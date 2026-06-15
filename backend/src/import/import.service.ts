import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CamaraService } from '../camara/camara.service';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly camara: CamaraService,
  ) {}

  private async retry<T>(
    operation: () => Promise<T>,
    label: string,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `${label} - tentativa ${attempt}/${maxRetries} falhou: ${error.message}`,
        );
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      }
    }
    throw lastError;
  }

  async importPartidos(): Promise<number> {
    this.logger.log('Iniciando importação de partidos...');
    const partidos = await this.retry(
      () => this.camara.getPartidos(),
      'getPartidos',
    );

    let count = 0;
    for (const p of partidos) {
      await this.prisma.party.upsert({
        where: { acronym: p.sigla },
        update: { name: p.nome },
        create: { acronym: p.sigla, name: p.nome },
      });
      count++;
    }
    this.logger.log(`Importados ${count} partidos`);
    return count;
  }

  async importDeputados(): Promise<number> {
    this.logger.log('Iniciando importação de deputados...');
    const deputados = await this.retry(
      () => this.camara.getActiveDeputados(),
      'getActiveDeputados',
    );

    let count = 0;
    for (const dep of deputados) {
      const state = await this.prisma.state.findUnique({
        where: { code: dep.siglaUf },
      });
      if (!state) {
        this.logger.warn(
          `Estado ${dep.siglaUf} não encontrado para deputado ${dep.nome}`,
        );
        continue;
      }

      const party = await this.prisma.party.findUnique({
        where: { acronym: dep.siglaPartido },
      });

      await this.prisma.politician.upsert({
        where: { externalId: dep.id },
        update: {
          name: dep.nome,
          photoUrl: dep.urlFoto,
          stateId: state.id,
          partyId: party?.id ?? 1,
          currentRole: 'Deputado Federal',
        },
        create: {
          externalId: dep.id,
          name: dep.nome,
          photoUrl: dep.urlFoto,
          stateId: state.id,
          partyId: party?.id ?? 1,
          currentRole: 'Deputado Federal',
        },
      });
      count++;
    }
    this.logger.log(`Importados ${count} deputados`);
    return count;
  }

  async importDespesas(ano: number, mes?: number): Promise<number> {
    this.logger.log(
      `Iniciando importação de despesas para ${ano}${mes ? `/${mes}` : ''}...`,
    );

    const politicians = await this.prisma.politician.findMany();

    let total = 0;
    for (const pol of politicians) {
      try {
        const despesas = await this.retry(
          () => this.camara.getDespesas(pol.externalId, ano, mes),
          `getDespesas(${pol.externalId}, ${ano})`,
        );

        for (const desp of despesas) {
          const externalId = `${pol.externalId}-${desp.ano}-${desp.mes}-${desp.numDocumento}`;

          const category = await this.prisma.expenseCategory.upsert({
            where: { name: desp.tipoDespesa },
            update: {},
            create: { name: desp.tipoDespesa },
          });

          await this.prisma.expense.upsert({
            where: { externalId },
            update: {
              amount: desp.valorDocumento,
            },
            create: {
              externalId,
              politicianId: pol.id,
              categoryId: category.id,
              supplier: desp.nomeFornecedor,
              description: desp.tipoDespesa,
              amount: desp.valorDocumento,
              expenseDate: new Date(desp.dataDocumento),
              documentUrl: desp.urlDocumento,
            },
          });
          total++;
        }
      } catch (error: any) {
        this.logger.error(
          `Erro ao importar despesas do deputado ${pol.externalId}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Importadas ${total} despesas`);
    return total;
  }

  async syncAll(ano?: number): Promise<{
    partidos: number;
    deputados: number;
    despesas: number;
  }> {
    this.logger.log('=== INÍCIO DA SINCRONIZAÇÃO COMPLETA ===');
    const startedAt = Date.now();

    const partidos = await this.importPartidos();
    const deputados = await this.importDeputados();

    const currentYear = ano ?? new Date().getFullYear();
    const despesas = await this.importDespesas(currentYear);

    const duration = ((Date.now() - startedAt) / 1000).toFixed(1);
    this.logger.log(
      `=== FIM DA SINCRONIZAÇÃO (${duration}s) - Partidos: ${partidos}, Deputados: ${deputados}, Despesas: ${despesas} ===`,
    );

    return { partidos, deputados, despesas };
  }
}

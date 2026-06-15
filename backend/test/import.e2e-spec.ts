import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { ImportService } from './../src/import/import.service';
import { PrismaService } from './../src/prisma/prisma.service';

describe('ImportService (e2e) — SPEC-002 Importação Câmara', () => {
  let app: INestApplication;
  let importService: ImportService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    importService = app.get(ImportService);
    prisma = app.get(PrismaService);

    // Seed all 27 Brazilian states for foreign key constraints
    const states = [
      { code: 'AC', name: 'Acre' },
      { code: 'AL', name: 'Alagoas' },
      { code: 'AP', name: 'Amapá' },
      { code: 'AM', name: 'Amazonas' },
      { code: 'BA', name: 'Bahia' },
      { code: 'CE', name: 'Ceará' },
      { code: 'DF', name: 'Distrito Federal' },
      { code: 'ES', name: 'Espírito Santo' },
      { code: 'GO', name: 'Goiás' },
      { code: 'MA', name: 'Maranhão' },
      { code: 'MT', name: 'Mato Grosso' },
      { code: 'MS', name: 'Mato Grosso do Sul' },
      { code: 'MG', name: 'Minas Gerais' },
      { code: 'PA', name: 'Pará' },
      { code: 'PB', name: 'Paraíba' },
      { code: 'PR', name: 'Paraná' },
      { code: 'PE', name: 'Pernambuco' },
      { code: 'PI', name: 'Piauí' },
      { code: 'RJ', name: 'Rio de Janeiro' },
      { code: 'RN', name: 'Rio Grande do Norte' },
      { code: 'RS', name: 'Rio Grande do Sul' },
      { code: 'RO', name: 'Rondônia' },
      { code: 'RR', name: 'Roraima' },
      { code: 'SC', name: 'Santa Catarina' },
      { code: 'SP', name: 'São Paulo' },
      { code: 'SE', name: 'Sergipe' },
      { code: 'TO', name: 'Tocantins' },
    ];
    for (const s of states) {
      await prisma.state.upsert({
        where: { code: s.code },
        update: {},
        create: s,
      });
    }

    // Import parties from API so politicians have valid party references
    await importService.importPartidos();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CA-001 — Importar todos os deputados ativos', () => {
    it('deve importar deputados da API da Câmara', async () => {
      const count = await importService.importDeputados();
      expect(count).toBeGreaterThan(0);

      const total = await prisma.politician.count();
      expect(total).toBeGreaterThan(0);
    }, 60000);
  });

  describe('CA-003 — Prevenção de duplicidade', () => {
    it('não deve criar deputados duplicados em nova sincronização', async () => {
      const before = await prisma.politician.count();
      await importService.importDeputados();
      const after = await prisma.politician.count();
      expect(after).toBe(before);
    }, 60000);

    it('não deve criar partidos duplicados em nova sincronização', async () => {
      const before = await prisma.party.count();
      await importService.importPartidos();
      const after = await prisma.party.count();
      expect(after).toBe(before);
    }, 60000);
  });

  describe('CA-004 — Consistência após múltiplas execuções', () => {
    it('deve manter dados consistentes após múltiplas importações', async () => {
      const count1 = await prisma.politician.count();
      await importService.importDeputados();
      const count2 = await prisma.politician.count();
      await importService.importDeputados();
      const count3 = await prisma.politician.count();
      expect(count1).toBe(count2);
      expect(count2).toBe(count3);
    }, 30000);
  });

  describe('CA-005 — Logs de erros de importação', () => {
    it('deve tratar erros e não propagar exceções fatais', async () => {
      // A importação de despesas deve ser tolerante a falhas individuais
      const result = await importService.importDespesas(2025);
      // Se chegou aqui sem exceção, o erro foi tratado com log
      expect(typeof result).toBe('number');
    }, 30000);
  });
});

import { Controller, Post, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ImportService } from './import.service';

@ApiTags('Importação')
@Controller('import')
export class ImportController {
  private readonly logger = new Logger(ImportController.name);

  constructor(private readonly importService: ImportService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Executa sincronização completa com a Câmara' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  async sync(@Query('ano') ano?: string) {
    const a = ano ? parseInt(ano, 10) : undefined;
    const result = await this.importService.syncAll(a);
    return { success: true, ...result };
  }

  @Post('deputados')
  @ApiOperation({ summary: 'Importa apenas deputados ativos' })
  async importDeputados() {
    const count = await this.importService.importDeputados();
    return { success: true, deputados: count };
  }

  @Post('despesas')
  @ApiOperation({ summary: 'Importa despesas dos deputados' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'mes', required: false, type: Number })
  async importDespesas(
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    const a = ano ? parseInt(ano, 10) : new Date().getFullYear();
    const m = mes ? parseInt(mes, 10) : undefined;
    const count = await this.importService.importDespesas(a, m);
    return { success: true, despesas: count };
  }
}

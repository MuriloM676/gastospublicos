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
    }, 30000);
  });

  describe('CA-003 — Prevenção de duplicidade', () => {
    it('não deve criar deputados duplicados em nova sincronização', async () => {
      const before = await prisma.politician.count();
      await importService.importDeputados();
      const after = await prisma.politician.count();
      expect(after).toBe(before);
    }, 30000);

    it('não deve criar partidos duplicados em nova sincronização', async () => {
      const before = await prisma.party.count();
      await importService.importPartidos();
      const after = await prisma.party.count();
      expect(after).toBe(before);
    }, 30000);
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

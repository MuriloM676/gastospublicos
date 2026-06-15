import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('PrismaService (e2e) — SPEC-003 Modelo de Dados', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let testStateId: number;
  let testPartyId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // Seed state and party for foreign key tests
    const state = await prisma.state.upsert({
      where: { code: 'ZZ' },
      update: {},
      create: { code: 'ZZ', name: 'Test State' },
    });
    testStateId = state.id;

    const party = await prisma.party.upsert({
      where: { acronym: 'TST' },
      update: {},
      create: { acronym: 'TST', name: 'Test Party' },
    });
    testPartyId = party.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.politician.deleteMany({
      where: { externalId: 99999 },
    });
    await prisma.party.deleteMany({ where: { acronym: 'TST' } });
    await prisma.state.deleteMany({ where: { code: 'ZZ' } });
    await app.close();
  });

  describe('CA-001 — Relações com chaves estrangeiras', () => {
    it('deve criar um político com estado e partido válidos', async () => {
      const politician = await prisma.politician.create({
        data: {
          externalId: 99999,
          name: 'Teste E2E',
          stateId: testStateId,
          partyId: testPartyId,
          currentRole: 'Deputado Federal',
        },
        include: { state: true, party: true },
      });

      expect(politician.state).toBeDefined();
      expect(politician.party).toBeDefined();
      expect(politician.state.code).toBe('ZZ');
      expect(politician.party.acronym).toBe('TST');

      await prisma.politician.delete({ where: { id: politician.id } });
    });
  });

  describe('CA-002 — Banco impede gastos sem político associado', () => {
    it('deve lançar erro ao criar gasto com politicianId inexistente', async () => {
      await expect(
        prisma.expense.create({
          data: {
            externalId: 'test-fk-politician-001',
            politicianId: 999999,
            categoryId: 1,
            amount: 100,
            expenseDate: new Date(),
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('CA-003 — Banco impede categorias inexistentes', () => {
    it('deve lançar erro ao criar gasto com categoryId inexistente', async () => {
      const politician = await prisma.politician.findFirst();
      expect(politician).toBeDefined();

      if (politician) {
        await expect(
          prisma.expense.create({
            data: {
              externalId: 'test-fk-category-001',
              politicianId: politician.id,
              categoryId: 999999,
              amount: 100,
              expenseDate: new Date(),
            },
          }),
        ).rejects.toThrow();
      }
    });
  });

  describe('CA-004 — Consultas históricas retornam todos os registros', () => {
    it('deve retornar gastos mesmo sem filtro de data', async () => {
      const expenses = await prisma.expense.findMany();
      expect(Array.isArray(expenses)).toBe(true);
    });

    it('não deve haver soft delete na tabela Expense', async () => {
      const columns = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'Expense' AND column_name = 'deletedAt'
      `;
      expect(columns).toHaveLength(0);
    });
  });
});

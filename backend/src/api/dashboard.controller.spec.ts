import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let prisma: jest.Mocked<Pick<PrismaService, 'politician' | 'expense' | 'expenseCategory'>>;

  beforeEach(async () => {
    const mockPrisma = {
      politician: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      expense: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      expenseCategory: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    prisma = module.get(PrismaService);
  });

  describe('getOverview', () => {
    it('should return overview with totals', async () => {
      prisma.politician.count.mockResolvedValue(10);

      const mockExpenses = [
        {
          id: 1,
          amount: 1000,
          politicianId: 1,
          politician: {
            id: 1,
            name: 'João Silva',
            partyId: 1,
            party: { id: 1, acronym: 'PT' },
          },
        },
        {
          id: 2,
          amount: 2000,
          politicianId: 2,
          politician: {
            id: 2,
            name: 'Maria Souza',
            partyId: 2,
            party: { id: 2, acronym: 'PSDB' },
          },
        },
        {
          id: 3,
          amount: 3000,
          politicianId: 3,
          politician: {
            id: 3,
            name: 'Carlos',
            partyId: 1,
            party: { id: 1, acronym: 'PT' },
          },
        },
      ];

      prisma.expense.findMany.mockResolvedValue(mockExpenses as any);

      const result = await controller.getOverview();

      expect(result.totalExpenses).toBe(6000);
      expect(result.totalPoliticians).toBe(10);
      expect(result.topSpender).toEqual({
        id: 3,
        name: 'Carlos',
        total: 3000,
      });
      expect(result.topParty).toEqual({
        acronym: 'PT',
        total: 4000,
      });
    });

    it('should return null top fields when no expenses', async () => {
      prisma.politician.count.mockResolvedValue(5);
      prisma.expense.findMany.mockResolvedValue([]);

      const result = await controller.getOverview();

      expect(result.totalExpenses).toBe(0);
      expect(result.totalPoliticians).toBe(5);
      expect(result.topSpender).toBeNull();
      expect(result.topParty).toBeNull();
    });
  });

  describe('getStatesExpenses', () => {
    it('should return expenses grouped by state', async () => {
      const mockPoliticians = [
        {
          id: 1,
          state: { code: 'SP' },
          expenses: [{ amount: 1000 }, { amount: 2000 }],
        },
        {
          id: 2,
          state: { code: 'RJ' },
          expenses: [{ amount: 3000 }],
        },
        {
          id: 3,
          state: { code: 'SP' },
          expenses: [{ amount: 500 }],
        },
      ];

      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);

      const result = await controller.getStatesExpenses();

      expect(result).toEqual([
        { state: 'SP', totalExpenses: 3500 },
        { state: 'RJ', totalExpenses: 3000 },
      ]);
    });

    it('should return empty array when no politicians', async () => {
      prisma.politician.findMany.mockResolvedValue([]);

      const result = await controller.getStatesExpenses();

      expect(result).toEqual([]);
    });
  });

  describe('getPartiesExpenses', () => {
    it('should return expenses grouped by party', async () => {
      const mockPoliticians = [
        {
          id: 1,
          party: { acronym: 'PT' },
          expenses: [{ amount: 1000 }, { amount: 2000 }],
        },
        {
          id: 2,
          party: { acronym: 'PSDB' },
          expenses: [{ amount: 3000 }],
        },
        {
          id: 3,
          party: { acronym: 'PT' },
          expenses: [{ amount: 500 }],
        },
      ];

      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);

      const result = await controller.getPartiesExpenses();

      expect(result).toEqual([
        { party: 'PT', totalExpenses: 3500 },
        { party: 'PSDB', totalExpenses: 3000 },
      ]);
    });

    it('should return empty array when no politicians', async () => {
      prisma.politician.findMany.mockResolvedValue([]);

      const result = await controller.getPartiesExpenses();

      expect(result).toEqual([]);
    });
  });

  describe('getCategoriesExpenses', () => {
    it('should return expenses grouped by category', async () => {
      const mockCategories = [
        {
          name: 'Combustível',
          expenses: [{ amount: 500 }, { amount: 300 }],
        },
        {
          name: 'Passagem',
          expenses: [{ amount: 1500 }],
        },
      ];

      prisma.expenseCategory.findMany.mockResolvedValue(mockCategories as any);

      const result = await controller.getCategoriesExpenses();

      expect(result).toEqual([
        { category: 'Passagem', totalExpenses: 1500 },
        { category: 'Combustível', totalExpenses: 800 },
      ]);
    });

    it('should return empty array when no categories', async () => {
      prisma.expenseCategory.findMany.mockResolvedValue([]);

      const result = await controller.getCategoriesExpenses();

      expect(result).toEqual([]);
    });
  });
});

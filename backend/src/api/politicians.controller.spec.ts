import { Test, TestingModule } from '@nestjs/testing';
import { PoliticiansController } from './politicians.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PoliticiansController', () => {
  let controller: PoliticiansController;
  let prisma: jest.Mocked<
    Pick<PrismaService, 'politician' | 'expense' | 'expenseCategory'>
  >;

  const mockPolitician = {
    id: 1,
    name: 'João Silva',
    photoUrl: 'https://foto.com/joao.jpg',
    stateId: 1,
    partyId: 1,
    currentRole: 'Deputado Federal',
    firstElectionDate: new Date('2018-01-01'),
    state: { id: 1, code: 'SP', name: 'São Paulo' },
    party: { id: 1, acronym: 'PT', name: 'Partido dos Trabalhadores' },
    expenses: [
      { id: 1, amount: 1000, expenseDate: new Date('2023-01-15') },
      { id: 2, amount: 2000, expenseDate: new Date('2024-06-20') },
    ],
    mandates: [{ id: 1, startDate: new Date('2023-01-01'), endDate: null }],
  };

  const allPoliticiansForRanking = [
    {
      id: 1,
      stateId: 1,
      partyId: 1,
      expenses: [{ id: 1, amount: 3000, expenseDate: new Date('2024-01-01') }],
      state: { id: 1, code: 'SP', name: 'São Paulo' },
      party: { id: 1, acronym: 'PT', name: 'Partido' },
    },
    {
      id: 999,
      stateId: 2,
      partyId: 999,
      expenses: [{ id: 2, amount: 5000, expenseDate: new Date('2024-01-01') }],
      state: { id: 2, code: 'RJ', name: 'Rio de Janeiro' },
      party: { id: 999, acronym: 'PSDB', name: 'PSDB' },
    },
  ];

  beforeEach(async () => {
    const mockPrisma = {
      politician: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      expense: { findMany: jest.fn(), count: jest.fn() },
      expenseCategory: { findUnique: jest.fn(), upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoliticiansController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<PoliticiansController>(PoliticiansController);
    prisma = module.get(PrismaService);
  });

  describe('getPolitician', () => {
    it('should return politician profile with rankings', async () => {
      prisma.politician.findUnique.mockResolvedValue(mockPolitician as any);
      prisma.politician.findMany.mockResolvedValue(
        allPoliticiansForRanking as any,
      );

      const result = await controller.getPolitician('1');

      expect(result).toEqual({
        id: 1,
        name: 'João Silva',
        photoUrl: 'https://foto.com/joao.jpg',
        party: 'PT',
        state: 'SP',
        position: 'Deputado Federal',
        firstElectionDate: '2018-01-01T00:00:00.000Z',
        totalExpenses: 3000,
        monthlyAverage: expect.any(Number),
        nationalRanking: 2,
        stateRanking: 1,
        partyRanking: 1,
      });
    });

    it('should throw NotFoundException when politician does not exist', async () => {
      prisma.politician.findUnique.mockResolvedValue(null);

      await expect(controller.getPolitician('999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle politician with no expenses', async () => {
      const noExpensePolitician = { ...mockPolitician, expenses: [] };
      prisma.politician.findUnique.mockResolvedValue(
        noExpensePolitician as any,
      );
      prisma.politician.findMany.mockResolvedValue(
        allPoliticiansForRanking as any,
      );

      const result = await controller.getPolitician('1');

      expect(result.totalExpenses).toBe(0);
      expect(result.monthlyAverage).toBe(0);
    });

    it('should handle null firstElectionDate', async () => {
      const noElectionPolitician = {
        ...mockPolitician,
        firstElectionDate: null,
      };
      prisma.politician.findUnique.mockResolvedValue(
        noElectionPolitician as any,
      );
      prisma.politician.findMany.mockResolvedValue(
        allPoliticiansForRanking as any,
      );

      const result = await controller.getPolitician('1');

      expect(result.firstElectionDate).toBeNull();
    });
  });
  describe('getExpenses', () => {
    const mockExpenses = [
      {
        id: 1,
        expenseDate: new Date('2024-03-15'),
        category: { id: 1, name: 'Combustível' },
        supplier: 'Posto ABC',
        description: 'Combustível',
        amount: 500,
        documentUrl: 'https://doc.com/1',
      },
      {
        id: 2,
        expenseDate: new Date('2024-01-10'),
        category: { id: 2, name: 'Passagem' },
        supplier: 'Latam',
        description: 'Passagem aérea',
        amount: 1500,
        documentUrl: 'https://doc.com/2',
      },
    ];

    it('should return paginated expenses without filters', async () => {
      prisma.expense.count.mockResolvedValue(2);
      prisma.expense.findMany.mockResolvedValue(mockExpenses as any);

      const result = await controller.getExpenses('1');

      expect(result).toEqual({
        items: [
          {
            date: '2024-03-15',
            category: 'Combustível',
            supplier: 'Posto ABC',
            description: 'Combustível',
            amount: 500,
            documentUrl: 'https://doc.com/1',
          },
          {
            date: '2024-01-10',
            category: 'Passagem',
            supplier: 'Latam',
            description: 'Passagem aérea',
            amount: 1500,
            documentUrl: 'https://doc.com/2',
          },
        ],
        page: 1,
        limit: 20,
        total: 2,
      });
    });

    it('should apply year filter when provided', async () => {
      prisma.expense.count.mockResolvedValue(1);
      prisma.expense.findMany.mockResolvedValue([mockExpenses[0]] as any);

      await controller.getExpenses('1', '2024');

      expect(prisma.expense.count).toHaveBeenCalledWith({
        where: {
          politicianId: 1,
          expenseDate: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31'),
          },
        },
      });
    });

    it('should apply category filter when valid category name is provided', async () => {
      prisma.expenseCategory.findUnique.mockResolvedValue({
        id: 5,
        name: 'Combustível',
      } as any);
      prisma.expense.count.mockResolvedValue(1);
      prisma.expense.findMany.mockResolvedValue([mockExpenses[0]] as any);

      await controller.getExpenses('1', undefined, 'Combustível');

      expect(prisma.expenseCategory.findUnique).toHaveBeenCalledWith({
        where: { name: 'Combustível' },
      });
      expect(prisma.expense.count).toHaveBeenCalledWith({
        where: { politicianId: 1, categoryId: 5 },
      });
    });

    it('should not apply category filter when category name is not found', async () => {
      prisma.expenseCategory.findUnique.mockResolvedValue(null);
      prisma.expense.count.mockResolvedValue(2);
      prisma.expense.findMany.mockResolvedValue(mockExpenses as any);

      await controller.getExpenses('1', undefined, 'InvalidCategory');

      expect(prisma.expense.count).toHaveBeenCalledWith({
        where: { politicianId: 1 },
      });
    });

    it('should apply pagination with custom page and limit', async () => {
      prisma.expense.count.mockResolvedValue(50);
      prisma.expense.findMany.mockResolvedValue([]);

      await controller.getExpenses('1', undefined, undefined, '2', '10');

      expect(prisma.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should cap limit at 100', async () => {
      prisma.expense.count.mockResolvedValue(200);
      prisma.expense.findMany.mockResolvedValue([]);

      await controller.getExpenses('1', undefined, undefined, '1', '200');

      expect(prisma.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 100 }),
      );
    });
  });

  describe('getEvolution', () => {
    it('should return monthly and yearly evolution', async () => {
      const mockExpensesEvolution = [
        { amount: 1000, expenseDate: new Date('2024-01-15') },
        { amount: 2000, expenseDate: new Date('2024-01-20') },
        { amount: 1500, expenseDate: new Date('2024-06-10') },
      ];

      prisma.expense.findMany.mockResolvedValue(mockExpensesEvolution as any);

      const result = await controller.getEvolution('1');

      expect(result).toEqual({
        monthly: [
          { period: '2024-01', total: 3000 },
          { period: '2024-06', total: 1500 },
        ],
        yearly: [{ period: '2024', total: 4500 }],
      });
    });

    it('should return empty evolution when no expenses exist', async () => {
      prisma.expense.findMany.mockResolvedValue([]);

      const result = await controller.getEvolution('1');

      expect(result).toEqual({ monthly: [], yearly: [] });
    });

    it('should round totals to 2 decimal places', async () => {
      prisma.expense.findMany.mockResolvedValue([
        { amount: 100.456, expenseDate: new Date('2024-01-15') },
      ] as any);

      const result = await controller.getEvolution('1');

      expect(result.monthly[0].total).toBe(100.46);
      expect(result.yearly[0].total).toBe(100.46);
    });
  });
});

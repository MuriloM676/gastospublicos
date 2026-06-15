import { Test, TestingModule } from '@nestjs/testing';
import { RankingsController } from './rankings.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('RankingsController', () => {
  let controller: RankingsController;
  let prisma: jest.Mocked<
    Pick<PrismaService, 'politician' | 'state' | 'party'>
  >;

  beforeEach(async () => {
    const mockPrisma = {
      politician: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      state: { findUnique: jest.fn(), findMany: jest.fn() },
      party: { findUnique: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingsController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<RankingsController>(RankingsController);
    prisma = module.get(PrismaService);
  });

  describe('getNationalRanking', () => {
    const mockPoliticians = [
      {
        id: 1,
        name: 'João Silva',
        currentRole: 'Deputado Federal',
        state: { code: 'SP' },
        party: { acronym: 'PT' },
        expenses: [{ amount: 5000 }, { amount: 3000 }],
      },
      {
        id: 2,
        name: 'Maria Souza',
        currentRole: 'Deputado Federal',
        state: { code: 'RJ' },
        party: { acronym: 'PSDB' },
        expenses: [{ amount: 10000 }],
      },
      {
        id: 3,
        name: 'Carlos Pereira',
        currentRole: 'Deputado Federal',
        state: { code: 'SP' },
        party: { acronym: 'PT' },
        expenses: [{ amount: 2000 }],
      },
    ];

    it('should return paginated ranking without filters', async () => {
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);
      const result = await controller.getNationalRanking();

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.items[0].name).toBe('Maria Souza');
      expect(result.items[0].totalExpenses).toBe(10000);
      expect(result.items[0].ranking).toBe(1);
      expect(result.items[1].name).toBe('João Silva');
      expect(result.items[1].totalExpenses).toBe(8000);
      expect(result.items[1].ranking).toBe(2);
      expect(result.items[2].name).toBe('Carlos Pereira');
      expect(result.items[2].totalExpenses).toBe(2000);
      expect(result.items[2].ranking).toBe(3);
    });

    it('should apply state filter', async () => {
      prisma.state.findUnique.mockResolvedValue({
        id: 1,
        code: 'SP',
        name: 'São Paulo',
      } as any);
      prisma.politician.findMany.mockResolvedValue([
        mockPoliticians[0],
        mockPoliticians[2],
      ] as any);

      const result = await controller.getNationalRanking(undefined, 'SP');

      expect(prisma.state.findUnique).toHaveBeenCalledWith({
        where: { code: 'SP' },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items.every((i: any) => i.state === 'SP')).toBe(true);
    });

    it('should apply party filter', async () => {
      prisma.party.findUnique.mockResolvedValue({
        id: 1,
        acronym: 'PT',
        name: 'Partido',
      } as any);
      prisma.politician.findMany.mockResolvedValue([
        mockPoliticians[0],
        mockPoliticians[2],
      ] as any);

      const result = await controller.getNationalRanking(
        undefined,
        undefined,
        'PT',
      );

      expect(prisma.party.findUnique).toHaveBeenCalledWith({
        where: { acronym: 'PT' },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items.every((i: any) => i.party === 'PT')).toBe(true);
    });

    it('should apply year filter with expense date range', async () => {
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);
      await controller.getNationalRanking('2024');

      expect(prisma.politician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            expenses: {
              some: {
                expenseDate: {
                  gte: new Date('2024-01-01'),
                  lte: new Date('2024-12-31'),
                },
              },
            },
          },
        }),
      );
    });

    it('should apply pagination with slice', async () => {
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);

      const result = await controller.getNationalRanking(
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '2',
      );

      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('should skip invalid state filter', async () => {
      prisma.state.findUnique.mockResolvedValue(null);
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);

      const result = await controller.getNationalRanking(undefined, 'XX');

      expect(prisma.politician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result.total).toBe(3);
    });

    it('should skip invalid party filter', async () => {
      prisma.party.findUnique.mockResolvedValue(null);
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);

      const result = await controller.getNationalRanking(
        undefined,
        undefined,
        'XX',
      );

      expect(prisma.politician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result.total).toBe(3);
    });
  });

  describe('getTop3', () => {
    const mockPoliticians = [
      {
        id: 1,
        name: 'João Silva',
        currentRole: 'Deputado Federal',
        state: { code: 'SP' },
        party: { acronym: 'PT' },
        expenses: [{ amount: 5000 }],
      },
      {
        id: 2,
        name: 'Maria Souza',
        currentRole: 'Deputado Federal',
        state: { code: 'RJ' },
        party: { acronym: 'PSDB' },
        expenses: [{ amount: 10000 }],
      },
      {
        id: 3,
        name: 'Carlos Pereira',
        currentRole: 'Deputado Federal',
        state: { code: 'MG' },
        party: { acronym: 'PV' },
        expenses: [{ amount: 3000 }],
      },
      {
        id: 4,
        name: 'Ana Costa',
        currentRole: 'Deputado Federal',
        state: { code: 'BA' },
        party: { acronym: 'MDB' },
        expenses: [{ amount: 7000 }],
      },
    ];

    it('should return top 3 biggest spenders', async () => {
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);

      const result = await controller.getTop3();

      expect(result.first?.name).toBe('Maria Souza');
      expect(result.first?.totalExpenses).toBe(10000);
      expect(result.second?.name).toBe('Ana Costa');
      expect(result.second?.totalExpenses).toBe(7000);
      expect(result.third?.name).toBe('João Silva');
      expect(result.third?.totalExpenses).toBe(5000);
    });

    it('should return null for missing positions when less than 3 politicians', async () => {
      prisma.politician.findMany.mockResolvedValue([
        mockPoliticians[0],
        mockPoliticians[1],
      ] as any);

      const result = await controller.getTop3();

      expect(result.first).not.toBeNull();
      expect(result.second).not.toBeNull();
      expect(result.third).toBeNull();
    });

    it('should return all null when no politicians exist', async () => {
      prisma.politician.findMany.mockResolvedValue([]);

      const result = await controller.getTop3();

      expect(result.first).toBeNull();
      expect(result.second).toBeNull();
      expect(result.third).toBeNull();
    });
  });
});

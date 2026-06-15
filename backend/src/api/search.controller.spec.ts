import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('SearchController', () => {
  let controller: SearchController;
  let prisma: jest.Mocked<Pick<PrismaService, 'politician'>>;

  beforeEach(async () => {
    const mockPrisma = {
      politician: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    prisma = module.get(PrismaService);
  });

  describe('search', () => {
    it('should return empty items when query is undefined', async () => {
      const result = await controller.search(undefined as unknown as string);

      expect(result).toEqual({ items: [] });
      expect(prisma.politician.findMany).not.toHaveBeenCalled();
    });

    it('should return empty items when query is shorter than 2 characters', async () => {
      const result = await controller.search('a');

      expect(result).toEqual({ items: [] });
      expect(prisma.politician.findMany).not.toHaveBeenCalled();
    });

    it('should return empty items when query is empty string', async () => {
      const result = await controller.search('');

      expect(result).toEqual({ items: [] });
      expect(prisma.politician.findMany).not.toHaveBeenCalled();
    });

    it('should search and return mapped results for valid query', async () => {
      const mockPoliticians = [
        {
          id: 1,
          name: 'João Silva',
          party: { acronym: 'PT' },
          state: { code: 'SP' },
        },
        {
          id: 2,
          name: 'Maria Souza',
          party: { acronym: 'PSDB' },
          state: { code: 'MG' },
        },
      ];

      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);

      const result = await controller.search('Silva');

      expect(result).toEqual({
        items: [
          { id: 1, name: 'João Silva', party: 'PT', state: 'SP' },
          { id: 2, name: 'Maria Souza', party: 'PSDB', state: 'MG' },
        ],
      });
      expect(prisma.politician.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Silva', mode: 'insensitive' } },
            { party: { acronym: { contains: 'Silva', mode: 'insensitive' } } },
            { state: { code: { contains: 'Silva', mode: 'insensitive' } } },
            { currentRole: { contains: 'Silva', mode: 'insensitive' } },
          ],
        },
        include: { state: true, party: true },
        take: 20,
        orderBy: { name: 'asc' },
      });
    });
  });
});

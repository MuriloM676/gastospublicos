import { Test, TestingModule } from '@nestjs/testing';
import { StatesController } from './states.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('StatesController', () => {
  let controller: StatesController;
  let prisma: jest.Mocked<Pick<PrismaService, 'state'>>;

  beforeEach(async () => {
    const mockPrisma = {
      state: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatesController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<StatesController>(StatesController);
    prisma = module.get(PrismaService);
  });

  describe('getStates', () => {
    it('should return a mapped list of states ordered by code', async () => {
      const mockStates = [
        { id: 1, code: 'AC', name: 'Acre' },
        { id: 2, code: 'AL', name: 'Alagoas' },
        { id: 3, code: 'SP', name: 'São Paulo' },
      ];

      prisma.state.findMany.mockResolvedValue(mockStates);

      const result = await controller.getStates();

      expect(result).toEqual([
        { code: 'AC', name: 'Acre' },
        { code: 'AL', name: 'Alagoas' },
        { code: 'SP', name: 'São Paulo' },
      ]);
      expect(prisma.state.findMany).toHaveBeenCalledWith({
        orderBy: { code: 'asc' },
      });
    });

    it('should return an empty array when no states exist', async () => {
      prisma.state.findMany.mockResolvedValue([]);

      const result = await controller.getStates();

      expect(result).toEqual([]);
    });
  });
});

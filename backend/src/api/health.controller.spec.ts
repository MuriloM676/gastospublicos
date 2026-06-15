import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: jest.Mocked<Pick<PrismaService, '$queryRaw'>>;

  beforeEach(async () => {
    const mockPrisma = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prisma = module.get(PrismaService);
  });

  describe('check', () => {
    it('should return healthy when database is up', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);

      const result = await controller.check();

      expect(result).toEqual({
        status: 'healthy',
        database: 'up',
        api: 'up',
      });
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return degraded when database query throws', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('DB connection failed'));

      const result = await controller.check();

      expect(result).toEqual({
        status: 'degraded',
        database: 'down',
        api: 'up',
      });
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
});

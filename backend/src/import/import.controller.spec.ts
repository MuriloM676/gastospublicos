import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

describe('ImportController', () => {
  let controller: ImportController;
  let importService: jest.Mocked<
    Pick<ImportService, 'syncAll' | 'importDeputados' | 'importDespesas'>
  >;

  beforeEach(async () => {
    const mockImportService = {
      syncAll: jest.fn(),
      importDeputados: jest.fn(),
      importDespesas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [{ provide: ImportService, useValue: mockImportService }],
    }).compile();

    controller = module.get<ImportController>(ImportController);
    importService = module.get(ImportService);
  });

  describe('sync', () => {
    it('should call syncAll without year when ano is not provided', async () => {
      importService.syncAll.mockResolvedValue({
        partidos: 25,
        deputados: 513,
        despesas: 10000,
      });

      const result = await controller.sync();

      expect(result).toEqual({
        success: true,
        partidos: 25,
        deputados: 513,
        despesas: 10000,
      });
      expect(importService.syncAll).toHaveBeenCalledWith(undefined);
    });

    it('should call syncAll with parsed year when ano is provided', async () => {
      importService.syncAll.mockResolvedValue({
        partidos: 25,
        deputados: 513,
        despesas: 5000,
      });

      const result = await controller.sync('2024');

      expect(result).toEqual({
        success: true,
        partidos: 25,
        deputados: 513,
        despesas: 5000,
      });
      expect(importService.syncAll).toHaveBeenCalledWith(2024);
    });
  });

  describe('importDeputados', () => {
    it('should call importDeputados and return count', async () => {
      importService.importDeputados.mockResolvedValue(513);

      const result = await controller.importDeputados();

      expect(result).toEqual({ success: true, deputados: 513 });
      expect(importService.importDeputados).toHaveBeenCalledTimes(1);
    });
  });

  describe('importDespesas', () => {
    it('should call importDespesas with default year when ano not provided', async () => {
      const currentYear = new Date().getFullYear();
      importService.importDespesas.mockResolvedValue(5000);

      const result = await controller.importDespesas();

      expect(result).toEqual({ success: true, despesas: 5000 });
      expect(importService.importDespesas).toHaveBeenCalledWith(
        currentYear,
        undefined,
      );
    });

    it('should call importDespesas with provided year', async () => {
      importService.importDespesas.mockResolvedValue(3000);

      const result = await controller.importDespesas('2024');

      expect(result).toEqual({ success: true, despesas: 3000 });
      expect(importService.importDespesas).toHaveBeenCalledWith(
        2024,
        undefined,
      );
    });

    it('should call importDespesas with year and month', async () => {
      importService.importDespesas.mockResolvedValue(500);

      const result = await controller.importDespesas('2024', '3');

      expect(result).toEqual({ success: true, despesas: 500 });
      expect(importService.importDespesas).toHaveBeenCalledWith(2024, 3);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { PrismaService } from '../prisma/prisma.service';
import { CamaraService } from '../camara/camara.service';

describe('ImportService', () => {
  let service: ImportService;
  let prisma: jest.Mocked<Pick<PrismaService, 'party' | 'politician' | 'state' | 'expenseCategory' | 'expense'>>;
  let camara: jest.Mocked<Pick<CamaraService, 'getPartidos' | 'getActiveDeputados' | 'getDespesas'>>;

  beforeEach(async () => {
    const mockPrisma = {
      party: { upsert: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
      politician: { upsert: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
      state: { findUnique: jest.fn(), findMany: jest.fn() },
      expenseCategory: { upsert: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
      expense: { upsert: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    };

    const mockCamara = {
      getPartidos: jest.fn(),
      getActiveDeputados: jest.fn(),
      getDespesas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CamaraService, useValue: mockCamara },
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);
    prisma = module.get(PrismaService);
    camara = module.get(CamaraService);
  });

  describe('importPartidos', () => {
    it('should import partidos from Camara API', async () => {
      const mockPartidos = [
        { id: 1, sigla: 'PT', nome: 'Partido dos Trabalhadores' },
        { id: 2, sigla: 'PSDB', nome: 'PSDB' },
      ];

      camara.getPartidos.mockResolvedValue(mockPartidos);
      prisma.party.upsert.mockResolvedValue({ id: 1 } as any);

      const result = await service.importPartidos();

      expect(result).toBe(2);
      expect(prisma.party.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.party.upsert).toHaveBeenCalledWith({
        where: { acronym: 'PT' },
        update: { name: 'Partido dos Trabalhadores' },
        create: { acronym: 'PT', name: 'Partido dos Trabalhadores' },
      });
    });

    it('should return 0 when no partidos from API', async () => {
      camara.getPartidos.mockResolvedValue([]);

      const result = await service.importPartidos();

      expect(result).toBe(0);
      expect(prisma.party.upsert).not.toHaveBeenCalled();
    });

    it('should retry on failure and succeed', async () => {
      camara.getPartidos
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([{ id: 1, sigla: 'PT', nome: 'PT' }]);
      prisma.party.upsert.mockResolvedValue({ id: 1 } as any);

      const result = await service.importPartidos();

      expect(result).toBe(1);
      expect(camara.getPartidos).toHaveBeenCalledTimes(2);
    });
  });

  describe('importDeputados', () => {
    const mockDeputados = [
      { id: 123, nome: 'João Silva', siglaPartido: 'PT', siglaUf: 'SP', urlFoto: 'https://foto.com/joao.jpg', idLegislatura: 56 },
      { id: 456, nome: 'Maria Souza', siglaPartido: 'PSDB', siglaUf: 'RJ', urlFoto: 'https://foto.com/maria.jpg', idLegislatura: 56 },
    ];

    it('should import deputados from Camara API', async () => {
      camara.getActiveDeputados.mockResolvedValue(mockDeputados);
      prisma.state.findUnique.mockResolvedValue({ id: 1, code: 'SP', name: 'São Paulo' } as any);
      prisma.party.findUnique.mockResolvedValue({ id: 10, acronym: 'PT', name: 'PT' } as any);
      prisma.politician.upsert.mockResolvedValue({ id: 1 } as any);

      const result = await service.importDeputados();

      expect(result).toBe(2);
      expect(prisma.politician.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.politician.upsert).toHaveBeenCalledWith({
        where: { externalId: 123 },
        update: { name: 'João Silva', photoUrl: 'https://foto.com/joao.jpg', stateId: 1, partyId: 10, currentRole: 'Deputado Federal' },
        create: { externalId: 123, name: 'João Silva', photoUrl: 'https://foto.com/joao.jpg', stateId: 1, partyId: 10, currentRole: 'Deputado Federal' },
      });
    });

    it('should skip deputados when state is not found', async () => {
      camara.getActiveDeputados.mockResolvedValue(mockDeputados);
      prisma.state.findUnique.mockResolvedValue(null);

      const result = await service.importDeputados();

      expect(result).toBe(0);
      expect(prisma.politician.upsert).not.toHaveBeenCalled();
    });

    it('should use default partyId 1 when party is not found', async () => {
      camara.getActiveDeputados.mockResolvedValue([mockDeputados[0]]);
      prisma.state.findUnique.mockResolvedValue({ id: 1 } as any);
      prisma.party.findUnique.mockResolvedValue(null);
      prisma.politician.upsert.mockResolvedValue({ id: 1 } as any);

      await service.importDeputados();

      expect(prisma.politician.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ partyId: 1 }) }),
      );
    });
  });

  describe('importDespesas', () => {
    const mockPoliticians = [
      { id: 1, externalId: 123, name: 'João Silva' },
      { id: 2, externalId: 456, name: 'Maria Souza' },
    ];

    const mockDespesas = [{
      ano: 2024, mes: 1, tipoDespesa: 'Combustível',
      valorDocumento: 500, nomeFornecedor: 'Posto ABC',
      dataDocumento: '2024-01-15', numDocumento: 'DOC001',
      urlDocumento: 'https://doc.com/1',
    }];

    it('should import despesas for politicians without expenses', async () => {
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);
      camara.getDespesas.mockResolvedValue(mockDespesas);
      prisma.expenseCategory.upsert.mockResolvedValue({ id: 1, name: 'Combustível' } as any);
      prisma.expense.upsert.mockResolvedValue({ id: 1 } as any);

      const result = await service.importDespesas(2024);

      expect(result).toBe(2);
      expect(camara.getDespesas).toHaveBeenCalledTimes(2);
      expect(prisma.expense.upsert).toHaveBeenCalledTimes(2);
    });

    it('should import despesas with month parameter', async () => {
      prisma.politician.findMany.mockResolvedValue([{ id: 1, externalId: 123, name: 'João' }] as any);
      camara.getDespesas.mockResolvedValue(mockDespesas);
      prisma.expenseCategory.upsert.mockResolvedValue({ id: 1 } as any);
      prisma.expense.upsert.mockResolvedValue({ id: 1 } as any);

      await service.importDespesas(2024, 1);

      expect(prisma.politician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { expenses: { none: { expenseDate: { gte: new Date(2024, 0, 1), lt: new Date(2024, 1, 1) } } } },
        }),
      );
    });

    it('should continue on error for individual politicians', async () => {
      prisma.politician.findMany.mockResolvedValue(mockPoliticians as any);
      camara.getDespesas
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce(mockDespesas);
      prisma.expenseCategory.upsert.mockResolvedValue({ id: 1 } as any);
      prisma.expense.upsert.mockResolvedValue({ id: 1 } as any);

      const result = await service.importDespesas(2024);

      expect(result).toBe(1);
    });
  });

  describe('syncAll', () => {
    it('should run complete sync and return counts', async () => {
      jest.spyOn(service, 'importPartidos').mockResolvedValue(25);
      jest.spyOn(service, 'importDeputados').mockResolvedValue(513);
      jest.spyOn(service, 'importDespesas').mockResolvedValue(10000);

      const result = await service.syncAll(2024);

      expect(result).toEqual({ partidos: 25, deputados: 513, despesas: 10000 });
      expect(service.importPartidos).toHaveBeenCalledTimes(1);
      expect(service.importDeputados).toHaveBeenCalledTimes(1);
      expect(service.importDespesas).toHaveBeenCalledWith(2024);
    });

    it('should use current year when ano is not provided', async () => {
      jest.spyOn(service, 'importPartidos').mockResolvedValue(0);
      jest.spyOn(service, 'importDeputados').mockResolvedValue(0);
      jest.spyOn(service, 'importDespesas').mockResolvedValue(0);

      const currentYear = new Date().getFullYear();
      await service.syncAll();

      expect(service.importDespesas).toHaveBeenCalledWith(currentYear);
    });
  });
});


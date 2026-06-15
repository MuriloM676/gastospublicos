import { Test, TestingModule } from '@nestjs/testing';
import { CamaraService } from './camara.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('CamaraService', () => {
  let service: CamaraService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CamaraService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<CamaraService>(CamaraService);
    httpService = module.get(HttpService);
  });

  describe('getActiveDeputados', () => {
    it('should fetch all pages and return deputados', async () => {
      const page1 = {
        data: {
          dados: [
            { id: 1, nome: 'Dep 1', siglaPartido: 'PT', siglaUf: 'SP', urlFoto: 'foto1' },
          ],
          links: [
            { rel: 'last', href: 'https://dadosabertos.camara.leg.br/api/v2/deputados?pagina=2' },
          ],
        },
      };
      const page2 = {
        data: {
          dados: [
            { id: 2, nome: 'Dep 2', siglaPartido: 'PSDB', siglaUf: 'RJ', urlFoto: 'foto2' },
          ],
          links: [],
        },
      };

      httpService.get
        .mockReturnValueOnce(of(page1) as any)
        .mockReturnValueOnce(of(page2) as any);

      const result = await service.getActiveDeputados();

      expect(result).toHaveLength(2);
      expect(result[0].nome).toBe('Dep 1');
      expect(result[1].nome).toBe('Dep 2');
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should fetch single page if only one page exists', async () => {
      const page1 = {
        data: {
          dados: [{ id: 1, nome: 'Dep 1', siglaPartido: 'PT', siglaUf: 'SP', urlFoto: 'foto1' }],
          links: [],
        },
      };

      httpService.get.mockReturnValueOnce(of(page1) as any);

      const result = await service.getActiveDeputados();

      expect(result).toHaveLength(1);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDeputadoDetails', () => {
    it('should fetch and return deputado details', async () => {
      const mockResponse = {
        data: {
          dados: {
            id: 1,
            nomeCivil: 'João Silva',
            ultimoStatus: { nome: 'João Silva', siglaPartido: 'PT', siglaUf: 'SP' },
          },
        },
      };

      httpService.get.mockReturnValueOnce(of(mockResponse) as any);

      const result = await service.getDeputadoDetails(1);

      expect(result.id).toBe(1);
      expect(result.nomeCivil).toBe('João Silva');
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/deputados/1'),
      );
    });
  });

  describe('getDespesas', () => {
    it('should fetch despesas with year parameter', async () => {
      const mockResponse = {
        data: {
          dados: [
            {
              ano: 2024, mes: 1, tipoDespesa: 'Combustível',
              valorDocumento: 500, nomeFornecedor: 'Posto ABC',
              dataDocumento: '2024-01-15', numDocumento: '123',
              urlDocumento: 'url',
            },
          ],
          links: [],
        },
      };

      httpService.get.mockReturnValueOnce(of(mockResponse) as any);

      const result = await service.getDespesas(1, 2024);

      expect(result).toHaveLength(1);
      expect(result[0].tipoDespesa).toBe('Combustível');
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/deputados/1/despesas'),
      );
    });

    it('should fetch despesas with year and month parameters', async () => {
      httpService.get.mockReturnValueOnce(of({ data: { dados: [], links: [] } }) as any);

      await service.getDespesas(1, 2024, 3);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('mes=3'),
      );
    });
  });

  describe('getPartidos', () => {
    it('should fetch and return partidos', async () => {
      const mockResponse = {
        data: {
          dados: [
            { id: 1, sigla: 'PT', nome: 'Partido dos Trabalhadores' },
            { id: 2, sigla: 'PSDB', nome: 'PSDB' },
          ],
          links: [],
        },
      };

      httpService.get.mockReturnValueOnce(of(mockResponse) as any);

      const result = await service.getPartidos();

      expect(result).toHaveLength(2);
      expect(result[0].sigla).toBe('PT');
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/partidos'),
      );
    });
  });

  describe('getLegislaturas', () => {
    it('should fetch and return legislaturas', async () => {
      const mockResponse = {
        data: {
          dados: [
            { id: 56, dataInicio: '2019-01-01', dataFim: '2023-01-31' },
          ],
          links: [],
        },
      };

      httpService.get.mockReturnValueOnce(of(mockResponse) as any);

      const result = await service.getLegislaturas();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(56);
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/legislaturas'),
      );
    });
  });

  describe('getTiposDespesa', () => {
    it('should fetch tipos de despesa when response is array', async () => {
      const mockResponse = {
        data: [
          { codTipoDespesa: 1, tipoDespesa: 'Combustível' },
          { codTipoDespesa: 2, tipoDespesa: 'Passagem' },
        ],
      };

      httpService.get.mockReturnValueOnce(of(mockResponse) as any);

      const result = await service.getTiposDespesa();

      expect(result).toHaveLength(2);
      expect(result[0].tipoDespesa).toBe('Combustível');
    });

    it('should fetch tipos de despesa when response has dados wrapper', async () => {
      const mockResponse = {
        data: {
          dados: [
            { codTipoDespesa: 3, tipoDespesa: 'Alimentação' },
          ],
        },
      };

      httpService.get.mockReturnValueOnce(of(mockResponse) as any);

      const result = await service.getTiposDespesa();

      expect(result).toHaveLength(1);
      expect(result[0].tipoDespesa).toBe('Alimentação');
    });

    it('should return empty array when data is empty object', async () => {
      const mockResponse = { data: {} };

      httpService.get.mockReturnValueOnce(of(mockResponse) as any);

      const result = await service.getTiposDespesa();

      expect(result).toEqual([]);
    });
  });
});

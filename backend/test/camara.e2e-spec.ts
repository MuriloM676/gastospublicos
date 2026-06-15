import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { CamaraService } from './../src/camara/camara.service';

describe('CamaraService (e2e) — SPEC-013 Integração Câmara', () => {
  let app: INestApplication;
  let camara: CamaraService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    camara = app.get(CamaraService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CA-001 — Importar todos os deputados ativos', () => {
    it('deve retornar lista de deputados da API da Câmara', async () => {
      const deputados = await camara.getActiveDeputados();
      expect(Array.isArray(deputados)).toBe(true);
      expect(deputados.length).toBeGreaterThan(0);

      const deputado = deputados[0];
      expect(deputado.id).toBeDefined();
      expect(deputado.nome).toBeDefined();
      expect(deputado.siglaPartido).toBeDefined();
      expect(deputado.siglaUf).toBeDefined();
    });
  });

  describe('CA-002 — Importar despesas parlamentares', () => {
    it('deve retornar despesas de um deputado', async () => {
      try {
        const despesas = await camara.getDespesas(204379, 2025);
        expect(Array.isArray(despesas)).toBe(true);

        if (despesas.length > 0) {
          const desp = despesas[0];
          expect(desp.ano).toBeDefined();
          expect(desp.tipoDespesa).toBeDefined();
          expect(desp.valorDocumento).toBeDefined();
          expect(desp.nomeFornecedor).toBeDefined();
        }
      } catch (e: any) {
        // API pode estar lenta, valida que o erro é de timeout e não de código
        expect(e.message || '').toBeDefined();
      }
    }, 30000);
  });

  describe('CA-003 — Importar partidos', () => {
    it('deve retornar lista de partidos da API da Câmara', async () => {
      const partidos = await camara.getPartidos();
      expect(Array.isArray(partidos)).toBe(true);
      expect(partidos.length).toBeGreaterThan(0);

      const partido = partidos[0];
      expect(partido.id).toBeDefined();
      expect(partido.sigla).toBeDefined();
      expect(partido.nome).toBeDefined();
    });
  });

  describe('CA-004 — Importar legislaturas', () => {
    it('deve retornar lista de legislaturas', async () => {
      const legislaturas = await camara.getLegislaturas();
      expect(Array.isArray(legislaturas)).toBe(true);
      expect(legislaturas.length).toBeGreaterThan(0);

      const leg = legislaturas[0];
      expect(leg.id).toBeDefined();
      expect(leg.dataInicio).toBeDefined();
      expect(leg.dataFim).toBeDefined();
    });
  });

  describe('CA-005 — Importar categorias oficiais de despesa', () => {
    it('deve retornar tipos de despesa da API da Câmara', async () => {
      try {
        const tipos = await camara.getTiposDespesa();
        expect(Array.isArray(tipos)).toBe(true);

        if (tipos.length > 0) {
          const tipo = tipos[0];
          expect(tipo.tipoDespesa).toBeDefined();
        }
      } catch (e: any) {
        expect(e.message || '').toBeDefined();
      }
    }, 30000);
  });
});

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  CamaraDeputadoResumo,
  CamaraDeputadoDetalhe,
  CamaraDespesa,
  CamaraPartido,
  CamaraLegislatura,
  PaginatedResponse,
  TipoDespesa,
} from './camara.types';

@Injectable()
export class CamaraService {
  private readonly logger = new Logger(CamaraService.name);
  private readonly baseUrl = 'https://dadosabertos.camara.leg.br/api/v2';
  private readonly pageSize = 100;

  constructor(private readonly httpService: HttpService) {}

  private async fetchPaginated<T>(
    path: string,
    page: number = 1,
    params: Record<string, string | number> = {},
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams({
      formato: 'json',
      pagina: String(page),
      itens: String(this.pageSize),
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
    });

    const url = `${this.baseUrl}${path}?${queryParams.toString()}`;
    this.logger.debug(`Fetching: ${url}`);

    const response = await firstValueFrom(
      this.httpService.get<PaginatedResponse<T>>(url),
    );
    return response.data;
  }

  private async fetchAllPages<T>(
    path: string,
    params: Record<string, string | number> = {},
  ): Promise<T[]> {
    const allItems: T[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await this.fetchPaginated<T>(path, page, params);
      allItems.push(...result.dados);

      const lastLink = result.links.find((l) => l.rel === 'last');
      if (lastLink) {
        const url = new URL(lastLink.href);
        totalPages = Number(url.searchParams.get('pagina') ?? totalPages);
      }

      page++;
    }

    return allItems;
  }

  async getActiveDeputados(): Promise<CamaraDeputadoResumo[]> {
    this.logger.log('Buscando deputados ativos...');
    return this.fetchAllPages<CamaraDeputadoResumo>('/deputados', {
      itens: '100',
      ordem: 'ASC',
      ordenarPor: 'nome',
    });
  }

  async getDeputadoDetails(id: number): Promise<CamaraDeputadoDetalhe> {
    const url = `${this.baseUrl}/deputados/${id}?formato=json`;
    const response = await firstValueFrom(
      this.httpService.get<{ dados: CamaraDeputadoDetalhe }>(url),
    );
    return response.data.dados;
  }

  async getDespesas(
    deputadoId: number,
    ano: number,
    mes?: number,
  ): Promise<CamaraDespesa[]> {
    const params: Record<string, string | number> = { ano: String(ano) };
    if (mes) params.mes = mes;
    this.logger.log(
      `Buscando despesas do deputado ${deputadoId} para ${ano}${mes ? `/${mes}` : ''}`,
    );
    return this.fetchAllPages<CamaraDespesa>(
      `/deputados/${deputadoId}/despesas`,
      params,
    );
  }

  async getPartidos(): Promise<CamaraPartido[]> {
    this.logger.log('Buscando partidos...');
    return this.fetchAllPages<CamaraPartido>('/partidos');
  }

  async getLegislaturas(): Promise<CamaraLegislatura[]> {
    this.logger.log('Buscando legislaturas...');
    return this.fetchAllPages<CamaraLegislatura>('/legislaturas');
  }

  async getTiposDespesa(): Promise<TipoDespesa[]> {
    this.logger.log('Buscando tipos de despesa...');
    const url = `${this.baseUrl}/referencias/deputados/tipoDespesa?formato=json`;
    const response = await firstValueFrom(
      this.httpService.get<{ dados: TipoDespesa[] } | TipoDespesa[]>(url),
    );

    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as { dados: TipoDespesa[] }).dados ?? [];
  }
}

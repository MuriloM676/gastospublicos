export interface CamaraDeputadoResumo {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string | null;
}

export interface CamaraDeputadoDetalhe {
  id: number;
  uri: string;
  nomeCivil: string;
  ultimoStatus: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string | null;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
    email: string | null;
    data: string;
    nomeEleitoral: string;
    situacao: string;
    condicaoEleitoral: string;
    descricaoStatus: string | null;
  };
  cpf: string;
  sexo: string;
  dataNascimento: string;
  ufNascimento: string;
  municipioNascimento: string;
  escolaridade: string;
}

export interface CamaraDespesa {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codTipoDespesa: number;
  tipoDocumento: string;
  codTipoDocumento: number;
  dataDocumento: string;
  numDocumento: string;
  valorDocumento: number;
  urlDocumento: string;
  nomeFornecedor: string;
  cnpjCpfFornecedor: string;
  codLote: number;
  parcela: number;
}

export interface CamaraPartido {
  id: number;
  sigla: string;
  nome: string;
  uri: string;
}

export interface CamaraLegislatura {
  id: number;
  uri: string;
  dataInicio: string;
  dataFim: string;
}

export interface PaginatedResponse<T> {
  dados: T[];
  links: Array<{
    rel: string;
    href: string;
  }>;
}

export interface TipoDespesa {
  codTipoDespesa: number;
  tipoDespesa: string;
}

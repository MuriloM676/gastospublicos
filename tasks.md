# TASKS.md

> Gerado automaticamente a partir dos arquivos em `.specs/`

---

## Ordem de Implementação

### FASE 0 — Fundação (Infraestrutura)
| Ordem | Spec | Tema | Dependências |
|-------|------|------|-------------|
| 1 | SPEC-001 | Arquitetura do Sistema | Nenhuma |
| 2 | SPEC-011 | Observabilidade | SPEC-001 |
| 3 | SPEC-012 | Segurança e Performance | SPEC-001, SPEC-010 |

### FASE 1 — Dados (Backend + Banco)
| Ordem | Spec | Tema | Dependências |
|-------|------|------|-------------|
| 4 | SPEC-003 | Modelo de Dados (Prisma Schema) | SPEC-001 |
| 5 | SPEC-013 | Integração Câmara dos Deputados | SPEC-003 |
| 6 | SPEC-002 | Importação de Dados da Câmara | SPEC-003, SPEC-013 |

### FASE 2 — API (Backend)
| Ordem | Spec | Tema | Dependências |
|-------|------|------|-------------|
| 7 | SPEC-010 | API Pública | SPEC-003, SPEC-001 |

### FASE 3 — Funcionalidades Core (Frontend + Backend)
| Ordem | Spec | Tema | Dependências |
|-------|------|------|-------------|
| 8 | SPEC-004 | Ranking Nacional | SPEC-003, SPEC-010 |
| 9 | SPEC-005 | Perfil do Político | SPEC-003, SPEC-010, SPEC-004 |
| 10 | SPEC-006 | Busca e Autocomplete | SPEC-003, SPEC-010 |
| 11 | SPEC-007 | Rankings por Categoria | SPEC-003, SPEC-010, SPEC-004 |
| 12 | SPEC-008 | Mapa do Brasil | SPEC-003, SPEC-010 |
| 13 | SPEC-009 | Dashboard Analítico | SPEC-003, SPEC-010, SPEC-004 |

---

## Dependências entre Specs

### Dependências Detalhadas

| Spec | Depende de | Fornece para |
|------|-----------|-------------|
| **SPEC-001** Arquitetura | — (raiz) | Todas as specs |
| **SPEC-011** Observabilidade | SPEC-001 | — (cross-cutting) |
| **SPEC-012** Segurança e Performance | SPEC-001, SPEC-010 | — (cross-cutting) |
| **SPEC-003** Modelo de Dados | SPEC-001 | SPEC-002, SPEC-010, SPEC-013 |
| **SPEC-013** Integração Câmara | SPEC-003 | SPEC-002 |
| **SPEC-002** Importação Câmara | SPEC-003, SPEC-013 | — (popula dados) |
| **SPEC-010** API Pública | SPEC-003, SPEC-001 | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-008, SPEC-009 |
| **SPEC-004** Ranking Nacional | SPEC-003, SPEC-010 | SPEC-005, SPEC-007, SPEC-009 |
| **SPEC-005** Perfil do Político | SPEC-003, SPEC-010, SPEC-004 | — |
| **SPEC-006** Busca | SPEC-003, SPEC-010 | — |
| **SPEC-007** Ranking por Categoria | SPEC-003, SPEC-010, SPEC-004 | — |
| **SPEC-008** Mapa do Brasil | SPEC-003, SPEC-010 | — |
| **SPEC-009** Dashboard Analítico | SPEC-003, SPEC-010, SPEC-004 | — |

---

## Tasks por Spec

### SPEC-001 — Arquitetura do Sistema (Tasks: TASK-001 a TASK-005)
Critérios de Aceitação: CA-001 a CA-005

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-001 | Configurar Docker Compose com PostgreSQL, backend NestJS e frontend Next.js | CA-001 |
| TASK-002 | Configurar frontend Next.js acessível na porta configurada | CA-002 |
| TASK-003 | Configurar backend NestJS acessível na porta configurada | CA-003 |
| TASK-004 | Configurar banco PostgreSQL operacional | CA-004 |
| TASK-005 | Configurar documentação Swagger no backend | CA-005 |

### SPEC-002 — Importação de Dados da Câmara (Tasks: TASK-006 a TASK-010)
Critérios de Aceitação: CA-001 a CA-005

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-006 | Implementar importação de todos os deputados ativos | CA-001 |
| TASK-007 | Implementar importação de despesas associadas aos deputados | CA-002 |
| TASK-008 | Implementar prevenção de duplicidade em sincronizações | CA-003 |
| TASK-009 | Garantir consistência dos dados após múltiplas execuções | CA-004 |
| TASK-010 | Implementar logging de erros de importação | CA-005 |

### SPEC-003 — Modelo de Dados (Tasks: TASK-011 a TASK-014)
Critérios de Aceitação: CA-001 a CA-004

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-011 | Criar schema Prisma com chaves estrangeiras entre entidades | CA-001 |
| TASK-012 | Implementar constraint que impede gastos sem político associado | CA-002 |
| TASK-013 | Implementar constraint que impede categorias inexistentes | CA-003 |
| TASK-014 | Garantir que consultas históricas retornem todos os registros | CA-004 |

### SPEC-004 — Ranking Nacional (Tasks: TASK-015 a TASK-019)
Critérios de Aceitação: CA-001 a CA-005

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-015 | Exibir os 3 maiores gastadores em destaque na página inicial | CA-001 |
| TASK-016 | Exibir ranking completo paginado na página inicial | CA-002 |
| TASK-017 | Garantir que o valor corresponda à soma das despesas registradas | CA-003 |
| TASK-018 | Implementar filtros (ano, estado, partido, cargo) que atualizam o ranking | CA-004 |
| TASK-019 | Garantir ordenação correta após aplicação dos filtros | CA-005 |

### SPEC-005 — Perfil do Político (Tasks: TASK-020 a TASK-024)
Critérios de Aceitação: CA-001 a CA-005

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-020 | Exibir informações básicas do político (nome, foto, partido, estado, cargo, mandatos) | CA-001 |
| TASK-021 | Exibir resumo financeiro (total gasto, média mensal, rankings) | CA-002 |
| TASK-022 | Exibir histórico de despesas detalhado | CA-003 |
| TASK-023 | Exibir evolução temporal dos gastos (gráfico) | CA-004 |
| TASK-024 | Exibir distribuição por categoria (gráfico donut) | CA-005 |


### SPEC-006 — Busca e Autocomplete (Tasks: TASK-025 a TASK-028)
Critérios de Aceitação: CA-001 a CA-004

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-025 | Implementar busca de político pelo nome (case-insensitive, sem acentos) | CA-001 |
| TASK-026 | Implementar busca de políticos por partido | CA-002 |
| TASK-027 | Implementar autocomplete com sugestões enquanto o usuário digita | CA-003 |
| TASK-028 | Garantir resposta da busca em menos de 500ms | CA-004 |

### SPEC-007 — Rankings por Categoria (Tasks: TASK-029 a TASK-032)
Critérios de Aceitação: CA-001 a CA-004

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-029 | Implementar ranking próprio para cada categoria de despesa | CA-001 |
| TASK-030 | Garantir cálculo correto dos valores por categoria | CA-002 |
| TASK-031 | Implementar filtros (ano, estado, partido) em todas as categorias | CA-003 |
| TASK-032 | Exibir na interface a categoria atualmente selecionada | CA-004 |

### SPEC-008 — Mapa do Brasil (Tasks: TASK-033 a TASK-036)
Critérios de Aceitação: CA-001 a CA-004

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-033 | Renderizar mapa do Brasil com todos os estados | CA-001 |
| TASK-034 | Implementar clique no estado para carregar detalhes (drawer lateral) | CA-002 |
| TASK-035 | Garantir que indicadores reflitam dados atuais | CA-003 |
| TASK-036 | Garantir que filtros globais impactem o mapa | CA-004 |

### SPEC-009 — Dashboard Analítico (Tasks: TASK-037 a TASK-040)
Critérios de Aceitação: CA-001 a CA-004

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-037 | Implementar todos os gráficos (evolução mensal, anual, categorias, partidos, estados) | CA-001 |
| TASK-038 | Implementar filtros globais que refletem em todos os gráficos | CA-002 |
| TASK-039 | Garantir consistência dos dados apresentados | CA-003 |
| TASK-040 | Garantir que não existam divergências entre rankings e gráficos | CA-004 |


### SPEC-010 — API Pública (Tasks: TASK-041 a TASK-045)
Critérios de Aceitação: CA-001 a CA-005

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-041 | Implementar todos os endpoints (politicians, rankings, expenses, states, parties) | CA-001 |
| TASK-042 | Manter documentação Swagger atualizada | CA-002 |
| TASK-043 | Implementar paginação em todos os endpoints | CA-003 |
| TASK-044 | Implementar filtros em todos os endpoints | CA-004 |
| TASK-045 | Implementar rate limiting | CA-005 |

### SPEC-011 — Observabilidade (Tasks: TASK-046 a TASK-049)
Critérios de Aceitação: CA-001 a CA-004

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-046 | Implementar persistência de logs | CA-001 |
| TASK-047 | Garantir rastreabilidade de falhas | CA-002 |
| TASK-048 | Disponibilizar métricas para consulta | CA-003 |
| TASK-049 | Implementar endpoint /health com status do sistema | CA-004 |

### SPEC-012 — Segurança e Performance (Tasks: TASK-050 a TASK-054)
Critérios de Aceitação: CA-001 a CA-005

| Task ID | Descrição | Critério |
|---------|-----------|----------|
| TASK-050 | Implementar validação de entrada em todos os endpoints | CA-001 |
| TASK-051 | Implementar rate limiting funcional | CA-002 |
| TASK-052 | Implementar paginação em todas as consultas | CA-003 |
| TASK-053 | Criar índices para consultas críticas | CA-004 |
| TASK-054 | Garantir tempo de resposta dentro dos limites (API < 500ms, página inicial < 2s, busca < 500ms) | CA-005 |

---

## Documentos de Referência

| Documento | Descrição |
|-----------|-----------|
| `.specs/ui-guidelines.md` | Design system, cores, tipografia, componentes, responsividade |
| `.specs/api-contracts.md` | Contratos de todas as APIs REST |
| `.specs/acceptance-matrix.md` | Matriz completa de critérios de aceitação vs tasks vs testes |
| `.specs/AGENTS.md` | Regras de implementação para agents de IA |

---

## Fases de Implementação (Resumo)

1. **FASE 0 — Fundação**: Docker, Next.js, NestJS, PostgreSQL, Observabilidade, Segurança
2. **FASE 1 — Dados**: Schema Prisma, Integração com API Câmara, Importação e Sincronização
3. **FASE 2 — API**: Endpoints REST públicos com documentação, paginação, filtros
4. **FASE 3 — Features**: Ranking, Perfil, Busca, Categorias, Mapa, Dashboard

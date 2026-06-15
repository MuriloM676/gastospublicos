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
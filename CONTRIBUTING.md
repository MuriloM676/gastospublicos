# Contribuindo para o Gastos Públicos

## Estratégia de Branches

O projeto adota o modelo **GitHub Flow simplificado com branch de desenvolvimento**.

### Branches Permanentes

| Branch | Finalidade |
|---|---|
| `main` | Código pronto para produção. Nunca recebe commits diretos. |
| `develop` | Integração contínua de funcionalidades concluídas. Nunca recebe commits diretos (exceto correções críticas aprovadas). |

### Branches Temporárias

Criadas a partir de `develop` e removidas após o merge.

| Prefixo | Finalidade | Exemplo |
|---|---|---|
| `feature/` | Nova funcionalidade | `feature/autenticacao-jwt` |
| `fix/` | Correção de bug | `fix/calculo-total-incorreto` |
| `chore/` | Tarefas de manutenção, configs, dependências | `chore/atualizar-dependencias` |
| `hotfix/` | Correção urgente diretamente em `main` | `hotfix/falha-critica-login` |
| `refactor/` | Refatoração sem mudança de comportamento | `refactor/reorganizar-modulo-usuario` |

### Regras de Nomenclatura

- Usar apenas letras minúsculas, números e hífens.
- Incluir o prefixo correspondente ao tipo.
- Nome descritivo e conciso, sem espaços ou caracteres especiais.
- Opcionalmente referenciar o ID da tarefa: `feature/SPEC-012-relatorio-gastos`.

## Fluxo de Trabalho

### Desenvolvimento de funcionalidade

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature
```

1. Desenvolva e faça commits na branch criada.
2. Abra um Pull Request de `feature/nome-da-feature` para `develop`.
3. O pipeline de CI será executado automaticamente.
4. Solicite revisão de pelo menos 1 outro desenvolvedor.
5. Após aprovação e CI verde, faça o merge utilizando **Squash and Merge**.
6. A branch será removida automaticamente após o merge.

### Promoção para produção

1. Abra um Pull Request de `develop` para `main`.
2. O pipeline de CI será executado.
3. Solicite pelo menos 1 aprovação.
4. Faça o merge utilizando **Merge Commit**.

### Correção urgente (hotfix)

```bash
git checkout main
git pull origin main
git checkout -b hotfix/nome-do-hotfix
```

1. Corrija e faça commits na branch.
2. Abra Pull Request para `main`.
3. Após merge em `main`, aplique a correção em `develop` via cherry-pick.

## Pipeline de CI/CD

O projeto utiliza GitHub Actions para validação automática.

### Workflows

| Workflow | Arquivo | Dispara em |
|---|---|---|
| **Test** | `.github/workflows/test.yml` | Push/PR em `main` ou `develop` |
| **Lint** | `.github/workflows/lint.yml` | Push/PR em `main` ou `develop` |

### Status Checks Obrigatórios

Para merge em `main` ou `develop`:

- ✅ `CI - Test` deve passar
- ✅ `CI - Lint` deve passar
- ✅ Pelo menos 1 aprovação de review

### Secrets Necessários no Repositório

As seguintes variáveis devem ser configuradas em **Settings → Secrets and variables → Actions**:

| Secret | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão com PostgreSQL (ex: `postgresql://gastospublicos:gastospublicos@localhost:5432/gastospublicos_test`) |
| `JWT_SECRET` | Chave secreta para geração de tokens JWT |

## Regras de Proteção de Branches

As seguintes regras estão/configuradas no repositório (via Settings → Branches):

| Regra | `main` | `develop` |
|---|---|---|
| Requer Pull Request | ✅ | ✅ |
| Aprovações necessárias | 1 | 1 |
| Requer status checks | ✅ (test, lint) | ✅ (test, lint) |
| Requer branches atualizadas | ✅ | ✅ |
| Push direto bloqueado | ✅ | ✅ |
| Force push | ❌ | ❌ |
| Deleção | ❌ | ❌ |

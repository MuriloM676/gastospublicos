<p align="center">
  <h1 align="center">🇧🇷 Gastos Públicos</h1>
  <p align="center">
    <strong>Quanto custam os políticos brasileiros?</strong><br>
    Transparência e análise de gastos públicos com dados oficiais da Câmara dos Deputados.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
</p>

---

## 📖 Sobre

**Gastos Públicos** é uma plataforma open-source que consome dados oficiais da [API Dados Abertos da Câmara dos Deputados](https://dadosabertos.camara.leg.br/) para promover transparência sobre os gastos parlamentares no Brasil.

A interface é inspirada em dashboards modernos como **Stripe**, **Linear** e **Vercel**, priorizando clareza, comparação rápida e design minimalista.

### ✨ Destaques

- 🏆 **Ranking Nacional** dos políticos por total de gastos
- 👤 **Perfil detalhado** de cada parlamentar com KPIs e histórico
- 🔍 **Busca instantânea** com autocomplete
- 📊 **Dashboard Analítico** com agregados por estado, partido e categoria
- 🌐 **API Pública** documentada com Swagger
- 🐳 **Docker Compose** para deploy simplificado
- 🎨 **Dark Mode** como padrão

---

## 🚀 Quick Start

```bash
git clone https://github.com/seu-usuario/gastospublicos.git
cd gastospublicos
docker compose up --build -d
```

### Desenvolvimento local

```bash
# Banco
docker compose up -d postgres

# Backend
cd backend && npm install
npx prisma migrate dev && npx prisma db seed
npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────┐
│              Docker Compose                   │
│                                              │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐  │
│  │ Next.js │──▶│  NestJS  │──▶│PostgreSQL│  │
│  │ :3000   │   │  :3001   │   │ :5432    │  │
│  └─────────┘   └────┬─────┘   └──────────┘  │
│                     │                        │
│                     ▼                        │
│            ┌──────────────┐                  │
│            │ Câmara API   │                  │
│            └──────────────┘                  │
└──────────────────────────────────────────────┘
```

| Camada | Tech |
|--------|------|
| Frontend | Next.js 16, TypeScript, TailwindCSS 4, Shadcn UI |
| Backend | NestJS 11, Prisma ORM 5, Swagger |
| Banco | PostgreSQL 16 |
| Infra | Docker, Docker Compose |

---

## 📊 Banco de Dados

6 entidades com FK, índices e prevenção de duplicatas:

```
Politician ──┬── State (27 UFs)
             ├── Party (31 partidos)
             ├── Expense ── ExpenseCategory (8 categorias)
             └── Mandate
```

---

## 🔌 API (base: `/api/v1`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/rankings/national` | Ranking com filtros |
| `GET` | `/rankings/top` | Top 3 gastadores |
| `GET` | `/politicians/:id` | Perfil completo |
| `GET` | `/politicians/:id/expenses` | Gastos detalhados |
| `GET` | `/politicians/:id/evolution` | Evolução mensal/anual |
| `GET` | `/search?q=` | Busca |
| `GET` | `/states` | Estados |
| `GET` | `/dashboard/overview` | Dashboard |
| `GET` | `/dashboard/states` | Gastos/estado |
| `GET` | `/dashboard/parties` | Gastos/partido |
| `GET` | `/dashboard/categories` | Gastos/categoria |
| `GET` | `/health` | Healthcheck |
| `POST` | `/import/sync` | Sincronização Câmara |

📘 Swagger: `http://localhost:3001/api/docs`

---

## 🎨 Design System

Dark mode por padrão, inspirado em Stripe / Linear / Vercel.

| Token | Cor |
|-------|-----|
| Background | `#0B1220` |
| Card | `#111827` |
| Primary | `#3B82F6` |
| Success | `#10B981` |
| Text | `#F9FAFB` |
| Muted | `#9CA3AF` |
| Font | Inter |

---

## 📁 Estrutura do Projeto

```
├── .specs/            # 13 specs + contracts + guidelines
├── tasks.md           # 54 tasks mapeadas
├── docker-compose.yml
├── backend/           # NestJS API
│   ├── prisma/        # Schema + Migrations + Seed
│   └── src/
│       ├── api/       # Rankings, Politicians, Search, Dashboard
│       ├── camara/    # Integração com API da Câmara
│       ├── import/    # Importação e sincronização
│       └── prisma/    # PrismaService
└── frontend/          # Next.js App
    └── src/
        ├── app/       # /, /rankings, /politicians/[id], /dashboard
        ├── components/ # Navbar
        └── lib/       # API client + helpers
```

---

## 📜 Fonte dos Dados

Origem: [API Dados Abertos da Câmara dos Deputados](https://dadosabertos.camara.leg.br/)

- 513 deputados ativos
- Despesas parlamentares desde 2008
- Sincronização incremental, zero dados manuais
- Toda informação rastreável via `externalId`

---

## 🤝 Contribuindo

1. Fork
2. Branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'feat: descrição'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

MIT

---

<p align="center">
  <sub>Dados oficiais da Câmara dos Deputados do Brasil.</sub>
</p>


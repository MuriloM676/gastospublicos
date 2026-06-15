# API-CONTRACTS

Versão: v1

## Convenções

Base URL:

/api/v1

Formato:

application/json

Paginação:

page
limit

Ordenação:

sort
order

---

# Ranking Nacional

GET /rankings/national

Query Params:

year
state
party
position
page
limit

Response

{
"items": [
{
"id": 123,
"name": "João Silva",
"party": "PL",
"state": "SP",
"position": "Deputado Federal",
"totalExpenses": 1245000.50,
"ranking": 1
}
],
"page": 1,
"limit": 20,
"total": 513
}

---

# Top 3 Gastadores

GET /rankings/top

Response

{
"first": {},
"second": {},
"third": {}
}

---

# Perfil do Político

GET /politicians/:id

Response

{
"id": 123,
"name": "João Silva",
"photoUrl": "",
"party": "PL",
"state": "SP",
"position": "Deputado Federal",
"firstElectionDate": "2014-01-01",
"totalExpenses": 1245000.50,
"monthlyAverage": 103750.00,
"nationalRanking": 1,
"stateRanking": 1,
"partyRanking": 3
}

---

# Gastos do Político

GET /politicians/:id/expenses

Query:

year
category
page
limit

Response

{
"items": [
{
"date": "2026-01-10",
"category": "Combustível",
"supplier": "Posto XPTO",
"description": "Abastecimento",
"amount": 1500.50,
"documentUrl": ""
}
]
}

---

# Evolução dos Gastos

GET /politicians/:id/evolution

Response

{
"monthly": [],
"yearly": []
}

---

# Busca

GET /search

Query:

q

Response

{
"items": [
{
"id": 123,
"name": "João Silva",
"party": "PL",
"state": "SP"
}
]
}

---

# Estados

GET /states

Response

[
{
"code": "SP",
"name": "São Paulo"
}
]

---

# Dashboard

GET /dashboard/overview

Response

{
"totalExpenses": 0,
"totalPoliticians": 0,
"topSpender": {},
"topParty": {}
}

---

# Gastos por Estado

GET /dashboard/states

Response

[
{
"state": "SP",
"totalExpenses": 0
}
]

---

# Gastos por Partido

GET /dashboard/parties

Response

[
{
"party": "PL",
"totalExpenses": 0
}
]

---

# Gastos por Categoria

GET /dashboard/categories

Response

[
{
"category": "Combustível",
"totalExpenses": 0
}
]

---

# Healthcheck

GET /health

Response

{
"status": "healthy",
"database": "up",
"api": "up"
}

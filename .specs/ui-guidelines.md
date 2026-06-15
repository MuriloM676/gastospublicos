# UI-GUIDELINES

Versão: v1

## Objetivo

Definir um padrão visual único para todo o sistema.

O objetivo da interface é transmitir:

* Transparência
* Credibilidade
* Simplicidade
* Facilidade de comparação

A experiência deve lembrar plataformas modernas de análise de dados como:

* Stripe Dashboard
* Plausible Analytics
* Linear
* Vercel Dashboard

Evitar aparência governamental antiga.

---

# Design Principles

## Regra 1

Dados primeiro.

O dado deve ser mais importante que o design.

---

## Regra 2

Menos é mais.

Evitar excesso de cores.

Evitar excesso de elementos decorativos.

---

## Regra 3

Comparação rápida.

O usuário deve conseguir identificar rapidamente:

* Quem mais gastou
* Quanto gastou
* Em que gastou

---

# Tema

## Modo padrão

Dark Mode

---

## Cores

Background:

#0B1220

Card:

#111827

Card Hover:

#1F2937

Border:

#374151

Primary:

#3B82F6

Success:

#10B981

Warning:

#F59E0B

Danger:

#EF4444

Text:

#F9FAFB

Muted:

#9CA3AF

---

# Tipografia

Fonte:

Inter

Fallback:

sans-serif

---

# Espaçamento

Grid:

8px

Valores permitidos:

8
16
24
32
40
48
64

---

# Layout Global

Estrutura:

Navbar

Conteúdo

Footer

---

# Navbar

Itens:

Logo

Buscar político

Rankings

Mapa

Dashboard

API

GitHub

Altura:

72px

Sticky obrigatório

---

# Página Inicial

## Seção Hero

Título:

Quanto custam os políticos brasileiros?

Subtítulo:

Explore gastos públicos utilizando dados oficiais e auditáveis.

CTA:

Explorar Ranking

---

## Seção Top 3

Layout:

3 cards horizontais

Desktop:

3 colunas

Tablet:

2 colunas

Mobile:

1 coluna

---

## Card Top 3

Exibir:

Foto

Nome

Partido

Estado

Total gasto

Posição

Indicador visual:

🥇
🥈
🥉

---

## Ranking Completo

Tabela

Colunas:

Posição

Nome

Partido

Estado

Total Gasto

Média Mensal

Ver Perfil

---

# Página do Político

## Header

Foto grande

Nome

Partido

Estado

Cargo

Mandatos

---

## KPIs

Total gasto

Média mensal

Ranking nacional

Ranking estadual

Ranking partidário

Layout:

5 cards

---

## Gráfico Evolução

Tipo:

Line Chart

Período:

Mensal

Anual

---

## Distribuição por Categoria

Tipo:

Donut Chart

---

## Gastos Detalhados

Tabela

Colunas:

Data

Categoria

Fornecedor

Descrição

Valor

Documento

---

# Dashboard

Layout:

Grid responsivo

---

## Bloco 1

Gastos por Estado

Mapa

---

## Bloco 2

Gastos por Partido

Bar Chart

---

## Bloco 3

Evolução Temporal

Line Chart

---

## Bloco 4

Categorias

Pie Chart

---

# Página de Busca

Busca centralizada

Autocomplete obrigatório

Resultados instantâneos

Tempo alvo:

<500ms

---

# Mapa do Brasil

Biblioteca:

Leaflet

ou

Mapbox

---

Ao clicar no estado:

Abrir drawer lateral.

Exibir:

Total gasto

Número de políticos

Maior gastador

Partido dominante

---

# Tabelas

Obrigatório:

Ordenação

Paginação

Filtros

Busca

---

# Componentes Permitidos

Shadcn UI

Card

Table

Drawer

Dialog

Tabs

Select

Badge

Tooltip

Dropdown

Chart Container

---

# Componentes Proibidos

Bootstrap

Material UI

Ant Design

JQuery

---

# Responsividade

Mobile:

320px+

Tablet:

768px+

Desktop:

1280px+

---

# Performance

LCP menor que 2 segundos

CLS menor que 0.1

Bundle inicial menor que 300KB

---

# Acessibilidade

Todos os botões devem possuir label.

Todos os inputs devem possuir label.

Navegação por teclado obrigatória.

Contraste mínimo AA.

---

# Estados de Interface

Loading

Empty State

Error State

Success State

Todos obrigatórios.

---

# Mensagens

Tom:

Informativo

Objetivo

Neutro

Sem posicionamento político.

Sem adjetivos.

Sem opinião.

Somente dados.

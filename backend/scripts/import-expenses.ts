import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BASE_URL = 'https://dadosabertos.camara.leg.br/api/v2';

async function importExpenses(ano: number) {
  // Pega deputados sem despesas nesse ano
  const politicians = await prisma.politician.findMany({
    where: {
      expenses: {
        none: {
          expenseDate: {
            gte: new Date(ano, 0, 1),
            lt: new Date(ano + 1, 0, 1),
          },
        },
      },
    },
  });

  console.log(`${politicians.length} deputados sem despesas para ${ano}`);

  let total = 0;
  let completed = 0;

  for (const pol of politicians) {
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${BASE_URL}/deputados/${pol.externalId}/despesas?ano=${ano}&itens=100&pagina=${page}&formato=json`;
        const { data } = await axios.get(url);

        for (const desp of data.dados) {
          const externalId = `${pol.externalId}-${desp.ano}-${desp.mes}-${desp.numDocumento}`;

          const category = await prisma.expenseCategory.upsert({
            where: { name: desp.tipoDespesa },
            update: {},
            create: { name: desp.tipoDespesa },
          });

          await prisma.expense.upsert({
            where: { externalId },
            update: { amount: desp.valorDocumento },
            create: {
              externalId,
              politicianId: pol.id,
              categoryId: category.id,
              supplier: desp.nomeFornecedor,
              description: desp.tipoDespesa,
              amount: desp.valorDocumento,
              expenseDate: new Date(desp.dataDocumento),
              documentUrl: desp.urlDocumento || '',
            },
          });
          total++;
        }

        // Check if there are more pages
        const lastLink = data.links.find((l: any) => l.rel === 'last');
        if (lastLink) {
          const urlObj = new URL(lastLink.href);
          const totalPages = Number(urlObj.searchParams.get('pagina') || page);
          hasMore = page < totalPages;
        } else {
          hasMore = false;
        }
        page++;
      }

      completed++;
      if (completed % 10 === 0) {
        console.log(`Progresso: ${completed}/${politicians.length}, ${total} despesas`);
      }
    } catch (err: any) {
      console.error(`Erro deputado ${pol.externalId}: ${err.message?.substring(0, 100)}`);
    }
  }

  console.log(`FIM: ${total} despesas de ${completed}/${politicians.length} deputados`);
}

const ano = parseInt(process.argv[2] || '2025', 10);
importExpenses(ano)
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const states = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

const parties = [
  { acronym: 'PL', name: 'Partido Liberal' },
  { acronym: 'PT', name: 'Partido dos Trabalhadores' },
  { acronym: 'UNIÃO', name: 'União Brasil' },
  { acronym: 'PP', name: 'Progressistas' },
  { acronym: 'MDB', name: 'Movimento Democrático Brasileiro' },
  { acronym: 'PSD', name: 'Partido Social Democrático' },
  { acronym: 'REPUBLICANOS', name: 'Republicanos' },
  { acronym: 'PDT', name: 'Partido Democrático Trabalhista' },
  { acronym: 'PSDB', name: 'Partido da Social Democracia Brasileira' },
  { acronym: 'PODE', name: 'Podemos' },
  { acronym: 'PSB', name: 'Partido Socialista Brasileiro' },
  { acronym: 'PTB', name: 'Partido Trabalhista Brasileiro' },
  { acronym: 'SOLIDARIEDADE', name: 'Solidariedade' },
  { acronym: 'NOVO', name: 'Partido Novo' },
  { acronym: 'PCdoB', name: 'Partido Comunista do Brasil' },
  { acronym: 'PV', name: 'Partido Verde' },
  { acronym: 'CIDADANIA', name: 'Cidadania' },
  { acronym: 'AVANTE', name: 'Avante' },
  { acronym: 'PSOL', name: 'Partido Socialismo e Liberdade' },
  { acronym: 'PROS', name: 'Partido Republicano da Ordem Social' },
  { acronym: 'PATRIOTA', name: 'Patriota' },
  { acronym: 'DC', name: 'Democracia Cristã' },
  { acronym: 'PMB', name: 'Partido da Mulher Brasileira' },
  { acronym: 'AGIR', name: 'Agir' },
  { acronym: 'REDE', name: 'Rede Sustentabilidade' },
  { acronym: 'PRD', name: 'Partido Renovação Democrática' },
  { acronym: 'MOBILIZA', name: 'Mobilização Nacional' },
  { acronym: 'PSTU', name: 'Partido Socialista dos Trabalhadores Unificado' },
  { acronym: 'PCB', name: 'Partido Comunista Brasileiro' },
  { acronym: 'PCO', name: 'Partido da Causa Operária' },
  { acronym: 'UP', name: 'Unidade Popular' },
];

const expenseCategories = [
  'Combustível',
  'Passagens',
  'Hospedagem',
  'Alimentação',
  'Divulgação',
  'Consultoria',
  'Escritório',
  'Outros',
];

async function main() {
  console.log('🌱 Iniciando seed...');

  for (const state of states) {
    await prisma.state.upsert({
      where: { code: state.code },
      update: { name: state.name },
      create: state,
    });
  }
  console.log(`✅ ${states.length} estados criados`);

  for (const party of parties) {
    await prisma.party.upsert({
      where: { acronym: party.acronym },
      update: { name: party.name },
      create: party,
    });
  }
  console.log(`✅ ${parties.length} partidos criados`);

  for (const name of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${expenseCategories.length} categorias de despesa criadas`);

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

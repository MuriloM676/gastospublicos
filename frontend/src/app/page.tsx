import { Navbar } from "@/components/navbar";
import { fetchTop3, fetchNationalRanking, formatCurrency } from "@/lib/api";

export default async function Home() {
  let top3;
  let ranking;

  try {
    top3 = await fetchTop3();
  } catch {
    top3 = null;
  }

  try {
    ranking = await fetchNationalRanking({ limit: "20" });
  } catch {
    ranking = null;
  }

  const topItems = top3
    ? [
        { position: "🥇", data: top3.first },
        { position: "🥈", data: top3.second },
        { position: "🥉", data: top3.third },
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-32">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-[#F9FAFB] md:text-6xl">
            Quanto custam os políticos brasileiros?
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#9CA3AF]">
            Explore gastos públicos utilizando dados oficiais e auditáveis.
          </p>
          <a
            href="/rankings"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-[#3B82F6] px-8 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
          >
            Explorar Ranking
          </a>
        </section>

        {/* Top 3 Section */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-2xl font-semibold text-[#F9FAFB]">
              Maiores Gastadores
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {topItems.map((item, index) => (
                <a
                  key={index}
                  href={item.data ? `/politicians/${item.data.id}` : "#"}
                  className="rounded-lg border border-[#374151] bg-[#111827] p-6 transition-colors hover:bg-[#1F2937]"
                >
                  <div className="text-3xl">{item.position}</div>
                  <div className="mt-4">
                    <p className="text-lg font-semibold text-[#F9FAFB]">
                      {item.data?.name ?? "Sem dados"}
                    </p>
                    <p className="text-sm text-[#9CA3AF]">
                      {item.data ? `${item.data.party} - ${item.data.state}` : "---"}
                    </p>
                    <p className="mt-2 text-xl font-bold text-[#3B82F6]">
                      {item.data ? formatCurrency(item.data.totalExpenses) : "R$ 0,00"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Ranking Table Section */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-2xl font-semibold text-[#F9FAFB]">
              Ranking Nacional
            </h2>
            <div className="rounded-lg border border-[#374151] bg-[#111827] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#9CA3AF]">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#9CA3AF]">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#9CA3AF]">Partido</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#9CA3AF]">Estado</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#9CA3AF]">Total Gasto</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#9CA3AF]">Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking?.items?.length ? (
                    ranking.items.map((item) => (
                      <tr key={item.id} className="border-b border-[#374151] hover:bg-[#1F2937]">
                        <td className="px-4 py-3 text-sm text-[#9CA3AF]">{item.ranking}</td>
                        <td className="px-4 py-3 text-sm text-[#F9FAFB]">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-[#9CA3AF]">{item.party}</td>
                        <td className="px-4 py-3 text-sm text-[#9CA3AF]">{item.state}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-[#10B981]">
                          {formatCurrency(item.totalExpenses)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <a
                            href={`/politicians/${item.id}`}
                            className="text-[#3B82F6] hover:underline"
                          >
                            Ver Perfil
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#9CA3AF]">
                        Nenhum dado disponível. Aguardando importação.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#374151] px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-[#9CA3AF]">
          Dados oficiais da Câmara dos Deputados do Brasil.
        </div>
      </footer>
    </div>
  );
}

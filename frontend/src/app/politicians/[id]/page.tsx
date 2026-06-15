import { Navbar } from "@/components/navbar";
import { fetchPolitician, fetchPoliticianExpenses, formatCurrency } from "@/lib/api";
import Link from "next/link";

export default async function PoliticianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const politician = await fetchPolitician(parseInt(id, 10));
  const expenses = await fetchPoliticianExpenses(parseInt(id, 10), { limit: "50" });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link href="/" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB]">
            ← Voltar ao ranking
          </Link>

          {/* Header */}
          <div className="mt-8 flex items-start gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-[#1F2937] flex items-center justify-center text-3xl text-[#9CA3AF]">
              {politician.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#F9FAFB]">{politician.name}</h1>
              <p className="mt-2 text-[#9CA3AF]">
                {politician.party} · {politician.state} · {politician.position}
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-12 grid gap-4 grid-cols-2 md:grid-cols-5">
            <KpiCard label="Total Gasto" value={formatCurrency(politician.totalExpenses)} />
            <KpiCard label="Média Mensal" value={formatCurrency(politician.monthlyAverage)} />
            <KpiCard label="Ranking Nacional" value={`#${politician.nationalRanking}`} />
            <KpiCard label="Ranking Estadual" value={`#${politician.stateRanking}`} />
            <KpiCard label="Ranking Partidário" value={`#${politician.partyRanking}`} />
          </div>

          {/* Expenses Table */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-4">Gastos Detalhados</h2>
            <div className="rounded-lg border border-[#374151] bg-[#111827] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Data</th>
                    <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Categoria</th>
                    <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Fornecedor</th>
                    <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Descrição</th>
                    <th className="px-4 py-3 text-right text-sm text-[#9CA3AF]">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.items.map((e, i) => (
                    <tr key={i} className="border-b border-[#374151]">
                      <td className="px-4 py-3 text-sm text-[#F9FAFB]">{e.date}</td>
                      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{e.category}</td>
                      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{e.supplier}</td>
                      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{e.description}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#10B981]">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-[#374151] px-6 py-8 text-center text-sm text-[#9CA3AF]">
        Dados oficiais da Câmara dos Deputados do Brasil.
      </footer>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#374151] bg-[#111827] p-4">
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#F9FAFB]">{value}</p>
    </div>
  );
}

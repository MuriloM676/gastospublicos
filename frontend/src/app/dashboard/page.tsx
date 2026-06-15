import { Navbar } from "@/components/navbar";
import { formatCurrency } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchData(path: string) {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
  return res.json();
}

export default async function DashboardPage() {
  const [overview, states, parties, categories] = await Promise.all([
    fetchData('/api/v1/dashboard/overview').catch(() => null),
    fetchData('/api/v1/dashboard/states').catch(() => []),
    fetchData('/api/v1/dashboard/parties').catch(() => []),
    fetchData('/api/v1/dashboard/categories').catch(() => []),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-3xl font-bold text-[#F9FAFB] mb-8">Dashboard Analítico</h1>

          {/* Overview Cards */}
          {overview && (
            <div className="grid gap-4 md:grid-cols-4 mb-12">
              <div className="rounded-lg border border-[#374151] bg-[#111827] p-4">
                <p className="text-xs text-[#9CA3AF]">Total Gasto</p>
                <p className="mt-1 text-xl font-bold text-[#F9FAFB]">{formatCurrency(overview.totalExpenses)}</p>
              </div>
              <div className="rounded-lg border border-[#374151] bg-[#111827] p-4">
                <p className="text-xs text-[#9CA3AF]">Total Políticos</p>
                <p className="mt-1 text-xl font-bold text-[#F9FAFB]">{overview.totalPoliticians}</p>
              </div>
              <div className="rounded-lg border border-[#374151] bg-[#111827] p-4">
                <p className="text-xs text-[#9CA3AF]">Maior Gastador</p>
                <p className="mt-1 text-lg font-bold text-[#F9FAFB]">{overview.topSpender?.name || 'N/A'}</p>
              </div>
              <div className="rounded-lg border border-[#374151] bg-[#111827] p-4">
                <p className="text-xs text-[#9CA3AF]">Partido com Maior Gasto</p>
                <p className="mt-1 text-lg font-bold text-[#F9FAFB]">{overview.topParty?.acronym || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* States */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-4">Gastos por Estado</h2>
            <div className="rounded-lg border border-[#374151] bg-[#111827] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Estado</th>
                    <th className="px-4 py-3 text-right text-sm text-[#9CA3AF]">Total Gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-[#374151]">
                      <td className="px-4 py-3 text-sm text-[#F9FAFB]">{s.state}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#10B981]">{formatCurrency(s.totalExpenses)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Parties */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-4">Gastos por Partido</h2>
            <div className="rounded-lg border border-[#374151] bg-[#111827] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Partido</th>
                    <th className="px-4 py-3 text-right text-sm text-[#9CA3AF]">Total Gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.slice(0, 20).map((p: any, i: number) => (
                    <tr key={i} className="border-b border-[#374151]">
                      <td className="px-4 py-3 text-sm text-[#F9FAFB]">{p.party}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#10B981]">{formatCurrency(p.totalExpenses)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Categories */}
          <section>
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-4">Gastos por Categoria</h2>
            <div className="rounded-lg border border-[#374151] bg-[#111827] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Categoria</th>
                    <th className="px-4 py-3 text-right text-sm text-[#9CA3AF]">Total Gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-[#374151]">
                      <td className="px-4 py-3 text-sm text-[#F9FAFB]">{c.category}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#10B981]">{formatCurrency(c.totalExpenses)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

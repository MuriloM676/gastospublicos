import { Navbar } from "@/components/navbar";
import { fetchNationalRanking, formatCurrency } from "@/lib/api";

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const data = await fetchNationalRanking(sp);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-3xl font-bold text-[#F9FAFB]">Ranking Nacional</h1>

          {/* Filtros */}
          <form className="mt-6 flex flex-wrap gap-4">
            <input
              name="year"
              placeholder="Ano"
              defaultValue={sp.year || ""}
              className="rounded-lg border border-[#374151] bg-[#111827] px-4 py-2 text-sm text-[#F9FAFB] placeholder-[#9CA3AF]"
            />
            <input
              name="state"
              placeholder="Estado (UF)"
              defaultValue={sp.state || ""}
              className="rounded-lg border border-[#374151] bg-[#111827] px-4 py-2 text-sm text-[#F9FAFB] placeholder-[#9CA3AF]"
            />
            <input
              name="party"
              placeholder="Partido"
              defaultValue={sp.party || ""}
              className="rounded-lg border border-[#374151] bg-[#111827] px-4 py-2 text-sm text-[#F9FAFB] placeholder-[#9CA3AF]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB]"
            >
              Filtrar
            </button>
          </form>

          {/* Tabela */}
          <div className="mt-8 rounded-lg border border-[#374151] bg-[#111827] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#374151]">
                  <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">#</th>
                  <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Nome</th>
                  <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Partido</th>
                  <th className="px-4 py-3 text-left text-sm text-[#9CA3AF]">Estado</th>
                  <th className="px-4 py-3 text-right text-sm text-[#9CA3AF]">Total Gasto</th>
                  <th className="px-4 py-3 text-right text-sm text-[#9CA3AF]">Perfil</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-[#374151] hover:bg-[#1F2937]">
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">{item.ranking}</td>
                    <td className="px-4 py-3 text-sm text-[#F9FAFB]">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">{item.party}</td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">{item.state}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-[#10B981]">
                      {formatCurrency(item.totalExpenses)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <a href={`/politicians/${item.id}`} className="text-[#3B82F6] hover:underline">
                        Ver Perfil
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

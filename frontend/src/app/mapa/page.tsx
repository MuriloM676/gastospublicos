import { Navbar } from "@/components/navbar";
import { formatCurrency } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface StateData {
  state: string;
  totalExpenses: number;
}

const stateNames: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia",
  RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

function getColor(expenses: number, max: number): string {
  if (max === 0) return "#1F2937";
  const ratio = expenses / max;
  if (ratio > 0.8) return "#EF4444";
  if (ratio > 0.5) return "#F59E0B";
  if (ratio > 0.2) return "#3B82F6";
  if (ratio > 0) return "#10B981";
  return "#374151";
}

export default async function MapaPage() {
  let states: StateData[] = [];
  let maxExpense = 0;

  try {
    const res = await fetch(`${API_URL}/api/v1/dashboard/states`, {
      next: { revalidate: 300 },
    });
    states = await res.json();
    maxExpense = Math.max(...states.map((s) => s.totalExpenses), 1);
  } catch {
    // API offline
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">
            Mapa de Gastos por Estado
          </h1>
          <p className="text-[#9CA3AF] mb-8">
            Total de gastos parlamentares por unidade federativa. Clique para detalhes.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {states.map((s) => (
              <a
                key={s.state}
                href={`/rankings?state=${s.state}`}
                className="rounded-lg border border-[#374151] p-4 transition-colors hover:bg-[#1F2937]"
                style={{
                  borderLeftColor: getColor(s.totalExpenses, maxExpense),
                  borderLeftWidth: "3px",
                }}
              >
                <p className="text-xs text-[#9CA3AF]">{s.state}</p>
                <p className="text-sm font-medium text-[#F9FAFB] truncate">
                  {stateNames[s.state] || s.state}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#3B82F6]">
                  {formatCurrency(s.totalExpenses)}
                </p>
              </a>
            ))}
          </div>

          {states.length === 0 && (
            <div className="rounded-lg border border-[#374151] bg-[#111827] p-12 text-center text-[#9CA3AF]">
              Dados indisponíveis. Inicie o backend em localhost:3001.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

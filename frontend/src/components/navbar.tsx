import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const navItems = [
  { label: "Rankings", href: "/rankings" },
  { label: "Mapa", href: "/mapa" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#374151] bg-[#0B1220]">
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold text-[#F9FAFB]">
          Gastos Públicos
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F9FAFB]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`${API_URL}/api/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F9FAFB]"
          >
            API
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F9FAFB]"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}

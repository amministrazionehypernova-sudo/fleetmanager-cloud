import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";
type AppLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

const menuItems = [
  { label: "Dashboard", href: "/dashboard", number: "01" },
  { label: "Veicoli", href: "/vehicles", number: "02" },
  { label: "Registro Operativo", href: "/operations", number: "03" },
  { label: "Rifornimenti", href: "/fuel", number: "04" },
  { label: "Interventi", href: "/expenses", number: "05" },
  { label: "Rinnovi Documenti", href: "/document-renewals", number: "06" },
  { label: "Scadenze", href: "/deadlines", number: "07" },
  { label: "Manutenzioni Programmate", href: "/maintenance-programs", number: "08" },
  { label: "Report", href: "/report", number: "09" },
  
];

export default function AppLayout({
  children,
  title,
  subtitle,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-72 border-r border-slate-800 bg-slate-950 p-5 hidden md:block">
        <div className="mb-10">
          <div className="text-2xl font-black tracking-widest">
            HYPERNOVA
          </div>

          <div className="text-sm text-sky-400 font-bold tracking-widest mt-1">
            FleetManager Cloud
          </div>

          <div className="text-xs text-slate-600 font-bold tracking-widest mt-2">
            CLOUD MVP
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-l-4 border-transparent hover:border-sky-400 hover:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300"
            >
              <span className="text-slate-600 mr-3">{item.number}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 px-4">
  <LogoutButton />
</div>
      </aside>

      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-widest">
            {title}
          </h1>

          {subtitle && (
            <p className="text-slate-400 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </main>
    </div>
  );
}
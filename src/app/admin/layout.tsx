import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LayoutDashboard, FileText, FolderOpen, BarChart2, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/categorias", label: "Categorias", icon: FolderOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-100 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <Logo href="/" width={80} height={16} />
          <p className="text-[10px] text-gray-400 mt-1.5">Central de Ajuda — Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Ver central pública
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

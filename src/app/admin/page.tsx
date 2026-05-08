export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileText, Eye, TrendingUp, AlertCircle, Plus } from "lucide-react";

async function getDashboardData() {
  const [totalArticles, publishedArticles, draftArticles, totalViews, topArticles, noResultSearches] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.count({ where: { status: "draft" } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.findMany({
        where: { status: "published" },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true, helpfulYes: true, helpfulNo: true },
      }),
      prisma.searchLog.findMany({
        where: { resultsCount: 0 },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { query: true, createdAt: true },
      }),
    ]);

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    totalViews: totalViews._sum.viewCount ?? 0,
    topArticles,
    noResultSearches,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    { label: "Total de artigos", value: data.totalArticles, icon: FileText, color: "blue" },
    { label: "Publicados", value: data.publishedArticles, icon: TrendingUp, color: "green" },
    { label: "Rascunhos", value: data.draftArticles, icon: AlertCircle, color: "yellow" },
    { label: "Visualizações", value: data.totalViews.toLocaleString("pt-BR"), icon: Eye, color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral da Central de Ajuda</p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo artigo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className={`w-9 h-9 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top articles */}
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Artigos mais acessados</h2>
          {data.topArticles.length > 0 ? (
            <div className="space-y-3">
              {data.topArticles.map((article: typeof data.topArticles[number], i: number) => {
                const rate =
                  article.helpfulYes + article.helpfulNo > 0
                    ? Math.round((article.helpfulYes / (article.helpfulYes + article.helpfulNo)) * 100)
                    : null;
                return (
                  <div key={article.id} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-300 w-4">{i + 1}</span>
                    <Link
                      href={`/admin/artigos/${article.id}`}
                      className="flex-1 text-sm text-gray-700 hover:text-blue-600 transition-colors truncate"
                    >
                      {article.title}
                    </Link>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-gray-900">
                        {article.viewCount.toLocaleString("pt-BR")}
                      </p>
                      {rate !== null && (
                        <p className="text-[10px] text-gray-400">{rate}% útil</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nenhum artigo publicado ainda.</p>
          )}
        </div>

        {/* No-result searches */}
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              Buscas sem resultado
            </h2>
          </div>
          {data.noResultSearches.length > 0 ? (
            <div className="space-y-2">
              {data.noResultSearches.map((log: typeof data.noResultSearches[number], i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-gray-600 truncate">"{log.query}"</span>
                  <Link
                    href={`/admin/artigos/novo?title=${encodeURIComponent(log.query)}`}
                    className="text-xs text-blue-600 hover:underline flex-shrink-0"
                  >
                    Criar artigo
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-600">Nenhuma busca sem resultado!</p>
          )}
        </div>
      </div>
    </div>
  );
}

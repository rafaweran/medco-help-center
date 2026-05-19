export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Search, ThumbsUp, ThumbsDown, Eye, TrendingUp, AlertCircle } from "lucide-react";

async function getData() {
  const [
    topSearches,
    noResultSearches,
    topArticles,
    feedbackStats,
    totalSearches,
  ] = await Promise.all([
    prisma.searchLog.groupBy({
      by: ["query"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
    prisma.searchLog.findMany({
      where: { resultsCount: 0 },
      select: { query: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      distinct: ["query"],
    }),
    prisma.article.findMany({
      where: { status: "published" },
      select: {
        id: true, title: true, slug: true,
        viewCount: true, helpfulYes: true, helpfulNo: true,
      },
      orderBy: { viewCount: "desc" },
      take: 10,
    }),
    prisma.article.aggregate({
      _sum: { helpfulYes: true, helpfulNo: true, viewCount: true },
    }),
    prisma.searchLog.count(),
  ]);

  return { topSearches, noResultSearches, topArticles, feedbackStats, totalSearches };
}

export default async function AnalyticsPage() {
  const { topSearches, noResultSearches, topArticles, feedbackStats, totalSearches } = await getData();

  const totalYes = feedbackStats._sum.helpfulYes ?? 0;
  const totalNo = feedbackStats._sum.helpfulNo ?? 0;
  const totalFeedback = totalYes + totalNo;
  const helpfulRate = totalFeedback > 0 ? Math.round((totalYes / totalFeedback) * 100) : null;
  const totalViews = feedbackStats._sum.viewCount ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Desempenho e buscas da Central de Ajuda</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center mb-3">
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-gray-400 mt-0.5">Visualizações totais</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center mb-3">
            <Search className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSearches.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-gray-400 mt-0.5">Buscas realizadas</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center mb-3">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {helpfulRate !== null ? `${helpfulRate}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Taxa de utilidade</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalFeedback.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-gray-400 mt-0.5">Feedbacks recebidos</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top searches */}
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <Search className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Termos mais buscados</h2>
          </div>
          {topSearches.length > 0 ? (
            <div className="space-y-2.5">
              {topSearches.map((s: { query: string; _count: { query: number } }, i: number) => {
                const max = topSearches[0]._count.query;
                const pct = Math.round((s._count.query / max) * 100);
                return (
                  <div key={s.query} className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 w-4 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate">{s.query}</span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{s._count.query}x</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-300 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nenhuma busca registrada ainda.</p>
          )}
        </div>

        {/* No result searches */}
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Buscas sem resultado</h2>
          </div>
          {noResultSearches.length > 0 ? (
            <div className="space-y-2">
              {noResultSearches.map((s: { query: string }, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">"{s.query}"</span>
                  <a
                    href={`/admin/artigos/novo?title=${encodeURIComponent(s.query)}`}
                    className="text-xs text-blue-600 hover:underline flex-shrink-0 ml-3"
                  >
                    Criar artigo
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-gray-300" />
              Nenhuma busca sem resultado!
            </p>
          )}
        </div>
      </div>

      {/* Top articles */}
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Artigos mais acessados</h2>
        </div>
        {topArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">#</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">Artigo</th>
                  <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">
                    <Eye className="w-3 h-3 inline" />
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">
                    <ThumbsUp className="w-3 h-3 inline" />
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">
                    <ThumbsDown className="w-3 h-3 inline" />
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 pb-3">Utilidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topArticles.map((a: typeof topArticles[number], i: number) => {
                  const rate =
                    a.helpfulYes + a.helpfulNo > 0
                      ? Math.round((a.helpfulYes / (a.helpfulYes + a.helpfulNo)) * 100)
                      : null;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-300 text-xs">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <a
                          href={`/admin/artigos/${a.id}`}
                          className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                        >
                          {a.title}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {a.viewCount.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">{a.helpfulYes}</td>
                      <td className="py-3 px-4 text-right text-gray-500">{a.helpfulNo}</td>
                      <td className="py-3 text-right">
                        {rate !== null ? (
                          <span className={`text-xs font-medium ${rate >= 80 ? "text-gray-600" : rate >= 60 ? "text-gray-500" : "text-gray-400"}`}>
                            {rate}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhum artigo publicado ainda.</p>
        )}
      </div>
    </div>
  );
}

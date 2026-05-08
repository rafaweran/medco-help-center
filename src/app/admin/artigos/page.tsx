export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatDate, truncate } from "@/lib/utils";
import { Plus, Eye, ThumbsUp, Star } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ status?: string; audience?: string; page?: string }>;
}

async function getArticles(status?: string, audience?: string, page = 1) {
  const limit = 20;
  const where = {
    ...(status && { status: status as "draft" | "published" | "archived" }),
    ...(audience && { audience: audience as "doctor" | "patient" | "both" }),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true, slug: true, title: true, summary: true,
        audience: true, status: true, isFeatured: true,
        viewCount: true, helpfulYes: true, helpfulNo: true,
        publishedAt: true, updatedAt: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, totalPages: Math.ceil(total / limit) };
}

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Rascunhos" },
  { value: "archived", label: "Arquivados" },
];

const audienceOptions = [
  { value: "", label: "Todos" },
  { value: "doctor", label: "Médico" },
  { value: "patient", label: "Paciente" },
  { value: "both", label: "Ambos" },
];

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { status, audience, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const { articles, total, totalPages } = await getArticles(status, audience, page);

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.status) sp.set("status", params.status);
    if (params.audience) sp.set("audience", params.audience);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    const q = sp.toString();
    return `/admin/artigos${q ? `?${q}` : ""}`;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Artigos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} artigo{total !== 1 ? "s" : ""} no total</p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo artigo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Status:</label>
          <div className="flex gap-1">
            {statusOptions.map(({ value, label }) => (
              <Link
                key={value}
                href={buildUrl({ status: value, audience: audience ?? "" })}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  (status ?? "") === value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Público:</label>
          <div className="flex gap-1">
            {audienceOptions.map(({ value, label }) => (
              <Link
                key={value}
                href={buildUrl({ status: status ?? "", audience: value })}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  (audience ?? "") === value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        {articles.length > 0 ? (
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Título</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Público</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Métricas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Atualizado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {articles.map((article: typeof articles[number]) => {
                const helpfulRate =
                  article.helpfulYes + article.helpfulNo > 0
                    ? Math.round((article.helpfulYes / (article.helpfulYes + article.helpfulNo)) * 100)
                    : null;

                return (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        {article.isFeatured && (
                          <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {truncate(article.title, 60)}
                          </p>
                          {article.category && (
                            <p className="text-xs text-gray-400 mt-0.5">{article.category.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={article.status as "draft" | "published" | "archived"}>
                        {article.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={article.audience as "doctor" | "patient" | "both"}>
                        {article.audience}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount.toLocaleString("pt-BR")}
                        </span>
                        {helpfulRate !== null && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {helpfulRate}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/artigos/${article.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Nenhum artigo encontrado.</p>
            <Link href="/admin/artigos/novo" className="mt-2 text-sm text-blue-600 hover:underline block">
              Criar primeiro artigo
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ status: status ?? "", audience: audience ?? "", page: String(page - 1) })}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-gray-500">{page} de {totalPages}</span>
          {page < totalPages && (
            <Link
              href={buildUrl({ status: status ?? "", audience: audience ?? "", page: String(page + 1) })}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors"
            >
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

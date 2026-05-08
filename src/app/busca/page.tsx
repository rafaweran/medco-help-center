export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/public/SearchBar";
import { ArticleCard } from "@/components/public/ArticleCard";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/public/Footer";
import { Home, ChevronRight, SearchX } from "lucide-react";
import type { ArticleListItem } from "@/types";

interface PageProps {
  searchParams: Promise<{ q?: string; audience?: string; page?: string }>;
}

async function search(query: string, audience?: string, page = 1) {
  if (!query || query.length < 2) return { articles: [], total: 0 };

  const limit = 10;
  const audienceFilter =
    audience === "doctor" || audience === "patient"
      ? { in: [audience, "both"] as ("doctor" | "patient" | "both")[] }
      : undefined;

  const where = {
    status: "published" as const,
    ...(audienceFilter && { audience: audienceFilter }),
    OR: [
      { title: { contains: query, mode: "insensitive" as const } },
      { content: { contains: query, mode: "insensitive" as const } },
      { summary: { contains: query, mode: "insensitive" as const } },
      {
        tags: {
          some: {
            tag: { name: { contains: query, mode: "insensitive" as const } },
          },
        },
      },
    ],
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
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles: articles as ArticleListItem[], total };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", audience, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const { articles, total } = await search(q, audience, page);
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Central de Ajuda</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">Busca</span>
        </nav>

        {/* Search bar */}
        <div className="mb-8">
          <SearchBar defaultValue={q} audience={audience} size="sm" />
        </div>

        {/* Results header */}
        {q && (
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-gray-900">
              {total > 0
                ? `${total} resultado${total !== 1 ? "s" : ""} para "${q}"`
                : `Nenhum resultado para "${q}"`}
            </h1>
          </div>
        )}

        {/* Results */}
        {articles.length > 0 ? (
          <div className="space-y-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} showAudience />
            ))}
          </div>
        ) : q ? (
          <div className="text-center py-16">
            <SearchX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium mb-1">Nenhum artigo encontrado</p>
            <p className="text-sm text-gray-400 mb-6">
              Tente usar palavras diferentes ou mais simples.
            </p>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              Ver todas as categorias
            </Link>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Digite algo para buscar artigos.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/busca?q=${q}&page=${page - 1}`}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors"
              >
                Anterior
              </Link>
            )}
            <span className="text-sm text-gray-500">
              {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/busca?q=${q}&page=${page + 1}`}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors"
              >
                Próxima
              </Link>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

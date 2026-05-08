export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/public/SearchBar";
import { Logo } from "@/components/ui/Logo";
import { ArticleCard } from "@/components/public/ArticleCard";
import { Footer } from "@/components/public/Footer";
import { ChevronRight, Home } from "lucide-react";
import type { ArticleListItem } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ audience?: string }>;
}

async function getData(slug: string, audience?: string) {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      _count: { select: { articles: { where: { status: "published" } } } },
    },
  });

  if (!category) return null;

  const audienceFilter =
    audience === "doctor" || audience === "patient"
      ? { in: [audience, "both"] as ("doctor" | "patient" | "both")[] }
      : undefined;

  const articles = await prisma.article.findMany({
    where: {
      categoryId: category.id,
      status: "published",
      ...(audienceFilter && { audience: audienceFilter }),
    },
    select: {
      id: true, slug: true, title: true, summary: true,
      audience: true, status: true, isFeatured: true,
      viewCount: true, helpfulYes: true, helpfulNo: true,
      publishedAt: true, updatedAt: true,
      category: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
    orderBy: [{ isPinned: "desc" }, { isFeatured: "desc" }, { viewCount: "desc" }],
  });

  return { category, articles: articles as ArticleListItem[] };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { audience } = await searchParams;
  const data = await getData(slug, audience);

  if (!data) notFound();

  const { category, articles } = data;

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

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">{category.name}</span>
        </nav>

        {/* Category header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-500">{category.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-400">
            {category._count.articles} artigo{category._count.articles !== 1 ? "s" : ""} nesta categoria
          </p>
        </div>

        {/* Search within category */}
        <div className="mb-8">
          <SearchBar
            size="sm"
            placeholder={`Buscar em ${category.name}...`}
          />
        </div>

        {/* Articles list */}
        {articles.length > 0 ? (
          <div className="space-y-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} showAudience />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Nenhum artigo publicado nesta categoria.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

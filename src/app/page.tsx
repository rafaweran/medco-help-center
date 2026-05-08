export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/public/SearchBar";
import { ArticleCard } from "@/components/public/ArticleCard";
import { Footer } from "@/components/public/Footer";
import { Logo } from "@/components/ui/Logo";
import { Stethoscope, User, BookOpen, Star } from "lucide-react";
import type { ArticleListItem } from "@/types";

async function getData() {
  const [categories, featured, popular] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { _count: { select: { articles: { where: { status: "published" } } } } },
      orderBy: { orderIndex: "asc" },
      take: 8,
    }),
    prisma.article.findMany({
      where: { status: "published", isFeatured: true },
      select: {
        id: true, slug: true, title: true, summary: true,
        audience: true, status: true, isFeatured: true,
        viewCount: true, helpfulYes: true, helpfulNo: true,
        publishedAt: true, updatedAt: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy: { viewCount: "desc" },
      take: 4,
    }),
    prisma.article.findMany({
      where: { status: "published" },
      select: {
        id: true, slug: true, title: true, summary: true,
        audience: true, status: true, isFeatured: true,
        viewCount: true, helpfulYes: true, helpfulNo: true,
        publishedAt: true, updatedAt: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy: { viewCount: "desc" },
      take: 6,
    }),
  ]);

  return { categories, featured: featured as ArticleListItem[], popular: popular as ArticleListItem[] };
}

const categoryIcons: Record<string, React.ReactNode> = {
  stethoscope: <Stethoscope className="w-6 h-6" />,
  user: <User className="w-6 h-6" />,
  book: <BookOpen className="w-6 h-6" />,
};

export default async function HomePage() {
  const { categories, featured, popular } = await getData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Central de Ajuda</span>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Área Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-white mb-3">
            Como podemos ajudar?
          </h1>
          <p className="text-blue-100 mb-8 text-sm">
            Encontre respostas, tutoriais e dicas para usar a plataforma Med.co
          </p>
          <SearchBar size="lg" />

          {/* Audience tabs */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/?audience=patient"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
            >
              <User className="w-4 h-4" />
              Sou paciente
            </Link>
            <Link
              href="/?audience=doctor"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              Sou médico
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 space-y-12">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Categorias
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat: typeof categories[number]) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="group flex flex-col items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
                    {cat.icon && categoryIcons[cat.icon]
                      ? categoryIcons[cat.icon]
                      : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cat._count.articles} artigo{cat._count.articles !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Artigos em destaque
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {featured.map((article) => (
                <ArticleCard key={article.id} article={article} showAudience />
              ))}
            </div>
          </section>
        )}

        {/* Popular */}
        {popular.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Mais acessados
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {popular.map((article) => (
                <ArticleCard key={article.id} article={article} compact />
              ))}
            </div>
          </section>
        )}

        {categories.length === 0 && featured.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum conteúdo publicado ainda.</p>
            <Link href="/admin" className="mt-2 text-sm text-blue-600 hover:underline">
              Ir para o Admin para criar conteúdo
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

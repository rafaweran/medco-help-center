export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Article, Category, Tag } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        media: true,
        relatedFrom: { include: { relatedArticle: { select: { id: true, title: true, slug: true } } } },
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-2">
        <Link
          href="/admin/artigos"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Artigos
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{article.title}</h1>
        {article.status === "published" && (
          <Link
            href={`/artigo/${article.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver publicado
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Badge variant={article.status as "draft" | "published" | "archived"}>{article.status}</Badge>
        <span className="text-xs text-gray-400">
          Criado em {formatDate(article.createdAt)} · Atualizado em {formatDate(article.updatedAt)}
        </span>
        <span className="text-xs text-gray-400">
          {article.viewCount.toLocaleString("pt-BR")} visualizações
        </span>
      </div>

      <ArticleForm
        categories={categories as Category[]}
        tags={tags as Tag[]}
        article={article as unknown as Article}
      />
    </div>
  );
}

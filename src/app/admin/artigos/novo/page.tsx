export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ChevronLeft } from "lucide-react";
import type { Category, Tag } from "@/types";

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/artigos"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Artigos
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Novo artigo</h1>
      </div>

      <ArticleForm
        categories={categories as Category[]}
        tags={tags as Tag[]}
      />
    </div>
  );
}

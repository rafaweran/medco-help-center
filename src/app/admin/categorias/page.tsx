export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { _count: { select: { articles: true } } },
    orderBy: { orderIndex: "asc" },
  });
}

export default async function CategoriasPage() {
  const categories = await getCategories();
  return <CategoriesClient initialCategories={categories} />;
}

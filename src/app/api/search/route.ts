export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const audience = searchParams.get("audience") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  if (!query || query.length < 2) {
    return NextResponse.json({ articles: [], total: 0, query });
  }

  const audienceFilter =
    audience === "doctor" || audience === "patient"
      ? { in: [audience, "both"] as ("doctor" | "patient" | "both")[] }
      : undefined;

  const where = {
    status: "published" as const,
    ...(audienceFilter && { audience: audienceFilter }),
    ...(categorySlug && { category: { slug: categorySlug } }),
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
        id: true,
        slug: true,
        title: true,
        summary: true,
        audience: true,
        status: true,
        isFeatured: true,
        viewCount: true,
        helpfulYes: true,
        helpfulNo: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  // log search
  await prisma.searchLog.create({
    data: {
      query,
      audience: audience ?? null,
      resultsCount: total,
    },
  });

  return NextResponse.json({ articles, total, query });
}

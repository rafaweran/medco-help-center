export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalViews,
    topArticles,
    noResultSearches,
    recentSearches,
    feedbackStats,
  ] = await Promise.all([
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
      take: 10,
      select: { query: true, createdAt: true },
    }),
    prisma.searchLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { query: true, resultsCount: true, createdAt: true },
    }),
    prisma.article.findMany({
      where: { status: "published" },
      select: { id: true, title: true, helpfulYes: true, helpfulNo: true },
      orderBy: { helpfulNo: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    overview: {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews: totalViews._sum.viewCount ?? 0,
    },
    topArticles,
    noResultSearches,
    recentSearches,
    feedbackStats,
  });
}

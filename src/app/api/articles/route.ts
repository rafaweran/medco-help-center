export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audience = searchParams.get("audience") ?? undefined;
  const featured = searchParams.get("featured") === "true";
  const popular = searchParams.get("popular") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const audienceFilter =
    audience === "doctor" || audience === "patient"
      ? { in: [audience, "both"] as ("doctor" | "patient" | "both")[] }
      : undefined;

  const where = {
    status: "published" as const,
    ...(audienceFilter && { audience: audienceFilter }),
    ...(featured && { isFeatured: true }),
  };

  const articles = await prisma.article.findMany({
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
    orderBy: popular
      ? { viewCount: "desc" }
      : [{ isPinned: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });

  return NextResponse.json(articles);
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const audience = searchParams.get("audience") ?? undefined;
  const categoryId = searchParams.get("category") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where = {
    ...(status && { status: status as "draft" | "published" | "archived" }),
    ...(audience && { audience: audience as "doctor" | "patient" | "both" }),
    ...(categoryId && { categoryId }),
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
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({ articles, total, page, limit });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    title, summary, content, steps,
    audience, status, categoryId, tagIds,
    isFeatured, isPinned, seoTitle, seoDescription, media,
  } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
  }

  const slug = slugify(title);

  type MediaInput = { type: string; url: string; caption?: string | null; position?: string; orderIndex?: number };
  const article = await prisma.article.create({
    data: {
      slug,
      title,
      summary: summary ?? null,
      content,
      steps: steps ?? undefined,
      audience: audience ?? "both",
      status: status ?? "draft",
      categoryId: categoryId ?? null,
      isFeatured: isFeatured ?? false,
      isPinned: isPinned ?? false,
      seoTitle: seoTitle ?? null,
      seoDescription: seoDescription ?? null,
      publishedAt: status === "published" ? new Date() : null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
      media: media?.length
        ? {
            create: media.map((m: MediaInput, i: number) => ({
              type: m.type,
              url: m.url,
              caption: m.caption ?? null,
              position: m.position ?? "after_content",
              orderIndex: m.orderIndex ?? i,
            })),
          }
        : undefined,
    },
  });

  return NextResponse.json(article, { status: 201 });
}

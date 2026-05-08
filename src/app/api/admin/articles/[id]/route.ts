export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      media: { orderBy: { orderIndex: "asc" } },
      relatedFrom: {
        include: {
          relatedArticle: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    title, summary, content, steps,
    audience, status, categoryId, tagIds,
    isFeatured, isPinned, seoTitle, seoDescription, media,
  } = body;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  const wasPublished = existing.status !== "published" && status === "published";
  const wasArchived = existing.status !== "archived" && status === "archived";

  type MediaInput = { type: string; url: string; caption?: string | null; position?: string; orderIndex?: number };
  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(title && { title }),
      summary: summary ?? null,
      ...(content && { content }),
      steps: steps ?? undefined,
      ...(audience && { audience }),
      ...(status && { status }),
      categoryId: categoryId ?? null,
      isFeatured: isFeatured ?? existing.isFeatured,
      isPinned: isPinned ?? existing.isPinned,
      seoTitle: seoTitle ?? null,
      seoDescription: seoDescription ?? null,
      ...(wasPublished && { publishedAt: new Date() }),
      ...(wasArchived && { archivedAt: new Date() }),
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
      }),
      ...(media !== undefined && {
        media: {
          deleteMany: {},
          create: media.map((m: MediaInput, i: number) => ({
            type: m.type,
            url: m.url,
            caption: m.caption ?? null,
            position: m.position ?? "after_content",
            orderIndex: m.orderIndex ?? i,
          })),
        },
      }),
    },
  });

  return NextResponse.json(article);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const article = await prisma.article.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(article);
}

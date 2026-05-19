export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, icon, audience, orderIndex, isActive } = body;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      description: description ?? null,
      icon: icon ?? null,
      ...(audience && { audience }),
      ...(orderIndex !== undefined && { orderIndex }),
      ...(isActive !== undefined && { isActive }),
    },
    include: { _count: { select: { articles: true } } },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  if (category._count.articles > 0) {
    return NextResponse.json(
      { error: `Esta categoria possui ${category._count.articles} artigo(s). Remova os artigos antes de excluir.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { articles: true } },
      children: {
        include: { _count: { select: { articles: true } } },
      },
    },
    where: { parentId: null },
    orderBy: { orderIndex: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, icon, audience, parentId, orderIndex } = body;

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const slug = slugify(name);
  const category = await prisma.category.create({
    data: {
      slug,
      name,
      description: description ?? null,
      icon: icon ?? null,
      audience: audience ?? "both",
      parentId: parentId ?? null,
      orderIndex: orderIndex ?? 0,
    },
  });

  return NextResponse.json(category, { status: 201 });
}

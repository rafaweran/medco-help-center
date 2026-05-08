export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audience = searchParams.get("audience") ?? undefined;

  const where = {
    isActive: true,
    parentId: null,
    ...(audience === "doctor" || audience === "patient"
      ? { audience: { in: [audience, "both"] as ("doctor" | "patient" | "both")[] } }
      : {}),
  };

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: {
        select: {
          articles: {
            where: { status: "published" },
          },
        },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json(categories);
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}

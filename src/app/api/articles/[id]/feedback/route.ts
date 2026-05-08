export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { isHelpful, comment, sessionId } = body;

  if (typeof isHelpful !== "boolean") {
    return NextResponse.json({ error: "isHelpful obrigatório" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await Promise.all([
    prisma.articleFeedback.create({
      data: {
        articleId: id,
        isHelpful,
        comment: comment ?? null,
        sessionId: sessionId ?? null,
        ipHash,
        userAgent,
      },
    }),
    prisma.article.update({
      where: { id },
      data: isHelpful
        ? { helpfulYes: { increment: 1 } }
        : { helpfulNo: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

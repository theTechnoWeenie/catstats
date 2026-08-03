import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONFIRMATION_PHRASE = "yes delete my data";

export async function POST(request: NextRequest) {
  const { confirm } = await request.json();

  if (confirm !== CONFIRMATION_PHRASE) {
    return NextResponse.json(
      { error: `You must type "${CONFIRMATION_PHRASE}" to confirm.` },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.feeding.deleteMany(),
    prisma.dayNote.deleteMany(),
    prisma.cat.deleteMany(),
  ]);

  return NextResponse.json({ ok: true });
}

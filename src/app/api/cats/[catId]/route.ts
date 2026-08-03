import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ catId: string }> },
) {
  const { catId } = await params;
  const { name } = await request.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const cat = await prisma.cat.update({
    where: { id: catId },
    data: { name: name.trim() },
  });

  return NextResponse.json(cat);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ catId: string }> },
) {
  const { catId } = await params;
  await prisma.cat.delete({ where: { id: catId } });
  return NextResponse.json({ ok: true });
}

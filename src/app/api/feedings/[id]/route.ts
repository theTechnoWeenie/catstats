import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { amount, catId } = await request.json();

  const existing = await prisma.feeding.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (amount !== undefined && (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0)) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 },
    );
  }
  if (catId !== undefined && (typeof catId !== "string" || !catId)) {
    return NextResponse.json({ error: "invalid catId" }, { status: 400 });
  }

  const nextCatId = typeof catId === "string" && catId ? catId : existing.catId;

  if (nextCatId !== existing.catId) {
    const conflict = await prisma.feeding.findUnique({
      where: {
        catId_day_mealSlot: {
          catId: nextCatId,
          day: existing.day,
          mealSlot: existing.mealSlot,
        },
      },
    });
    if (conflict && conflict.id !== id) {
      return NextResponse.json(
        {
          error:
            "A meal already exists for that cat/day/slot. Delete or merge it manually first.",
        },
        { status: 409 },
      );
    }
  }

  const feeding = await prisma.feeding.update({
    where: { id },
    data: {
      catId: nextCatId,
      amount: typeof amount === "number" ? amount : undefined,
    },
    include: { cat: true },
  });

  return NextResponse.json(feeding);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.feeding.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

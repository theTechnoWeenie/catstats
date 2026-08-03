import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMealSlot, getMealSlotForTime } from "@/lib/meal-slots";
import { isDayString, todayString } from "@/lib/day";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const catId = searchParams.get("catId") ?? undefined;
  const day = searchParams.get("day") ?? undefined;

  const feedings = await prisma.feeding.findMany({
    where: { catId, day },
    orderBy: { updatedAt: "desc" },
    include: { cat: true },
  });

  return NextResponse.json(feedings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { catId, amount, day, mealSlot } = body;

  if (typeof catId !== "string" || !catId) {
    return NextResponse.json({ error: "catId is required" }, { status: 400 });
  }
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 },
    );
  }
  if (day !== undefined && !isDayString(day)) {
    return NextResponse.json(
      { error: "day must be a YYYY-MM-DD string" },
      { status: 400 },
    );
  }
  if (mealSlot !== undefined && !isMealSlot(mealSlot)) {
    return NextResponse.json({ error: "invalid mealSlot" }, { status: 400 });
  }

  const resolvedDay = typeof day === "string" && day ? day : todayString();
  const resolvedSlot = isMealSlot(mealSlot) ? mealSlot : getMealSlotForTime(new Date());

  const feeding = await prisma.feeding.upsert({
    where: {
      catId_day_mealSlot: { catId, day: resolvedDay, mealSlot: resolvedSlot },
    },
    create: { catId, day: resolvedDay, mealSlot: resolvedSlot, amount },
    update: { amount: { increment: amount } },
    include: { cat: true },
  });

  return NextResponse.json(feeding, { status: 201 });
}

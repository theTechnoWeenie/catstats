import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MEAL_SLOTS } from "@/lib/meal-slots";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const catId = searchParams.get("catId");

  if (!catId) {
    return NextResponse.json({ error: "catId is required" }, { status: 400 });
  }

  const grouped = await prisma.feeding.groupBy({
    by: ["mealSlot"],
    where: { catId },
    _avg: { amount: true },
  });

  const bySlot = new Map(grouped.map((g) => [g.mealSlot, g._avg.amount ?? 0]));

  const averages = MEAL_SLOTS.map((mealSlot) => ({
    mealSlot,
    average: bySlot.get(mealSlot) ?? 0,
  }));

  return NextResponse.json(averages);
}

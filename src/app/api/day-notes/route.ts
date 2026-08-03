import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDayString } from "@/lib/day";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const catId = searchParams.get("catId");
  const day = searchParams.get("day");

  if (!catId || !day) {
    return NextResponse.json(
      { error: "catId and day are required" },
      { status: 400 },
    );
  }

  const note = await prisma.dayNote.findUnique({
    where: { catId_day: { catId, day } },
  });

  return NextResponse.json(note ?? { catId, day, notes: "" });
}

export async function POST(request: NextRequest) {
  const { catId, day, notes } = await request.json();

  if (typeof catId !== "string" || !catId) {
    return NextResponse.json({ error: "catId is required" }, { status: 400 });
  }
  if (!isDayString(day)) {
    return NextResponse.json(
      { error: "day must be a YYYY-MM-DD string" },
      { status: 400 },
    );
  }
  if (typeof notes !== "string") {
    return NextResponse.json({ error: "notes must be a string" }, { status: 400 });
  }

  const note = await prisma.dayNote.upsert({
    where: { catId_day: { catId, day } },
    create: { catId, day, notes },
    update: { notes },
  });

  return NextResponse.json(note);
}

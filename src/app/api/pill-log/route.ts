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

  const pillLog = await prisma.pillLog.findUnique({
    where: { catId_day: { catId, day } },
  });

  return NextResponse.json(pillLog ?? { catId, day, am: false, pm: false });
}

export async function POST(request: NextRequest) {
  const { catId, day, am, pm } = await request.json();

  if (typeof catId !== "string" || !catId) {
    return NextResponse.json({ error: "catId is required" }, { status: 400 });
  }
  if (!isDayString(day)) {
    return NextResponse.json(
      { error: "day must be a YYYY-MM-DD string" },
      { status: 400 },
    );
  }
  if (typeof am !== "boolean" || typeof pm !== "boolean") {
    return NextResponse.json(
      { error: "am and pm must be booleans" },
      { status: 400 },
    );
  }

  const pillLog = await prisma.pillLog.upsert({
    where: { catId_day: { catId, day } },
    create: { catId, day, am, pm },
    update: { am, pm },
  });

  return NextResponse.json(pillLog);
}

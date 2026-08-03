import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cats = await prisma.cat.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(cats);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const cat = await prisma.cat.create({ data: { name: name.trim() } });
  return NextResponse.json(cat, { status: 201 });
}

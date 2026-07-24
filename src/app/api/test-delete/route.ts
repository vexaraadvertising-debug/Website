import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const slides = await prisma.heroSlide.findMany();
    return NextResponse.json({ success: true, count: slides.length, slides });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

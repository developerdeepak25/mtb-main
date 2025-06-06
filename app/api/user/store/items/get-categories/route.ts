import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

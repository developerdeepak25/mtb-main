import { checkRole } from "@/lib/utils/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// * get all spotlight applications
export async function GET(request: NextRequest) {
  try {
    // Check user role
    await checkRole("ADMIN", "You are not authorized for this action");

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Fetch all spotlight applications sorted by appliedAt (oldest first) with pagination
    const spotlightApplications = await prisma.spotlight.findMany({
      include: {
        user: true,
      },
      orderBy: {
        appliedAt: "asc",
      },
      take: limit,
      skip: skip,
    });

    return NextResponse.json(spotlightApplications, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

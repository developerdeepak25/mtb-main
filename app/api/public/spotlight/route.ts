import { PrismaClient, SpotlightStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activeSpotlight = await prisma.spotlight.findFirst({
      where: {
        isActive: true,
        status: SpotlightStatus.APPROVED,
        // ? cron jobs will take care of this
        // expiresAt: {
        //   gt: new Date(), // Not expired
        // },
      },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            // bio: true,
            // socialLinks: true,
            // skills: true,
            email: true,
            jpEarned: true,
            jpSpent: true,
          },
        },
      },
    });

    console.log(activeSpotlight); //?dev

    // If no active spotlight found, return null
    if (!activeSpotlight) {
      return NextResponse.json(null);
    }

    return NextResponse.json(activeSpotlight);
  } catch (error) {
    console.error("Error fetching active spotlight:", error);
    return NextResponse.json(
      { error: "Failed to fetch active spotlight" },
      { status: 500 }
    );
  }
}

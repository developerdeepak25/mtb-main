import { checkRole } from "@/lib/utils/auth";
import { ActivityType,  SpotlightStatus } from "@prisma/client";
import {  NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



//! add check for profile completion

// * route to apply for spotlight
export async function POST() {
  try {
    // Check user role and get session
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );
    const userId = session.user.id;

    // Get spotlight activity data
    const spotlightActivity = await prisma.activity.findUnique({
      where: { activity: ActivityType.SPOTLIGHT },
    });

    if (!spotlightActivity) {
      return NextResponse.json(
        { error: "Spotlight activity not configured" },
        { status: 400 }
      );
    }

    const jpRequired = spotlightActivity.jpAmount;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { spotlight: true, userBusinessProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user's business profile is complete
    const businessProfile = user.userBusinessProfile[0];
    if (!businessProfile || !businessProfile.isProfileComplete) {
      return NextResponse.json(
        {
          error: "Complete your business profile before applying for spotlight",
        },
        { status: 400 }
      );
    }

    // Check if user has an active spotlight, in review, or already applied
    if (user.spotlight) {
      if (user.spotlight.status === SpotlightStatus.ACTIVE) {
        return NextResponse.json(
          { error: "You already have an active spotlight" },
          { status: 400 }
        );
      }
      if (
        user.spotlight.status === "IN_REVIEW" ||
        user.spotlight.status === "APPLIED"
      ) {
        return NextResponse.json(
          { error: "You already have a spotlight application in review" },
          { status: 400 }
        );
      }
      if (user.spotlight.status === "APPROVED") {
        return NextResponse.json(
          { error: "You already have an approved spotlight" },
          { status: 400 }
        );
      }
    }

    // Check if user has enough JP
    if (user.jpBalance < jpRequired) {
      return NextResponse.json({ error: "Insufficient JP" }, { status: 400 });
    }

    // Deduct JP and create transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          jpSpent: { increment: jpRequired },
          jpBalance: { decrement: jpRequired },
          jpTransaction: { increment: jpRequired },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: userId,
          activityId: spotlightActivity.id,
          createdAt: new Date(),
        },
      }),
      prisma.spotlight.create({
        data: {
          userId: userId,
          status: "APPLIED",
          // isActive: false,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Spotlight application created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// * route to get user spotlight application status
export async function GET() {
  try {
    // Check user role and get session
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );
    const userId = session.user.id;
    console.log(userId); //?dev

    const spotlightApplication = await prisma.spotlight.findFirst({
      where: { userId: userId },
      select: {
        id: true,
        status: true,
        // isActive: true,
        appliedAt: true,
        expiresAt: true,
        user: {
          omit: {
            password: true,
          },
        },
      },
    });

    console.log(spotlightApplication);

    if (!spotlightApplication) {
      return NextResponse.json(
        { message: "No spotlight application found" },
        { status: 404 }
      );
    }

    return NextResponse.json(spotlightApplication, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// function to add jp according to the plan and activity

import { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";



type UserWithPlan = Prisma.UserGetPayload<{
  include: {
    plan: true;
  };
  omit: {
    password: true;
  };
}>;

export function isPlanActive(user: UserWithPlan) {
  if (!user.planId) return false; // Free user → Not active
  if (!user.planEnd) return true; // Lifetime plan → Always active
  return new Date() < user.planEnd; // Valid time-based plan
}

export async function assignJp(user: UserWithPlan, activity: ActivityType) {
  try {
    const activityData = await prisma.activity.findUnique({
      where: { activity: activity },
    });
     if (!activityData) {
       throw new Error(`Activity ${activity} not found`);
     }

    const isActive = isPlanActive(user);
    const multiplier = isActive ? user?.plan?.jpMultiplier || 1 : 1;
    const jpToAdd = activityData.jpAmount! * multiplier;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        jpEarned: { increment: jpToAdd },
        jpBalance: { increment: jpToAdd },
        jpTransaction: { increment: jpToAdd },
        transaction: {
          create: {
            //!may need user ID here -- may be
            activityId: activityData.id!,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

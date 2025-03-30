import { SpotlightStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";


// const SPOTLIGHT_EXPIREY_MS = 24 * 60 * 60 * 1000;
const SPOTLIGHT_EXPIREY_MS = 60 * 1000; //for dev seted to 1 min
// TODO: get expiry from days and it will be in days see defaultDurationDays in spotlight model

// export async function approveSpotlight(spotlightId: string) {
//   await prisma.spotlight.update({
//     where: { id: spotlightId },
//     data: { status: "APPROVED" },
//   });
// }

export async function activateNextSpotlight() {
  const nextSpotlight = await prisma.spotlight.findFirst({
    where: { status: SpotlightStatus.APPROVED },
    orderBy: { appliedAt: "asc" }, // Get the oldest approved request
  });

  console.log("nextSpotlight", nextSpotlight); //?dev
  if (nextSpotlight) {
    await prisma.spotlight.update({
      where: { id: nextSpotlight.id },
      data: {
        // isActive: true,
        status: SpotlightStatus.ACTIVE,
        expiresAt: new Date(Date.now() + SPOTLIGHT_EXPIREY_MS), // 1 day validity
      },
    });
  }
}

export async function checkAndRotateSpotlight() {
  const activeSpotlight = await prisma.spotlight.findFirst({
    where: { status: SpotlightStatus.ACTIVE },
  });
  console.log("active spolight", activeSpotlight); //?dev

  if (!activeSpotlight) {
    // If no active spotlight, activate one
    await activateNextSpotlight();
    return;
  }
  console.log("is expired", activeSpotlight.expiresAt! < new Date());

  // Check if the active spotlight is expired
  if (activeSpotlight.expiresAt! < new Date()) {
    console.log("condition is indeed true");
    // await prisma.$transaction([
    await prisma.spotlight.update({
      where: { id: activeSpotlight.id },
      data: { status: SpotlightStatus.EXPIRED },
    });
    // ]);

    // Activate next in queue
    activateNextSpotlight();
  }
}

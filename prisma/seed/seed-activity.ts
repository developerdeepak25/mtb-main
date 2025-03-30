import {  ActivityType, PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient()

// * this seed script is meant for production as well
async function main() {
  const activities = [
    {
      activity: ActivityType.SIGNUP,
      jpAmount: 500,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.DAILY_LOGIN,
      jpAmount: 50,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.QUIZ_CORRECT,
      jpAmount: 10,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.ADD_LOG,
      jpAmount: 20,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.SPOTLIGHT,
      jpAmount: 5000,
      transactionType: TransactionType.DEBIT,
    },
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { activity: activity.activity },
      update: {
        // jpAmount: activity.jpAmount,
        // transactionType: activity.transactionType,
      },
      create: activity,
    });
  }

  console.log("Seed data for activities inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export const revalidate = 600; // 10 minutes

import { PrismaClient } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * * considerations
 * - cache  --- //* DONE
 * - rate limit 
 *
 */
export async function GET(request: NextRequest) {
  try {
    //! commented this just authorization code for testing
    // const session = await getServerSession(authConfig);
    // console.log(session);
    // if (!session)
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total user count
    const totalUsers = await prisma.user.count();

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await prisma.user.findMany({
      orderBy: {
        jpEarned: "desc",
      },
      omit: {
        password: true,
      },
      take: limit,
      skip: skip,
    });
    console.log(users); //?dev
    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }
    const updatedUsers = users.map((user) => {
      return {
        ...user,
        jpTransaction: user.jpEarned + user.jpSpent,
        jpBalance: user.jpEarned - user.jpSpent,
      };
    });

    return NextResponse.json(
      {
        users: updatedUsers,
        message: "success",
        page,
        limit,
        totalUsers,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

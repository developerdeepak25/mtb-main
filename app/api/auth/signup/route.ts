import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/schema/zodSchema";
import { ActivityType } from "@prisma/client";
import { assignJp } from "@/lib/utils/jp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    const { email, password, name } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: process.env.ADMIN_EMAIL ? "ADMIN" : "USER",
      },
      omit: {
        password: true, // removing passwrod before sending
      },
      include: {
        plan: true, //its include for jp assignment only
      },
    });

    //  * assign JP as signup reward
    assignJp(user, ActivityType.SIGNUP);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

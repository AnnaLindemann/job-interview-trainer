import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { prisma } from "@/src/db/prisma";
import { registerSchema } from "@/src/features/analysis/auth/register.schema";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];

      return NextResponse.json(
        {
          ok: false,
          error: firstIssue?.message ?? "Invalid request body",
        },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          ok: false,
          error: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
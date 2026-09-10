import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = loginSchema.parse(body);

    // Ensure user in database
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });

    // Set HTTP-only session cookie
    response.cookies.set("screener_session", JSON.stringify({ email: user.email }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

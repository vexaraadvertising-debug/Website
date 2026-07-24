import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    const validKey = process.env.ADMIN_SECRET_KEY || "ORINKO_ADMIN_2026";
    if (key !== validKey) {
      return NextResponse.json(
        { error: "Invalid secret key. Access denied." },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to promote your account." },
        { status: 401 }
      );
    }

    // 1. Update Supabase auth user_metadata
    await supabase.auth.updateUser({
      data: { role: "admin" }
    });

    // 2. Upsert into Supabase public.profiles
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin User",
      role: "admin",
    });

    // 3. Upsert into Prisma User table
    await prisma.user.upsert({
      where: { authId: user.id },
      update: { role: "ADMIN" },
      create: {
        authId: user.id,
        email: user.email!,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
      },
    });

    console.log(`[PROMOTE_ADMIN_ROUTE] User ${user.email} promoted to ADMIN across user_metadata, profiles, and DB`);

    return NextResponse.json({
      success: true,
      message: `User ${user.email} successfully promoted to ADMIN! You now have access to /admin.`,
      redirect: "/admin",
    });
  } catch (error: any) {
    console.error("Failed to promote user to admin:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}

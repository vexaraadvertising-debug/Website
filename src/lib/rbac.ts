import { prisma } from "@/lib/prisma";

export async function getUserRole(user: any, supabase: any): Promise<string> {
  if (!user) {
    console.log("[RBAC_CHECK] No user provided, defaulting to customer");
    return "customer";
  }

  const userId = user.id;
  const email = user.email?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "admin@orinko.in";

  let isEmailAdmin = false;
  if (email && (email === adminEmail || email.endsWith("@orinko.in"))) {
    isEmailAdmin = true;
  }

  // Check user metadata / app metadata
  const rawMetaRole = user.user_metadata?.role || user.app_metadata?.role;
  const metaRole = rawMetaRole ? String(rawMetaRole).toLowerCase() : null;
  const isMetaAdmin = metaRole === "admin" || metaRole === "super_admin";

  // Check Supabase public.profiles table
  let profileRole: string | null = null;
  let isProfileAdmin = false;
  if (supabase) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("[RBAC_CHECK] Supabase profiles query error:", error.message);
      } else if (profile?.role) {
        profileRole = String(profile.role).toLowerCase();
        if (profileRole === "admin" || profileRole === "super_admin") {
          isProfileAdmin = true;
        }
      }
    } catch (err) {
      console.warn("[RBAC_CHECK] Supabase profiles exception:", err);
    }
  }

  // Check Prisma User table
  let dbRole: string | null = null;
  let isDbAdmin = false;
  try {
    const dbUser = await prisma.user.findUnique({
      where: { authId: userId },
      select: { role: true }
    });

    if (dbUser?.role) {
      dbRole = String(dbUser.role).toLowerCase();
      if (dbRole === "admin" || dbRole === "super_admin") {
        isDbAdmin = true;
      }
    }
  } catch (err) {
    console.warn("[RBAC_CHECK] Prisma query exception:", err);
  }

  const isAdmin = isEmailAdmin || isMetaAdmin || isProfileAdmin || isDbAdmin;
  const finalRole = isAdmin ? "admin" : "customer";

  console.log("[RBAC_CHECK] Role resolution summary:", {
    userId,
    email,
    isEmailAdmin,
    metaRole,
    isMetaAdmin,
    profileRole,
    isProfileAdmin,
    dbRole,
    isDbAdmin,
    finalRole
  });

  return finalRole;
}


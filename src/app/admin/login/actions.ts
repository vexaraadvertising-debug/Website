"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/rbac";

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure user is actually an admin
  if (data.user) {
    const role = await getUserRole(data.user, supabase);
    console.log(`[ADMIN_LOGIN_ACTION] User ${data.user.email} authenticated. Resolved role: "${role}"`);
    
    if (role !== "admin" && role !== "super_admin") {
      await supabase.auth.signOut();
      return { error: "Access Denied. This portal is for administrators only." };
    }
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

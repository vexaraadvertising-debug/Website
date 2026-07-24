"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/WelcomeEmail";

import { getUserRole } from "@/lib/rbac";

export async function login(formData: FormData) {
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

  let redirectTarget = "/";

  // Ensure user profile exists in database
  if (data.user) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { authId: data.user.id },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            authId: data.user.id,
            email: data.user.email!,
            firstName: data.user.user_metadata?.first_name || "",
            lastName: data.user.user_metadata?.last_name || "",
            role: "CUSTOMER",
          },
        });
      }
    } catch (dbError) {
      console.error("Failed to sync user profile on login:", dbError);
    }

    const role = await getUserRole(data.user, supabase);
    console.log(`[AUTH_LOGIN_ACTION] User ${data.user.email} authenticated. Resolved role: "${role}"`);
    
    // CUSTOMER PORTAL SECURITY: Reject admins from logging in here
    if (role === "admin" || role === "super_admin") {
      await supabase.auth.signOut();
      return { error: "Access Denied. Admins must login via the Admin Portal." };
    }
  }

  revalidatePath("/", "layout");
  redirect(redirectTarget);
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // 1. Validation Checks
  if (!email || !email.includes("@") || email.length < 5) {
    return { error: "Please enter a valid email address." };
  }
  if (!password || password.length < 8) {
    return { error: "Weak password. Password must be at least 8 characters long." };
  }
  if (!firstName || firstName.trim() === "" || !lastName || lastName.trim() === "") {
    return { error: "First name and last name are required." };
  }

  // 2. Duplicate Email Check in Database
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      return { error: "An account with this email already exists. Please login instead." };
    }
  } catch (dbError) {
    console.error("Database duplicate check error:", dbError);
    return { error: "A database error occurred. Please try again." };
  }
  
  const supabase = await createClient();
  
  let data, error;
  try {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    data = res.data;
    error = res.error;
  } catch (err: any) {
    console.error("Supabase signUp network error:", err);
    return { error: "A network error occurred during signup. Please try again." };
  }

  if (error) {
    return { error: error.message };
  }

  // Check if email already exists in Supabase (identities array is empty)
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return { error: "An account with this email already exists. Please login instead." };
  }

  // Create User Profile in Prisma DB
  if (data.user) {
    try {
      await prisma.user.upsert({
        where: { authId: data.user.id },
        update: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
        create: {
          authId: data.user.id,
          email: data.user.email!,
          firstName: firstName,
          lastName: lastName,
          role: "CUSTOMER",
        },
      });
      
      // Send Welcome Email safely
      try {
        const emailHtml = await render(<WelcomeEmail firstName={firstName || "Fashion Lover"} />);
        await sendEmail({
          to: data.user.email!,
          subject: "Welcome to ORINKO! Let's elevate your style.",
          html: emailHtml,
          type: "AUTH"
        });
      } catch (emailErr) {
        console.error("Welcome email failed to send:", emailErr);
      }
    } catch (dbError) {
      console.error("Failed to sync user profile on signup:", dbError);
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset instructions sent to your email." };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated successfully." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

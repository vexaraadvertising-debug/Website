"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Subscribes a user to the newsletter
 */
export async function subscribeNewsletter(email: string) {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true },
        });
        return { success: true, message: "Subscription reactivated successfully." };
      }
      return { success: false, error: "Email is already subscribed." };
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        isActive: true,
      },
    });

    return { success: true, message: "Successfully subscribed to the newsletter!" };
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error);
    return { success: false, error: error.message || "Failed to subscribe" };
  }
}

/**
 * Gets all newsletter subscribers for Admin Panel
 */
export async function getNewsletterSubscribers() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return { success: true, data: subscribers };
  } catch (error: any) {
    console.error("Error fetching newsletter subscribers:", error);
    return { success: false, error: error.message || "Failed to fetch subscribers" };
  }
}

/**
 * Deletes a newsletter subscriber
 */
export async function deleteSubscriber(id: string) {
  try {
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });
    revalidatePath("/admin/customers");
    return { success: true, message: "Subscriber deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting subscriber:", error);
    return { success: false, error: error.message || "Failed to delete subscriber" };
  }
}

/**
 * Checks if a given email is already subscribed
 */
export async function checkSubscriptionStatus(email: string) {
  try {
    if (!email) return { isSubscribed: false };
    
    const sub = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });
    
    return { isSubscribed: !!(sub && sub.isActive) };
  } catch (error) {
    console.error("Error checking subscription:", error);
    return { isSubscribed: false };
  }
}

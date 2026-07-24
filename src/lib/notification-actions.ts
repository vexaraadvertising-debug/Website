import { prisma } from "@/lib/prisma";

export async function createAdminNotification({
  type,
  entityId,
  title,
  message,
  link
}: {
  type: string;
  entityId: string;
  title: string;
  message?: string;
  link: string;
}) {
  try {
    // Check if an unresolved notification already exists for this entity
    const existing = await prisma.adminNotification.findFirst({
      where: {
        type,
        entityId,
        isResolved: false
      }
    });

    if (existing) {
      // Update it if it exists to avoid duplicates
      await prisma.adminNotification.update({
        where: { id: existing.id },
        data: {
          title,
          message,
          link,
          createdAt: new Date() // bump to top
        }
      });
      return { success: true };
    }

    // Create new
    await prisma.adminNotification.create({
      data: {
        type,
        entityId,
        title,
        message,
        link,
        isResolved: false
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create admin notification", error);
    return { success: false };
  }
}

export async function resolveAdminNotification(type: string, entityId: string) {
  try {
    const activeNotifications = await prisma.adminNotification.findMany({
      where: {
        type,
        entityId,
        isResolved: false
      }
    });

    if (activeNotifications.length > 0) {
      await Promise.all(
        activeNotifications.map((notification: any) =>
          prisma.adminNotification.update({
            where: { id: notification.id },
            data: {
              isResolved: true,
              resolvedAt: new Date()
            }
          })
        )
      );
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to resolve admin notification", error);
    return { success: false };
  }
}

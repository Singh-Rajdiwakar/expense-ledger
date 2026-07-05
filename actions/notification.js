"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/prisma";
import { getAuthenticatedDbUser } from "@/lib/auth-user";
import { getCurrentPeriod, periodSchema } from "@/lib/date-period";
import {
  generateNotificationsForUser,
  serializeNotification,
} from "@/lib/notification-service";

const idSchema = z.string().uuid();

export async function getNotificationSummary(input = {}) {
  try {
    const user = await getAuthenticatedDbUser();
    const periodResult = periodSchema.safeParse(input);
    const period = periodResult.success ? periodResult.data : getCurrentPeriod();

    await generateNotificationsForUser({ userId: user.id, period });

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return {
      success: true,
      data: {
        notifications: notifications.map(serializeNotification),
        unreadCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to load notifications",
    };
  }
}

export async function markNotificationAsRead(id) {
  try {
    const notificationId = idSchema.parse(id);
    const user = await getAuthenticatedDbUser();

    await db.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Failed to update notification" };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await getAuthenticatedDbUser();

    await db.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Failed to update notifications" };
  }
}

export async function deleteNotification(id) {
  try {
    const notificationId = idSchema.parse(id);
    const user = await getAuthenticatedDbUser();

    await db.notification.deleteMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Failed to delete notification" };
  }
}

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getAuthenticatedDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return user;
}

export async function verifyAccountOwnership(userId, accountId) {
  if (!accountId) return null;

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
}

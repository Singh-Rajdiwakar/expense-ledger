import { z } from "zod";

import { getAuthenticatedDbUser, verifyAccountOwnership } from "@/lib/auth-user";
import { db } from "@/lib/prisma";
import { periodSchema } from "@/lib/date-period";
import { getOrCreateFinancialInsight } from "@/lib/financial-insights";

const insightInputSchema = periodSchema.extend({
  accountId: z.string().uuid().optional().nullable(),
  refresh: z.boolean().optional(),
});

function toNumber(value) {
  if (!value) return 0;
  return typeof value.toNumber === "function" ? value.toNumber() : Number(value);
}

export async function loadFinancialInsights(input) {
  try {
    const parsed = insightInputSchema.parse(input);
    const user = await getAuthenticatedDbUser();
    let accountBalance = 0;

    if (parsed.accountId) {
      const account = await verifyAccountOwnership(user.id, parsed.accountId);
      accountBalance = toNumber(account.balance);
    } else {
      const aggregate = await db.account.aggregate({
        where: { userId: user.id },
        _sum: { balance: true },
      });
      accountBalance = toNumber(aggregate._sum.balance);
    }

    const insight = await getOrCreateFinancialInsight({
      userId: user.id,
      accountId: parsed.accountId || null,
      period: { month: parsed.month, year: parsed.year },
      refresh: Boolean(parsed.refresh),
    });

    return {
      success: true,
      data: {
        ...insight,
        accountBalance,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to load insights",
    };
  }
}

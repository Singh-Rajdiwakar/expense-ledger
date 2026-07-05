import { z } from "zod";

import { getAuthenticatedDbUser, verifyAccountOwnership } from "@/lib/auth-user";
import { periodSchema } from "@/lib/date-period";
import { getOrCreateFinancialInsight } from "@/lib/financial-insights";

const insightInputSchema = periodSchema.extend({
  accountId: z.string().uuid().optional().nullable(),
  refresh: z.boolean().optional(),
});

export async function loadFinancialInsights(input) {
  try {
    const parsed = insightInputSchema.parse(input);
    const user = await getAuthenticatedDbUser();

    if (parsed.accountId) {
      await verifyAccountOwnership(user.id, parsed.accountId);
    }

    return {
      success: true,
      data: await getOrCreateFinancialInsight({
        userId: user.id,
        accountId: parsed.accountId || null,
        period: { month: parsed.month, year: parsed.year },
        refresh: Boolean(parsed.refresh),
      }),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to load insights",
    };
  }
}

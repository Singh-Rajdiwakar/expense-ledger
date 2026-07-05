"use server";

import { revalidatePath } from "next/cache";

import { loadFinancialInsights } from "@/lib/insight-loader";

export async function getFinancialInsights(input) {
  return loadFinancialInsights(input);
}

export async function refreshFinancialInsights(input) {
  const result = await getFinancialInsights({ ...input, refresh: true });
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  if (input?.accountId) {
    revalidatePath(`/account/${input.accountId}`);
  }
  return result;
}

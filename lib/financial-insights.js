import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { db } from "@/lib/prisma";
import {
  formatDateKeyInAppTimeZone,
  formatSelectedMonth,
  getDaysRemainingInPeriod,
  getMonthDateRange,
  getPreviousPeriod,
} from "@/lib/date-period";
import { formatCategoryLabel } from "@/lib/format";

const ENABLE_GEMINI_INSIGHTS = process.env.ENABLE_GEMINI_INSIGHTS === "true";

const insightResponseSchema = z.object({
  summary: z.string().min(12).max(500),
  highlights: z.array(z.string().min(6).max(180)).min(1).max(5),
  recommendations: z.array(z.string().min(6).max(180)).min(1).max(5),
  riskLevel: z.enum(["low", "medium", "high"]),
});

function toNumber(value) {
  return Number(value || 0);
}

function percentChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function safePercent(value, total) {
  if (!total) return 0;
  return (value / total) * 100;
}

function getScopeKey(accountId) {
  return accountId || "all";
}

function hasSpendingAverageFields(insight) {
  const current = insight?.metrics?.current;

  return (
    current &&
    current.averagePerCalendarDay !== undefined &&
    current.averagePerSpendingDay !== undefined &&
    current.uniqueSpendingDays !== undefined
  );
}

function normalizeCurrencyText(value) {
  if (typeof value !== "string") return value;

  return value
    .replace(/\$\s*([\d,]+(?:\.\d+)?)/g, "₹$1")
    .replace(/\bUSD\b/gi, "INR")
    .replace(/\bdollars?\b/gi, "rupees");
}

function normalizeNarrative(narrative) {
  return {
    ...narrative,
    summary: normalizeCurrencyText(narrative.summary),
    highlights: (narrative.highlights || []).map(normalizeCurrencyText),
    recommendations: (narrative.recommendations || []).map(
      normalizeCurrencyText
    ),
  };
}

function summariseTransactions(transactions, period) {
  const categoryTotals = {};
  const dailyExpenses = {};
  const uniqueSpendingDateKeys = new Set();
  let totalIncome = 0;
  let totalExpenses = 0;
  let recurringExpenseTotal = 0;
  let largestTransaction = null;

  for (const transaction of transactions) {
    const amount = toNumber(transaction.amount);

    if (!largestTransaction || amount > largestTransaction.amount) {
      largestTransaction = {
        id: transaction.id,
        amount,
        type: transaction.type,
        description: transaction.description || "Untitled transaction",
        date: transaction.date,
        category: transaction.category,
      };
    }

    if (transaction.type === "INCOME") {
      totalIncome += amount;
      continue;
    }

    totalExpenses += amount;
    categoryTotals[transaction.category] =
      (categoryTotals[transaction.category] || 0) + amount;

    if (transaction.isRecurring) {
      recurringExpenseTotal += amount;
    }

    const dayKey = formatDateKeyInAppTimeZone(transaction.date);
    uniqueSpendingDateKeys.add(dayKey);
    dailyExpenses[dayKey] = (dailyExpenses[dayKey] || 0) + amount;
  }

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      label: formatCategoryLabel(category),
      amount,
      percentage: safePercent(amount, totalExpenses),
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestSpendingDayEntry = Object.entries(dailyExpenses).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const daysInMonth = new Date(period.year, period.month, 0).getDate();
  const uniqueSpendingDays = uniqueSpendingDateKeys.size;
  const averagePerCalendarDay = totalExpenses ? totalExpenses / daysInMonth : 0;
  const averagePerSpendingDay = uniqueSpendingDays
    ? totalExpenses / uniqueSpendingDays
    : 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    categoryBreakdown,
    topCategory: categoryBreakdown[0] || null,
    largestTransaction,
    averageExpense: totalExpenses
      ? totalExpenses /
        transactions.filter((transaction) => transaction.type === "EXPENSE")
          .length
      : 0,
    recurringExpenseTotal,
    recurringExpensePercentage: safePercent(recurringExpenseTotal, totalExpenses),
    averagePerCalendarDay,
    averagePerSpendingDay,
    uniqueSpendingDays,
    dailyAverageSpending: averagePerCalendarDay,
    highestSpendingDay: highestSpendingDayEntry
      ? { date: highestSpendingDayEntry[0], amount: highestSpendingDayEntry[1] }
      : null,
    daysRemaining: getDaysRemainingInPeriod(period),
  };
}

function buildRuleBasedInsight({ current, previous, budget, period }) {
  const periodLabel = formatSelectedMonth(period, "long");
  const budgetAmount = toNumber(budget?.amount);
  const budgetUsage = budgetAmount
    ? safePercent(current.totalExpenses, budgetAmount)
    : null;
  const budgetRemaining = budgetAmount
    ? Math.max(0, budgetAmount - current.totalExpenses)
    : null;
  const incomeChangePct = percentChange(
    current.totalIncome,
    previous.totalIncome
  );
  const expenseChangePct = percentChange(
    current.totalExpenses,
    previous.totalExpenses
  );
  const netBalanceChange = current.netBalance - previous.netBalance;
  const highlights = [];
  const recommendations = [];

  if (!current.transactionCount) {
    return {
      summary: `No transactions were found for ${periodLabel}. Add income and expenses to receive useful financial insights.`,
      highlights: ["No transaction data is available for this period."],
      recommendations: [
        "Add transactions for this month to unlock spending and budget insights.",
      ],
      riskLevel: "low",
      metrics: {
        budgetUsage,
        budgetRemaining,
        incomeChangePct,
        expenseChangePct,
        netBalanceChange,
      },
    };
  }

  if (current.topCategory) {
    highlights.push(
      `${current.topCategory.label} was your highest expense category, accounting for ${current.topCategory.percentage.toFixed(
        0
      )}% of monthly spending.`
    );
  }

  if (expenseChangePct !== null) {
    const direction = expenseChangePct >= 0 ? "increased" : "decreased";
    highlights.push(
      `Expenses ${direction} by ${Math.abs(expenseChangePct).toFixed(
        0
      )}% compared with the previous month.`
    );
  } else {
    highlights.push("No previous-month comparison is available yet.");
  }

  if (budgetUsage !== null) {
    highlights.push(`You have used ${budgetUsage.toFixed(0)}% of your budget.`);
  }

  if (current.netBalance < 0) {
    highlights.push(
      `Expenses exceeded income by ₹${Math.abs(current.netBalance).toLocaleString(
        "en-IN"
      )} this month.`
    );
    recommendations.push(
      "Review the largest expenses and reduce non-essential spending where possible."
    );
  } else if (current.totalIncome > 0) {
    const savedPct = safePercent(current.netBalance, current.totalIncome);
    highlights.push(
      `You kept ${savedPct.toFixed(0)}% of income unspent this month.`
    );
  }

  if (current.recurringExpensePercentage >= 35) {
    recommendations.push(
      `Recurring expenses represent ${current.recurringExpensePercentage.toFixed(
        0
      )}% of spending. Review subscriptions and fixed payments.`
    );
  }

  if (budgetUsage >= 90) {
    recommendations.push(
      "Your budget is close to being exhausted. Keep new expenses intentional for the rest of the month."
    );
  } else if (budgetUsage >= 75) {
    recommendations.push(
      "Budget usage is above 75%. Track upcoming payments before adding new expenses."
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "Keep categorising transactions consistently to improve future insights."
    );
  }

  const riskLevel =
    current.netBalance < 0 || budgetUsage >= 100
      ? "high"
      : budgetUsage >= 75 || current.recurringExpensePercentage >= 45
        ? "medium"
        : "low";

  return {
    summary:
      highlights[0] ||
      `Your ${periodLabel} finances are ready for review with ${current.transactionCount} transactions.`,
    highlights: highlights.slice(0, 5),
    recommendations: recommendations.slice(0, 5),
    riskLevel,
    metrics: {
      budgetUsage,
      budgetRemaining,
      incomeChangePct,
      expenseChangePct,
      netBalanceChange,
    },
  };
}

async function generateGeminiSummary(metrics) {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model:
        process.env.GEMINI_INSIGHTS_MODEL ||
        process.env.GEMINI_MODEL ||
        "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      Create a concise personal finance insight report from anonymous aggregate data.
      Do not provide investment advice. Keep the tone neutral and helpful.
      Currency is Indian Rupees. Always use INR or ₹ for money values.
      Never use $, USD, dollars, cents, or any non-INR currency.
      The input includes two separate spending averages:
      - averagePerCalendarDay: total expenses divided by every calendar day in the selected month.
      - averagePerSpendingDay: total expenses divided only by unique dates with at least one EXPENSE transaction.
      Do not treat averagePerCalendarDay as the active spending-day average.
      Return only JSON with:
      {
        "summary": "string",
        "highlights": ["string"],
        "recommendations": ["string"],
        "riskLevel": "low" | "medium" | "high"
      }

      Aggregate data:
      ${JSON.stringify(metrics)}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
    return normalizeNarrative(insightResponseSchema.parse(parsed));
  } catch (error) {
    return null;
  }
}

export async function calculateFinancialInsight({
  userId,
  accountId,
  period,
  useGemini = ENABLE_GEMINI_INSIGHTS,
}) {
  const { startDate, endDate } = getMonthDateRange(period);
  const previousPeriod = getPreviousPeriod(period);
  const previousRange = getMonthDateRange(previousPeriod);
  const accountFilter = accountId ? { accountId } : {};

  const [transactions, previousTransactions, budget] = await Promise.all([
    db.transaction.findMany({
      where: {
        userId,
        ...accountFilter,
        date: { gte: startDate, lt: endDate },
      },
      orderBy: { date: "desc" },
    }),
    db.transaction.findMany({
      where: {
        userId,
        ...accountFilter,
        date: { gte: previousRange.startDate, lt: previousRange.endDate },
      },
      orderBy: { date: "desc" },
    }),
    db.budget.findFirst({ where: { userId } }),
  ]);

  const current = summariseTransactions(transactions, period);
  const previous = summariseTransactions(previousTransactions, previousPeriod);
  const ruleBased = buildRuleBasedInsight({
    current,
    previous,
    budget,
    period,
  });
  const gemini = useGemini
    ? await generateGeminiSummary({
        period: formatSelectedMonth(period, "long"),
        totalIncome: current.totalIncome,
        totalExpenses: current.totalExpenses,
        netBalance: current.netBalance,
        topCategory: current.topCategory,
        categoryBreakdown: current.categoryBreakdown,
        previousMonth: {
          totalIncome: previous.totalIncome,
          totalExpenses: previous.totalExpenses,
          netBalance: previous.netBalance,
        },
        budget: ruleBased.metrics,
        recurringExpensePercentage: current.recurringExpensePercentage,
        averagePerCalendarDay: current.averagePerCalendarDay,
        averagePerSpendingDay: current.averagePerSpendingDay,
        uniqueSpendingDays: current.uniqueSpendingDays,
      })
    : null;

  const narrative = normalizeNarrative(gemini || ruleBased);
  const metrics = {
    current,
    previous,
    comparisons: ruleBased.metrics,
    periodLabel: formatSelectedMonth(period, "long"),
    previousPeriodLabel: formatSelectedMonth(previousPeriod, "long"),
  };
  const serializableMetrics = JSON.parse(JSON.stringify(metrics));

  return {
    totalIncome: current.totalIncome,
    totalExpenses: current.totalExpenses,
    netBalance: current.netBalance,
    topCategory: current.topCategory?.category || null,
    topCategoryPct: current.topCategory?.percentage || null,
    summary: narrative.summary,
    highlights: narrative.highlights,
    recommendations: narrative.recommendations,
    riskLevel: narrative.riskLevel,
    source: gemini ? "GEMINI" : "RULE_BASED",
    metrics: serializableMetrics,
  };
}

export async function getOrCreateFinancialInsight({
  userId,
  accountId,
  period,
  refresh = false,
  useGemini = ENABLE_GEMINI_INSIGHTS,
}) {
  const scopeKey = getScopeKey(accountId);

  if (!refresh) {
    const existing = await db.financialInsight.findUnique({
      where: {
        userId_scopeKey_month_year: {
          userId,
          scopeKey,
          month: period.month,
          year: period.year,
        },
      },
    });

    if (existing && hasSpendingAverageFields(existing)) {
      return serializeInsight(existing);
    }
  }

  const data = await calculateFinancialInsight({
    userId,
    accountId,
    period,
    useGemini,
  });

  const insight = await db.financialInsight.upsert({
    where: {
      userId_scopeKey_month_year: {
        userId,
        scopeKey,
        month: period.month,
        year: period.year,
      },
    },
    update: {
      ...data,
      generatedAt: new Date(),
    },
    create: {
      ...data,
      userId,
      accountId: accountId || null,
      scopeKey,
      month: period.month,
      year: period.year,
    },
  });

  await db.notification.upsert({
    where: {
      dedupeKey: `insight:${userId}:${scopeKey}:${period.year}:${period.month}`,
    },
    update: {},
    create: {
      userId,
      type: "INSIGHT_READY",
      title: "Insight report ready",
      message: `Your ${formatSelectedMonth(period)} financial insight report is ready.`,
      actionUrl: `/insights?${new URLSearchParams({
        ...(accountId ? { accountId } : {}),
        month: String(period.month),
        year: String(period.year),
      }).toString()}`,
      dedupeKey: `insight:${userId}:${scopeKey}:${period.year}:${period.month}`,
      metadata: { accountId, month: period.month, year: period.year },
    },
  });

  return serializeInsight(insight);
}

export function serializeInsight(insight) {
  return {
    ...insight,
    totalIncome: insight.totalIncome ? insight.totalIncome.toNumber() : 0,
    totalExpenses: insight.totalExpenses ? insight.totalExpenses.toNumber() : 0,
    netBalance: insight.netBalance ? insight.netBalance.toNumber() : 0,
    summary: normalizeCurrencyText(insight.summary),
    highlights: (insight.highlights || []).map(normalizeCurrencyText),
    recommendations: (insight.recommendations || []).map(
      normalizeCurrencyText
    ),
    metrics: insight.metrics || {},
    generatedAt: insight.generatedAt?.toISOString?.() || insight.generatedAt,
    updatedAt: insight.updatedAt?.toISOString?.() || insight.updatedAt,
  };
}

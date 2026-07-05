"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  APP_TIME_ZONE,
  addDaysToAppDateParts,
  comparePeriods,
  formatDateKeyInAppTimeZone,
  getAppDateKeyFromParts,
  getChartDateRange,
  getMonthDateRange,
  shiftPeriod,
} from "@/lib/date-period";

const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getAccountWithTransactions(accountId, period, chartRange) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const range = period ? getChartDateRange(period, chartRange) : null;
  const dateFilter = range
    ? {
        date: {
          gte: range.startDate,
          lt: range.endDate,
        },
      }
    : {};

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        where: dateFilter,
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
    periodTransactionCount: account.transactions.length,
  };
}

function formatDayLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)));
}

function formatMonthKeyInAppTimeZone(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date(date));

  const valueByType = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${valueByType.year}-${valueByType.month}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 15, 12, 0, 0, 0)));
}

function getPeriodFromMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);

  return { month, year };
}

function createChartPoint(label, sortKey) {
  return {
    date: label,
    expense: 0,
    income: 0,
    sortKey,
  };
}

function addTransactionToPoint(point, transaction) {
  const amount = Number(transaction.amount || 0);

  if (transaction.type === "INCOME") {
    point.income += amount;
  } else {
    point.expense += amount;
  }
}

function buildDailyChartData(transactions, range) {
  const grouped = new Map();

  if (range.range === "last7Days") {
    for (let index = 0; index < 7; index += 1) {
      const day = addDaysToAppDateParts(range.startDateParts, index);
      const key = getAppDateKeyFromParts(day);
      grouped.set(key, createChartPoint(formatDayLabel(key), key));
    }
  }

  for (const transaction of transactions) {
    const key = formatDateKeyInAppTimeZone(transaction.date);

    if (!grouped.has(key)) {
      grouped.set(key, createChartPoint(formatDayLabel(key), key));
    }

    addTransactionToPoint(grouped.get(key), transaction);
  }

  return Array.from(grouped.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...point }) => point);
}

function seedMonthlyPoints(startPeriod, endPeriod) {
  const grouped = new Map();

  for (
    let period = startPeriod;
    comparePeriods(period, endPeriod) <= 0;
    period = shiftPeriod(period, 1)
  ) {
    const key = `${period.year}-${String(period.month).padStart(2, "0")}`;
    grouped.set(key, createChartPoint(formatMonthLabel(key), key));
  }

  return grouped;
}

function buildMonthlyChartData(transactions, range, selectedPeriod) {
  let grouped = new Map();

  if (range.range === "last3Months" || range.range === "last6Months") {
    grouped = seedMonthlyPoints(range.startPeriod, selectedPeriod);
  } else if (transactions.length > 0) {
    const firstPeriod = getPeriodFromMonthKey(
      formatMonthKeyInAppTimeZone(transactions[0].date)
    );
    grouped = seedMonthlyPoints(firstPeriod, selectedPeriod);
  }

  for (const transaction of transactions) {
    const key = formatMonthKeyInAppTimeZone(transaction.date);

    if (!grouped.has(key)) {
      grouped.set(key, createChartPoint(formatMonthLabel(key), key));
    }

    addTransactionToPoint(grouped.get(key), transaction);
  }

  return Array.from(grouped.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...point }) => point);
}

export async function getAccountChartData(accountId, period, chartRange) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!account) return null;

  const range = getChartDateRange(period, chartRange);
  const transactions = await db.transaction.findMany({
    where: {
      accountId,
      date: {
        gte: range.startDate,
        lt: range.endDate,
      },
      userId: user.id,
    },
    orderBy: { date: "asc" },
    select: {
      amount: true,
      date: true,
      type: true,
    },
  });

  const data =
    range.groupBy === "month"
      ? buildMonthlyChartData(transactions, range, period)
      : buildDailyChartData(transactions, range);

  return {
    chartRange: range.range,
    data,
    endDate: range.endDate,
    hasTransactions: transactions.length > 0,
    startDate: range.startDate,
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");


    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });


    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});


    await db.$transaction(async (tx) => {

      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });


      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    revalidatePath("/insights");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }


    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });


    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

import { addDays } from "date-fns";

import { db } from "@/lib/prisma";
import {
  formatSelectedMonth,
  getCurrentPeriod,
  getMonthDateRange,
  getPreviousPeriod,
} from "@/lib/date-period";

function toNumber(value) {
  return Number(value || 0);
}

async function createUniqueNotification(data) {
  if (!data.dedupeKey) {
    return db.notification.create({ data });
  }

  return db.notification.upsert({
    where: { dedupeKey: data.dedupeKey },
    update: {},
    create: data,
  });
}

export async function generateNotificationsForUser({
  userId,
  period = getCurrentPeriod(),
}) {
  const { startDate, endDate } = getMonthDateRange(period);
  const previousPeriod = getPreviousPeriod(period);
  const previousLabel = formatSelectedMonth(previousPeriod);
  const periodLabel = formatSelectedMonth(period);

  const [budget, accounts, transactions, recurringDue] = await Promise.all([
    db.budget.findFirst({ where: { userId } }),
    db.account.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
      orderBy: { amount: "desc" },
    }),
    db.transaction.findMany({
      where: {
        userId,
        isRecurring: true,
        status: "COMPLETED",
        nextRecurringDate: {
          gte: new Date(),
          lte: addDays(new Date(), 3),
        },
      },
      take: 5,
      orderBy: { nextRecurringDate: "asc" },
    }),
  ]);

  const defaultAccount = accounts.find((account) => account.isDefault);
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const expenses = transactions.filter((transaction) => transaction.type === "EXPENSE");
  const totalExpenses = expenses.reduce(
    (sum, transaction) => sum + toNumber(transaction.amount),
    0
  );

  if (budget) {
    const budgetAmount = toNumber(budget.amount);
    const percentUsed = budgetAmount ? (totalExpenses / budgetAmount) * 100 : 0;
    const threshold =
      percentUsed >= 100 ? "exceeded" : percentUsed >= 90 ? "90" : percentUsed >= 75 ? "75" : null;

    if (threshold) {
      await createUniqueNotification({
        userId,
        type: percentUsed >= 100 ? "BUDGET_EXCEEDED" : "BUDGET_WARNING",
        title: percentUsed >= 100 ? "Budget exceeded" : "Budget almost reached",
        message:
          percentUsed >= 100
            ? `You have exceeded your ${periodLabel} budget.`
            : `You have used ${percentUsed.toFixed(0)}% of your ${periodLabel} budget.`,
        actionUrl: `/insights?month=${period.month}&year=${period.year}`,
        dedupeKey: `budget:${userId}:${period.year}:${period.month}:${threshold}`,
        metadata: {
          month: period.month,
          year: period.year,
          threshold,
          percentUsed,
          budgetId: budget.id,
        },
      });
    }
  }

  if (totalExpenses > totalIncome && transactions.length > 0) {
    await createUniqueNotification({
      userId,
      type: "NEGATIVE_BALANCE",
      title: "Expenses are above income",
      message: `Your ${periodLabel} expenses exceed income by ₹${(
        totalExpenses - totalIncome
      ).toLocaleString("en-IN")}.`,
      actionUrl: `/insights?month=${period.month}&year=${period.year}`,
      dedupeKey: `negative-cashflow:${userId}:${period.year}:${period.month}`,
      metadata: { month: period.month, year: period.year },
    });
  }

  if (expenses.length >= 3) {
    const averageExpense = totalExpenses / expenses.length;
    const largestExpense = expenses[0];

    if (largestExpense && toNumber(largestExpense.amount) >= averageExpense * 2) {
      await createUniqueNotification({
        userId,
        type: "LARGE_EXPENSE",
        title: "Large expense detected",
        message: `${largestExpense.description || "A transaction"} is higher than your usual ${periodLabel} expense.`,
        actionUrl: `/account/${largestExpense.accountId}?month=${period.month}&year=${period.year}`,
        dedupeKey: `large-expense:${userId}:${largestExpense.id}`,
        metadata: {
          transactionId: largestExpense.id,
          month: period.month,
          year: period.year,
        },
      });
    }
  }

  for (const transaction of recurringDue) {
    await createUniqueNotification({
      userId,
      type: "RECURRING_PAYMENT_DUE",
      title: "Recurring payment due",
      message: `${transaction.description || "Recurring payment"} is due soon.`,
      actionUrl: `/account/${transaction.accountId}`,
      dedupeKey: `recurring-due:${userId}:${transaction.id}:${transaction.nextRecurringDate?.toISOString().slice(0, 10)}`,
      metadata: {
        recurringTransactionId: transaction.id,
        nextRecurringDate: transaction.nextRecurringDate,
      },
    });
  }

  if (defaultAccount) {
    await createUniqueNotification({
      userId,
      type: "MONTHLY_REPORT_READY",
      title: "Monthly report ready",
      message: `Your ${previousLabel} financial summary is ready to view.`,
      actionUrl: `/insights?month=${previousPeriod.month}&year=${previousPeriod.year}`,
      dedupeKey: `monthly-report:${userId}:${previousPeriod.year}:${previousPeriod.month}`,
      metadata: {
        month: previousPeriod.month,
        year: previousPeriod.year,
      },
    });
  }
}

export function serializeNotification(notification) {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
  };
}

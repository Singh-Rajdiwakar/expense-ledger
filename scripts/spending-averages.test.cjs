const assert = require("node:assert/strict");

const APP_TIME_ZONE = "Asia/Kolkata";

function dateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date(date));

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function spendingAverages(transactions, period) {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "EXPENSE"
  );
  const totalExpenses = expenseTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );
  const uniqueDates = new Set(
    expenseTransactions.map((transaction) => dateKey(transaction.date))
  );
  const calendarDays = new Date(period.year, period.month, 0).getDate();

  return {
    averagePerCalendarDay: totalExpenses ? totalExpenses / calendarDays : 0,
    averagePerSpendingDay: uniqueDates.size ? totalExpenses / uniqueDates.size : 0,
    uniqueSpendingDays: uniqueDates.size,
  };
}

const july2026 = { month: 7, year: 2026 };

assert.deepEqual(
  spendingAverages(
    [
      { type: "EXPENSE", amount: 333, date: "2026-07-01T08:00:00.000Z" },
      { type: "EXPENSE", amount: 5000, date: "2026-07-02T08:00:00.000Z" },
      { type: "INCOME", amount: 3000, date: "2026-07-04T08:00:00.000Z" },
      { type: "EXPENSE", amount: 33, date: "2026-07-04T08:00:00.000Z" },
    ],
    july2026
  ),
  {
    averagePerCalendarDay: 5366 / 31,
    averagePerSpendingDay: 5366 / 3,
    uniqueSpendingDays: 3,
  }
);

assert.equal(
  spendingAverages(
    [
      { type: "EXPENSE", amount: 200, date: "2026-07-10T08:00:00.000Z" },
      { type: "EXPENSE", amount: 300, date: "2026-07-10T12:00:00.000Z" },
    ],
    july2026
  ).uniqueSpendingDays,
  1
);

assert.equal(
  spendingAverages(
    [
      { type: "INCOME", amount: 1000, date: "2026-07-11T08:00:00.000Z" },
      { type: "EXPENSE", amount: 100, date: "2026-07-11T09:00:00.000Z" },
    ],
    july2026
  ).averagePerSpendingDay,
  100
);

assert.deepEqual(
  spendingAverages(
    [{ type: "INCOME", amount: 1000, date: "2026-07-11T08:00:00.000Z" }],
    july2026
  ),
  {
    averagePerCalendarDay: 0,
    averagePerSpendingDay: 0,
    uniqueSpendingDays: 0,
  }
);

assert.equal(
  spendingAverages(
    [{ type: "EXPENSE", amount: 310, date: "2026-07-12T08:00:00.000Z" }],
    july2026
  ).averagePerSpendingDay,
  310
);

assert.equal(
  spendingAverages(
    [{ type: "EXPENSE", amount: 290, date: "2024-02-29T08:00:00.000Z" }],
    { month: 2, year: 2024 }
  ).averagePerCalendarDay,
  10
);

assert.equal(
  spendingAverages(
    [{ type: "EXPENSE", amount: 280, date: "2026-02-28T08:00:00.000Z" }],
    { month: 2, year: 2026 }
  ).averagePerCalendarDay,
  10
);

console.log("Spending-average tests passed");

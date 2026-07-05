"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Car,
  Gift,
  Home,
  Laptop,
  MoreHorizontal,
  PieChart as PieChartIcon,
  Plane,
  ReceiptText,
  Utensils,
  WalletCards,
} from "lucide-react";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCategoryLabel, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const CATEGORY_META = {
  food: { color: "#FF4D67", bg: "#FFF0F3", icon: Utensils },
  bills: { color: "#13B8B5", bg: "#E8FAF9", icon: ReceiptText },
  "bills-fees": { color: "#13B8B5", bg: "#E8FAF9", icon: ReceiptText },
  transportation: { color: "#F5B942", bg: "#FFF8E6", icon: Car },
  travel: { color: "#695CF6", bg: "#F0EEFF", icon: Plane },
  entertainment: { color: "#38BDF8", bg: "#EAF6FF", icon: Laptop },
  housing: { color: "#8BDDB2", bg: "#EAFBF1", icon: Home },
  gifts: { color: "#F472B6", bg: "#FFF0F7", icon: Gift },
  salary: { color: "#22C55E", bg: "#EAFBF1", icon: WalletCards },
};

const FALLBACK_COLORS = ["#FF4D67", "#13B8B5", "#38BDF8", "#8BDDB2", "#F5B942", "#695CF6", "#94A3B8"];

function getCategoryMeta(category, index = 0) {
  return (
    CATEGORY_META[category] || {
      color: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      bg: "#F1F5F9",
      icon: ReceiptText,
    }
  );
}

function TransactionIcon({ transaction, index }) {
  const meta = getCategoryMeta(transaction.category, index);
  const Icon = meta.icon;

  return (
    <span
      className="grid size-10 shrink-0 place-items-center rounded-full"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <Icon className="size-4" />
    </span>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#E8EDF3] bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-[#0F172A]">
        {formatCategoryLabel(payload[0].name)}
      </p>
      <p className="money-nums text-[#64748B]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function DashboardOverview({ accounts, transactions, period, shortInsight }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ""
  );

  const accountTransactions = useMemo(
    () => transactions.filter((t) => t.accountId === selectedAccountId),
    [transactions, selectedAccountId]
  );

  const recentTransactions = useMemo(
    () =>
      [...accountTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    [accountTransactions]
  );

  const pieChartData = useMemo(() => {
    const currentMonthExpenses = accountTransactions.filter(
      (t) => t.type === "EXPENSE"
    );

    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    return Object.entries(expensesByCategory)
      .map(([category, amount], index) => {
        const meta = getCategoryMeta(category, index);

        return {
          name: category,
          label: formatCategoryLabel(category),
          value: amount,
          color: meta.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [accountTransactions]);

  const totalExpense = pieChartData.reduce((sum, item) => sum + item.value, 0);
  const topCategory = pieChartData[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="finance-card finance-card-hover p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-[#E8FAF9] text-[#13B8B5]">
              <ReceiptText className="size-4" />
            </span>
            <h2 className="text-base font-extrabold text-[#0F172A]">
              Recent Transactions
            </h2>
          </div>
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link href={selectedAccountId ? `/account/${selectedAccountId}` : "/dashboard"}>
              View all
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="mb-4 h-9 w-full sm:w-[190px]">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="divide-y divide-[#EEF2F7]">
          {recentTransactions.length === 0 ? (
            <div className="rounded-xl bg-[#F8FAFC] py-8 text-center text-sm font-medium text-[#64748B]">
              No recent transactions
            </div>
          ) : (
            recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <TransactionIcon transaction={transaction} index={index} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#0F172A]">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-xs font-medium text-[#64748B]">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    "money-nums whitespace-nowrap text-sm font-extrabold",
                    transaction.type === "EXPENSE" ? "text-[#FF4D67]" : "text-[#22C55E]"
                  )}
                >
                  {transaction.type === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="finance-card finance-card-hover p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-[#E8FAF9] text-[#13B8B5]">
              <PieChartIcon className="size-4" />
            </span>
            <h2 className="text-base font-extrabold text-[#0F172A]">
              Monthly Expense Breakdown
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="More options" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>

        {pieChartData.length === 0 ? (
          <div className="rounded-xl bg-[#F8FAFC] py-16 text-center text-sm font-medium text-[#64748B]">
            No expenses this month
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-center">
              <div className="h-[230px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={2}
                      stroke="#FFFFFF"
                      strokeWidth={4}
                    >
                      {pieChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (!viewBox) return null;
                          const { cx, cy } = viewBox;
                          return (
                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={cx} y={cy - 8} className="fill-[#64748B] text-xs font-semibold">
                                Total
                              </tspan>
                              <tspan x={cx} y={cy + 12} className="fill-[#0F172A] text-sm font-extrabold">
                                {formatCurrency(totalExpense)}
                              </tspan>
                            </text>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {pieChartData.map((item) => {
                  const percent = totalExpense ? (item.value / totalExpense) * 100 : 0;

                  return (
                    <div key={item.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate font-semibold text-[#475569]">{item.label}</span>
                      </div>
                      <span className="money-nums font-bold text-[#0F172A]">{formatCurrency(item.value)}</span>
                      <span className="money-nums w-12 text-right text-xs font-semibold text-[#64748B]">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#F5FAFF] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#E8FAF9] text-[#13B8B5]">
                  {topCategory ? (
                    <ArrowUpRight className="size-5" />
                  ) : (
                    <ArrowDownRight className="size-5" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#0F172A]">Top Category</p>
                  <p className="text-xs font-medium text-[#64748B]">
                    {topCategory
                      ? shortInsight || `${topCategory.label} expenses are ${
                        totalExpense ? ((topCategory.value / totalExpense) * 100).toFixed(1) : "0.0"
                      }% of your total spending.`
                      : "No category data available yet."}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="h-8 text-[#13B8B5]">
                <Link
                  href={`/insights?${new URLSearchParams({
                    ...(selectedAccountId ? { accountId: selectedAccountId } : {}),
                    month: String(period.month),
                    year: String(period.year),
                  }).toString()}`}
                >
                View Insights
                <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

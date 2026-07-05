"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, PieChart as PieChartIcon } from "lucide-react";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Button } from "@/components/ui/button";
import { formatCategoryLabel, formatCurrency } from "@/lib/format";

const CATEGORY_COLORS = {
  food: "#FF4D67",
  bills: "#13B8B5",
  "bills-fees": "#13B8B5",
  travel: "#695CF6",
  transportation: "#F5B942",
  entertainment: "#38BDF8",
  housing: "#8BDDB2",
  groceries: "#22C55E",
  shopping: "#F472B6",
  utilities: "#06B6D4",
};

const FALLBACK_COLORS = ["#FF4D67", "#13B8B5", "#38BDF8", "#F5B942", "#695CF6", "#94A3B8"];

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

export function ExpenseCategoryCard({ transactions, period, accountId, shortInsight }) {
  const chartData = useMemo(() => {
    const monthlyExpenses = transactions.filter(
      (transaction) => transaction.type === "EXPENSE"
    );

    const byCategory = monthlyExpenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    return Object.entries(byCategory)
      .map(([category, amount], index) => ({
        name: category,
        label: formatCategoryLabel(category),
        value: amount,
        color: CATEGORY_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const topCategory = chartData[0];

  return (
    <section className="finance-card finance-card-hover h-full p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-[#0F172A]">
          Expense by Category
        </h2>
        <span className="grid size-8 place-items-center rounded-lg bg-[#F0EEFF] text-[#695CF6]">
          <PieChartIcon className="size-4" />
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="grid min-h-[300px] place-items-center rounded-xl bg-[#F8FAFC] text-center text-sm font-medium text-[#64748B]">
          No category expenses yet
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-[190px_1fr] sm:items-center lg:grid-cols-1 xl:grid-cols-[190px_1fr]">
            <div className="h-[190px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={2}
                    stroke="#FFFFFF"
                    strokeWidth={4}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox) return null;
                        const { cx, cy } = viewBox;
                        return (
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={cx} y={cy - 7} className="fill-[#64748B] text-[11px] font-semibold">
                              Total
                            </tspan>
                            <tspan x={cx} y={cy + 12} className="fill-[#0F172A] text-xs font-extrabold">
                              {formatCurrency(total)}
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

            <div className="space-y-2">
              {chartData.map((item) => {
                const percent = total ? (item.value / total) * 100 : 0;

                return (
                  <div key={item.name} className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate font-bold text-[#475569]">{item.label}</span>
                    </div>
                    <span className="money-nums font-bold text-[#64748B]">
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#F5FAFF] p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E8FAF9] text-[#13B8B5]">
                <ArrowUpRight className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#0F172A]">Top Insight</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-[#64748B]">
                  {topCategory
                    ? shortInsight || `${topCategory.label} is your highest category at ${
                      total ? ((topCategory.value / total) * 100).toFixed(0) : 0
                    }% of monthly expenses.`
                    : "No spending insight available yet."}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 h-8 text-[#695CF6]">
                  <Link
                    href={`/insights?${new URLSearchParams({
                      accountId,
                      month: String(period.month),
                      year: String(period.year),
                    }).toString()}`}
                  >
                    View Full Report
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";

const DATE_RANGES = {
  last7Days: { label: "Last 7 Days" },
  selectedMonth: { label: "Selected Month" },
  last3Months: { label: "Last 3 Months" },
  last6Months: { label: "Last 6 Months" },
  allTime: { label: "All Time" },
};

export function AccountChart({
  accountId,
  chartData,
  currentChartRange,
  hasTransactions,
  period,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChartRangeChange = (value) => {
    if (!DATE_RANGES[value]) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("chartRange", value);

    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    if (nextUrl === currentUrl) return;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

  const chartKey = `${accountId}-${period.year}-${period.month}-${currentChartRange}`;
  const showEmptyState = !isPending && (!hasTransactions || chartData.length === 0);

  return (
    <Card className="h-full finance-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">
          Spending Overview
        </CardTitle>
        <Select value={currentChartRange} onValueChange={handleChartRangeChange}>
          <SelectTrigger className="h-9 w-[132px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-2">
        {isPending ? (
          <div className="grid h-[300px] gap-4 rounded-xl bg-[#F8FAFC] p-5">
            <div className="h-5 w-36 animate-pulse rounded-full bg-[#E8EDF3]" />
            <div className="flex h-full items-end gap-3">
              {[50, 72, 44, 82, 56, 68].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col justify-end">
                  <div
                    className="animate-pulse rounded-t-lg bg-[#E8EDF3]"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : showEmptyState ? (
          <div className="grid h-[300px] place-items-center rounded-xl bg-[#F8FAFC] text-sm font-medium text-[#64748B]">
            No transactions in this range
          </div>
        ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={chartKey}
              data={chartData}
              margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#E8EDF3" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontWeight: 600 }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontWeight: 600 }}
                tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), undefined]}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8EDF3",
                  borderRadius: "14px",
                  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.1)",
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                isAnimationActive
                radius={[7, 7, 0, 0]}
                barSize={34}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#FF4D67"
                isAnimationActive
                radius={[7, 7, 0, 0]}
                barSize={34}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

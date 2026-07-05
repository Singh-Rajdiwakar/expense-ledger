import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleAlert,
  Info,
  Lightbulb,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { AppTopbar } from "@/components/app-topbar";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshInsightButton } from "@/components/insights/refresh-insight-button";
import { parseSelectedPeriod, formatSelectedMonth } from "@/lib/date-period";
import { formatCategoryLabel, formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { loadFinancialInsights } from "@/lib/insight-loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function formatPercent(value) {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(1)}%`;
}

function MetricLabel({ label, tooltip }) {
  if (!tooltip) return label;

  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-label={`${label} info`}
            className="inline-grid size-4 cursor-help place-items-center rounded-full text-[#94A3B8] transition hover:text-[#13B8B5]"
          >
            <Info className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] leading-5">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

function MetricRow({ label, value, tooltip }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EEF2F7] py-3 last:border-b-0">
      <span className="text-sm font-semibold text-[#64748B]">
        <MetricLabel label={label} tooltip={tooltip} />
      </span>
      <span className="money-nums text-sm font-extrabold text-[#0F172A]">
        {value}
      </span>
    </div>
  );
}

function getBackHref(accountId, period) {
  const params = new URLSearchParams({
    month: String(period.month),
    year: String(period.year),
  });

  return accountId
    ? `/account/${accountId}?${params.toString()}`
    : `/dashboard?${params.toString()}`;
}

function BackButton({ accountId, period }) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-10 w-fit rounded-xl border-[#E5E7EB] bg-white px-4 text-[#334155] shadow-[0_3px_12px_rgba(15,23,42,0.05)] hover:bg-[#F8FAFC]"
    >
      <Link href={getBackHref(accountId, period)}>
        <ArrowLeft className="size-4" />
        {accountId ? "Back to account" : "Back to dashboard"}
      </Link>
    </Button>
  );
}

export default async function InsightsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const period = parseSelectedPeriod(resolvedSearchParams);
  const accountId = resolvedSearchParams?.accountId || null;
  const result = await loadFinancialInsights({
    month: period.month,
    year: period.year,
    accountId,
  });

  if (!result.success) {
    return (
      <div className="space-y-5">
        <BackButton accountId={accountId} period={period} />
        <AppTopbar
          eyebrow="Financial report"
          title="Insights"
          description={`Detailed report for ${formatSelectedMonth(period, "long")}.`}
          period={period}
          actionTone="teal"
        />

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CircleAlert className="size-5 text-[#FF4D67]" />
              Insight report could not load
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium leading-6 text-[#64748B]">
              {result.error ||
                "Something went wrong while preparing this financial report."}
            </p>
            <div className="flex flex-wrap gap-3">
              <RefreshInsightButton
                month={period.month}
                year={period.year}
                accountId={accountId}
              />
              <Button asChild variant="outline" className="h-10 rounded-xl">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const insight = result.data;
  const metrics = insight.metrics || {};
  const current = metrics.current || {};
  const comparisons = metrics.comparisons || {};
  const categoryBreakdown = current.categoryBreakdown || [];
  const largestTransaction = current.largestTransaction;
  const generatedAt = insight.generatedAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(insight.generatedAt))
    : "Just now";

  return (
    <div className="space-y-5">
      <BackButton accountId={accountId} period={period} />
      <AppTopbar
        eyebrow="Financial report"
        title="Insights"
        description={`Detailed report for ${formatSelectedMonth(period, "long")}.`}
        period={period}
        actionTone="teal"
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E8EDF3] bg-white p-5 shadow-[0_8px_32px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[#0F172A]">
            {formatSelectedMonth(period, "long")} report
          </p>
          <p className="mt-1 text-xs font-medium text-[#64748B]">
            Generated {generatedAt} · Source {insight.source}
          </p>
        </div>
        <RefreshInsightButton
          month={period.month}
          year={period.year}
          accountId={accountId}
        />
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Income"
          value={formatCurrency(insight.totalIncome)}
          helper="Selected period"
          icon={ArrowUpRight}
          tone="green"
        />
        <MetricCard
          label="Expenses"
          value={formatCurrency(insight.totalExpenses)}
          helper="Selected period"
          icon={ArrowDownRight}
          tone="red"
        />
        <MetricCard
          label="Net Balance"
          value={formatCurrency(insight.accountBalance || 0)}
          helper={accountId ? "Current account balance" : "Total account balance"}
          icon={Wallet}
          tone="purple"
        />
        <MetricCard
          label="Transactions"
          value={current.transactionCount || 0}
          helper="Selected period"
          icon={ReceiptText}
          tone="yellow"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="finance-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-5 text-[#13B8B5]" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl bg-[#F5FAFF] p-5">
              <p className="text-base font-bold leading-7 text-[#0F172A]">
                {insight.summary}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-extrabold text-[#0F172A]">
                  Key highlights
                </h3>
                <div className="space-y-2">
                  {(insight.highlights || []).map((item) => (
                    <div key={item} className="rounded-xl bg-[#F8FAFC] p-3 text-sm font-medium text-[#475569]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-extrabold text-[#0F172A]">
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {(insight.recommendations || []).map((item) => (
                    <div key={item} className="rounded-xl bg-[#F8FAFC] p-3 text-sm font-medium text-[#475569]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-5 text-[#695CF6]" />
              Report metrics
            </CardTitle>
          </CardHeader>
          <TooltipProvider delayDuration={150}>
            <CardContent>
            <MetricRow
              label="Top category"
              value={
                insight.topCategory
                  ? `${formatCategoryLabel(insight.topCategory)} (${formatPercent(
                      insight.topCategoryPct
                    )})`
                  : "No expenses"
              }
            />
            <MetricRow
              label="Budget usage"
              value={formatPercent(comparisons.budgetUsage)}
            />
            <MetricRow
              label="Budget remaining"
              value={
                comparisons.budgetRemaining === null ||
                comparisons.budgetRemaining === undefined
                  ? "N/A"
                  : formatCurrency(comparisons.budgetRemaining)
              }
            />
            <MetricRow
              label="Income change"
              value={formatPercent(comparisons.incomeChangePct)}
            />
            <MetricRow
              label="Expense change"
              value={formatPercent(comparisons.expenseChangePct)}
            />
            <MetricRow
              label="Period net change"
              value={formatCurrency(comparisons.netBalanceChange || 0)}
            />
            <MetricRow
              label="Average per calendar day"
              value={formatCurrency(current.averagePerCalendarDay || 0)}
              tooltip="Total expenses divided by all days in the selected month."
            />
            <MetricRow
              label="Average per spending day"
              value={formatCurrency(current.averagePerSpendingDay || 0)}
              tooltip="Total expenses divided only by days when at least one expense was recorded."
            />
            <MetricRow
              label="Recurring expenses"
              value={`${formatCurrency(current.recurringExpenseTotal || 0)} (${formatPercent(
                current.recurringExpensePercentage
              )})`}
            />
            </CardContent>
          </TooltipProvider>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="finance-card-hover">
          <CardHeader>
            <CardTitle className="text-base">Category breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <div className="grid h-36 place-items-center rounded-xl bg-[#F8FAFC] text-sm font-medium text-[#64748B]">
                No expenses in this period
              </div>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map((category) => (
                  <div key={category.category}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-[#334155]">{category.label}</span>
                      <span className="money-nums font-extrabold text-[#0F172A]">
                        {formatCurrency(category.amount)} · {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E8EDF3]">
                      <div
                        className="h-full rounded-full bg-[#13B8B5]"
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="finance-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-5 text-[#13B8B5]" />
              Activity details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MetricRow
              label="Highest-spending day"
              value={
                current.highestSpendingDay
                  ? `${current.highestSpendingDay.date} · ${formatCurrency(
                      current.highestSpendingDay.amount
                    )}`
                  : "No expense day"
              }
            />
            <MetricRow
              label="Largest transaction"
              value={
                largestTransaction
                  ? `${largestTransaction.description} · ${formatCurrency(
                      largestTransaction.amount
                    )}`
                  : "No transaction"
              }
            />
            <MetricRow
              label="Days remaining"
              value={`${current.daysRemaining || 0} days`}
            />
            <MetricRow
              label="Risk level"
              value={insight.riskLevel || "low"}
            />
            {insight.riskLevel === "high" && (
              <div className="mt-4 flex gap-3 rounded-xl bg-[#FFF0F3] p-4 text-sm font-medium text-[#9F1239]">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                Review this period carefully before adding new non-essential expenses.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

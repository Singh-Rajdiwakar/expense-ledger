import { Suspense } from "react";
import { getAccountChartData, getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { currentUser } from "@clerk/nextjs/server";
import { ReceiptText, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { AppTopbar } from "@/components/app-topbar";
import { MetricCard } from "@/components/metric-card";
import { ExpenseCategoryCard } from "../_components/expense-category-card";
import { formatCurrency } from "@/lib/format";
import { parseChartRange, parseSelectedPeriod } from "@/lib/date-period";
import { loadFinancialInsights } from "@/lib/insight-loader";

function getDashboardHref(period) {
  const params = new URLSearchParams({
    month: String(period.month),
    year: String(period.year),
  });

  return `/dashboard?${params.toString()}`;
}

export default async function AccountPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const period = parseSelectedPeriod(resolvedSearchParams);
  const chartRange = parseChartRange(resolvedSearchParams);
  const [accountData, chartData, user, insightData] = await Promise.all([
    getAccountWithTransactions(resolvedParams.id, period),
    getAccountChartData(resolvedParams.id, period, chartRange),
    currentUser(),
    loadFinancialInsights({
      accountId: resolvedParams.id,
      month: period.month,
      year: period.year,
    }),
  ]);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "INCOME") {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
  const firstName = user?.firstName || user?.fullName?.split(" ")?.[0] || "there";

  return (
    <div className="space-y-5">
      <AppTopbar
        eyebrow={`Good morning, ${firstName} 👋`}
        title="Monthly Overview"
        description="Track your income, expenses and manage your finances smartly."
        period={period}
        actionTone="purple"
        dashboardHref={getDashboardHref(period)}
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Income"
          value={formatCurrency(totals.income)}
          helper={`${account.name} income`}
          icon={TrendingUp}
          tone="green"
        />
        <MetricCard
          label="Total Expenses"
          value={formatCurrency(totals.expense)}
          helper={`${account.name} expenses`}
          icon={TrendingDown}
          tone="red"
        />
        <MetricCard
          label="Net Balance"
          value={formatCurrency(account.balance || 0)}
          helper={`${account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account`}
          icon={Wallet}
          tone="purple"
        />
        <MetricCard
          label="Transactions"
          value={account.periodTransactionCount}
          helper="This account"
          icon={ReceiptText}
          tone="yellow"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#695CF6" />}
        >
          <AccountChart
            accountId={account.id}
            chartData={chartData?.data || []}
            currentChartRange={chartData?.chartRange || chartRange}
            hasTransactions={Boolean(chartData?.hasTransactions)}
            period={period}
          />
        </Suspense>
        <ExpenseCategoryCard
          transactions={transactions}
          period={period}
          accountId={account.id}
          shortInsight={insightData?.success ? insightData.data.summary : null}
        />
      </section>

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#695CF6" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}

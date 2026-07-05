import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardDataForPeriod } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";
import { AppTopbar } from "@/components/app-topbar";
import { parseSelectedPeriod } from "@/lib/date-period";
import { loadFinancialInsights } from "@/lib/insight-loader";

export default async function DashboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const period = parseSelectedPeriod(resolvedSearchParams);
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardDataForPeriod(period),
  ]);

  const safeAccounts = accounts || [];
  const safeTransactions = transactions || [];
  const defaultAccount = safeAccounts.find((account) => account.isDefault);


  let budgetData = null;
  let insightData = null;
  if (defaultAccount) {
    [budgetData, insightData] = await Promise.all([
      getCurrentBudget(defaultAccount.id, period),
      loadFinancialInsights({
        accountId: defaultAccount.id,
        month: period.month,
        year: period.year,
      }),
    ]);
  }

  const visibleMonthExpenses = defaultAccount
    ? safeTransactions
      .filter((transaction) => {
        return (
          transaction.accountId === defaultAccount.id &&
          transaction.type === "EXPENSE"
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    : 0;

  return (
    <div className="space-y-5">
      <AppTopbar
        title="Dashboard"
        description="Track your income, expenses and manage your finances with ease."
        period={period}
        actionTone="teal"
      />

      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || visibleMonthExpenses}
      />

      <DashboardOverview
        accounts={safeAccounts}
        transactions={safeTransactions}
        period={period}
        shortInsight={insightData?.success ? insightData.data.summary : null}
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="min-h-[190px] cursor-pointer border-dashed border-[#D7DEE8] bg-white/70 shadow-none transition-all hover:-translate-y-0.5 hover:border-[#13B8B5] hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <CardContent className="flex h-full min-h-[190px] flex-col items-center justify-center p-6 text-center">
              <span className="mb-4 grid size-14 place-items-center rounded-full bg-[#E8FAF9] text-[#13B8B5]">
                <Plus className="size-7" />
              </span>
              <p className="text-sm font-extrabold text-[#0F172A]">Add New Account</p>
              <p className="mt-2 max-w-[140px] text-xs font-medium leading-relaxed text-[#64748B]">
                Manage your finances in one place
              </p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {safeAccounts.length > 0 &&
          safeAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              transactions={safeTransactions.filter((transaction) => transaction.accountId === account.id)}
            />
          ))}
      </div>
    </div>
  );
}

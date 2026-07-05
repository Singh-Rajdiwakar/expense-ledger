import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams }) {
  const [accounts, resolvedSearchParams] = await Promise.all([
    getUserAccounts(),
    searchParams,
  ]);
  const editId = resolvedSearchParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-[34px] font-extrabold tracking-tight text-[#111827] sm:text-4xl">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
        <p className="mt-2 text-sm font-medium text-[#475569]">
          Capture income, expenses, receipts, and recurring details.
        </p>
      </div>
      <div className="finance-card p-5 sm:p-6">
        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
          editMode={!!editId}
          initialData={initialData}
        />
      </div>
    </div>
  );
}

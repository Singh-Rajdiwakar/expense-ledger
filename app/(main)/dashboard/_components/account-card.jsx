"use client";

import { ArrowDownRight, ArrowUpRight, WalletCards } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

export function AccountCard({ account, transactions = [] }) {
  const { name, type, balance, id, isDefault } = account;
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

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    setData: setUpdatedAccount,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (checked) => {
    if (isDefault && !checked) {
      toast.warning("You need at least 1 default account");
      return;
    }

    if (!checked) {
      return;
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
      setUpdatedAccount(undefined);
    } else if (updatedAccount?.error) {
      toast.error(updatedAccount.error || "Failed to update default account");
      setUpdatedAccount(undefined);
    }
  }, [updatedAccount, setUpdatedAccount]);

  return (
    <Card className="finance-card-hover group relative min-h-[190px]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Link href={`/account/${id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-[#E8FAF9] text-[#13B8B5]">
              <WalletCards className="size-4" />
            </span>
            <CardTitle className="text-sm capitalize">
              {name}
            </CardTitle>
          </div>
        </Link>
        <Switch
          checked={isDefault}
          onCheckedChange={handleDefaultChange}
          disabled={updateDefaultLoading}
          aria-label={`Set ${name} as default account`}
        />
      </CardHeader>
      <Link href={`/account/${id}`} className="block">
        <CardContent>
          <div className="money-nums text-2xl font-extrabold text-[#0F172A]">
            {formatCurrency(balance)}
          </div>
          <p className="mt-1 text-xs font-medium text-[#64748B]">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
          <div className="mt-5 grid grid-cols-2 rounded-xl border border-[#E8EDF3] bg-[#F8FAFC]">
            <div className="p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                <ArrowUpRight className="size-3.5" />
                Income
              </div>
              <p className="money-nums mt-1 text-sm font-extrabold text-[#22C55E]">
                +{formatCurrency(totals.income)}
              </p>
            </div>
            <div className="border-l border-[#D7DEE8] p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444]">
                <ArrowDownRight className="size-3.5" />
                Expense
              </div>
              <p className="money-nums mt-1 text-sm font-extrabold text-[#FF4D67]">
                -{formatCurrency(totals.expense)}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

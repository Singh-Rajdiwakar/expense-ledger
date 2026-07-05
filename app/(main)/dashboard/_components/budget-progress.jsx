"use client";

import { useState, useEffect } from "react";
import { Check, MoreHorizontal, Wallet, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import { formatCurrency } from "@/lib/format";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    setData: setUpdatedBudget,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? Math.min((currentExpenses / initialBudget.amount) * 100, 100)
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
      setUpdatedBudget(undefined);
    } else if (updatedBudget?.error) {
      toast.error(updatedBudget.error || "Failed to update budget");
      setUpdatedBudget(undefined);
    }
  }, [updatedBudget, setUpdatedBudget]);

  return (
    <Card className="finance-card-hover">
      <CardContent className="p-5">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-[#E8FAF9] text-[#13B8B5]">
            <Wallet className="size-7" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm">
                  Monthly Budget (Default Account)
                </CardTitle>
                {!isEditing && (
                  <CardDescription className="mt-1">
                    {initialBudget
                      ? (
                        <>
                          <span className="money-nums text-xl font-extrabold text-[#0F172A]">
                            {formatCurrency(currentExpenses)}
                          </span>{" "}
                          of {formatCurrency(initialBudget.amount)} spent
                        </>
                      )
                      : "No budget set"}
                  </CardDescription>
                )}
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Edit monthly budget"
                  className="size-8 text-[#64748B]"
                  onClick={() => setIsEditing(true)}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-40"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                  aria-label="Save budget"
                >
                  <Check className="size-4 text-[#16A34A]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                  aria-label="Cancel budget edit"
                >
                  <X className="size-4 text-[#EF4444]" />
                </Button>
              </div>
            ) : (
              initialBudget && (
                <Progress
                  value={percentUsed}
                  extraStyles={`${
                    percentUsed >= 90
                      ? "bg-[#FF4D67]"
                      : percentUsed >= 75
                        ? "bg-[#F5B942]"
                        : "bg-[#13B8B5]"
                    }`}
                />
              )
            )}
          </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <div className="rounded-xl bg-[#F8FAFC] px-6 py-3 text-center">
              <p className="money-nums text-xl font-extrabold text-[#0F172A]">
                {percentUsed.toFixed(1)}%
              </p>
              <p className="text-xs font-semibold text-[#64748B]">used</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

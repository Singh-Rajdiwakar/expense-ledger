"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
          type: initialData.type,
          amount: initialData.amount.toString(),
          description: initialData.description,
          accountId: initialData.accountId,
          category: initialData.category,
          date: new Date(initialData.date),
          isRecurring: initialData.isRecurring,
          ...(initialData.recurringInterval && {
            recurringInterval: initialData.recurringInterval,
          }),
        }
        : {
          type: "EXPENSE",
          amount: "",
          description: "",
          accountId: accounts.find((ac) => ac.isDefault)?.id,
          date: new Date(),
          isRecurring: false,
        },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
    setData: setTransactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = useCallback((scannedData) => {
    if (!scannedData?.amount || !scannedData?.date) {
      toast.error("Could not read receipt details");
      return;
    }

    setValue("amount", scannedData.amount.toString());
    setValue("date", new Date(scannedData.date));
    if (scannedData.description) {
      setValue("description", scannedData.description);
    }
    if (scannedData.category) {
      setValue("category", scannedData.category);
    }
    toast.success("Receipt scanned successfully");
  }, [setValue]);

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      const accountId = transactionResult.data.accountId;
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      setTransactionResult(undefined);
      reset();
      router.push(`/account/${accountId}`);
    }
  }, [
    transactionResult,
    transactionLoading,
    editMode,
    reset,
    router,
    setTransactionResult,
  ]);

  const type = watch("type");
  const accountId = watch("accountId");
  const category = watch("category");
  const isRecurring = watch("isRecurring");
  const recurringInterval = watch("recurringInterval");
  const date = watch("date");

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  useEffect(() => {
    if (
      category &&
      !filteredCategories.some((option) => option.id === category)
    ) {
      setValue("category", "");
    }
  }, [category, filteredCategories, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}


      <div className="space-y-2">
        <label className="text-sm font-bold text-[#0F172A]">Type</label>
        <Select
          value={type}
          onValueChange={(value) => setValue("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>


      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#0F172A]">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[#0F172A]">Account</label>
          <Select
            value={accountId}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="relative flex w-full cursor-default select-none items-center justify-start rounded-lg px-2 py-2 text-sm outline-none hover:bg-[#E8FAF9]"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>


      <div className="space-y-2">
        <label className="text-sm font-bold text-[#0F172A]">Category</label>
        <Select
          value={category}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>


      <div className="space-y-2">
        <label className="text-sm font-bold text-[#0F172A]">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) setValue("date", date);
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>


      <div className="space-y-2">
        <label className="text-sm font-bold text-[#0F172A]">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>


      <div className="flex flex-row items-center justify-between rounded-xl border border-[#E8EDF3] bg-[#F8FAFC] p-4">
        <div className="space-y-0.5">
          <label className="text-base font-bold text-[#0F172A]">Recurring Transaction</label>
          <div className="text-sm text-[#64748B]">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>


      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#0F172A]">Recurring Interval</label>
            <Select
              value={recurringInterval}
              onValueChange={(value) => setValue("recurringInterval", value)}
            >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}


      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full" disabled={transactionLoading}>
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}

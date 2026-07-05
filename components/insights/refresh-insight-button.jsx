"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { refreshFinancialInsights } from "@/actions/insight";
import { Button } from "@/components/ui/button";

export function RefreshInsightButton({ month, year, accountId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const result = await refreshFinancialInsights({ month, year, accountId });

      if (result.success) {
        toast.success("Insight report refreshed");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to refresh insights");
      }
    });
  };

  return (
    <Button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      className="h-10 rounded-xl bg-[#13B8B5] px-4 text-white hover:bg-[#0EA5A4]"
    >
      <RefreshCw className={isPending ? "size-4 animate-spin" : "size-4"} />
      Refresh insight
    </Button>
  );
}

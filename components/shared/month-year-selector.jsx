"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatSelectedMonth } from "@/lib/date-period";
import { cn } from "@/lib/utils";

const months = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    new Date(2026, index, 1)
  ),
}));

export function MonthYearSelector({ month, year }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(String(year));
  const [isPending, startTransition] = useTransition();

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, index) => currentYear - 6 + index);
  }, []);

  useEffect(() => {
    const nextYear = String(year);
    setDraftYear((currentYear) =>
      currentYear === nextYear ? currentYear : nextYear
    );
  }, [year]);

  const updatePeriod = (nextMonth, nextYear = Number(draftYear)) => {
    if (isPending) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(nextMonth));
    params.set("year", String(nextYear));

    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    if (nextUrl === currentUrl) {
      setOpen(false);
      return;
    }

    startTransition(() => {
      router.push(nextUrl);
      setOpen(false);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Select month and year"
          disabled={isPending}
          className="h-10 rounded-xl border-[#E5E7EB] bg-white px-4 text-[#334155] shadow-[0_3px_12px_rgba(15,23,42,0.05)] hover:bg-[#F8FAFC]"
        >
          <Calendar className="size-4 text-[#64748B]" />
          <span>{formatSelectedMonth({ month, year })}</span>
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-[#94A3B8]" />
          ) : (
            <ChevronDown className="size-4 text-[#94A3B8]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[292px] rounded-2xl p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-[#0F172A]">Select period</p>
          <Select
            value={draftYear}
            onValueChange={(value) => {
              setDraftYear(value);
              updatePeriod(month, Number(value));
            }}
          >
            <SelectTrigger className="h-9 w-[112px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((item) => {
            const active = item.value === month && Number(draftYear) === year;

            return (
              <Button
                key={item.value}
                type="button"
                variant={active ? "default" : "outline"}
                disabled={isPending}
                className={cn(
                  "h-10 rounded-xl text-sm font-bold",
                  active
                    ? "bg-[#13B8B5] text-white hover:bg-[#0EA5A4]"
                    : "bg-white text-[#334155] hover:bg-[#F8FAFC]"
                )}
                onClick={() => updatePeriod(item.value)}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

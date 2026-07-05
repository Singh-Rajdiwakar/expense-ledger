"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MonthYearSelector } from "@/components/shared/month-year-selector";
import { NotificationBell } from "@/components/shared/notification-bell";

export function AppTopbar({
  eyebrow,
  title,
  description,
  period,
  actionTone = "teal",
}) {
  const actionClass =
    actionTone === "purple"
      ? "bg-[#695CF6] shadow-[0_8px_18px_rgba(105,92,246,0.24)] hover:bg-[#5848EE]"
      : "bg-[#13B8B5] shadow-[0_8px_18px_rgba(19,184,181,0.22)] hover:bg-[#0EA5A4]";

  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-sm font-semibold text-[#475569]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[34px] font-extrabold leading-none tracking-tight text-[#111827] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm font-medium text-[#475569]">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MonthYearSelector month={period.month} year={period.year} />

        <Button
          asChild
          className={cn(
            "h-10 rounded-xl px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98]",
            actionClass
          )}
        >
          <Link href="/transaction/create">
            <Plus className="size-4" />
            Add Transaction
          </Link>
        </Button>

        <NotificationBell period={period} />

        <div className="relative grid size-10 place-items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-10 rounded-full border-2 border-white shadow-sm",
              },
            }}
          />
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#22C55E]" />
        </div>
      </div>
    </header>
  );
}

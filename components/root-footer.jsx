"use client";

import { usePathname } from "next/navigation";
import { Heart, ShieldCheck } from "lucide-react";

export function RootFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="border-t border-[#E8EDF3] bg-white/70">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 text-xs text-[#64748B] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl border border-[#E8EDF3] bg-white text-[#0EA5A4] shadow-sm">
            <ShieldCheck className="size-4" />
          </span>
          <span>
            <span className="block font-semibold text-[#0F172A]">
              Your data is secure
            </span>
            Protected account access
          </span>
        </div>
        <p>© 2025 Expense Ledger. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Made with{" "}
          <Heart className="size-3 fill-[#13B8B5] text-[#13B8B5]" /> by
          Singh Rajdiwakar
        </p>
      </div>
    </footer>
  );
}

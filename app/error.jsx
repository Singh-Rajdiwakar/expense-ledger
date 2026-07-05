"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({ reset }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] px-6">
      <section className="w-full max-w-xl rounded-2xl border border-[#E8EDF3] bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#13B8B5]">
          Expense Ledger
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-[#0F172A]">
          Something went wrong
        </h1>
        <p className="mt-3 text-base font-medium leading-7 text-[#64748B]">
          The page could not finish loading. Try again, or return to the
          dashboard.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

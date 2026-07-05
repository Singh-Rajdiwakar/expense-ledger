"use client";

import { useState } from "react";
import { CheckCircle2, ReceiptText, WalletCards } from "lucide-react";
import { MiniBarChart, MiniDonut } from "./hero-dashboard-preview";

const tabs = ["Overview", "Transactions", "Budgets", "Accounts"];

const tabCopy = {
  Overview: "Balances, cash flow, categories, and AI insights in one calm view.",
  Transactions: "Search, filter, and review income and expenses without spreadsheet clutter.",
  Budgets: "Track monthly budget usage and catch overspending before it grows.",
  Accounts: "Keep current, salary, and savings accounts organised together.",
};

export function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <section id="showcase" className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
            One dashboard. Complete financial clarity.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#64748B]">
            See balances, budgets, transactions, category breakdowns, and account
            activity without switching between multiple tools.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-10 rounded-xl border px-4 text-sm font-bold transition ${
                activeTab === tab
                  ? "border-[#13B8B5] bg-[#13B8B5] text-white shadow-[0_10px_22px_rgba(19,184,181,0.18)]"
                  : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-[#E8EDF3] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="rounded-[22px] bg-[#F8FAFC] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#13B8B5]">
                  {activeTab}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-[#0F172A]">
                  {tabCopy[activeTab]}
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#475569] shadow-sm">
                <CheckCircle2 className="size-4 text-[#22C55E]" />
                Public illustrative preview
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-base font-extrabold text-[#0F172A]">
                    Monthly cash flow
                  </p>
                  <span className="text-sm font-bold text-[#64748B]">May 2025</span>
                </div>
                <MiniBarChart />
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-4 text-base font-extrabold text-[#0F172A]">
                  Expense mix
                </p>
                <div className="flex items-center justify-center gap-5">
                  <MiniDonut />
                  <div className="space-y-3 text-sm font-bold text-[#64748B]">
                    <p><span className="mr-2 inline-block size-2 rounded-full bg-[#FF4D67]" />Food</p>
                    <p><span className="mr-2 inline-block size-2 rounded-full bg-[#13B8B5]" />Bills</p>
                    <p><span className="mr-2 inline-block size-2 rounded-full bg-[#695CF6]" />Travel</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#ECFDFB] text-[#13B8B5]">
                    <ReceiptText className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[#0F172A]">Recent activity</p>
                    <p className="text-xs font-semibold text-[#64748B]">Three latest payments</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#EFEDFF] text-[#695CF6]">
                    <WalletCards className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[#0F172A]">Account clarity</p>
                    <p className="text-xs font-semibold text-[#64748B]">Balances and spending together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

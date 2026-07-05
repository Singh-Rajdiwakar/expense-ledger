import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  ReceiptText,
  WalletCards,
} from "lucide-react";

const transactions = [
  { label: "Street food", category: "Food", amount: "-₹50", color: "#FF4D67" },
  { label: "Gift received", category: "Income", amount: "+₹22,200", color: "#22C55E" },
  { label: "Travel cost", category: "Travel", amount: "-₹650", color: "#FF4D67" },
];

const cashFlowSeries = [
  { label: "W1", income: 42, expense: 22 },
  { label: "W2", income: 58, expense: 68 },
  { label: "W3", income: 48, expense: 34 },
  { label: "W4", income: 82, expense: 46 },
  { label: "W5", income: 54, expense: 28 },
];

const donutSegments = [
  { label: "Food", percent: 36, color: "#FF4D67", offset: 0 },
  { label: "Bills", percent: 18, color: "#13B8B5", offset: 36 },
  { label: "Travel", percent: 19, color: "#695CF6", offset: 54 },
  { label: "Transport", percent: 14, color: "#F59E0B", offset: 73 },
  { label: "Others", percent: 13, color: "#8BDDB2", offset: 87 },
];

export function MiniBarChart() {
  return (
    <div className="relative h-32 overflow-hidden rounded-2xl border border-[#E8EDF3] bg-gradient-to-b from-white to-[#F8FAFC] px-4 pb-3 pt-4">
      <div className="absolute inset-x-4 top-5 h-px bg-[#E8EDF3]" />
      <div className="absolute inset-x-4 top-12 h-px bg-[#E8EDF3]" />
      <div className="absolute inset-x-4 top-[76px] h-px bg-[#E8EDF3]" />
      <svg
        className="pointer-events-none absolute inset-x-4 top-4 h-20 w-[calc(100%-2rem)]"
        viewBox="0 0 180 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M4 54 C28 28, 52 58, 76 34 S128 22, 176 36"
          fill="none"
          stroke="#13B8B5"
          strokeLinecap="round"
          strokeWidth="3"
          opacity="0.82"
        />
        <path
          d="M4 62 C34 48, 58 68, 84 44 S130 54, 176 30"
          fill="none"
          stroke="#FF4D67"
          strokeLinecap="round"
          strokeWidth="3"
          opacity="0.72"
        />
      </svg>
      <div className="relative z-10 flex h-24 items-end gap-3">
        {cashFlowSeries.map((item, index) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-20 items-end gap-1.5">
              <div
                className="landing-bar w-2.5 rounded-t-full bg-[#22C55E] shadow-[0_8px_16px_rgba(34,197,94,0.16)]"
                style={{
                  "--bar-height": `${item.income}%`,
                  animationDelay: `${index * 80}ms`,
                }}
              />
              <div
                className="landing-bar w-2.5 rounded-t-full bg-[#FF4D67] shadow-[0_8px_16px_rgba(255,77,103,0.16)]"
                style={{
                  "--bar-height": `${item.expense}%`,
                  animationDelay: `${index * 80 + 60}ms`,
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-[#94A3B8]">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 right-4 flex items-center gap-3 text-[10px] font-extrabold text-[#64748B]">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-[#22C55E]" />
          Income
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-[#FF4D67]" />
          Spend
        </span>
      </div>
    </div>
  );
}

export function MiniDonut() {
  return (
    <div className="relative grid size-28 shrink-0 place-items-center">
      <svg
        className="absolute inset-0 block size-full"
        viewBox="0 0 120 120"
        role="img"
        aria-label="Expense category mix"
      >
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="47"
          stroke="#EEF2F7"
          strokeWidth="18"
        />
        {donutSegments.map((segment) => (
          <circle
            key={segment.label}
            cx="60"
            cy="60"
            fill="none"
            pathLength="100"
            r="47"
            stroke={segment.color}
            strokeDasharray={`${segment.percent - 1.2} ${101.2 - segment.percent}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="round"
            strokeWidth="18"
            transform="rotate(-90 60 60)"
          />
        ))}
      </svg>
      <div className="relative z-10 grid size-14 place-items-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
        <div>
          <span className="block text-[10px] font-bold text-[#64748B]">Total</span>
          <span className="money-nums block text-xs font-extrabold text-[#0F172A]">
            ₹5,200
          </span>
        </div>
      </div>
    </div>
  );
}

function FloatingMetric({ className, tone, icon: Icon, label, value, helper }) {
  return (
    <div className={`landing-float-card absolute hidden rounded-2xl border border-[#E8EDF3] bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur md:block ${className}`}>
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 place-items-center rounded-full"
          style={{ backgroundColor: tone.bg, color: tone.color }}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold text-[#64748B]">{label}</p>
          <p className="money-nums text-lg font-extrabold" style={{ color: tone.color }}>
            {value}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#94A3B8]">{helper}</p>
    </div>
  );
}

export function HeroDashboardPreview() {
  return (
    <div className="landing-preview relative mx-auto max-w-[690px]">
      <div className="absolute -inset-8 -z-10 rounded-[42px] bg-[radial-gradient(circle_at_24%_18%,rgba(19,184,181,0.27),transparent_35%),radial-gradient(circle_at_82%_28%,rgba(105,92,246,0.25),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0),rgba(19,184,181,0.08))] blur-2xl" />
      <div className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.16)] ring-1 ring-[#E8EDF3]/80 backdrop-blur">
        <div className="rounded-[22px] bg-gradient-to-br from-[#F8FAFC] via-white to-[#ECFDFB] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748B]">
                Monthly overview
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-[#0F172A]">
                Financial clarity
              </h3>
            </div>
            <span className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#64748B] shadow-sm">
              May 2025
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-bold text-[#64748B]">Balance</p>
              <p className="money-nums mt-1 text-2xl font-extrabold text-[#0F172A]">
                ₹27,000
              </p>
              <p className="mt-2 text-[11px] font-bold text-[#94A3B8]">Across 3 accounts</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-bold text-[#64748B]">Income</p>
              <p className="money-nums mt-1 text-2xl font-extrabold text-[#22C55E]">
                ₹22,200
              </p>
              <p className="mt-2 text-[11px] font-bold text-[#94A3B8]">+18.6% vs last month</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-bold text-[#64748B]">Expenses</p>
              <p className="money-nums mt-1 text-2xl font-extrabold text-[#FF4D67]">
                ₹5,200
              </p>
              <p className="mt-2 text-[11px] font-bold text-[#94A3B8]">26% budget used</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-extrabold text-[#0F172A]">
                  Cash flow
                </p>
                <span className="rounded-full bg-[#ECFDFB] px-2.5 py-1 text-xs font-bold text-[#13B8B5]">
                  Monthly
                </span>
              </div>
              <MiniBarChart />
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-extrabold text-[#0F172A]">
                  Categories
                </p>
                <span className="money-nums text-xs font-extrabold text-[#64748B]">
                  5 groups
                </span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <MiniDonut />
                <div className="space-y-2 text-xs font-bold text-[#64748B]">
                  <p><span className="mr-2 inline-block size-2 rounded-full bg-[#FF4D67]" />Food 36%</p>
                  <p><span className="mr-2 inline-block size-2 rounded-full bg-[#13B8B5]" />Bills 18%</p>
                  <p><span className="mr-2 inline-block size-2 rounded-full bg-[#695CF6]" />Travel 19%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-extrabold text-[#0F172A]">Budget</p>
                <span className="money-nums text-sm font-extrabold text-[#13B8B5]">26%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#E8EDF3]">
                <div className="landing-progress h-full rounded-full bg-[#13B8B5]" />
              </div>
              <p className="mt-3 text-xs font-semibold text-[#64748B]">
                ₹5,200 of ₹20,000 spent
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <p className="mb-3 text-sm font-extrabold text-[#0F172A]">
                Recent transactions
              </p>
              <div className="space-y-3">
                {transactions.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-[#F8FAFC] text-[#64748B]">
                        <ReceiptText className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-[#0F172A]">{item.label}</p>
                        <p className="text-[11px] font-semibold text-[#94A3B8]">{item.category}</p>
                      </div>
                    </div>
                    <p className="money-nums text-xs font-extrabold" style={{ color: item.color }}>
                      {item.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#ECFDFB] p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#13B8B5]">
              <Brain className="size-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#0F172A]">Top Insight</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">
                Food expenses are your highest category this month. Review daily
                payments before the month ends.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FloatingMetric
        className="-left-8 top-14"
        tone={{ bg: "#EAFBF1", color: "#22C55E" }}
        icon={ArrowUpRight}
        label="Income"
        value="+₹22,200"
        helper="This month"
      />
      <FloatingMetric
        className="-right-8 top-36"
        tone={{ bg: "#FFF0F3", color: "#FF4D67" }}
        icon={ArrowDownRight}
        label="Expenses"
        value="-₹5,200"
        helper="26% budget used"
      />
      <FloatingMetric
        className="bottom-8 left-8"
        tone={{ bg: "#EFEDFF", color: "#695CF6" }}
        icon={WalletCards}
        label="Accounts"
        value="3 active"
        helper="Current, salary, savings"
      />
    </div>
  );
}

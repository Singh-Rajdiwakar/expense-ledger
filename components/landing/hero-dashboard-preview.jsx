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

export function MiniBarChart() {
  return (
    <div className="flex h-28 items-end gap-2 rounded-2xl bg-[#F8FAFC] p-4">
      {[34, 64, 42, 82, 48, 58, 28].map((height, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="landing-bar w-full rounded-t-lg"
            style={{
              "--bar-height": `${height}%`,
              backgroundColor: index === 3 ? "#22C55E" : "#FF4D67",
              animationDelay: `${index * 80}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function MiniDonut() {
  return (
    <div className="relative size-28 rounded-full bg-[conic-gradient(#FF4D67_0_36%,#13B8B5_36%_54%,#695CF6_54%_73%,#F59E0B_73%_86%,#8BDDB2_86%_100%)] shadow-inner">
      <div className="absolute inset-6 grid place-items-center rounded-full bg-white text-center">
        <span className="text-[10px] font-bold text-[#64748B]">Total</span>
        <span className="-mt-1 text-xs font-extrabold text-[#0F172A]">₹5,200</span>
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
      <div className="absolute -inset-8 -z-10 rounded-[42px] bg-[radial-gradient(circle_at_30%_20%,rgba(19,184,181,0.25),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(105,92,246,0.24),transparent_35%)] blur-2xl" />
      <div className="rounded-[28px] border border-[#E8EDF3] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
        <div className="rounded-[22px] bg-[#F8FAFC] p-4">
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
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-[#64748B]">Balance</p>
              <p className="money-nums mt-1 text-2xl font-extrabold text-[#0F172A]">
                ₹27,000
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-[#64748B]">Income</p>
              <p className="money-nums mt-1 text-2xl font-extrabold text-[#22C55E]">
                ₹22,200
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-[#64748B]">Expenses</p>
              <p className="money-nums mt-1 text-2xl font-extrabold text-[#FF4D67]">
                ₹5,200
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-extrabold text-[#0F172A]">
                  Cash flow
                </p>
                <span className="text-xs font-bold text-[#64748B]">Monthly</span>
              </div>
              <MiniBarChart />
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-extrabold text-[#0F172A]">
                Categories
              </p>
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
            <div className="rounded-2xl bg-white p-4 shadow-sm">
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
            <div className="rounded-2xl bg-white p-4 shadow-sm">
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

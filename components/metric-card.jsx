import { cn } from "@/lib/utils";

const toneStyles = {
  green: {
    icon: "bg-[#EAFBF1] text-[#16A34A]",
    value: "text-[#22C55E]",
  },
  red: {
    icon: "bg-[#FFF0F3] text-[#FF4D67]",
    value: "text-[#FF4D67]",
  },
  purple: {
    icon: "bg-[#F0EEFF] text-[#695CF6]",
    value: "text-[#695CF6]",
  },
  yellow: {
    icon: "bg-[#FFF8E6] text-[#F5B942]",
    value: "text-[#0F172A]",
  },
  teal: {
    icon: "bg-[#E8FAF9] text-[#13B8B5]",
    value: "text-[#0F172A]",
  },
};

export function MetricCard({ label, value, helper, icon: Icon, tone = "teal" }) {
  const styles = toneStyles[tone] || toneStyles.teal;

  return (
    <div className="finance-card finance-card-hover flex min-h-[116px] items-center gap-5 p-5">
      <div
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-full",
          styles.icon
        )}
      >
        <Icon className="size-6" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#64748B]">{label}</p>
        <p className={cn("money-nums mt-1 text-2xl font-extrabold", styles.value)}>
          {value}
        </p>
        {helper && (
          <p className="mt-1 text-xs font-medium text-[#64748B]">{helper}</p>
        )}
      </div>
    </div>
  );
}

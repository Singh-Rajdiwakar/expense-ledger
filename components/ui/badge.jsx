import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#13B8B5]/25 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#E8FAF9] text-[#0EA5A4] hover:bg-[#DDF7F5]",
        secondary:
          "border-transparent bg-[#F1F5F9] text-[#475569] hover:bg-[#E8EDF3]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "border-[#E5E7EB] bg-white text-[#475569]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }

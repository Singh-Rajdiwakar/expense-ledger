import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#13B8B5]/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#13B8B5] text-white shadow-[0_8px_18px_rgba(19,184,181,0.2)] hover:bg-[#0EA5A4]",
        destructive:
          "bg-[#FF4D67] text-white shadow-sm hover:bg-[#EF4444]",
        outline:
          "border border-[#E5E7EB] bg-white text-[#334155] shadow-sm hover:bg-[#F8FAFC] hover:text-[#0F172A]",
        secondary:
          "bg-[#F0EEFF] text-[#695CF6] shadow-sm hover:bg-[#E5E1FF]",
        ghost: "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
        link: "text-[#13B8B5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        {...(!asChild ? { type: "button" } : {})}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

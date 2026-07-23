import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: pill-shaped, bold, smooth transitions, press feedback
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary — SoudFlex blue with glow
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.35)] hover:bg-primary/90 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.5)]",
        // Destructive — red
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_4px_16px_hsl(var(--destructive)/0.3)] hover:bg-destructive/90",
        // Outline — subtle dark border, glass-like
        outline:
          "border border-white/10 bg-white/5 text-foreground backdrop-blur-sm hover:bg-white/10 hover:border-white/20",
        // Secondary — slightly lighter dark
        secondary:
          "bg-white/8 text-foreground hover:bg-white/15",
        // Ghost — no background, just hover
        ghost:
          "hover:bg-white/10 hover:text-foreground",
        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm:      "h-9 rounded-xl px-4 text-xs",
        lg:      "h-13 rounded-xl px-8 text-base",
        icon:    "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

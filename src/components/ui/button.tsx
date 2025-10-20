import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const baseButtonStyles =
  "flex transition-[border-color,color,background-color] duration-[500ms] ease-[cubic-bezier(0.39,0.575,0.565,1)] [transition-property:border-color,color,background-color] [transition-timing-function:cubic-bezier(0.39,0.575,0.565,1),cubic-bezier(0.39,0.575,0.565,1),cubic-bezier(0.47,0,0.745,0.715)] [transition-duration:0.5s,0.5s,0.5s] [box-shadow:rgba(220,220,220,0.25)_0px_4px_16px_inset,rgba(255,255,255,0.3)_0px_2px_6px_inset]";
const buttonVariants = cva(
  [
    baseButtonStyles,
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/70 ",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3 rounded-3xl",
        sm: "h-8 rounded-2xl gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-3xl px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

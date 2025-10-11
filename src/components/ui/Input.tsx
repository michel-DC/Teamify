"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";

// Interface étendue pour permettre l'autocomplétion et la documentation
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function InputComponent({ className, type, ...props }, ref) {
    const radius = 100;
    const [visible, setVisible] = React.useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    return (
      <motion.div
        style={{
          background: useMotionTemplate`radial-gradient(${
            visible ? radius + "px" : "0px"
          } circle at ${mouseX}px ${mouseY}px, #7C3AED, transparent 80%)`,
        }}
        onMouseMove={(e) => {
          const { left, top } = e.currentTarget.getBoundingClientRect();
          mouseX.set(e.clientX - left);
          mouseY.set(e.clientY - top);
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);
Input.displayName = "Input";

export { Input };

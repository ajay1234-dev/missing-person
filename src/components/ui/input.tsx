import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[40px] w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg-elevated)] px-[12px] text-[14px] text-[var(--text-primary)] transition-all duration-150",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[var(--text-muted)]",
          "focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_3px_var(--brand-glow)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

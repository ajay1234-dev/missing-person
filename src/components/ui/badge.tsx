import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[999px] px-[10px] py-[3px] text-xs font-semibold tracking-[0.02em] transition-colors border",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand)] border-transparent text-white",
        outline: "border-[var(--border)] text-[var(--text-secondary)]",
        active: "bg-[var(--success-bg)] border-[rgba(16,185,129,0.2)] text-[var(--success)]",
        found: "bg-[var(--info-bg)] border-[rgba(59,130,246,0.2)] text-[var(--info)]",
        closed: "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]",
        pending: "bg-[var(--warning-bg)] border-[rgba(245,158,11,0.2)] text-[var(--warning)]",
        verified: "bg-[var(--info-bg)] border-[rgba(59,130,246,0.2)] text-[var(--info)]",
        falseAlarm: "bg-[var(--danger-bg)] border-[rgba(239,68,68,0.2)] text-[var(--danger)]",
        danger: "bg-[var(--danger-bg)] border-[rgba(239,68,68,0.2)] text-[var(--danger)]",
        warning: "bg-[var(--warning-bg)] border-[rgba(245,158,11,0.2)] text-[var(--warning)]"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

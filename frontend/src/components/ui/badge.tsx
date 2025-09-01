"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-red-600 text-white hover:bg-red-700",
        secondary: "border-transparent bg-gray-700 text-gray-200 hover:bg-gray-600",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-gray-300 border-gray-600",
        success: "border-transparent bg-green-600 text-white hover:bg-green-700",
        warning: "border-transparent bg-yellow-600 text-white hover:bg-yellow-700",
        info: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
        // 의료용 특별 배지
        ct: "border-transparent bg-blue-700 text-white",
        mri: "border-transparent bg-purple-700 text-white",
        xray: "border-transparent bg-gray-700 text-white",
        us: "border-transparent bg-green-700 text-white",
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

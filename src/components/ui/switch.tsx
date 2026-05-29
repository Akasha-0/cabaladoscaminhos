"use client"

import * as React from "react"
import { Switch as BaseSwitch } from "@base-ui/react"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ComponentRef<typeof BaseSwitch>,
  React.ComponentPropsWithoutRef<typeof BaseSwitch>
>(({ className, ...props }, ref) => (
  <BaseSwitch
    ref={ref}
    className={cn(
      "peer inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-checked:border-primary",
      className
    )}
    {...props}
  >
    <BaseSwitch.Thumb
      className={cn(
        "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-checked:translate-x-5 data-checked:bg-primary-foreground"
      )}
    />
  </BaseSwitch>
))
Switch.displayName = "Switch"

export { Switch }
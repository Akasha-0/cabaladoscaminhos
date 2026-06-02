// fallow-ignore-file unused-file
"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverPrimitive.Positioner.Props & {
    align?: "start" | "center" | "end"
  }
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner sideOffset={sideOffset} align={align} {...props}>
      <PopoverPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 shadow-xl shadow-black/40 outline-none",
          className
        )}
      >
        {children}
      </PopoverPrimitive.Popup>
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
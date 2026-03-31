import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-sm bg-surface-highest px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border-none transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ghost-border-focus focus-visible:bg-surface-high/50 focus-visible:backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
}

export { Input }

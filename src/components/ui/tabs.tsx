import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TabsValueContext = React.createContext<string | undefined>(undefined)

function Tabs({
  className,
  orientation = "horizontal",
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsValueContext.Provider value={value as string | undefined}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        value={value}
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className
        )}
        {...props}
      />
    </TabsValueContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-start rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
        "file-labels":
          "relative gap-0 rounded-none bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const MORE_BTN_WIDTH = 80
const LIST_PADDING = 6

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const outerRef = React.useRef<HTMLDivElement>(null)
  const measureRef = React.useRef<HTMLDivElement>(null)
  const hiddenTriggersRef = React.useRef<Map<string, HTMLButtonElement>>(
    new Map()
  )
  const [visibleCount, setVisibleCount] = React.useState(Infinity)
  const activeValue = React.useContext(TabsValueContext)

  const childArray = React.Children.toArray(children).filter(
    (
      child
    ): child is React.ReactElement<{
      value: string
      children?: React.ReactNode
    }> => React.isValidElement(child)
  )

  const recalculate = React.useCallback(() => {
    const outer = outerRef.current
    const measure = measureRef.current
    if (!outer || !measure) return

    const available = outer.clientWidth
    if (available === 0) {
      setVisibleCount(Infinity)
      return
    }

    const items = Array.from(measure.children) as HTMLElement[]
    let used = LIST_PADDING
    let count = 0

    for (let i = 0; i < items.length; i++) {
      const w = items[i].offsetWidth
      const isLast = i === items.length - 1

      if (isLast && used + w <= available) {
        count++
        break
      }
      if (used + w + MORE_BTN_WIDTH > available) break
      used += w
      count++
    }

    setVisibleCount(Math.max(1, count))
  }, [])

  React.useLayoutEffect(recalculate)

  React.useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const ro = new ResizeObserver(recalculate)
    ro.observe(el)
    return () => ro.disconnect()
  }, [recalculate])

  const hasOverflow = visibleCount < childArray.length
  const visible = hasOverflow ? childArray.slice(0, visibleCount) : childArray
  const overflow = hasOverflow ? childArray.slice(visibleCount) : []
  const isActiveInOverflow = activeValue
    ? overflow.some((c) => c.props.value === activeValue)
    : false

  return (
    <div ref={outerRef} className="relative min-w-0">
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute flex h-0 overflow-hidden"
      >
        {childArray.map((child, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap"
          >
            {child.props.children}
          </span>
        ))}
      </div>

      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          tabsListVariants({ variant }),
          hasOverflow && "max-w-full",
          className
        )}
        {...props}
      >
        {visible}

        {overflow.map((child) => {
          const value = child.props.value
          return (
            <TabsPrimitive.Trigger
              key={`hidden-${value}`}
              ref={(el: HTMLButtonElement | null) => {
                if (el) hiddenTriggersRef.current.set(value, el)
                else hiddenTriggersRef.current.delete(value)
              }}
              value={value}
              className="sr-only"
              tabIndex={-1}
            />
          )
        })}

        {hasOverflow && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-[calc(100%-1px)] items-center gap-1 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "group-data-[variant=file-labels]/tabs-list:h-auto group-data-[variant=file-labels]/tabs-list:rounded-none group-data-[variant=file-labels]/tabs-list:px-3 group-data-[variant=file-labels]/tabs-list:py-1.5",
                  isActiveInOverflow
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground"
                )}
              >
                More
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {overflow.map((child) => {
                const value = child.props.value
                return (
                  <DropdownMenuItem
                    key={value}
                    className={cn(
                      value === activeValue && "bg-accent font-medium"
                    )}
                    onSelect={() =>
                      hiddenTriggersRef.current.get(value)?.click()
                    }
                  >
                    {child.props.children}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TabsPrimitive.List>
    </div>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-[color,background-color,border-color,box-shadow,opacity] group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-white data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        "group-data-[variant=file-labels]/tabs-list:box-content group-data-[variant=file-labels]/tabs-list:h-auto group-data-[variant=file-labels]/tabs-list:rounded-none group-data-[variant=file-labels]/tabs-list:rounded-t-md group-data-[variant=file-labels]/tabs-list:border-transparent group-data-[variant=file-labels]/tabs-list:px-3 group-data-[variant=file-labels]/tabs-list:py-1.5 group-data-[variant=file-labels]/tabs-list:transition-none group-data-[variant=file-labels]/tabs-list:after:hidden group-data-[variant=file-labels]/tabs-list:hover:bg-muted/50",
        "group-data-[variant=file-labels]/tabs-list:data-[state=active]:z-10 group-data-[variant=file-labels]/tabs-list:data-[state=active]:border-border group-data-[variant=file-labels]/tabs-list:data-[state=active]:border-b-white group-data-[variant=file-labels]/tabs-list:data-[state=active]:bg-white group-data-[variant=file-labels]/tabs-list:data-[state=active]:shadow-none dark:group-data-[variant=file-labels]/tabs-list:data-[state=active]:border-b-card dark:group-data-[variant=file-labels]/tabs-list:data-[state=active]:bg-card",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

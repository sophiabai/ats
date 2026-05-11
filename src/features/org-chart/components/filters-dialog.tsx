import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Search, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  ALL_COUNTRY_GROUPS,
  ALL_DEPARTMENT_GROUPS,
  ALL_EMPLOYMENT_STATUSES,
  ALL_EMPLOYMENT_TYPES,
  ALL_JOB_FAMILIES,
  ALL_LEGAL_ENTITIES,
  ALL_LEVELS,
  ALL_TEAMS,
  DEPARTMENT_COLORS,
  employees,
} from "@/features/org-chart/data"
import {
  categoriesForView,
  countActiveFilters,
  EMPTY_FILTERS,
  EMPTY_VALUE,
  type CompensationFilter,
  type DateFilter,
  type DateOperator,
  type FilterCategoryId,
  type OrgChartFilters,
  type QuickDateKind,
} from "@/features/org-chart/filter-state"
import type { OrgChartView } from "@/features/org-chart/types"

interface FiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  view: OrgChartView
  value: OrgChartFilters
  onChange: (filters: OrgChartFilters) => void
}

export function FiltersDialog({
  open,
  onOpenChange,
  view,
  value,
  onChange,
}: FiltersDialogProps) {
  const categories = categoriesForView(view)
  const [activeId, setActiveId] = useState<FilterCategoryId>(
    categories[0]?.id ?? "department"
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[1024px] gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close">
              <X className="size-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="grid h-[560px] grid-cols-[224px_1fr_300px]">
          <LeftRail
            view={view}
            activeId={activeId}
            onSelect={setActiveId}
          />
          <div className="border-x px-5 py-5">
            <CategoryPanel
              activeId={activeId}
              filters={value}
              onChange={onChange}
            />
          </div>
          <RightRail filters={value} onChange={onChange} />
        </div>

        <div className="flex items-center justify-end border-t px-6 py-3">
          <DialogClose asChild>
            <Button variant="default" size="default">
              Done
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────
// Left rail – category navigation
// ─────────────────────────────────────────────────────────

interface LeftRailProps {
  view: OrgChartView
  activeId: FilterCategoryId
  onSelect: (id: FilterCategoryId) => void
}

function LeftRail({ view, activeId, onSelect }: LeftRailProps) {
  const categories = categoriesForView(view)
  return (
    <div className="overflow-y-auto px-2 py-4">
      <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Employee filters
        <br />
        (data as of today)
      </div>
      <div className="flex flex-col">
        {categories.map((c) => {
          const active = c.id === activeId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Right rail – selected filters summary
// ─────────────────────────────────────────────────────────

interface RightRailProps {
  filters: OrgChartFilters
  onChange: (next: OrgChartFilters) => void
}

function RightRail({ filters, onChange }: RightRailProps) {
  const sections: Array<{
    label: string
    chips: Array<{ id: string; label: string; onRemove: () => void }>
  }> = []

  function listSection<K extends keyof OrgChartFilters>(
    label: string,
    key: K,
    formatter?: (v: string) => string
  ) {
    const list = filters[key] as unknown as string[]
    if (!Array.isArray(list) || list.length === 0) return
    sections.push({
      label,
      chips: list.map((v) => ({
        id: v,
        label: formatter ? formatter(v) : v === EMPTY_VALUE ? "Empty values" : v,
        onRemove: () =>
          onChange({
            ...filters,
            [key]: list.filter((x) => x !== v),
          } as OrgChartFilters),
      })),
    })
  }

  listSection("Department", "departments")
  listSection("Job family", "jobFamilies")
  listSection("Team", "teams")
  listSection("Level", "levels")
  listSection("Location", "locations")
  listSection("Employment status", "employmentStatuses")
  listSection("Employment type", "employmentTypes")
  listSection("Legal entity", "legalEntities")
  listSection("Manager", "managers", (id) => {
    const e = employees.find((x) => x.id === id)
    return e ? e.name : id
  })

  if (filters.startDate) {
    sections.push({
      label: "Start date",
      chips: [
        {
          id: "start",
          label: dateFilterLabel(filters.startDate),
          onRemove: () => onChange({ ...filters, startDate: null }),
        },
      ],
    })
  }
  if (filters.endDate) {
    sections.push({
      label: "End date",
      chips: [
        {
          id: "end",
          label: dateFilterLabel(filters.endDate),
          onRemove: () => onChange({ ...filters, endDate: null }),
        },
      ],
    })
  }
  if (filters.compensation) {
    const c = filters.compensation
    const parts: string[] = [c.period, c.currency]
    if (c.greaterThan != null) parts.push(`> ${formatNumber(c.greaterThan)}`)
    if (c.lessThan != null) parts.push(`< ${formatNumber(c.lessThan)}`)
    if (c.includeBonus) parts.push("incl. bonus")
    if (c.includeCommission) parts.push("incl. commission")
    sections.push({
      label: "Compensation",
      chips: [
        {
          id: "comp",
          label: parts.join(" · "),
          onRemove: () => onChange({ ...filters, compensation: null }),
        },
      ],
    })
  }

  return (
    <div className="overflow-y-auto px-5 py-5">
      <div className="text-sm font-semibold">Selected filters</div>
      <div className="mt-4 space-y-5">
        {sections.length === 0 ? (
          <p className="text-xs text-muted-foreground">No filters applied.</p>
        ) : (
          sections.map((s) => (
            <div key={s.label}>
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.chips.map((chip) => (
                  <span
                    key={chip.id}
                    className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${chip.label}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const QUICK_LABELS: Record<QuickDateKind, string> = {
  today: "Today",
  yesterday: "Yesterday",
  tomorrow: "Tomorrow",
  current_week: "Current calendar week",
  current_month: "Current calendar month",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function dateFilterLabel(filter: DateFilter): string {
  switch (filter.kind) {
    case "before":
      return `Before ${formatDate(filter.date)}`
    case "after":
      return `After ${formatDate(filter.date)}`
    case "between":
      return `${formatDate(filter.from)} – ${formatDate(filter.to)}`
    default:
      return QUICK_LABELS[filter.kind]
  }
}

function toIso(date: Date): string {
  // Local-time ISO date (yyyy-mm-dd) so picking "Apr 15" stores Apr 15 in the
  // user's locale, not whatever UTC midnight maps to.
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

// ─────────────────────────────────────────────────────────
// Middle column – router
// ─────────────────────────────────────────────────────────

interface CategoryPanelProps {
  activeId: FilterCategoryId
  filters: OrgChartFilters
  onChange: (filters: OrgChartFilters) => void
}

function CategoryPanel({ activeId, filters, onChange }: CategoryPanelProps) {
  switch (activeId) {
    case "compensation":
      return (
        <CompensationPanel
          value={filters.compensation}
          onChange={(c) => onChange({ ...filters, compensation: c })}
        />
      )
    case "department":
      return (
        <HierarchicalPanel
          groups={ALL_DEPARTMENT_GROUPS.map((g) => ({
            name: g.name,
            children: g.subDepartments.filter((s) => s !== g.name),
            icon: (
              <span
                className="size-1.5 rounded-full"
                style={{
                  backgroundColor:
                    DEPARTMENT_COLORS[g.name] ?? "#94a3b8",
                }}
              />
            ),
          }))}
          value={filters.departments}
          onChange={(v) => onChange({ ...filters, departments: v })}
        />
      )
    case "jobFamily":
      return (
        <FlatListPanel
          options={ALL_JOB_FAMILIES.map((j) => ({ id: j, label: j }))}
          value={filters.jobFamilies}
          onChange={(v) => onChange({ ...filters, jobFamilies: v })}
        />
      )
    case "team":
      return (
        <FlatListPanel
          options={ALL_TEAMS.map((t) => ({ id: t, label: t }))}
          value={filters.teams}
          onChange={(v) => onChange({ ...filters, teams: v })}
        />
      )
    case "level":
      return (
        <FlatListPanel
          options={ALL_LEVELS.map((l) => ({ id: l, label: l }))}
          value={filters.levels}
          onChange={(v) => onChange({ ...filters, levels: v })}
        />
      )
    case "location":
      return (
        <HierarchicalPanel
          groups={ALL_COUNTRY_GROUPS.map((g) => ({
            name: g.name,
            children: g.regions,
          }))}
          value={filters.locations}
          onChange={(v) => onChange({ ...filters, locations: v })}
        />
      )
    case "employmentStatus":
      return (
        <FlatListPanel
          options={ALL_EMPLOYMENT_STATUSES.map((s) => ({ id: s, label: s }))}
          value={filters.employmentStatuses}
          onChange={(v) => onChange({ ...filters, employmentStatuses: v })}
        />
      )
    case "employmentType":
      return (
        <FlatListPanel
          options={ALL_EMPLOYMENT_TYPES.map((t) => ({ id: t, label: t }))}
          value={filters.employmentTypes}
          onChange={(v) => onChange({ ...filters, employmentTypes: v })}
        />
      )
    case "legalEntity":
      return (
        <FlatListPanel
          options={ALL_LEGAL_ENTITIES.map((l) => ({ id: l, label: l }))}
          value={filters.legalEntities}
          onChange={(v) => onChange({ ...filters, legalEntities: v })}
        />
      )
    case "startDate":
      return (
        <DatePanel
          label="Date filter"
          value={filters.startDate}
          onChange={(v) => onChange({ ...filters, startDate: v })}
        />
      )
    case "endDate":
      return (
        <DatePanel
          label="Date filter"
          value={filters.endDate}
          onChange={(v) => onChange({ ...filters, endDate: v })}
        />
      )
    case "manager":
      return (
        <ManagerPanel
          value={filters.managers}
          onChange={(v) => onChange({ ...filters, managers: v })}
        />
      )
  }
}

// ─────────────────────────────────────────────────────────
// Reusable: flat list with search + Select all
// ─────────────────────────────────────────────────────────

interface ListOption {
  id: string
  label: string
  icon?: React.ReactNode
  expandable?: boolean
}

interface FlatListPanelProps {
  options: ListOption[]
  value: string[]
  onChange: (next: string[]) => void
  /** When true, prepends the standard "Empty values" row. */
  showEmptyRow?: boolean
}

function FlatListPanel({
  options,
  value,
  onChange,
  showEmptyRow = true,
}: FlatListPanelProps) {
  const [query, setQuery] = useState("")
  const trimmed = query.trim().toLowerCase()
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(trimmed)
  )
  const allOptionIds = options.map((o) => o.id)
  const allSelected =
    allOptionIds.length > 0 && allOptionIds.every((id) => value.includes(id))

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id))
    else onChange([...value, id])
  }

  function selectAll(next: boolean) {
    if (next) onChange([...new Set([...value, ...allOptionIds])])
    else onChange(value.filter((v) => !allOptionIds.includes(v)))
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <SearchBox value={query} onChange={setQuery} />
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border">
        <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
          <span className="font-medium">{value.length} selected</span>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="font-medium">Select all</span>
            <Checkbox
              checked={allSelected}
              onCheckedChange={(c) => selectAll(Boolean(c))}
            />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {showEmptyRow && (
            <CheckboxRow
              label="Empty values"
              checked={value.includes(EMPTY_VALUE)}
              onChange={() => toggle(EMPTY_VALUE)}
            />
          )}
          {filtered.map((o) => (
            <CheckboxRow
              key={o.id}
              label={o.label}
              icon={o.icon}
              expandable={o.expandable}
              checked={value.includes(o.id)}
              onChange={() => toggle(o.id)}
            />
          ))}
          {filtered.length === 0 && trimmed && (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              No matches.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface CheckboxRowProps {
  label: string
  checked: boolean
  onChange: () => void
  icon?: React.ReactNode
  expandable?: boolean
  expanded?: boolean
  onToggleExpand?: () => void
  indented?: boolean
}

function CheckboxRow({
  label,
  checked,
  onChange,
  icon,
  expandable,
  expanded,
  onToggleExpand,
  indented,
}: CheckboxRowProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50",
        indented && "pl-9"
      )}
    >
      {expandable ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleExpand?.()
          }}
          className="flex size-4 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>
      ) : (
        <span className="size-4" aria-hidden />
      )}
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        onClick={(e) => e.stopPropagation()}
      />
      {icon && <span className="ml-1 inline-flex">{icon}</span>}
      <span className="truncate">{label}</span>
    </label>
  )
}

// ─────────────────────────────────────────────────────────
// Location – grouped country / region with expandables
// ─────────────────────────────────────────────────────────

interface HierarchicalGroup {
  name: string
  children: string[]
  /** Optional rendered icon for the parent row (e.g. dept color dot). */
  icon?: React.ReactNode
}

interface HierarchicalPanelProps {
  groups: HierarchicalGroup[]
  value: string[]
  onChange: (next: string[]) => void
}

function HierarchicalPanel({
  groups: allGroups,
  value,
  onChange,
}: HierarchicalPanelProps) {
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const trimmed = query.trim().toLowerCase()

  const filteredGroups = useMemo(() => {
    if (!trimmed) return allGroups
    return allGroups
      .map((g) => ({
        ...g,
        children: g.children.filter((c) =>
          c.toLowerCase().includes(trimmed)
        ),
      }))
      .filter(
        (g) =>
          g.name.toLowerCase().includes(trimmed) || g.children.length > 0
      )
  }, [allGroups, trimmed])

  const allTokens = allGroups.flatMap((g) =>
    g.children.length === 0
      ? [g.name]
      : [g.name, ...g.children.map((c) => `${g.name} > ${c}`)]
  )
  const allSelected =
    allTokens.length > 0 && allTokens.every((t) => value.includes(t))

  function toggle(token: string) {
    if (value.includes(token)) onChange(value.filter((v) => v !== token))
    else onChange([...value, token])
  }

  function toggleExpand(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function selectAll(next: boolean) {
    if (next) onChange([...new Set([...value, ...allTokens])])
    else onChange(value.filter((v) => !allTokens.includes(v)))
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <SearchBox value={query} onChange={setQuery} />
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border">
        <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
          <span className="font-medium">{value.length} selected</span>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="font-medium">Select all</span>
            <Checkbox
              checked={allSelected}
              onCheckedChange={(c) => selectAll(Boolean(c))}
            />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <CheckboxRow
            label="Empty values"
            checked={value.includes(EMPTY_VALUE)}
            onChange={() => toggle(EMPTY_VALUE)}
          />
          {filteredGroups.map((g) => {
            const isOpen = expanded.has(g.name) || trimmed.length > 0
            const hasChildren = g.children.length > 0
            return (
              <div key={g.name}>
                <CheckboxRow
                  label={g.name}
                  icon={g.icon}
                  checked={value.includes(g.name)}
                  onChange={() => toggle(g.name)}
                  expandable={hasChildren}
                  expanded={isOpen}
                  onToggleExpand={() => toggleExpand(g.name)}
                />
                {isOpen &&
                  g.children.map((c) => {
                    const token = `${g.name} > ${c}`
                    return (
                      <CheckboxRow
                        key={token}
                        label={c}
                        checked={value.includes(token)}
                        onChange={() => toggle(token)}
                        indented
                      />
                    )
                  })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Compensation
// ─────────────────────────────────────────────────────────

const CURRENCIES = ["USD", "CAD", "GBP", "INR"]

interface CompensationPanelProps {
  value: CompensationFilter | null
  onChange: (next: CompensationFilter | null) => void
}

function CompensationPanel({ value, onChange }: CompensationPanelProps) {
  const filter: CompensationFilter = value ?? {
    period: "per year",
    currency: "USD",
    greaterThan: null,
    lessThan: null,
    includeBonus: false,
    includeCommission: false,
    emptyValues: false,
    notEmpty: false,
  }

  function update(patch: Partial<CompensationFilter>) {
    onChange({ ...filter, ...patch })
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2">
      <Field label="Period">
        <Select
          value={filter.period}
          onValueChange={(v) =>
            update({ period: v as CompensationFilter["period"] })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="per hour">per hour</SelectItem>
            <SelectItem value="per year">per year</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Currency type">
        <Select
          value={filter.currency}
          onValueChange={(v) => update({ currency: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                $ {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Greater than">
        <Input
          type="number"
          placeholder="$ 000,000"
          value={filter.greaterThan ?? ""}
          onChange={(e) =>
            update({
              greaterThan: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </Field>

      <Field label="Less than">
        <Input
          type="number"
          placeholder="$ 000,000"
          value={filter.lessThan ?? ""}
          onChange={(e) =>
            update({
              lessThan: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </Field>

      <div className="space-y-2 pt-1">
        <CheckboxOption
          label="Include annual target bonus"
          checked={filter.includeBonus}
          onChange={(v) => update({ includeBonus: v })}
        />
        <CheckboxOption
          label="Include annual target commission"
          checked={filter.includeCommission}
          onChange={(v) => update({ includeCommission: v })}
        />
        <CheckboxOption
          label="Empty values"
          checked={filter.emptyValues}
          onChange={(v) => update({ emptyValues: v })}
        />
        <CheckboxOption
          label="Not an empty value"
          checked={filter.notEmpty}
          onChange={(v) => update({ notEmpty: v })}
        />
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      {children}
    </div>
  )
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Checkbox
        checked={checked}
        onCheckedChange={(c) => onChange(Boolean(c))}
      />
      {label}
    </label>
  )
}

// ─────────────────────────────────────────────────────────
// Date filter (Start/End date)
// ─────────────────────────────────────────────────────────

const QUICK_OPTIONS: Array<{ kind: QuickDateKind; label: string }> = [
  { kind: "today", label: "Today" },
  { kind: "yesterday", label: "Yesterday" },
  { kind: "tomorrow", label: "Tomorrow" },
  { kind: "current_week", label: "Current calendar week" },
  { kind: "current_month", label: "Current calendar month" },
]

const OPERATOR_OPTIONS: Array<{ kind: DateOperator; label: string }> = [
  { kind: "between", label: "Between" },
  { kind: "before", label: "Before" },
  { kind: "after", label: "After" },
]

interface DatePanelProps {
  label: string
  value: DateFilter | null
  onChange: (next: DateFilter | null) => void
}

function DatePanel({ label, value, onChange }: DatePanelProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const trimmed = query.trim().toLowerCase()
  const filtered = QUICK_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(trimmed)
  )

  const isQuick =
    value != null &&
    (QUICK_OPTIONS as Array<{ kind: string }>).some(
      (o) => o.kind === value.kind
    )
  const activeOperator: DateOperator | null =
    value && !isQuick ? (value.kind as DateOperator) : null

  function selectOperator(op: DateOperator) {
    if (activeOperator === op) {
      onChange(null)
      return
    }
    const today = toIso(new Date())
    if (op === "between") {
      onChange({ kind: "between", from: today, to: today })
    } else {
      onChange({ kind: op, date: today })
    }
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto pr-2">
      <div className="space-y-2">
        <div className="text-sm font-semibold">{label}</div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-colors",
                "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              )}
            >
              <span className={cn(!isQuick && "text-muted-foreground")}>
                {isQuick && value ? dateFilterLabel(value) : "Search"}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
          >
            <div className="border-b p-2">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-8"
              />
            </div>
            <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Quick picker
            </div>
            <div className="pb-2">
              {filtered.map((o) => (
                <button
                  key={o.kind}
                  type="button"
                  onClick={() => {
                    onChange({ kind: o.kind })
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-muted",
                    isQuick &&
                      value?.kind === o.kind &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Operator</div>
        <div className="flex flex-col">
          {OPERATOR_OPTIONS.map((o) => (
            <button
              key={o.kind}
              type="button"
              onClick={() => selectOperator(o.kind)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-left text-sm transition-colors",
                activeOperator === o.kind
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        {activeOperator === "between" && value?.kind === "between" && (
          <div className="rounded-md border p-2">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={{
                from: isoToDate(value.from),
                to: isoToDate(value.to),
              }}
              onSelect={(range) => {
                if (!range?.from) return
                onChange({
                  kind: "between",
                  from: toIso(range.from),
                  to: toIso(range.to ?? range.from),
                })
              }}
              className="mx-auto"
            />
          </div>
        )}
        {activeOperator === "before" && value?.kind === "before" && (
          <div className="rounded-md border p-2">
            <Calendar
              mode="single"
              selected={isoToDate(value.date)}
              onSelect={(d) => {
                if (!d) return
                onChange({ kind: "before", date: toIso(d) })
              }}
              className="mx-auto"
            />
          </div>
        )}
        {activeOperator === "after" && value?.kind === "after" && (
          <div className="rounded-md border p-2">
            <Calendar
              mode="single"
              selected={isoToDate(value.date)}
              onSelect={(d) => {
                if (!d) return
                onChange({ kind: "after", date: toIso(d) })
              }}
              className="mx-auto"
            />
          </div>
        )}
      </div>

      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          className="h-7 self-start text-xs"
        >
          Clear
        </Button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Manager – searchable employee list
// ─────────────────────────────────────────────────────────

interface ManagerPanelProps {
  value: string[]
  onChange: (next: string[]) => void
}

function ManagerPanel({ value, onChange }: ManagerPanelProps) {
  const [query, setQuery] = useState("")
  const trimmed = query.trim().toLowerCase()

  // Only employees who actually manage someone are valid managers.
  const managerIds = useMemo(() => {
    const ids = new Set<string>()
    for (const e of employees) {
      if (e.parentId) ids.add(e.parentId)
    }
    return [...ids]
  }, [])
  const managers = useMemo(
    () =>
      managerIds
        .map((id) => employees.find((e) => e.id === id)!)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [managerIds]
  )

  const filtered = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(trimmed) ||
      m.title.toLowerCase().includes(trimmed)
  )

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id))
    else onChange([...value, id])
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <SearchBox value={query} onChange={setQuery} />
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border">
        <div className="flex items-center justify-between border-b px-3 py-2 text-xs font-medium">
          <span>{value.length} selected</span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.map((m) => (
            <label
              key={m.id}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50"
            >
              <Checkbox
                checked={value.includes(m.id)}
                onCheckedChange={() => toggle(m.id)}
              />
              <Avatar className="size-6">
                <AvatarImage src={m.imageUrl} alt={m.name} />
                <AvatarFallback className="text-[10px]">
                  {m.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate">
                {m.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {m.title}
                </span>
              </span>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              No managers found.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Shared search box
// ─────────────────────────────────────────────────────────

interface SearchBoxProps {
  value: string
  onChange: (next: string) => void
}

function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search"
        className="h-9 pl-8"
      />
    </div>
  )
}

// Re-export so callers can grab everything from this file.
export { countActiveFilters, EMPTY_FILTERS }

import { useEffect, useMemo, useState } from "react"
import { ListFilter, Search, X } from "lucide-react"

import { HeaderActions } from "@/components/header-actions-portal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrgChartViewer } from "@/features/org-chart/components/org-chart-viewer"
import { FiltersDialog } from "@/features/org-chart/components/filters-dialog"
import { employees } from "@/features/org-chart/data"
import {
  countActiveFilters,
  EMPTY_FILTERS,
  matchesFilters,
  type OrgChartFilters,
} from "@/features/org-chart/filter-state"
import type { Employee, OrgChartView } from "@/features/org-chart/types"
import { useOrgChartDetailStore } from "@/stores/org-chart-detail-store"

function getAncestorIds(empId: string, byId: Map<string, Employee>): Set<string> {
  const ids = new Set<string>()
  let current = byId.get(empId)
  while (current && current.parentId) {
    ids.add(current.parentId)
    current = byId.get(current.parentId)
  }
  return ids
}

export function Component() {
  const [view, setView] = useState<OrgChartView>("hr")
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<OrgChartFilters>(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const openEmployee = useOrgChartDetailStore((s) => s.open)
  const closeEmployee = useOrgChartDetailStore((s) => s.close)

  useEffect(() => closeEmployee, [closeEmployee])

  // Reset filters when switching views — Employee view exposes a smaller subset
  // so leftover HR filters would be confusing if invisible.
  function handleViewChange(next: OrgChartView) {
    setView(next)
    setFilters(EMPTY_FILTERS)
  }

  const trimmed = query.trim().toLowerCase()
  const hasQuery = trimmed.length > 0
  const activeFilterCount = countActiveFilters(filters)
  const isFiltered = hasQuery || activeFilterCount > 0

  const filtered = useMemo(() => {
    if (!isFiltered) return employees

    const byId = new Map(employees.map((e) => [e.id, e]))
    const matchIds = new Set<string>()

    for (const e of employees) {
      const matchesQuery =
        !hasQuery ||
        e.name.toLowerCase().includes(trimmed) ||
        e.title.toLowerCase().includes(trimmed)
      if (matchesQuery && matchesFilters(e, filters)) matchIds.add(e.id)
    }

    const includeIds = new Set(matchIds)
    for (const id of matchIds) {
      for (const ancestor of getAncestorIds(id, byId)) {
        includeIds.add(ancestor)
      }
    }

    return employees.filter((e) => includeIds.has(e.id))
  }, [filters, hasQuery, isFiltered, trimmed])

  const viewerKey = `${view}|${trimmed}|${activeFilterCount}|${JSON.stringify(filters)}`

  return (
    <div className="-mx-17 -mt-6 flex h-full flex-col">
      <HeaderActions>
        <Select
          value={view}
          onValueChange={(v) => handleViewChange(v as OrgChartView)}
        >
          <SelectTrigger size="sm" className="h-8 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hr">HR view</SelectItem>
            <SelectItem value="employee">Employee view</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or title"
            className="h-8 pr-8 pl-8 text-sm"
          />
          {hasQuery && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-1 -translate-y-1/2"
              title="Clear search"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setFiltersOpen(true)}
        >
          <ListFilter className="size-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium leading-none text-accent-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </HeaderActions>

      <FiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        view={view}
        value={filters}
        onChange={setFilters}
      />

      <div className="min-h-0 flex-1">
        {filtered.length > 0 ? (
          <OrgChartViewer
            key={viewerKey}
            data={filtered}
            expandLevel={isFiltered ? 10 : 1}
            onNodeClick={(emp: Employee) => openEmployee(emp.id)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No employees match your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

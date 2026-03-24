import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Building2,
  MapPin,
  Search,
  Briefcase,
} from "lucide-react";
import logoUrl from "@/assets/Logo.svg";
import { useJobPosts } from "@/features/job-board/api/use-job-posts";
import type { Requisition } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

function parseLocations(location: string | null): string[] {
  if (!location) return [];
  return location
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}

function getDescriptionPreview(description: string | null): string | null {
  if (!description) return null;
  const match = description.match(/## About the role\n([\s\S]*?)(?=\n## |$)/);
  if (match) return match[1].trim().split("\n")[0];
  const firstLine = description.replace(/^## .+\n/, "").trim().split("\n")[0];
  return firstLine || null;
}

function JobBoardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Requisition }) {
  const locations = parseLocations(job.location);
  const preview = getDescriptionPreview(job.description);

  return (
    <Link to={`/careers/${job.id}`} className="block">
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="truncate text-base font-semibold">{job.title}</h3>
              {preview && (
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                  {preview}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {job.department && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 shrink-0" />
                  {job.department}
                </span>
              )}
              {locations.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="flex flex-wrap gap-1">
                    {locations.map((loc) => (
                      <Badge key={loc} variant="secondary" className="text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-3.5 shrink-0" />
                {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary">
              {job.headcount} opening{job.headcount !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const ALL_VALUE = "__all__";

export function Component() {
  const { data, isLoading, error } = useJobPosts();

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(ALL_VALUE);
  const [locationFilter, setLocationFilter] = useState(ALL_VALUE);

  const departments = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.map((j) => j.department).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [data]);

  const locations = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.flatMap((j) => parseLocations(j.location)));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((job) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesDept = job.department?.toLowerCase().includes(q);
        const matchesDesc = job.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDept && !matchesDesc) return false;
      }
      if (departmentFilter !== ALL_VALUE && job.department !== departmentFilter) {
        return false;
      }
      if (locationFilter !== ALL_VALUE) {
        const locs = parseLocations(job.location);
        if (!locs.includes(locationFilter)) return false;
      }
      return true;
    });
  }, [data, search, departmentFilter, locationFilter]);

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <img src={logoUrl} alt="Acme" className="size-8" />
          <span className="text-lg font-semibold">Acme careers</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {isLoading ? (
          <JobBoardSkeleton />
        ) : error ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-destructive">
              Failed to load job posts: {error.message}
            </p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
            <Briefcase className="size-12" />
            <h2 className="text-xl font-semibold text-foreground">
              No open positions
            </h2>
            <p>Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Open positions
              </h1>
              <p className="text-sm text-muted-foreground">
                {filtered.length} open position
                {filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search positions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={locationFilter}
                onValueChange={setLocationFilter}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No positions match your filters.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

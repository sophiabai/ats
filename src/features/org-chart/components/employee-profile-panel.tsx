import { ChevronsRight, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEPARTMENT_COLORS, employees } from "@/features/org-chart/data";
import { getEmployeeProfile } from "@/features/org-chart/profile";
import { useOrgChartDetailStore } from "@/stores/org-chart-detail-store";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();
}

export function EmployeeProfilePanel() {
  const employeeId = useOrgChartDetailStore((s) => s.employeeId);
  const close = useOrgChartDetailStore((s) => s.close);
  const open = useOrgChartDetailStore((s) => s.open);

  const employee = employeeId
    ? employees.find((e) => e.id === employeeId) ?? null
    : null;

  if (!employee) return null;

  const profile = getEmployeeProfile(employee);
  const deptColor = DEPARTMENT_COLORS[employee.department] ?? "#64748b";

  return (
    <aside className="flex h-full w-[420px] shrink-0 flex-col border-l bg-background">
      <div className="flex items-center justify-end gap-1 px-5 pt-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={close}
          aria-label="Close profile"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Avatar className="size-12">
              <AvatarImage src={employee.imageUrl} alt={employee.name} />
              <AvatarFallback>{initials(employee.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-semibold tracking-tight">
                  {employee.name}
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                >
                  <span
                    className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  Active
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {employee.title}
              </p>
              <div
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  color: deptColor,
                  backgroundColor: `${deptColor}14`,
                  border: `1px solid ${deptColor}30`,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: deptColor }}
                  aria-hidden
                />
                {employee.department}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              window.open(`mailto:${profile.workEmail}`, "_blank", "noopener")
            }
          >
            <Mail className="size-3.5" />
            Email {employee.name.split(" ")[0]}
          </Button>

          <section>
            <h3 className="mb-3 text-sm font-semibold">Role information</h3>
            <dl className="divide-y divide-border/60 text-sm">
              <Field label="Title" value={employee.title} />
              <Field label="Department">
                <div>
                  {employee.department === employee.subDepartment
                    ? employee.department
                    : `${employee.department} › ${employee.subDepartment}`}
                </div>
                {profile.departmentPath.length > 1 && (
                  <div className="text-xs text-muted-foreground">
                    {profile.departmentPath.join(" › ")}
                  </div>
                )}
              </Field>
              <Field label="Manager">
                {profile.manager ? (
                  <button
                    type="button"
                    onClick={() => open(profile.manager!.id)}
                    className="text-left text-foreground underline-offset-2 hover:underline"
                  >
                    {profile.manager.name}
                  </button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Field>
              <Field label="Work location">
                <div>{profile.office.name}</div>
                <div className="text-xs text-muted-foreground">
                  {profile.office.address}
                </div>
              </Field>
              <Field label="Work email">
                <a
                  href={`mailto:${profile.workEmail}`}
                  className="break-all text-foreground hover:underline"
                >
                  {profile.workEmail}
                </a>
              </Field>
              <Field label="Phone number" value={profile.phone} />
              <Field label="Start date" value={profile.startDateLabel} />
              <Field label="Employment type" value={profile.employmentType} />
              <Field label="Employment status">
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  {profile.employmentStatus}
                </Badge>
              </Field>
              <Field label="GitHub username">
                <span className="font-mono text-xs">
                  {profile.githubUsername}
                </span>
              </Field>
            </dl>
          </section>
        </div>
      </div>
    </aside>
  );
}

interface FieldProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
}

function Field({ label, value, children }: FieldProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm">{children ?? value}</dd>
    </div>
  );
}

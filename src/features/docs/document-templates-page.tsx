import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import { BASE_DOC_TEMPLATES } from "@/features/docs/document-templates-data"

export function Component() {
  return (
    <div className="min-h-svh bg-white p-6">
      <Toaster position="bottom-center" />
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/docs">Back to send packet</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Document templates
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reusable definitions used when assembling packets. Templates with
            variables are filled per send on the packet screen.
          </p>
        </div>
        <ul className="space-y-4">
          {BASE_DOC_TEMPLATES.map((t) => (
            <li key={t.id} className="rounded-lg border bg-card p-4 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium">{t.name}</p>
                {t.variables.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {t.variables.map((v) => (
                      <Badge key={v.key} variant="secondary" className="font-normal">
                        {v.label}
                        <span className="ml-1 text-muted-foreground">
                          ({v.kind})
                        </span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No variables</span>
                )}
              </div>
              <Separator className="my-3" />
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {t.bodyTemplate.replace(/\{\{(\w+)\}\}/g, "[$1]")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

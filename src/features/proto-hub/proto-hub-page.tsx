import { ExternalLink } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const protos = [
  {
    title: "ATS main proto",
    description: "The full applicant tracking system prototype",
    href: "/",
  },
  {
    title: "Candidate provides availability",
    description: "Candidate-facing scheduling flow",
    href: "/candidate-availability",
  },
]

export function Component() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Proto hub</h1>
          <p className="text-sm text-muted-foreground">
            Select a prototype to open
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {protos.map((proto) => (
            <a
              key={proto.href}
              href={proto.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="transition-colors group-hover:border-primary/40 group-hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {proto.title}
                    <ExternalLink className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </CardTitle>
                  <CardDescription>{proto.description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

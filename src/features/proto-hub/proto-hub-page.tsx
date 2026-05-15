import { ExternalLink } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Proto = {
  title: string
  description: string
  href: string
}

type Section = {
  title: string
  protos: Proto[]
}

const sections: Section[] = [
  {
    title: "Prototypes",
    protos: [
      {
        title: "ATS main proto",
        description: "The full applicant tracking system prototype",
        href: "/",
      },
    ],
  },
  {
    title: "Scheduling",
    protos: [
      {
        title: "1. RA",
        description: "Candidate detail scheduling view",
        href: "/candidates/c0000000-0000-0000-0000-000000000001",
      },
      {
        title: "2. Candidate provides availability",
        description: "Candidate-facing scheduling flow",
        href: "/candidate-email/next-steps-with-acme-ai",
      },
      {
        title: "3. Candidate self-scheduling",
        description: "Candidate-facing self-scheduling flow",
        href: "/candidate-email/schedule-interview-acme-ai",
      },
    ],
  },
  {
    title: "Others",
    protos: [
      {
        title: "Docs",
        description: "Send and configure document packets",
        href: "/docs",
      },
      {
        title: "Email composer",
        description: "Gmail-style compose window with recruiting templates",
        href: "/proto-hub/email-composer",
      },
    ],
  },
]

export function Component() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Proto hub</h1>
          <p className="text-sm text-muted-foreground">
            Select a prototype to open
          </p>
        </div>
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {section.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.protos.map((proto) => (
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
          </section>
        ))}
      </div>
    </div>
  )
}

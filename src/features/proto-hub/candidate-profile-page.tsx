import { MapPin, Mail, Phone, Briefcase, Building2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const candidate = {
  firstName: "Emily",
  lastName: "Zhang",
  email: "emily.zhang@email.com",
  phone: "415-555-0101",
  location: "San Francisco",
  headline: "Full-stack engineer with 6 years of experience",
  yearsExperience: 6,
  currentCompany: "Stripe",
  currentTitle: "Senior Software Engineer",
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  tags: ["referral", "senior"],
}

export function Component() {
  const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {candidate.firstName} {candidate.lastName}
            </CardTitle>
            <CardDescription>{candidate.headline}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="size-4" />
              <span>{candidate.currentTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="size-4" />
              <span>{candidate.currentCompany}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" />
              <span>{candidate.phone}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

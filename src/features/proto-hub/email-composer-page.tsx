import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { GmailStyleEmailComposer } from "@/features/candidates/components/gmail-style-email-composer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"

const SIGNATURE = `--\nSophia Bai\nProduct designer | Acme ATS`

type EmailTemplate = {
  id: string
  name: string
  subject: string
  body: string
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    subject: "",
    body: "",
  },
  {
    id: "interview",
    name: "Interview invite",
    subject: "Interview next week — {{role}}",
    body: `Hi {{first_name}},

Thanks for your interest in the {{role}} role. We would like to schedule a 45-minute video interview.

Please reply with a few times that work for you next week.

Best,`,
  },
  {
    id: "follow-up",
    name: "Application follow-up",
    subject: "Update on your application",
    body: `Hi {{first_name}},

Thank you for taking the time to apply. We are still reviewing applications and will share an update by {{date}}.

Regards,`,
  },
  {
    id: "offer-intro",
    name: "Offer — next steps",
    subject: "Offer and next steps",
    body: `Hi {{first_name}},

We are excited to move forward. Attached is a summary of the offer and benefits. Please let us know if you have any questions.

Congratulations,`,
  },
]

function templateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id)
}

function composeBodyFromTemplate(t: EmailTemplate): string {
  if (t.id === "blank") return SIGNATURE
  if (!t.body.trim()) return SIGNATURE
  return `${t.body.trim()}\n\n${SIGNATURE}`
}

export function Component() {
  const navigate = useNavigate()
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState(() => SIGNATURE)
  const [templateId, setTemplateId] = useState<string>("blank")

  function applyTemplate(id: string) {
    setTemplateId(id)
    const t = templateById(id)
    if (!t) return
    setSubject(t.subject)
    setBody(composeBodyFromTemplate(t))
  }

  const templateRow: ReactNode = (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor="email-template" className="sr-only">
        Template
      </Label>
      <span className="text-xs text-muted-foreground">Template</span>
      <Select value={templateId} onValueChange={applyTemplate}>
        <SelectTrigger
          id="email-template"
          size="sm"
          className="h-8 w-[min(100%,220px)] border-dashed bg-background text-left text-xs sm:w-64"
        >
          <SelectValue placeholder="Choose template" />
        </SelectTrigger>
        <SelectContent>
          {EMAIL_TEMPLATES.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="relative min-h-svh overflow-hidden bg-white">
      <Toaster position="bottom-center" />

      <div className="relative flex min-h-svh flex-col items-center justify-center p-4 sm:p-8">
        <div className="mb-4 flex w-full max-w-3xl items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/proto-hub">Back to proto hub</Link>
          </Button>
          <p className="text-xs text-muted-foreground">Prototype — not sent</p>
        </div>

        <GmailStyleEmailComposer
          className="w-full max-w-3xl shadow-xl"
          title="New message"
          showWindowControls
          onClose={() => navigate("/proto-hub")}
          headerAccessory={templateRow}
          toValue={to}
          onToChange={setTo}
          showSubject
          subject={subject}
          onSubjectChange={setSubject}
          onSend={() =>
            toast.success("Send is a demo — message not delivered")
          }
          onDiscard={() => {
            setTo("")
            setSubject("")
            setBody(SIGNATURE)
            setTemplateId("blank")
            toast.message("Draft discarded")
          }}
        >
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder=" "
            className="min-h-[min(50vh,420px)] w-full resize-none rounded-none border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:ring-0"
          />
        </GmailStyleEmailComposer>
      </div>
    </div>
  )
}

import { useState, useMemo } from "react"

// ---------------------------------------------------------------------------
// Fully self-contained fake Gmail UI → candidate availability flow.
// No imports from the rest of the codebase — only React + Tailwind.
// ---------------------------------------------------------------------------

const CANDIDATE = "Andy"

type Email = {
  id: string
  slug?: string
  from: string
  senderEmail: string
  senderInitial: string
  senderColor: string
  subject: string
  preview: string
  time: string
  unread: boolean
  starred: boolean
  availabilityUrl: string | null
}

const emails: Email[] = [
  {
    id: "scheduling-acme-inc",
    slug: "interview-invitation-acme-inc",
    from: "ACME Inc. Recruiting",
    senderEmail: "recruiting@acme.com",
    senderInitial: "A",
    senderColor: "#1a73e8",
    subject: "Interview invitation — Senior Software Engineer, Infra",
    preview: `Hi ${CANDIDATE}, we'd love to schedule your next round of interviews. Please share your availability…`,
    time: "10:32 AM",
    unread: true,
    starred: true,
    availabilityUrl: "/candidate-availability-acme-inc",
  },
  {
    id: "scheduling-acme-ai",
    slug: "next-steps-with-acme-ai",
    from: "Anne Montgomery",
    senderEmail: "anne@acme.ai",
    senderInitial: "A",
    senderColor: "#7c3aed",
    subject: "Next steps with ACME AI",
    preview: `Hi ${CANDIDATE}, We're excited to move forward with your candidacy for the Senior Software Engineering role at ACME AI!…`,
    time: "9:04 AM",
    unread: true,
    starred: false,
    availabilityUrl: "/candidate-availability-acme-ai",
  },
  {
    id: "welcome",
    from: "Google Community",
    senderEmail: "no-reply@google.com",
    senderInitial: "G",
    senderColor: "#ea4335",
    subject: "Welcome to your new Google Account",
    preview: "Get the most out of your Google Account. We'll help you set things up.",
    time: "Yesterday",
    unread: false,
    starred: false,
    availabilityUrl: null,
  },
  {
    id: "security",
    from: "Google",
    senderEmail: "no-reply@accounts.google.com",
    senderInitial: "G",
    senderColor: "#ea4335",
    subject: "Security alert for your linked account",
    preview: "We noticed a new sign-in to your Google Account on a Mac device.",
    time: "Yesterday",
    unread: false,
    starred: false,
    availabilityUrl: null,
  },
  {
    id: "promo",
    from: "LinkedIn",
    senderEmail: "messages-noreply@linkedin.com",
    senderInitial: "in",
    senderColor: "#0a66c2",
    subject: "5 jobs you might be interested in",
    preview: "Based on your profile: Senior Engineer at Stripe, Staff Engineer at Vercel…",
    time: "Apr 21",
    unread: false,
    starred: false,
    availabilityUrl: null,
  },
  {
    id: "newsletter",
    from: "TechCrunch",
    senderEmail: "newsletter@techcrunch.com",
    senderInitial: "T",
    senderColor: "#0a9e01",
    subject: "Daily digest — top stories",
    preview: "OpenAI announces new model, Apple reveals WWDC lineup, and more…",
    time: "Apr 21",
    unread: false,
    starred: false,
    availabilityUrl: null,
  },
]

const sidebarLabels = [
  { icon: InboxIcon, label: "Inbox", count: 2, active: true },
  { icon: StarIcon, label: "Starred", count: 0, active: false },
  { icon: ClockIcon, label: "Snoozed", count: 0, active: false },
  { icon: SendIcon, label: "Sent", count: 0, active: false },
  { icon: FileIcon, label: "Drafts", count: 0, active: false },
]

export function Component() {
  const slugFromUrl = useMemo(() => {
    const parts = window.location.pathname.split("/")
    return parts.length > 2 ? parts.slice(2).join("/") : null
  }, [])

  const [openEmail, setOpenEmail] = useState<string | null>(
    slugFromUrl ? (emails.find((e) => e.slug === slugFromUrl)?.id ?? null) : null
  )

  const activeEmail = emails.find((e) => e.id === openEmail)

  return (
    <div className="flex h-svh flex-col bg-[#f6f8fc] text-sm" style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif" }}>
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-4 px-4">
        <button className="rounded-full p-2 hover:bg-gray-100">
          <MenuIcon />
        </button>
        <span className="mr-8 text-[22px] font-normal text-gray-600">Gmail</span>
        <div className="ml-[80px] mx-4 flex h-12 max-w-2xl flex-1 items-center rounded-full bg-[#eaf1fb] px-4 text-gray-600">
          <SearchIcon />
          <span className="ml-3 text-base text-gray-500">Search mail</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full p-2 hover:bg-gray-100"><HelpIcon /></button>
          <button className="rounded-full p-2 hover:bg-gray-100"><SettingsIcon /></button>
          <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#6d4aaa] text-sm font-medium text-white">
            {CANDIDATE[0]}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-0.5 overflow-y-auto px-4 pt-3 lg:flex">
          <button className="mb-4 flex h-14 w-fit items-center gap-3 rounded-2xl bg-[#c2e7ff] px-6 font-medium text-gray-800 shadow-sm hover:shadow">
            <ComposeIcon />
            Compose
          </button>
          {sidebarLabels.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-4 rounded-full px-4 py-1.5 text-left text-[13px] font-medium ${
                item.active
                  ? "bg-[#d3e3fd] text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon active={item.active} />
              <span className="flex-1">{item.label}</span>
              {item.count > 0 && <span className="text-xs font-bold">{item.count}</span>}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto rounded-tl-2xl bg-white">
          {openEmail && activeEmail ? (
            <EmailDetail
              email={activeEmail}
              onBack={() => {
                setOpenEmail(null)
                window.history.pushState(null, "", "/candidate-email")
              }}
            />
          ) : (
            <InboxList
              emails={emails}
              onOpen={(id) => {
                const email = emails.find((e) => e.id === id)
                setOpenEmail(id)
                if (email?.slug) {
                  window.history.pushState(null, "", `/candidate-email/${email.slug}`)
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inbox list view
// ---------------------------------------------------------------------------
function InboxList({ emails, onOpen }: { emails: Email[]; onOpen: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2">
        <button className="rounded p-1.5 hover:bg-gray-100"><CheckboxIcon /></button>
        <button className="rounded p-1.5 hover:bg-gray-100"><RefreshIcon /></button>
        <button className="rounded p-1.5 hover:bg-gray-100"><MoreVertIcon /></button>
      </div>
      <div className="divide-y divide-gray-100">
        {emails.map((email) => (
          <button
            key={email.id}
            onClick={() => onOpen(email.id)}
            className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3)] ${
              email.unread ? "bg-white font-semibold" : "bg-transparent"
            }`}
          >
            <span className="shrink-0"><CheckboxIcon /></span>
            <span className="shrink-0">
              {email.starred ? <StarFilledIcon /> : <StarOutlineIcon />}
            </span>
            <span className="w-44 shrink-0 truncate text-[13px] text-gray-900">{email.from}</span>
            <span className="flex-1 truncate text-[13px]">
              <span className="text-gray-900">{email.subject}</span>
              <span className="font-normal text-gray-500"> — {email.preview}</span>
            </span>
            <span className="shrink-0 text-xs text-gray-500">{email.time}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Email detail view (the scheduling invitation email)
// ---------------------------------------------------------------------------
function EmailDetail({
  email,
  onBack,
}: {
  email: Email
  onBack: () => void
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={onBack} className="rounded-full p-2 hover:bg-gray-100">
          <BackArrowIcon />
        </button>
        <span className="text-xs text-gray-500">Back to inbox</span>
      </div>

      <h1 className="mb-4 text-xl font-normal text-gray-900">{email.subject}</h1>

      <div className="mb-6 flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: email.senderColor }}
        >
          {email.senderInitial}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-gray-900">{email.from}</span>
            <span className="text-xs text-gray-500">&lt;{email.senderEmail}&gt;</span>
          </div>
          <div className="text-xs text-gray-500">to me</div>
        </div>
        <span className="text-xs text-gray-500">{email.time}</span>
      </div>

      {email.id === "scheduling-acme-inc" ? (
        <div className="space-y-4 text-sm leading-relaxed text-gray-800">
          <p>Hi {CANDIDATE},</p>
          <p>
            Thank you for your interest in the <strong>Senior Software Engineer, Infra</strong> position at{" "}
            <strong>ACME Inc.</strong> We'd love to move forward with the next round of interviews.
          </p>
          <p>
            The interview loop is <strong>3 hours 30 minutes</strong> and includes the following sessions:
          </p>
          <ul className="ml-6 list-disc space-y-1 text-gray-700">
            <li>System Design (60 min) — Leslie Alexander & Javier Ramirez</li>
            <li>Algorithms and Data Structures (45 min) — Wade Warren</li>
            <li>Break (15 min)</li>
            <li>Culture Fit (30 min) — Leslie Alexander</li>
            <li>Hiring Manager Close-up (30 min) — Floyd Miles</li>
          </ul>
          <p>
            Please click the button below to share your availability for the upcoming week. The scheduling
            tool will let you select time blocks that work for you.
          </p>
          <div className="pt-2">
            <a
              href={email.availabilityUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a73e8] px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1557b0]"
            >
              <CalendarIcon />
              Share my availability
            </a>
          </div>
          <p className="pt-2 text-gray-500">
            If you have any questions, don't hesitate to reply to this email.
          </p>
          <p>
            Best,
            <br />
            The ACME Inc. Recruiting Team
          </p>
        </div>
      ) : email.id === "scheduling-acme-ai" ? (
        <div className="space-y-4 text-sm leading-relaxed text-gray-800">
          <p>Hi {CANDIDATE}</p>
          <p>
            We're excited to move forward with your candidacy for the <strong>Senior Software Engineering</strong> role
            at <strong>ACME AI</strong>! Please use the link below to share your availability for an interview.
          </p>
          <p>Looking forward to speaking with you!</p>
          <p>
            <a
              href={email.availabilityUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a73e8] hover:underline"
            >
              Enter your availability here &gt;&gt;
            </a>
          </p>
          <p>
            Best,
            <br />
            Anne
          </p>
        </div>
      ) : (
        <div className="text-sm text-gray-700">
          <p>{email.preview}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline SVG icons — no external dependencies
// ---------------------------------------------------------------------------

function MenuIcon() {
  return <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
}

function SearchIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
}

function HelpIcon() {
  return <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="17" r=".5" /></svg>
}

function SettingsIcon() {
  return <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
}

function ComposeIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>
}

function InboxIcon({ active }: { active?: boolean }) {
  return <svg className={`h-5 w-5 ${active ? "text-gray-900" : "text-gray-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 12h6l2 3h4l2-3h6" /></svg>
}

function StarIcon({ active }: { active?: boolean }) {
  return <svg className={`h-5 w-5 ${active ? "text-gray-900" : "text-gray-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}

function ClockIcon({ active }: { active?: boolean }) {
  return <svg className={`h-5 w-5 ${active ? "text-gray-900" : "text-gray-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function SendIcon({ active }: { active?: boolean }) {
  return <svg className={`h-5 w-5 ${active ? "text-gray-900" : "text-gray-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m22 2-7 20-4-9-9-4z" /><path d="m22 2-11 11" /></svg>
}

function FileIcon({ active }: { active?: boolean }) {
  return <svg className={`h-5 w-5 ${active ? "text-gray-900" : "text-gray-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
}

function CheckboxIcon() {
  return <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
}

function RefreshIcon() {
  return <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
}

function MoreVertIcon() {
  return <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
}

function StarFilledIcon() {
  return <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}

function StarOutlineIcon() {
  return <svg className="h-5 w-5 text-gray-300 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}

function BackArrowIcon() {
  return <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
}

function CalendarIcon() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
}

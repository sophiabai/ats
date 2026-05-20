import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import {
  Briefcase,
  Check,
  ChevronDown,
  CircleAlert,
  Copy,
  ExternalLink,
  Globe,
  Linkedin,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Sparkles,
  TriangleAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JobPostStatus = "published" | "offline"

type JobPost = {
  id: string
  title: string
  locations: string[]
  boards: string[]
  boardUrls: string[]
  status: JobPostStatus
  applications: number
  department: string
  employmentType: string
  companyDescription: string
  roleDescription: string
  payRange: string
  eeoc: boolean
  publicUrl: string
  organicBundleEnabled: boolean
}

type SponsoredStatus =
  | "Published"
  | "Delivery in process"
  | "Action required"
  | "Updates in process"
  | "Removal in process"
  | "Expired"

type SponsoredPost = {
  id: string
  jobBoard: string
  jobBoardUrl: string
  jobPostTitle: string
  location: string
  status: SponsoredStatus
  cost: string
  endDate: string
  applications: number
}

type CompanyBoard = {
  id: string
  name: string
  type: "external" | "internal"
  implementation: "rippling-hosted" | "custom-api"
  status: "active" | "offline"
  url: string
}

type LinkedInOrg = {
  id: string
  orgName: string
  companyId: string
  status: "connected" | "pending" | "disconnected"
  autoPublish: boolean
  assignedBoards: string[]
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const COMPANY_BOARDS: CompanyBoard[] = [
  {
    id: "board-ext-1",
    name: "Acme careers",
    type: "external",
    implementation: "rippling-hosted",
    status: "active",
    url: "https://careers.acme.co",
  },
  {
    id: "board-int-1",
    name: "Internal job board",
    type: "internal",
    implementation: "rippling-hosted",
    status: "active",
    url: "https://internal.acme.co/jobs",
  },
]

const INITIAL_POSTS: JobPost[] = [
  {
    id: "jp-1",
    title: "Senior software engineer",
    locations: ["San Francisco, CA", "Remote — US"],
    boards: ["Acme careers", "Internal job board"],
    boardUrls: ["https://careers.acme.co/swe", "https://internal.acme.co/jobs/swe"],
    status: "published",
    applications: 47,
    department: "Engineering",
    employmentType: "Full-time",
    companyDescription: "Acme builds developer tools used by thousands of companies worldwide.",
    roleDescription: "Design and implement distributed systems for our core platform. You will work across the stack with a small team shipping weekly.",
    payRange: "$180,000 – $240,000 USD / year (San Francisco, CA)",
    eeoc: true,
    publicUrl: "https://careers.acme.co/swe",
    organicBundleEnabled: true,
  },
  {
    id: "jp-2",
    title: "Product designer",
    locations: ["New York, NY"],
    boards: ["Acme careers"],
    boardUrls: ["https://careers.acme.co/pd"],
    status: "published",
    applications: 23,
    department: "Design",
    employmentType: "Full-time",
    companyDescription: "Acme builds developer tools used by thousands of companies worldwide.",
    roleDescription: "Own end-to-end design for our recruiting product, from research to shipping pixels.",
    payRange: "$150,000 – $195,000 USD / year (New York, NY)",
    eeoc: true,
    publicUrl: "https://careers.acme.co/pd",
    organicBundleEnabled: true,
  },
  {
    id: "jp-3",
    title: "Data analyst intern",
    locations: ["Austin, TX"],
    boards: [],
    boardUrls: [],
    status: "offline",
    applications: 0,
    department: "Data",
    employmentType: "Internship",
    companyDescription: "Acme builds developer tools used by thousands of companies worldwide.",
    roleDescription: "Support the data team with dashboards, metric definitions, and ad-hoc analyses.",
    payRange: "$35 / hour (Austin, TX)",
    eeoc: false,
    publicUrl: "",
    organicBundleEnabled: false,
  },
]

const INITIAL_SPONSORED: SponsoredPost[] = [
  {
    id: "sp-1",
    jobBoard: "LinkedIn Promoted",
    jobBoardUrl: "https://linkedin.com/jobs/view/123",
    jobPostTitle: "Senior software engineer",
    location: "San Francisco, CA",
    status: "Published",
    cost: "$499",
    endDate: "Jun 15, 2026",
    applications: 12,
  },
  {
    id: "sp-2",
    jobBoard: "Indeed",
    jobBoardUrl: "https://indeed.com/jobs/view/456",
    jobPostTitle: "Senior software engineer",
    location: "Remote — US",
    status: "Delivery in process",
    cost: "$299",
    endDate: "Jun 10, 2026",
    applications: 0,
  },
  {
    id: "sp-3",
    jobBoard: "ZipRecruiter",
    jobBoardUrl: "https://ziprecruiter.com/jobs/789",
    jobPostTitle: "Product designer",
    location: "New York, NY",
    status: "Action required",
    cost: "$199",
    endDate: "May 30, 2026",
    applications: 5,
  },
  {
    id: "sp-4",
    jobBoard: "Monster",
    jobBoardUrl: "",
    jobPostTitle: "Product designer",
    location: "New York, NY",
    status: "Expired",
    cost: "$149",
    endDate: "May 1, 2026",
    applications: 8,
  },
]

const ORGANIC_SITES = [
  "LinkedIn",
  "ZipRecruiter",
  "Monster",
  "talent.com",
  "MyJobHelper",
  "Adzuna",
  "Jora",
  "Jooble",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sponsoredStatusVariant(s: SponsoredStatus) {
  switch (s) {
    case "Published":
      return "default" as const
    case "Delivery in process":
    case "Updates in process":
    case "Removal in process":
      return "secondary" as const
    case "Action required":
      return "destructive" as const
    case "Expired":
      return "outline" as const
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Component() {
  const [posts, setPosts] = useState<JobPost[]>(INITIAL_POSTS)
  const [sponsored, setSponsored] = useState<SponsoredPost[]>(INITIAL_SPONSORED)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [previewPost, setPreviewPost] = useState<JobPost | null>(null)
  const [promotePost, setPromotePost] = useState<JobPost | null>(null)
  const [linkedInSettingsOpen, setLinkedInSettingsOpen] = useState(false)
  const [publishGateDialog, setPublishGateDialog] = useState<{
    postId: string
    gate: "draft" | "unassigned" | "confidential"
  } | null>(null)

  // Create form
  const [newTitle, setNewTitle] = useState("")
  const [newLocations, setNewLocations] = useState("")
  const [newBoardIds, setNewBoardIds] = useState<string[]>([])

  // LinkedIn orgs
  const [linkedInOrgs, setLinkedInOrgs] = useState<LinkedInOrg[]>([
    {
      id: "li-1",
      orgName: "Acme Inc.",
      companyId: "12345678",
      status: "connected",
      autoPublish: true,
      assignedBoards: ["board-ext-1"],
    },
  ])
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [connectStep, setConnectStep] = useState<1 | 2>(1)
  const [connectOrgId, setConnectOrgId] = useState("")
  const [connectOrgName, setConnectOrgName] = useState("")
  const [connectBoard, setConnectBoard] = useState("")

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function togglePostStatus(id: string) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p

        if (p.status === "published") {
          const hasSponsoredPosts = sponsored.some(
            (sp) => sp.jobPostTitle === p.title && sp.status !== "Expired",
          )
          if (hasSponsoredPosts) {
            toast.warning(
              "Unpublishing will close all associated sponsored posts. You will not be able to restart them.",
            )
          }
          return { ...p, status: "offline", boards: [], boardUrls: [], organicBundleEnabled: false }
        }

        const gate = Math.random()
        if (gate < 0.15) {
          setPublishGateDialog({ postId: id, gate: "draft" })
          return p
        }
        if (gate < 0.25) {
          setPublishGateDialog({ postId: id, gate: "unassigned" })
          return p
        }

        const board = COMPANY_BOARDS.find((b) => b.status === "active" && b.type === "external")
        return {
          ...p,
          status: "published",
          boards: board ? [board.name] : [],
          boardUrls: board ? [board.url] : [],
        }
      }),
    )
  }

  function toggleOrganicBundle(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, organicBundleEnabled: !p.organicBundleEnabled } : p,
      ),
    )
    toast.success("Organic distribution updated")
  }

  function handleCreatePost() {
    if (!newTitle.trim()) {
      toast.error("Enter a job post title.")
      return
    }
    const locations = newLocations
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean)

    const boards = newBoardIds.map(
      (bid) => COMPANY_BOARDS.find((b) => b.id === bid)!,
    )

    const duplicate = posts.find(
      (p) =>
        p.title.toLowerCase() === newTitle.trim().toLowerCase() &&
        JSON.stringify(p.locations.sort()) === JSON.stringify(locations.sort()),
    )

    if (duplicate) {
      toast.error("A job post with the same title and locations already exists on this requisition.")
      return
    }

    const post: JobPost = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      locations,
      boards: boards.map((b) => b.name),
      boardUrls: boards.map((b) => b.url),
      status: boards.length > 0 ? "published" : "offline",
      applications: 0,
      department: "",
      employmentType: "Full-time",
      companyDescription: "",
      roleDescription: "",
      payRange: "",
      eeoc: false,
      publicUrl: "",
      organicBundleEnabled: false,
    }

    setPosts((prev) => [...prev, post])
    setCreateOpen(false)
    setNewTitle("")
    setNewLocations("")
    setNewBoardIds([])
    toast.success("Job post created")
  }

  function removePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    toast.success("Job post removed")
  }

  function duplicatePost(id: string) {
    const source = posts.find((p) => p.id === id)
    if (!source) return
    const clone: JobPost = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} (copy)`,
      status: "offline",
      boards: [],
      boardUrls: [],
      applications: 0,
      organicBundleEnabled: false,
    }
    setPosts((prev) => [...prev, clone])
    toast.success("Job post duplicated")
  }

  function removeSponsoredPost(id: string) {
    setSponsored((prev) => prev.filter((sp) => sp.id !== id))
    toast.success("Sponsored listing removed")
  }

  function handleConnectLinkedIn() {
    if (!connectOrgId.trim() || !connectOrgName.trim()) {
      toast.error("Fill in all fields.")
      return
    }
    if (connectStep === 1) {
      setConnectStep(2)
      return
    }
    const org: LinkedInOrg = {
      id: crypto.randomUUID(),
      orgName: connectOrgName.trim(),
      companyId: connectOrgId.trim(),
      status: "pending",
      autoPublish: false,
      assignedBoards: connectBoard ? [connectBoard] : [],
    }
    setLinkedInOrgs((prev) => [...prev, org])
    setConnectModalOpen(false)
    setConnectStep(1)
    setConnectOrgId("")
    setConnectOrgName("")
    setConnectBoard("")
    toast.success("LinkedIn organization submitted — pending approval")
  }

  function approveLinkedInOrg(id: string) {
    setLinkedInOrgs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "connected" } : o)),
    )
    toast.success("LinkedIn organization connected")
  }

  function disconnectLinkedInOrg(id: string) {
    setLinkedInOrgs((prev) => prev.filter((o) => o.id !== id))
    toast.success("LinkedIn organization disconnected")
  }

  function toggleLinkedInAutoPublish(id: string) {
    setLinkedInOrgs((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, autoPublish: !o.autoPublish } : o,
      ),
    )
  }

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredPosts = posts.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.locations.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredSponsored = sponsored.filter(
    (sp) =>
      !searchQuery ||
      sp.jobBoard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.jobPostTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-svh bg-white">
      <Toaster position="bottom-center" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/proto-hub">Back to proto hub</Link>
          </Button>
          <p className="text-xs text-muted-foreground">Prototype — demo data only</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Senior software engineer · REQ-2026-042
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Job posts & promotion
          </h1>
        </div>

        {/* Search + create */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, boards, or locations…"
              className="pl-9"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            New job post
          </Button>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="job-posts">
          <TabsList variant="line">
            <TabsTrigger value="job-posts">
              Job posts
              <Badge variant="secondary" className="ml-1.5 tabular-nums">
                {posts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sponsored">
              Sponsored posts
              <Badge variant="secondary" className="ml-1.5 tabular-nums">
                {sponsored.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn integration</TabsTrigger>
          </TabsList>

          {/* ---- Job Posts Grid ---- */}
          <TabsContent value="job-posts" className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Job post</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Job board</TableHead>
                    <TableHead>Organic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Applications</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No job posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <button
                            type="button"
                            className="text-left hover:underline"
                            onClick={() => setPreviewPost(post)}
                          >
                            {post.title}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {post.locations.length > 0 ? (
                              post.locations.map((loc) => (
                                <Badge key={loc} variant="outline" className="font-normal">
                                  {loc}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.boards.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {post.boards.map((b, i) => (
                                <a
                                  key={b}
                                  href={post.boardUrls[i]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  {b}
                                  <ExternalLink className="size-3" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not published
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {post.status === "published" ? (
                            <Switch
                              size="sm"
                              checked={post.organicBundleEnabled}
                              onCheckedChange={() => toggleOrganicBundle(post.id)}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              size="sm"
                              checked={post.status === "published"}
                              onCheckedChange={() => togglePostStatus(post.id)}
                            />
                            <span className="text-sm capitalize">
                              {post.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {post.applications}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setPreviewPost(post)}>
                                Preview
                              </DropdownMenuItem>
                              {post.status === "published" && post.publicUrl && (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    window.open(post.publicUrl, "_blank")
                                  }
                                >
                                  View live
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onSelect={() => toast.info("Edit flow is not part of this prototype")}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => duplicatePost(post.id)}>
                                Duplicate
                              </DropdownMenuItem>
                              {post.status === "published" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => setPromotePost(post)}>
                                    <Sparkles className="mr-2 size-4" />
                                    Promote
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      void navigator.clipboard.writeText(
                                        `https://careers.acme.co/apply/${post.id}?src=tracking`,
                                      )
                                      toast.success("Source tracking link copied")
                                    }}
                                  >
                                    Create source tracking link
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => removePost(post.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Organic sites info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="size-4 text-muted-foreground" />
                  Free organic distribution (JobTarget)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Published job posts with organic distribution enabled are automatically sent to
                  free aggregator sites. Posting to third-party sites is not guaranteed.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ORGANIC_SITES.map((site) => (
                    <Badge key={site} variant="secondary">
                      {site}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Sponsored Posts Grid ---- */}
          <TabsContent value="sponsored" className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job board</TableHead>
                    <TableHead>Job post</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Applications</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSponsored.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No sponsored posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSponsored.map((sp) => (
                      <TableRow key={sp.id}>
                        <TableCell>
                          {sp.jobBoardUrl ? (
                            <a
                              href={sp.jobBoardUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                              {sp.jobBoard}
                              <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            <span className="font-medium">{sp.jobBoard}</span>
                          )}
                        </TableCell>
                        <TableCell>{sp.jobPostTitle}</TableCell>
                        <TableCell>{sp.location}</TableCell>
                        <TableCell>
                          <Badge variant={sponsoredStatusVariant(sp.status)}>
                            {sp.status === "Action required" && (
                              <CircleAlert className="mr-1 size-3" />
                            )}
                            {sp.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-medium tabular-nums">{sp.cost}</span>
                            <p className="text-xs text-muted-foreground">
                              Ends {sp.endDate}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {sp.applications}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() =>
                                  toast.info("JobTarget marketplace would open here")
                                }
                              >
                                Buy again
                              </DropdownMenuItem>
                              {sp.status === "Action required" && (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    toast.info("JobTarget marketplace would open to resolve this issue")
                                  }
                                >
                                  View more
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => removeSponsoredPost(sp.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Promotion cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="size-4 text-amber-500" />
                    JobTarget marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Browse 25,000+ paid boards including LinkedIn Promoted, Indeed, and ZipRecruiter.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("JobTarget marketplace drawer would open here")}
                  >
                    Open marketplace
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="size-4 text-blue-600" />
                    Indeed promotion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Promote directly on Indeed for greater visibility to job seekers.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("Indeed promotion flow would open here")}
                  >
                    Promote on Indeed
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Share2 className="size-4 text-violet-500" />
                    Share on social
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Copy a shareable link and post it to any social platform.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText("https://careers.acme.co/swe")
                      toast.success("Link copied to clipboard")
                    }}
                  >
                    <Copy className="mr-1.5 size-3.5" />
                    Copy link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ---- LinkedIn Integration ---- */}
          <TabsContent value="linkedin" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#0A66C2]/10">
                      <Linkedin className="size-5 text-[#0A66C2]" />
                    </div>
                    <div>
                      <CardTitle className="text-base">LinkedIn ATS integration</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Connect LinkedIn organizations to auto-publish job posts
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setLinkedInSettingsOpen(true)}
                  >
                    Manage settings
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkedInOrgs.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-10">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <Linkedin className="size-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="font-medium">No LinkedIn organizations connected</p>
                      <p className="text-sm text-muted-foreground">
                        Connect your company's LinkedIn page to sync job posts automatically.
                      </p>
                    </div>
                    <Button onClick={() => setConnectModalOpen(true)}>
                      Connect to LinkedIn
                    </Button>
                  </div>
                ) : (
                  <>
                    {linkedInOrgs.map((org) => (
                      <div key={org.id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{org.orgName}</p>
                              <Badge
                                variant={
                                  org.status === "connected"
                                    ? "default"
                                    : org.status === "pending"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={cn(
                                  org.status === "connected" && "bg-emerald-600",
                                )}
                              >
                                {org.status === "connected" && (
                                  <Check className="mr-0.5 size-3" />
                                )}
                                {org.status === "pending"
                                  ? "Pending LinkedIn approval"
                                  : org.status === "connected"
                                    ? "Connected"
                                    : "Disconnected"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Company ID: {org.companyId}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {org.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveLinkedInOrg(org.id)}
                              >
                                Reconnect
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground"
                              onClick={() => disconnectLinkedInOrg(org.id)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>

                        {org.status === "connected" && (
                          <div className="mt-4 space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Auto-publish</p>
                                <p className="text-sm text-muted-foreground">
                                  Automatically push new job posts to LinkedIn
                                </p>
                              </div>
                              <Switch
                                checked={org.autoPublish}
                                onCheckedChange={() => toggleLinkedInAutoPublish(org.id)}
                              />
                            </div>
                            <div>
                              <p className="mb-1.5 text-sm font-medium">Assigned job boards</p>
                              <div className="flex flex-wrap gap-2">
                                {COMPANY_BOARDS.filter((b) => b.status === "active").map((board) => {
                                  const isAssigned = org.assignedBoards.includes(board.id)
                                  return (
                                    <label
                                      key={board.id}
                                      className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                                    >
                                      <Checkbox
                                        checked={isAssigned}
                                        onCheckedChange={(checked) => {
                                          setLinkedInOrgs((prev) =>
                                            prev.map((o) =>
                                              o.id === org.id
                                                ? {
                                                    ...o,
                                                    assignedBoards: checked
                                                      ? [...o.assignedBoards, board.id]
                                                      : o.assignedBoards.filter(
                                                          (b) => b !== board.id,
                                                        ),
                                                  }
                                                : o,
                                            ),
                                          )
                                        }}
                                      />
                                      {board.name}
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setConnectModalOpen(true)}
                    >
                      <Plus className="mr-1.5 size-4" />
                      Connect to another LinkedIn organization
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      By using this integration you agree to LinkedIn's Terms of Service for ATS
                      integrations.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ================================================================= */}
      {/* Dialogs / Sheets                                                   */}
      {/* ================================================================= */}

      {/* Create Job Post Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Create job post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="jp-title">Title</Label>
              <Input
                id="jp-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Senior software engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jp-locations">Locations</Label>
              <Input
                id="jp-locations"
                value={newLocations}
                onChange={(e) => setNewLocations(e.target.value)}
                placeholder="San Francisco, CA; Remote — US"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Include city, state, and country for sponsored promotions.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Target boards</Label>
              <div className="space-y-2">
                {COMPANY_BOARDS.filter((b) => b.status === "active").map((board) => (
                  <label
                    key={board.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={newBoardIds.includes(board.id)}
                      onCheckedChange={(checked) =>
                        setNewBoardIds((prev) =>
                          checked
                            ? [...prev, board.id]
                            : prev.filter((id) => id !== board.id),
                        )
                      }
                    />
                    {board.name}
                    <Badge variant="outline" className="ml-auto font-normal capitalize">
                      {board.type}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost}>
              {newBoardIds.length > 0 ? "Create & publish" : "Create as draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Sheet */}
      <Sheet open={!!previewPost} onOpenChange={(o) => !o && setPreviewPost(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{previewPost?.title}</SheetTitle>
            <SheetDescription>Job post details</SheetDescription>
          </SheetHeader>
          {previewPost && (
            <div className="space-y-5 px-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{previewPost.department || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Employment type</p>
                  <p className="text-sm">{previewPost.employmentType}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <Badge
                    variant={previewPost.status === "published" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {previewPost.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Applications</p>
                  <p className="text-sm tabular-nums">{previewPost.applications}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Locations</p>
                <div className="flex flex-wrap gap-1.5">
                  {previewPost.locations.length > 0
                    ? previewPost.locations.map((loc) => (
                        <Badge key={loc} variant="outline">
                          {loc}
                        </Badge>
                      ))
                    : "—"}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Pay range</p>
                <p className="text-sm">{previewPost.payRange || "Not specified"}</p>
              </div>

              <Separator />

              {previewPost.companyDescription && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Company description
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {previewPost.companyDescription}
                  </p>
                </div>
              )}

              {previewPost.roleDescription && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Role description
                  </p>
                  <p className="text-sm">{previewPost.roleDescription}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">EEOC questionnaire</p>
                  <p className="text-sm">{previewPost.eeoc ? "Enabled" : "Disabled"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Organic bundle</p>
                  <p className="text-sm">
                    {previewPost.organicBundleEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              {previewPost.publicUrl && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Public URL</p>
                  <a
                    href={previewPost.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {previewPost.publicUrl}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}

              <div className="flex gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewPost(null)}
                >
                  Close
                </Button>
                {previewPost.status === "published" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setPreviewPost(null)
                      setPromotePost(previewPost)
                    }}
                  >
                    <Sparkles className="mr-1.5 size-4" />
                    Promote
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Promote Dialog */}
      <Dialog open={!!promotePost} onOpenChange={(o) => !o && setPromotePost(null)}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Promote job post</DialogTitle>
          </DialogHeader>
          {promotePost && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="font-medium">{promotePost.title}</p>
                <p className="text-sm text-muted-foreground">
                  {promotePost.locations.join(", ")}
                </p>
              </div>

              {promotePost.locations.some(
                (l) => l.toLowerCase().includes("remote") && !l.includes(","),
              ) && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Remote locations need city and state for sponsored listings. Add missing
                    details before promoting.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Select location to promote</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotePost.locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Enable easy apply</p>
                  <p className="text-xs text-muted-foreground">
                    Reduce friction on supported boards
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromotePost(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPromotePost(null)
                toast.info("JobTarget marketplace drawer would open here")
              }}
            >
              Open JobTarget marketplace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publishing Gate Dialog */}
      <Dialog
        open={!!publishGateDialog}
        onOpenChange={(o) => !o && setPublishGateDialog(null)}
      >
        <DialogContent showCloseButton className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-amber-500" />
              {publishGateDialog?.gate === "draft"
                ? "Requisition is in draft"
                : publishGateDialog?.gate === "unassigned"
                  ? "Missing assignment"
                  : "Heads up"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {publishGateDialog?.gate === "draft"
              ? "This job requisition is still in draft. Open the requisition before publishing."
              : publishGateDialog?.gate === "unassigned"
                ? "A hiring manager or recruiter must be assigned before publishing."
                : "Please review before continuing."}
          </p>
          <DialogFooter>
            <Button onClick={() => setPublishGateDialog(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LinkedIn Settings Sheet */}
      <Sheet open={linkedInSettingsOpen} onOpenChange={setLinkedInSettingsOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>LinkedIn integration settings</SheetTitle>
            <SheetDescription>
              Manage connected LinkedIn organizations and auto-publish preferences
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {linkedInOrgs.map((org) => (
              <div key={org.id} className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{org.orgName}</p>
                  <Badge
                    variant={org.status === "connected" ? "default" : "secondary"}
                    className={cn(org.status === "connected" && "bg-emerald-600")}
                  >
                    {org.status === "connected" ? "Connected" : "Pending"}
                  </Badge>
                </div>
                {org.status === "connected" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Company ID</Label>
                      <Input
                        value={org.companyId}
                        onChange={(e) =>
                          setLinkedInOrgs((prev) =>
                            prev.map((o) =>
                              o.id === org.id
                                ? { ...o, companyId: e.target.value }
                                : o,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto-publish</Label>
                      <Switch
                        size="sm"
                        checked={org.autoPublish}
                        onCheckedChange={() => toggleLinkedInAutoPublish(org.id)}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLinkedInSettingsOpen(false)
                setConnectModalOpen(true)
              }}
            >
              <Plus className="mr-1.5 size-3.5" />
              Add organization
            </Button>

            <div className="border-t pt-4">
              <Button
                onClick={() => {
                  setLinkedInSettingsOpen(false)
                  toast.success("Settings saved")
                }}
                className="w-full"
              >
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* LinkedIn Connect Modal */}
      <Dialog
        open={connectModalOpen}
        onOpenChange={(o) => {
          if (!o) {
            setConnectModalOpen(false)
            setConnectStep(1)
          }
        }}
      >
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connectStep === 1
                ? "Connect LinkedIn organization"
                : "Authorize with LinkedIn"}
            </DialogTitle>
          </DialogHeader>

          {connectStep === 1 ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="li-org-id">Organization ID</Label>
                <Input
                  id="li-org-id"
                  value={connectOrgId}
                  onChange={(e) => setConnectOrgId(e.target.value)}
                  placeholder="e.g. 12345678"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="li-org-name">Organization name</Label>
                <Input
                  id="li-org-name"
                  value={connectOrgName}
                  onChange={(e) => setConnectOrgName(e.target.value)}
                  placeholder="e.g. Acme Inc."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="li-board">Job board</Label>
                <Select value={connectBoard} onValueChange={setConnectBoard}>
                  <SelectTrigger id="li-board">
                    <SelectValue placeholder="Select a board" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_BOARDS.filter((b) => b.status === "active").map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#0A66C2]/10">
                  <Linkedin className="size-6 text-[#0A66C2]" />
                </div>
                <p className="text-sm text-muted-foreground">
                  LinkedIn ATS integration widget would load here
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete OAuth authorization to connect
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {connectStep === 2 && (
              <Button variant="outline" onClick={() => setConnectStep(1)}>
                Back
              </Button>
            )}
            <Button onClick={handleConnectLinkedIn}>
              {connectStep === 1 ? (
                <>
                  Continue
                  <ChevronDown className="ml-1 size-4 -rotate-90" />
                </>
              ) : (
                "Complete connection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

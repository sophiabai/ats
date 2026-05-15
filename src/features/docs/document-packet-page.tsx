import { useId, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import { format, isValid, parse } from "date-fns"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FilePenLine,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import {
  BASE_DOC_TEMPLATES,
  escapeHtml,
  missingVariableKeys,
  renderDocumentBodyHtml,
  templateById,
  type DocTemplate,
  type DocVariable,
} from "@/features/docs/document-templates-data"

const NEW_PACKET = "__new__"

const EXPIRATION_OPTIONS = [
  "7 days after sent",
  "14 days after sent",
  "30 days after sent",
] as const

type PacketDocItem = {
  instanceId: string
  templateId: string
  variableValues: Record<string, string>
}

type Packet = {
  id: string
  name: string
  items: PacketDocItem[]
  expiration: (typeof EXPIRATION_OPTIONS)[number]
}

type NewPacketDraft = {
  name: string
  items: PacketDocItem[]
  expiration: (typeof EXPIRATION_OPTIONS)[number]
}

type VariableDialogState = {
  templateId: string
  values: Record<string, string>
  editInstanceId?: string
}

const INITIAL_PACKETS: Packet[] = [
  {
    id: "pkt-acme",
    name: "ACME candidate NDA",
    expiration: "7 days after sent",
    items: [
      {
        instanceId: "inst-nda-1",
        templateId: "tmpl-nda",
        variableValues: {
          confidentialScope: "Product roadmap",
          interviewDate: "2026-05-20",
        },
      },
      {
        instanceId: "inst-int-1",
        templateId: "tmpl-interview",
        variableValues: {},
      },
      {
        instanceId: "inst-off-1",
        templateId: "tmpl-office",
        variableValues: {},
      },
    ],
  },
]

function parseYmd(s: string): Date | undefined {
  const d = parse(s, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

function formatYmd(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function displayDateValue(s: string): string {
  const d = parseYmd(s)
  return d ? format(d, "PPP") : s || "—"
}

export function Component() {
  const packetSelectId = useId()
  const expirationSelectId = useId()
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [extraTemplates, setExtraTemplates] = useState<DocTemplate[]>([])
  const [packets, setPackets] = useState<Packet[]>(INITIAL_PACKETS)
  const [selectedKey, setSelectedKey] = useState<string>(INITIAL_PACKETS[0]!.id)
  const [panelOpen, setPanelOpen] = useState(true)

  const [newDraft, setNewDraft] = useState<NewPacketDraft>({
    name: "Untitled packet",
    items: [],
    expiration: "7 days after sent",
  })

  const [scratchOpen, setScratchOpen] = useState(false)
  const [scratchTitle, setScratchTitle] = useState("")
  const [scratchBody, setScratchBody] = useState("")

  const [variableDialog, setVariableDialog] = useState<VariableDialogState | null>(
    null,
  )
  const [previewItem, setPreviewItem] = useState<PacketDocItem | null>(null)

  const templates = useMemo(
    () => [...BASE_DOC_TEMPLATES, ...extraTemplates],
    [extraTemplates],
  )

  const isNewPacket = selectedKey === NEW_PACKET

  const selectedPacket = useMemo(
    () => packets.find((p) => p.id === selectedKey),
    [packets, selectedKey],
  )

  const itemsInPacket = useMemo(() => {
    if (isNewPacket) return newDraft.items
    return selectedPacket?.items ?? []
  }, [isNewPacket, newDraft.items, selectedPacket])

  const templatesWithoutVariablesInPacket = useMemo(() => {
    const inPacket = new Set(itemsInPacket.map((i) => i.templateId))
    return templates.filter(
      (t) => t.variables.length === 0 && !inPacket.has(t.id),
    )
  }, [templates, itemsInPacket])

  const templatesNotInPacketQuickAdd = useMemo(() => {
    const inPacket = new Set(itemsInPacket.map((i) => i.templateId))
    return templates.filter((t) => !inPacket.has(t.id))
  }, [templates, itemsInPacket])

  const expirationValue = isNewPacket
    ? newDraft.expiration
    : selectedPacket?.expiration ?? "7 days after sent"

  function findTemplate(id: string) {
    return templateById(templates, id)
  }

  function templateName(id: string) {
    return findTemplate(id)?.name ?? id
  }

  function setExpiration(next: (typeof EXPIRATION_OPTIONS)[number]) {
    if (isNewPacket) {
      setNewDraft((d) => ({ ...d, expiration: next }))
      return
    }
    if (!selectedPacket) return
    setPackets((prev) =>
      prev.map((p) =>
        p.id === selectedPacket.id ? { ...p, expiration: next } : p,
      ),
    )
  }

  function appendItem(templateId: string, variableValues: Record<string, string>) {
    const row: PacketDocItem = {
      instanceId: crypto.randomUUID(),
      templateId,
      variableValues: { ...variableValues },
    }
    if (isNewPacket) {
      setNewDraft((d) => ({ ...d, items: [...d.items, row] }))
    } else if (selectedPacket) {
      setPackets((prev) =>
        prev.map((p) =>
          p.id === selectedPacket.id ? { ...p, items: [...p.items, row] } : p,
        ),
      )
    }
  }

  function updateItemVars(
    instanceId: string,
    variableValues: Record<string, string>,
  ) {
    if (isNewPacket) {
      setNewDraft((d) => ({
        ...d,
        items: d.items.map((it) =>
          it.instanceId === instanceId
            ? { ...it, variableValues: { ...variableValues } }
            : it,
        ),
      }))
      return
    }
    if (!selectedPacket) return
    setPackets((prev) =>
      prev.map((p) =>
        p.id === selectedPacket.id
          ? {
              ...p,
              items: p.items.map((it) =>
                it.instanceId === instanceId
                  ? { ...it, variableValues: { ...variableValues } }
                  : it,
              ),
            }
          : p,
      ),
    )
  }

  function removeItem(instanceId: string) {
    if (isNewPacket) {
      setNewDraft((d) => ({
        ...d,
        items: d.items.filter((it) => it.instanceId !== instanceId),
      }))
      return
    }
    if (!selectedPacket) return
    setPackets((prev) =>
      prev.map((p) =>
        p.id === selectedPacket.id
          ? { ...p, items: p.items.filter((it) => it.instanceId !== instanceId) }
          : p,
      ),
    )
  }

  function startAppendTemplate(templateId: string) {
    const t = findTemplate(templateId)
    if (!t) return
    if (t.variables.length === 0) {
      appendItem(templateId, {})
      toast.message("Document added.", { description: t.name })
      return
    }
    const initial: Record<string, string> = {}
    for (const v of t.variables) initial[v.key] = ""
    setVariableDialog({ templateId, values: initial })
  }

  function openEditVariables(item: PacketDocItem) {
    const t = findTemplate(item.templateId)
    if (!t || t.variables.length === 0) return
    const initial: Record<string, string> = {}
    for (const v of t.variables) {
      initial[v.key] = item.variableValues[v.key] ?? ""
    }
    setVariableDialog({
      templateId: item.templateId,
      values: initial,
      editInstanceId: item.instanceId,
    })
  }

  function confirmVariableDialog() {
    if (!variableDialog) return
    const t = findTemplate(variableDialog.templateId)
    if (!t) {
      setVariableDialog(null)
      return
    }
    const missing = missingVariableKeys(t, variableDialog.values)
    if (missing.length > 0) {
      toast.error("Fill in all fields before continuing.")
      return
    }
    if (variableDialog.editInstanceId) {
      updateItemVars(variableDialog.editInstanceId, variableDialog.values)
      toast.success("Variables updated.")
    } else {
      appendItem(variableDialog.templateId, variableDialog.values)
      toast.message("Document added.", { description: t.name })
    }
    setVariableDialog(null)
  }

  function appendPdfDocument(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Choose a PDF file.")
      return
    }
    const base = file.name.replace(/\.pdf$/i, "").trim() || "Untitled"
    const id = crypto.randomUUID()
    const doc: DocTemplate = {
      id,
      name: `${base} (PDF)`,
      variables: [],
      bodyTemplate: `This packet includes the uploaded file "${escapeHtml(base)}.pdf". Preview of binary PDF content is not available in this prototype.`,
    }
    setExtraTemplates((prev) => [...prev, doc])
    appendItem(id, {})
    toast.message("Document added from PDF.", { description: doc.name })
  }

  function commitScratchDocument() {
    const title = scratchTitle.trim() || "Untitled document"
    const id = crypto.randomUUID()
    const body = scratchBody.trim()
    const doc: DocTemplate = {
      id,
      name: body ? `${title} (draft)` : title,
      variables: [],
      bodyTemplate:
        body ||
        "This is a blank document created from scratch. Edit it in document management when that flow is available.",
    }
    setExtraTemplates((prev) => [...prev, doc])
    appendItem(id, {})
    setScratchOpen(false)
    setScratchTitle("")
    setScratchBody("")
    toast.message("Document created from scratch.", {
      description: doc.name,
    })
  }

  function validatePacketItems(items: PacketDocItem[]): boolean {
    for (const it of items) {
      const t = findTemplate(it.templateId)
      if (!t) continue
      const missing = missingVariableKeys(t, it.variableValues)
      if (missing.length > 0) {
        toast.error(
          `Fill all variables on "${t.name}" before saving (use preview or row actions).`,
        )
        return false
      }
    }
    return true
  }

  function handleSave() {
    if (isNewPacket) {
      const name = newDraft.name.trim()
      if (!name) {
        toast.error("Enter a packet name.")
        return
      }
      if (newDraft.items.length === 0) {
        toast.error("Add at least one document to this packet.")
        return
      }
      if (!validatePacketItems(newDraft.items)) return
      const id = crypto.randomUUID()
      setPackets((prev) => [
        ...prev,
        {
          id,
          name,
          items: newDraft.items.map((it) => ({ ...it })),
          expiration: newDraft.expiration,
        },
      ])
      setSelectedKey(id)
      setNewDraft({
        name: "Untitled packet",
        items: [],
        expiration: "7 days after sent",
      })
      toast.success("Packet created.")
      return
    }
    if (selectedPacket && !validatePacketItems(selectedPacket.items)) return
    toast.success("Packet saved.")
  }

  function handleCancel() {
    if (isNewPacket) {
      setSelectedKey(packets[0]?.id ?? NEW_PACKET)
      setNewDraft({
        name: "Untitled packet",
        items: [],
        expiration: "7 days after sent",
      })
      return
    }
    toast.message("Edits discarded for this session.", {
      description: "Reload the page to reset demo data.",
    })
  }

  const variableDialogTemplate = variableDialog
    ? findTemplate(variableDialog.templateId)
    : undefined

  function renderVariableField(v: DocVariable) {
    if (!variableDialog) return null
    const value = variableDialog.values[v.key] ?? ""

    if (v.kind === "date") {
      const selected = parseYmd(value)
      return (
        <div key={v.key} className="space-y-1.5">
          <Label>{v.label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-start font-normal"
              >
                {value ? displayDateValue(value) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(d) => {
                  if (!d) return
                  setVariableDialog((cur) => {
                    if (!cur) return null
                    return {
                      ...cur,
                      values: { ...cur.values, [v.key]: formatYmd(d) },
                    }
                  })
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )
    }

    return (
      <div key={v.key} className="space-y-1.5">
        <Label htmlFor={`var-${v.key}`}>{v.label}</Label>
        <Input
          id={`var-${v.key}`}
          value={value}
          onChange={(e) =>
            setVariableDialog((cur) =>
              cur
                ? {
                    ...cur,
                    values: { ...cur.values, [v.key]: e.target.value },
                  }
                : null,
            )
          }
          placeholder={
            v.key === "confidentialScope" ? "e.g. Product roadmap" : undefined
          }
        />
      </div>
    )
  }

  const previewTemplate = previewItem
    ? findTemplate(previewItem.templateId)
    : undefined

  return (
    <div className="min-h-svh bg-white p-6">
      <Toaster position="bottom-center" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/proto-hub">Back to proto hub</Link>
          </Button>
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <Link to="/document-templates">Document template library</Link>
          </Button>
        </div>

        <Collapsible open={panelOpen} onOpenChange={setPanelOpen}>
          <div
            className={cn(
              "w-full rounded-2xl border bg-muted/30 p-4 pt-3 shadow-sm",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-muted"
                  aria-hidden
                >
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <p className="text-base font-medium leading-6">
                  Send document packet to candidate
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-8 shrink-0 rounded-full"
                  aria-expanded={panelOpen}
                  aria-label={panelOpen ? "Collapse panel" : "Expand panel"}
                >
                  {panelOpen ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-6 space-y-6 data-[state=closed]:animate-out">
              <div className="grid gap-4 pl-0 sm:grid-cols-[1fr_240px] sm:pl-11">
                <div className="space-y-2">
                  <Label htmlFor={packetSelectId} className="text-base font-medium">
                    Select document packet
                  </Label>
                  <Select
                    value={selectedKey}
                    onValueChange={(v) => {
                      setSelectedKey(v)
                      if (v === NEW_PACKET) {
                        setNewDraft({
                          name: "Untitled packet",
                          items: [],
                          expiration: "7 days after sent",
                        })
                      }
                    }}
                  >
                    <SelectTrigger
                      id={packetSelectId}
                      className="h-10 w-full rounded-lg bg-background"
                    >
                      <SelectValue
                        placeholder="Select a packet"
                        className="text-base"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {packets.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-base">
                          {p.name}
                        </SelectItem>
                      ))}
                      <SelectItem value={NEW_PACKET} className="text-base">
                        New packet
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isNewPacket ? (
                    <div className="space-y-1.5 pt-1">
                      <Label
                        htmlFor="packet-name"
                        className="text-sm font-normal text-muted-foreground"
                      >
                        Packet name
                      </Label>
                      <Input
                        id="packet-name"
                        value={newDraft.name}
                        onChange={(e) =>
                          setNewDraft((d) => ({ ...d, name: e.target.value }))
                        }
                        className="bg-background"
                        placeholder="Untitled packet"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={expirationSelectId}
                    className="text-base font-medium"
                  >
                    Expiration date
                  </Label>
                  <Select
                    value={expirationValue}
                    onValueChange={(v) =>
                      setExpiration(v as (typeof EXPIRATION_OPTIONS)[number])
                    }
                  >
                    <SelectTrigger
                      id={expirationSelectId}
                      className="h-10 w-full rounded-lg bg-background"
                    >
                      <SelectValue className="text-base" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-base">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 sm:pl-11">
                <div className="flex flex-col gap-2 py-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-base font-medium">Documents in this packet</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        Add document
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      {templatesNotInPacketQuickAdd.map((t) => (
                        <DropdownMenuItem
                          key={t.id}
                          onSelect={() => startAppendTemplate(t.id)}
                        >
                          Add {t.name}
                        </DropdownMenuItem>
                      ))}
                      {templatesNotInPacketQuickAdd.length > 0 ? (
                        <DropdownMenuSeparator />
                      ) : null}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <LayoutTemplate className="mr-2 size-4" />
                          From template
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                          {templates.map((t) => (
                            <DropdownMenuItem
                              key={t.id}
                              onSelect={() => startAppendTemplate(t.id)}
                            >
                              {t.name}
                              {t.variables.length > 0 ? (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({t.variables.length} fields)
                                </span>
                              ) : null}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => pdfInputRef.current?.click()}
                      >
                        <Upload className="mr-2 size-4" />
                        New from PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setScratchOpen(true)}>
                        <FilePenLine className="mr-2 size-4" />
                        New from scratch
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/document-templates" className="cursor-pointer">
                          Open template library…
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ""
                      if (file) appendPdfDocument(file)
                    }}
                  />
                </div>

                {isNewPacket ? (
                  <div className="space-y-4 rounded-lg border bg-background px-3 py-3">
                    <p className="text-sm text-muted-foreground">
                      Check documents without merge fields. Templates such as the
                      NDA that need{" "}
                      <span className="font-medium text-foreground">
                        confidential scope
                      </span>{" "}
                      or an{" "}
                      <span className="font-medium text-foreground">
                        interview date
                      </span>{" "}
                      are added through{" "}
                      <span className="font-medium text-foreground">
                        Add document
                      </span>{" "}
                      → <span className="font-medium text-foreground">From template</span>.
                    </p>
                    <div className="space-y-3">
                      {templatesWithoutVariablesInPacket.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          All simple templates are already in this packet.
                        </p>
                      ) : (
                        templatesWithoutVariablesInPacket.map((t, i) => (
                          <div key={t.id}>
                            {i > 0 ? <Separator className="mb-3" /> : null}
                            <label className="flex cursor-pointer items-center gap-3 text-base">
                              <Checkbox
                                checked={newDraft.items.some(
                                  (it) => it.templateId === t.id,
                                )}
                                onCheckedChange={(checked) => {
                                  const on = checked === true
                                  if (on) startAppendTemplate(t.id)
                                  else {
                                    setNewDraft((d) => ({
                                      ...d,
                                      items: d.items.filter(
                                        (it) => it.templateId !== t.id,
                                      ),
                                    }))
                                  }
                                }}
                              />
                              <span>{t.name}</span>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {newDraft.items.length > 0 ? (
                      <div className="border-t pt-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Included in packet
                        </p>
                        <ul className="space-y-1">
                          {newDraft.items.map((it) => (
                            <li
                              key={it.instanceId}
                              className="flex items-center justify-between gap-2 rounded-md border bg-background/80 px-2 py-1.5"
                            >
                              <span className="min-w-0 truncate text-sm">
                                {templateName(it.templateId)}
                              </span>
                              <div className="flex shrink-0 gap-0.5">
                                {findTemplate(it.templateId)?.variables.length ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 shrink-0"
                                    aria-label={`Edit variables for ${templateName(it.templateId)}`}
                                    onClick={() => openEditVariables(it)}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 shrink-0"
                                  aria-label={`Preview ${templateName(it.templateId)}`}
                                  onClick={() => setPreviewItem(it)}
                                >
                                  <Eye className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                  aria-label={`Remove ${templateName(it.templateId)}`}
                                  onClick={() => removeItem(it.instanceId)}
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <ul className="divide-y rounded-lg border bg-background">
                    {itemsInPacket.length === 0 ? (
                      <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No documents in this packet. Use Add document.
                      </li>
                    ) : (
                      itemsInPacket.map((it) => {
                        const tmpl = findTemplate(it.templateId)
                        const missing =
                          tmpl && tmpl.variables.length > 0
                            ? missingVariableKeys(tmpl, it.variableValues).length
                            : 0
                        return (
                          <li
                            key={it.instanceId}
                            className="flex flex-wrap items-center justify-between gap-2 py-2 pr-1 pl-3"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-base">
                                {templateName(it.templateId)}
                              </span>
                              {missing > 0 ? (
                                <span className="text-xs text-amber-600 dark:text-amber-500">
                                  {missing} variable{missing > 1 ? "s" : ""} not
                                  set
                                </span>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`Preview ${templateName(it.templateId)}`}
                                onClick={() => setPreviewItem(it)}
                              >
                                <Eye className="size-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-md"
                                    aria-label={`Actions for ${templateName(it.templateId)}`}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() => setPreviewItem(it)}
                                  >
                                    <Eye className="mr-2 size-4" />
                                    Preview
                                  </DropdownMenuItem>
                                  {tmpl && tmpl.variables.length > 0 ? (
                                    <DropdownMenuItem
                                      onSelect={() => openEditVariables(it)}
                                    >
                                      <Pencil className="mr-2 size-4" />
                                      Edit variables
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => removeItem(it.instanceId)}
                                  >
                                    Remove from packet
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </li>
                        )
                      })
                    )}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-4 border-t pt-4 sm:pl-11">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      <Dialog
        open={!!variableDialog && !!variableDialogTemplate}
        onOpenChange={(o) => {
          if (!o) setVariableDialog(null)
        }}
      >
        <DialogContent showCloseButton className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {variableDialog?.editInstanceId
                ? "Edit document variables"
                : "Fill in document variables"}
            </DialogTitle>
            {variableDialogTemplate ? (
              <p className="text-sm text-muted-foreground">
                {variableDialogTemplate.name}
              </p>
            ) : null}
          </DialogHeader>
          {variableDialogTemplate ? (
            <div className="space-y-4">
              {variableDialogTemplate.variables.map((v) =>
                renderVariableField(v),
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVariableDialog(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmVariableDialog}>
              {variableDialog?.editInstanceId ? "Save" : "Add to packet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={(o) => !o && setPreviewItem(null)}>
        <DialogContent showCloseButton className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {previewItem ? templateName(previewItem.templateId) : "Preview"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Values shown as they will appear to the candidate. Empty fields show
              as placeholders.
            </p>
          </DialogHeader>
          {previewTemplate && previewItem ? (
            <ScrollArea className="max-h-[min(420px,55vh)] rounded-md border bg-muted/20 p-4">
              <div
                className="prose prose-sm max-w-none text-foreground dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: renderDocumentBodyHtml(
                    previewTemplate,
                    previewItem.variableValues,
                  ),
                }}
              />
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">No preview available.</p>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setPreviewItem(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scratchOpen} onOpenChange={setScratchOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>New document from scratch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="scratch-title">Title</Label>
              <Input
                id="scratch-title"
                value={scratchTitle}
                onChange={(e) => setScratchTitle(e.target.value)}
                placeholder="Document title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scratch-body">Body (optional)</Label>
              <Textarea
                id="scratch-body"
                value={scratchBody}
                onChange={(e) => setScratchBody(e.target.value)}
                placeholder="Type the document content…"
                rows={6}
                className="resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setScratchOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={commitScratchDocument}>
              Add to packet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

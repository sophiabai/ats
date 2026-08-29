import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Bold,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Italic,
  Plus,
  Search,
  Trash,
  Underline,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  ColorTokens,
  Row,
  Section,
  Specimen,
  TextColorScale,
  TypeScale,
} from "@/features/component-gallery/components/gallery-primitives";

// ---------------------------------------------------------------------------
// Variant lists — read off the cva definitions in components/ui/.
// Keep these in sync with the source; if it is not defined there, it does not
// belong here.
// ---------------------------------------------------------------------------

const BUTTON_VARIANTS = [
  "default", "destructive", "success", "outline", "secondary", "ghost", "link",
] as const;
const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;
const BUTTON_ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;
const BADGE_VARIANTS = [
  "default", "secondary", "destructive", "outline", "ghost", "link",
] as const;
const TOGGLE_VARIANTS = ["default", "outline"] as const;
const TOGGLE_SIZES = ["sm", "default", "lg"] as const;
const TABS_VARIANTS = ["default", "line", "file-labels"] as const;
const AVATAR_SIZES = ["sm", "default", "lg"] as const;
const SELECT_SIZES = ["sm", "default"] as const;

type Entry = { id: string; label: string; render: () => React.ReactNode };

function useEntries(): Entry[] {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [toggleOn, setToggleOn] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  return useMemo<Entry[]>(
    () => [
      // ---------------------------------------------------------------- Type
      {
        id: "typography",
        label: "Typography",
        render: () => (
          <Section
            id="typography"
            title="Typography"
            caption="index.css — the type scale and the text colours, measured live"
          >
            <TypeScale />
            <Separator />
            <TextColorScale />
          </Section>
        ),
      },
      {
        id: "color",
        label: "Color",
        render: () => (
          <Section id="color" title="Color" caption="semantic tokens + berry ramp">
            <ColorTokens />
          </Section>
        ),
      },

      // ------------------------------------------------------------- Controls
      {
        id: "button",
        label: "Button",
        render: () => (
          <Section id="button" title="Button" caption="variant × size">
            <Row label="variant">
              {BUTTON_VARIANTS.map((v) => (
                <Specimen key={v} name={v}>
                  <Button variant={v}>{v}</Button>
                </Specimen>
              ))}
            </Row>
            <Row label="size">
              {BUTTON_SIZES.map((s) => (
                <Specimen key={s} name={s}>
                  <Button size={s}>{s}</Button>
                </Specimen>
              ))}
            </Row>
            <Row label="icon size">
              {BUTTON_ICON_SIZES.map((s) => (
                <Specimen key={s} name={s}>
                  <Button size={s} aria-label={s}>
                    <Plus />
                  </Button>
                </Specimen>
              ))}
            </Row>
            <Row label="with icon">
              <Specimen name="leading">
                <Button>
                  <Plus /> New requisition
                </Button>
              </Specimen>
              <Specimen name="trailing">
                <Button variant="outline">
                  Continue <ChevronRight />
                </Button>
              </Specimen>
            </Row>
            <Row label="disabled">
              {BUTTON_VARIANTS.slice(0, 5).map((v) => (
                <Specimen key={v} name={v}>
                  <Button variant={v} disabled>
                    {v}
                  </Button>
                </Specimen>
              ))}
            </Row>
          </Section>
        ),
      },
      {
        id: "badge",
        label: "Badge",
        render: () => (
          <Section id="badge" title="Badge" caption="variant">
            <Row label="variant">
              {BADGE_VARIANTS.map((v) => (
                <Specimen key={v} name={v}>
                  <Badge variant={v}>{v}</Badge>
                </Specimen>
              ))}
            </Row>
            <Row label="with icon">
              <Specimen name="default">
                <Badge>
                  <Check /> Top match
                </Badge>
              </Specimen>
              <Specimen name="secondary">
                <Badge variant="secondary">
                  <CalendarIcon /> Scheduled
                </Badge>
              </Specimen>
            </Row>
          </Section>
        ),
      },
      {
        id: "toggle",
        label: "Toggle",
        render: () => (
          <Section id="toggle" title="Toggle" caption="variant × size">
            <Row label="variant">
              {TOGGLE_VARIANTS.map((v) => (
                <Specimen key={v} name={v}>
                  <Toggle variant={v} aria-label={v}>
                    <Bold />
                  </Toggle>
                </Specimen>
              ))}
            </Row>
            <Row label="size">
              {TOGGLE_SIZES.map((s) => (
                <Specimen key={s} name={s}>
                  <Toggle size={s} variant="outline" aria-label={s}>
                    <Bold />
                  </Toggle>
                </Specimen>
              ))}
            </Row>
            <Row label="state">
              <Specimen name="on">
                <Toggle pressed={toggleOn} onPressedChange={setToggleOn} aria-label="on">
                  <Bold />
                </Toggle>
              </Specimen>
              <Specimen name="disabled">
                <Toggle disabled aria-label="disabled">
                  <Bold />
                </Toggle>
              </Specimen>
            </Row>
          </Section>
        ),
      },
      {
        id: "toggle-group",
        label: "Toggle group",
        render: () => (
          <Section id="toggle-group" title="Toggle group" caption="type × variant">
            <Row label="single">
              <ToggleGroup type="single" variant="outline" defaultValue="b">
                <ToggleGroupItem value="a" aria-label="Bold"><Bold /></ToggleGroupItem>
                <ToggleGroupItem value="b" aria-label="Italic"><Italic /></ToggleGroupItem>
                <ToggleGroupItem value="c" aria-label="Underline"><Underline /></ToggleGroupItem>
              </ToggleGroup>
            </Row>
            <Row label="multiple">
              <ToggleGroup type="multiple" defaultValue={["a"]}>
                <ToggleGroupItem value="a" aria-label="Bold"><Bold /></ToggleGroupItem>
                <ToggleGroupItem value="b" aria-label="Italic"><Italic /></ToggleGroupItem>
                <ToggleGroupItem value="c" aria-label="Underline"><Underline /></ToggleGroupItem>
              </ToggleGroup>
            </Row>
          </Section>
        ),
      },
      {
        id: "checkbox",
        label: "Checkbox",
        render: () => (
          <Section id="checkbox" title="Checkbox" caption="state">
            <Row label="state">
              <Specimen name="unchecked"><Checkbox /></Specimen>
              <Specimen name="checked">
                <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
              </Specimen>
              <Specimen name="disabled"><Checkbox disabled /></Specimen>
              <Specimen name="disabled + checked"><Checkbox disabled checked /></Specimen>
            </Row>
            <Row label="with label">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox defaultChecked /> Ignore order of interviews
              </label>
            </Row>
          </Section>
        ),
      },
      {
        id: "switch",
        label: "Switch",
        render: () => (
          <Section id="switch" title="Switch" caption="state">
            <Row label="state">
              <Specimen name="off"><Switch /></Specimen>
              <Specimen name="on">
                <Switch checked={switched} onCheckedChange={setSwitched} />
              </Specimen>
              <Specimen name="disabled"><Switch disabled /></Specimen>
              <Specimen name="disabled + on"><Switch disabled checked /></Specimen>
            </Row>
          </Section>
        ),
      },

      // ---------------------------------------------------------------- Input
      {
        id: "input",
        label: "Input",
        render: () => (
          <Section id="input" title="Input" caption="state">
            <Row label="state" align="start">
              <Specimen name="default" className="w-56">
                <Input placeholder="Search candidates" />
              </Specimen>
              <Specimen name="disabled" className="w-56">
                <Input placeholder="Disabled" disabled />
              </Specimen>
              <Specimen name="aria-invalid" className="w-56">
                <Input placeholder="Invalid" aria-invalid />
              </Specimen>
            </Row>
            <Row label="type" align="start">
              <Specimen name="email" className="w-56">
                <Input type="email" placeholder="name@acme.com" />
              </Specimen>
              <Specimen name="file" className="w-56">
                <Input type="file" />
              </Specimen>
            </Row>
          </Section>
        ),
      },
      {
        id: "textarea",
        label: "Textarea",
        render: () => (
          <Section id="textarea" title="Textarea" caption="state">
            <Row label="state" align="start">
              <Specimen name="default" className="w-64">
                <Textarea placeholder="Add a note to the recruiter" />
              </Specimen>
              <Specimen name="disabled" className="w-64">
                <Textarea placeholder="Disabled" disabled />
              </Specimen>
            </Row>
          </Section>
        ),
      },
      {
        id: "label",
        label: "Label",
        render: () => (
          <Section id="label" title="Label">
            <Row label="default" align="start">
              <div className="flex w-56 flex-col gap-1.5">
                <Label htmlFor="gallery-duration">Interview duration</Label>
                <Input id="gallery-duration" placeholder="3 hours 15 minutes" />
              </div>
            </Row>
          </Section>
        ),
      },
      {
        id: "select",
        label: "Select",
        render: () => (
          <Section id="select" title="Select" caption="size">
            <Row label="size" align="start">
              {SELECT_SIZES.map((s) => (
                <Specimen key={s} name={s}>
                  <Select defaultValue="1">
                    <SelectTrigger size={s} className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Next 1 calendar week</SelectItem>
                      <SelectItem value="2">Next 2 calendar weeks</SelectItem>
                      <SelectItem value="3">Next 3 calendar weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </Specimen>
              ))}
              <Specimen name="disabled">
                <Select disabled>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Disabled" />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Specimen>
            </Row>
          </Section>
        ),
      },

      // -------------------------------------------------------------- Display
      {
        id: "avatar",
        label: "Avatar",
        render: () => (
          <Section id="avatar" title="Avatar" caption="size">
            <Row label="size">
              {AVATAR_SIZES.map((s) => (
                <Specimen key={s} name={s}>
                  <Avatar size={s}>
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                </Specimen>
              ))}
            </Row>
            <Row label="group">
              <AvatarGroup>
                <Avatar><AvatarFallback>LA</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>JR</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>JB</AvatarFallback></Avatar>
                <AvatarGroupCount>+3</AvatarGroupCount>
              </AvatarGroup>
            </Row>
          </Section>
        ),
      },
      {
        id: "card",
        label: "Card",
        render: () => (
          <Section id="card" title="Card">
            <Row label="default" align="start">
              <Card className="w-80">
                <CardHeader>
                  <CardTitle>Senior Frontend Engineer</CardTitle>
                  <CardDescription>10 candidates in pipeline</CardDescription>
                  <CardAction>
                    <Button variant="ghost" size="icon-sm" aria-label="More">
                      <Plus />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card content sits here — body copy at text-sm.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Open</Button>
                </CardFooter>
              </Card>
            </Row>
          </Section>
        ),
      },
      {
        id: "table",
        label: "Table",
        render: () => (
          <Section id="table" title="Table">
            <Row label="default" align="start">
              <div className="w-full max-w-2xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Jordan Kim", "Hiring manager screen", "6mo ago"],
                      ["Emily Zhang", "Onsite", "6mo ago"],
                      ["Jane Warren", "Onsite", "6mo ago"],
                    ].map((r) => (
                      <TableRow key={r[0]}>
                        <TableCell className="font-medium">{r[0]}</TableCell>
                        <TableCell>{r[1]}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{r[2]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Row>
          </Section>
        ),
      },
      {
        id: "separator",
        label: "Separator",
        render: () => (
          <Section id="separator" title="Separator" caption="orientation">
            <Row label="horizontal" align="start">
              <div className="w-64"><Separator /></div>
            </Row>
            <Row label="vertical">
              <div className="flex h-10 items-center gap-3">
                <span className="text-sm">Left</span>
                <Separator orientation="vertical" />
                <span className="text-sm">Right</span>
              </div>
            </Row>
          </Section>
        ),
      },
      {
        id: "skeleton",
        label: "Skeleton",
        render: () => (
          <Section id="skeleton" title="Skeleton">
            <Row label="default" align="start">
              <div className="flex w-64 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Row>
          </Section>
        ),
      },
      {
        id: "breadcrumb",
        label: "Breadcrumb",
        render: () => (
          <Section id="breadcrumb" title="Breadcrumb">
            <Row label="default">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Candidates</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Jordan Kim</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Row>
          </Section>
        ),
      },
      {
        id: "tabs",
        label: "Tabs",
        render: () => (
          <Section id="tabs" title="Tabs" caption="variant">
            {TABS_VARIANTS.map((v) => (
              <Row key={v} label={v} align="start">
                <Tabs defaultValue="a" className="w-full max-w-md">
                  <TabsList variant={v}>
                    <TabsTrigger value="a">Application</TabsTrigger>
                    <TabsTrigger value="b">Interview stages</TabsTrigger>
                    <TabsTrigger value="c">Feedback</TabsTrigger>
                  </TabsList>
                  <TabsContent value="a" className="pt-3 text-sm text-muted-foreground">
                    Application panel
                  </TabsContent>
                  <TabsContent value="b" className="pt-3 text-sm text-muted-foreground">
                    Interview stages panel
                  </TabsContent>
                  <TabsContent value="c" className="pt-3 text-sm text-muted-foreground">
                    Feedback panel
                  </TabsContent>
                </Tabs>
              </Row>
            ))}
          </Section>
        ),
      },
      {
        id: "calendar",
        label: "Calendar",
        render: () => (
          <Section id="calendar" title="Calendar" caption="react-day-picker">
            <Row label="single" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border border-border"
              />
            </Row>
          </Section>
        ),
      },
      {
        id: "scroll-area",
        label: "Scroll area",
        render: () => (
          <Section id="scroll-area" title="Scroll area">
            <Row label="vertical" align="start">
              <ScrollArea className="h-32 w-64 rounded-lg border border-border p-3">
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="text-sm">Interview slot {i + 1}</span>
                  ))}
                </div>
              </ScrollArea>
            </Row>
          </Section>
        ),
      },
      {
        id: "collapsible",
        label: "Collapsible",
        render: () => (
          <Section id="collapsible" title="Collapsible">
            <Row label="default" align="start">
              <Collapsible open={collapsed} onOpenChange={setCollapsed} className="w-64">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    {collapsed ? "Hide" : "Show"} availability
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
                  Tue, May 6 — 10:00 AM – 1:30 PM
                </CollapsibleContent>
              </Collapsible>
            </Row>
          </Section>
        ),
      },

      // -------------------------------------------------------------- Overlays
      {
        id: "tooltip",
        label: "Tooltip",
        render: () => (
          <Section id="tooltip" title="Tooltip" caption="side">
            <Row label="side">
              {(["top", "right", "bottom", "left"] as const).map((side) => (
                <Specimen key={side} name={side}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">{side}</Button>
                    </TooltipTrigger>
                    <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
                  </Tooltip>
                </Specimen>
              ))}
            </Row>
          </Section>
        ),
      },
      {
        id: "popover",
        label: "Popover",
        render: () => (
          <Section id="popover" title="Popover">
            <Row label="default">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <p className="text-sm">
                    Popover content — used for the week picker on the availability grid.
                  </p>
                </PopoverContent>
              </Popover>
            </Row>
          </Section>
        ),
      },
      {
        id: "dropdown-menu",
        label: "Dropdown menu",
        render: () => (
          <Section id="dropdown-menu" title="Dropdown menu">
            <Row label="default">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Schedule</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Scheduling</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Schedule</DropdownMenuItem>
                  <DropdownMenuItem>Request availability</DropdownMenuItem>
                  <DropdownMenuItem>Candidate self-schedule</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Trash /> Cancel
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Row>
          </Section>
        ),
      },
      {
        id: "dialog",
        label: "Dialog",
        render: () => (
          <Section id="dialog" title="Dialog">
            <Row label="default">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request availability</DialogTitle>
                    <DialogDescription>
                      Send an availability request email to the candidate.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Send</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Row>
          </Section>
        ),
      },
      {
        id: "alert-dialog",
        label: "Alert dialog",
        render: () => (
          <Section id="alert-dialog" title="Alert dialog">
            <Row label="default">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this interview?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The candidate and all interviewers will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction>Cancel interview</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Row>
          </Section>
        ),
      },
      {
        id: "sheet",
        label: "Sheet",
        render: () => (
          <Section id="sheet" title="Sheet" caption="side">
            <Row label="side">
              {(["right", "left", "top", "bottom"] as const).map((side) => (
                <Specimen key={side} name={side}>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">{side}</Button>
                    </SheetTrigger>
                    <SheetContent side={side}>
                      <SheetHeader>
                        <SheetTitle>Sheet from {side}</SheetTitle>
                        <SheetDescription>Slide-over panel content.</SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                </Specimen>
              ))}
            </Row>
          </Section>
        ),
      },
      {
        id: "command",
        label: "Command",
        render: () => (
          <Section id="command" title="Command">
            <Row label="inline" align="start">
              <Command className="w-72 rounded-lg border border-border">
                <CommandInput placeholder="Search candidates…" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Candidates">
                    <CommandItem>Jordan Kim<CommandShortcut>⌘1</CommandShortcut></CommandItem>
                    <CommandItem>Emily Zhang<CommandShortcut>⌘2</CommandShortcut></CommandItem>
                    <CommandItem>Jane Warren<CommandShortcut>⌘3</CommandShortcut></CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </Row>
          </Section>
        ),
      },
      {
        id: "sonner",
        label: "Sonner (toast)",
        render: () => (
          <Section id="sonner" title="Sonner (toast)" caption="type">
            <Row label="type">
              <Specimen name="default">
                <Button variant="outline" size="sm" onClick={() => toast("Interview scheduled")}>
                  default
                </Button>
              </Specimen>
              <Specimen name="success">
                <Button variant="outline" size="sm" onClick={() => toast.success("Confirmation sent")}>
                  success
                </Button>
              </Specimen>
              <Specimen name="error">
                <Button variant="outline" size="sm" onClick={() => toast.error("Couldn't find that candidate")}>
                  error
                </Button>
              </Specimen>
              <Specimen name="info">
                <Button variant="outline" size="sm" onClick={() => toast.info("Simulated 48h passed")}>
                  info
                </Button>
              </Specimen>
            </Row>
          </Section>
        ),
      },
    ],
    [date, checked, switched, toggleOn, collapsed],
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ComponentGalleryPage() {
  const entries = useEntries();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.label.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-svh bg-background text-foreground">
        {/* Sidebar */}
        <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col gap-4 border-r border-border px-4 py-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to app
          </Link>

          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="rounded-full pl-9"
            />
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
            {filtered.map((e) => (
              <a
                key={e.id}
                href={`#${e.id}`}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm text-foreground/80",
                  "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {e.label}
              </a>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">No matches</p>
            )}
          </nav>

          <p className="font-mono text-[10px] text-muted-foreground">
            {entries.length} sections
          </p>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-8 py-6">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Components</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The primitives in <span className="font-mono text-xs">components/ui/</span>,
              in every variant and size they define. Read off the source — if it
              is not here, it does not exist.
            </p>
          </header>

          <div className="flex flex-col gap-5 pb-20">
            {filtered.map((e) => (
              <div key={e.id}>{e.render()}</div>
            ))}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export { ComponentGalleryPage as Component };

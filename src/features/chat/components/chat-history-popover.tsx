import { History } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ThreadBucket = "today" | "earlier"

type ChatThread = {
  id: string
  title: string
  bucket: ThreadBucket
}

const FAKE_THREADS: ChatThread[] = [
  { id: "t1", title: "Draft outreach to Priya Kapoor", bucket: "today" },
  { id: "t2", title: "Schedule onsite for staff engineer role", bucket: "today" },
  { id: "t3", title: "Summarize feedback for Marco Liu", bucket: "today" },
  { id: "t4", title: "Create req for senior product designer", bucket: "earlier" },
  { id: "t5", title: "Compare candidates for ML lead", bucket: "earlier" },
  { id: "t6", title: "Reject template for cooled pipeline", bucket: "earlier" },
  { id: "t7", title: "Sourcing notes from EU recruiters sync", bucket: "earlier" },
]

export function ChatHistoryPopover() {
  const today = FAKE_THREADS.filter((t) => t.bucket === "today")
  const earlier = FAKE_THREADS.filter((t) => t.bucket === "earlier")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-xs" title="Chat history">
          <History className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-80 p-0"
      >
        <Command>
          <CommandInput placeholder="Search threads" />
          <CommandList className="max-h-80">
            <CommandEmpty>No threads found.</CommandEmpty>
            {today.length > 0 && (
              <CommandGroup heading="Today">
                {today.map((thread) => (
                  <CommandItem key={thread.id} value={thread.title}>
                    <span className="truncate">{thread.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {earlier.length > 0 && (
              <CommandGroup heading="Earlier">
                {earlier.map((thread) => (
                  <CommandItem key={thread.id} value={thread.title}>
                    <span className="truncate">{thread.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

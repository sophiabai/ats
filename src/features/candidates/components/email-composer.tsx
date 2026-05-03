import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  Indent,
  Italic,
  List,
  ListOrdered,
  Outdent,
  Plus,
  Underline as UnderlineIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EmailVariableKey =
  | "candidateName"
  | "candidateEmail"
  | "jobTitle"
  | "companyName"
  | "senderName"
  | "recruiterName";

export type EmailContext = Record<EmailVariableKey, string>;

export type EmailTemplateKey =
  | "availability-default"
  | "availability-followup"
  | "confirmation"
  | "reminder"
  | "rejection";

type EmailTemplate = {
  label: string;
  render: (ctx: EmailContext) => string;
};

// ---------------------------------------------------------------------------
// Variable definitions
// ---------------------------------------------------------------------------

const VARIABLE_OPTIONS: { key: EmailVariableKey; label: string }[] = [
  { key: "candidateName", label: "Candidate name" },
  { key: "candidateEmail", label: "Candidate email" },
  { key: "jobTitle", label: "Job title" },
  { key: "companyName", label: "Company name" },
  { key: "senderName", label: "Sender name" },
  { key: "recruiterName", label: "Recruiter name" },
];

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CHIP_CLASSES =
  "inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 align-baseline text-xs font-medium text-primary select-none";
const CHIP_DELETE_CLASSES =
  "inline-flex size-3 cursor-pointer items-center justify-center text-primary/70 hover:text-primary";
const CHIP_X_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

function chipHtml(value: string, key: EmailVariableKey): string {
  return (
    `<span contenteditable="false" data-variable-chip="${key}" class="${CHIP_CLASSES}">` +
    escapeHtml(value) +
    `<button type="button" data-chip-delete aria-label="Remove variable" tabindex="-1" class="${CHIP_DELETE_CLASSES}">${CHIP_X_SVG}</button>` +
    `</span>`
  );
}

function lockedBoxHtml(labelHtml: string, footerText: string): string {
  return (
    `<div contenteditable="false" data-locked-box class="my-3 rounded-lg bg-muted p-3 select-none">` +
    `<span class="${CHIP_CLASSES}">${labelHtml}</span>` +
    `<p class="mt-2 text-xs text-muted-foreground">${escapeHtml(footerText)}</p>` +
    `</div>`
  );
}

// Strips whitespace between tags so the contenteditable surface doesn't
// contain top-level text nodes where the caret can land outside a block.
function compactHtml(html: string): string {
  return html.replace(/>\s+</g, "><").trim();
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  "availability-default": "Request availability default",
  "availability-followup": "Request availability follow-up",
  confirmation: "Interview confirmation",
  reminder: "Interview reminder",
  rejection: "Candidate rejection",
};

const TEMPLATES: Record<EmailTemplateKey, EmailTemplate> = {
  "availability-default": {
    label: "Request availability default",
    render: (ctx) => `
      <p>Hi ${chipHtml(ctx.candidateName, "candidateName")},</p>
      <p>We're excited to move forward with your candidacy for the ${chipHtml(ctx.jobTitle, "jobTitle")} at ${chipHtml(ctx.companyName, "companyName")}! Please use the link below to share your availability for an interview.</p>
      <p>Looking forward to speaking with you!</p>
      ${lockedBoxHtml("Enter your availability here &gt;&gt;", "Send the email to generate the scheduling link. (Only visible to you)")}
      <p>Best,</p>
      <p>${chipHtml(ctx.senderName, "senderName")}</p>
    `,
  },
  "availability-followup": {
    label: "Request availability follow-up",
    render: (ctx) => `
      <p>Hi ${chipHtml(ctx.candidateName, "candidateName")},</p>
      <p>Just following up on our earlier note about scheduling your interview for the ${chipHtml(ctx.jobTitle, "jobTitle")} role at ${chipHtml(ctx.companyName, "companyName")}. When you have a moment, please share a few times that work for you.</p>
      ${lockedBoxHtml("Enter your availability here &gt;&gt;", "Send the email to generate the scheduling link. (Only visible to you)")}
      <p>Thanks,</p>
      <p>${chipHtml(ctx.senderName, "senderName")}</p>
    `,
  },
  confirmation: {
    label: "Interview confirmation",
    render: (ctx) => `
      <p>Hi ${chipHtml(ctx.candidateName, "candidateName")},</p>
      <p>We're pleased to confirm your interview for the ${chipHtml(ctx.jobTitle, "jobTitle")} position at ${chipHtml(ctx.companyName, "companyName")}.</p>
      <p>Please find the details below. If you need to reschedule, reply to this email and we'll find another time.</p>
      ${lockedBoxHtml("Interview details &gt;&gt;", "Schedule details will be inserted when sent. (Only visible to you)")}
      <p>Looking forward to meeting you!</p>
      <p>Best,</p>
      <p>${chipHtml(ctx.senderName, "senderName")}</p>
    `,
  },
  reminder: {
    label: "Interview reminder",
    render: (ctx) => `
      <p>Hi ${chipHtml(ctx.candidateName, "candidateName")},</p>
      <p>A quick reminder that your interview for the ${chipHtml(ctx.jobTitle, "jobTitle")} role at ${chipHtml(ctx.companyName, "companyName")} is coming up soon. Please reach out if you have any questions.</p>
      <p>Best,</p>
      <p>${chipHtml(ctx.recruiterName, "recruiterName")}</p>
    `,
  },
  rejection: {
    label: "Candidate rejection",
    render: (ctx) => `
      <p>Hi ${chipHtml(ctx.candidateName, "candidateName")},</p>
      <p>Thank you so much for taking the time to interview for the ${chipHtml(ctx.jobTitle, "jobTitle")} role at ${chipHtml(ctx.companyName, "companyName")}. After careful consideration, we've decided to move forward with other candidates for this role.</p>
      <p>We truly appreciated learning about your experience and wish you the best in your job search.</p>
      <p>Warm regards,</p>
      <p>${chipHtml(ctx.senderName, "senderName")}</p>
    `,
  },
};

// Renders a template as plain HTML with variable chips replaced by their bold
// text values — suitable for read-only contexts like the activity log.
export function renderEmailTemplatePlain(
  key: EmailTemplateKey,
  context: EmailContext,
): string {
  const plainChip = (value: string) =>
    `<strong>${escapeHtml(value)}</strong>`;
  const plainLocked = (labelText: string) =>
    `<p><a href="#" class="text-primary underline underline-offset-2 hover:text-primary/80">${labelText}</a></p>`;

  const renderers: Record<EmailTemplateKey, (ctx: EmailContext) => string> = {
    "availability-default": (ctx) => `
      <p>Hi ${plainChip(ctx.candidateName)},</p>
      <p>We're excited to move forward with your candidacy for the ${plainChip(ctx.jobTitle)} at ${plainChip(ctx.companyName)}! Please use the link below to share your availability for an interview.</p>
      <p>Looking forward to speaking with you!</p>
      ${plainLocked("Enter your availability here &gt;&gt;&gt;")}
      <p>Best,</p>
      <p>${plainChip(ctx.senderName)}</p>
    `,
    "availability-followup": (ctx) => `
      <p>Hi ${plainChip(ctx.candidateName)},</p>
      <p>Just following up on our earlier note about scheduling your interview for the ${plainChip(ctx.jobTitle)} role at ${plainChip(ctx.companyName)}. When you have a moment, please share a few times that work for you.</p>
      ${plainLocked("Enter your availability here &gt;&gt;&gt;")}
      <p>Thanks,</p>
      <p>${plainChip(ctx.senderName)}</p>
    `,
    confirmation: (ctx) => `
      <p>Hi ${plainChip(ctx.candidateName)},</p>
      <p>We're pleased to confirm your interview for the ${plainChip(ctx.jobTitle)} position at ${plainChip(ctx.companyName)}.</p>
      <p>Please find the details below. If you need to reschedule, reply to this email and we'll find another time.</p>
      ${plainLocked("Interview details &gt;&gt;&gt;")}
      <p>Looking forward to meeting you!</p>
      <p>Best,</p>
      <p>${plainChip(ctx.senderName)}</p>
    `,
    reminder: (ctx) => `
      <p>Hi ${plainChip(ctx.candidateName)},</p>
      <p>A quick reminder that your interview for the ${plainChip(ctx.jobTitle)} role at ${plainChip(ctx.companyName)} is coming up soon. Please reach out if you have any questions.</p>
      <p>Best,</p>
      <p>${plainChip(ctx.recruiterName)}</p>
    `,
    rejection: (ctx) => `
      <p>Hi ${plainChip(ctx.candidateName)},</p>
      <p>Thank you so much for taking the time to interview for the ${plainChip(ctx.jobTitle)} role at ${plainChip(ctx.companyName)}. After careful consideration, we've decided to move forward with other candidates for this role.</p>
      <p>We truly appreciated learning about your experience and wish you the best in your job search.</p>
      <p>Warm regards,</p>
      <p>${plainChip(ctx.senderName)}</p>
    `,
  };

  return renderers[key](context);
}

// ---------------------------------------------------------------------------
// Selection helpers
// ---------------------------------------------------------------------------

function captureRange(editor: HTMLElement): Range | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function rangeIsValid(editor: HTMLElement, range: Range | null): boolean {
  if (!range) return false;
  return (
    editor.contains(range.startContainer) && editor.contains(range.endContainer)
  );
}

// Finds the last editable paragraph-like element (outside any locked box).
function findLastEditableBlock(editor: HTMLElement): HTMLElement | null {
  const blocks = editor.querySelectorAll<HTMLElement>("p, li, h1, h2, h3, div");
  for (let i = blocks.length - 1; i >= 0; i--) {
    const el = blocks[i];
    if (el.closest('[contenteditable="false"]')) continue;
    if (el === editor) continue;
    return el;
  }
  return null;
}

function restoreRange(editor: HTMLElement, saved: Range | null) {
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();

  if (rangeIsValid(editor, saved)) {
    let range = saved!;
    // If the caret sits directly in the editor (between block elements),
    // redirect it to the end of the nearest preceding editable block so
    // inline insertions don't create a new block.
    if (range.startContainer === editor) {
      const offset = range.startOffset;
      const childBefore = editor.childNodes[offset - 1] as
        | HTMLElement
        | undefined;
      const childAfter = editor.childNodes[offset] as HTMLElement | undefined;
      const target =
        (childBefore && !isLockedNode(childBefore) ? childBefore : null) ??
        (childAfter && !isLockedNode(childAfter) ? childAfter : null);
      if (target) {
        range = document.createRange();
        range.selectNodeContents(target);
        range.collapse(target === childBefore ? false : true);
      }
    }
    sel.addRange(range);
    editor.focus();
    return;
  }

  const fallback = findLastEditableBlock(editor) ?? editor;
  const range = document.createRange();
  range.selectNodeContents(fallback);
  range.collapse(false);
  sel.addRange(range);
  editor.focus();
}

function isLockedNode(node: Node | null | undefined): boolean {
  return (
    !!node &&
    node.nodeType === Node.ELEMENT_NODE &&
    (node as HTMLElement).getAttribute("contenteditable") === "false"
  );
}

// ---------------------------------------------------------------------------
// Format toolbar
// ---------------------------------------------------------------------------

function ToolbarIconButton({
  tooltip,
  onClick,
  children,
}: {
  tooltip: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function FormatToolbar({
  onExec,
  onInsertVariable,
  leading,
  trailing,
}: {
  onExec: (cmd: string) => void;
  onInsertVariable: (key: EmailVariableKey) => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-0.5 border-t bg-background px-2 py-1.5">
      {leading}
      {leading && <Separator orientation="vertical" className="mx-1 !h-5" />}
      <ToolbarIconButton tooltip="Bold (⌘B)" onClick={() => onExec("bold")}>
        <Bold className="size-4" />
      </ToolbarIconButton>
      <ToolbarIconButton tooltip="Italic (⌘I)" onClick={() => onExec("italic")}>
        <Italic className="size-4" />
      </ToolbarIconButton>
      <ToolbarIconButton
        tooltip="Underline (⌘U)"
        onClick={() => onExec("underline")}
      >
        <UnderlineIcon className="size-4" />
      </ToolbarIconButton>

      <Separator orientation="vertical" className="mx-1 !h-5" />

      <ToolbarIconButton
        tooltip="Bullet list"
        onClick={() => onExec("insertUnorderedList")}
      >
        <List className="size-4" />
      </ToolbarIconButton>
      <ToolbarIconButton
        tooltip="Numbered list"
        onClick={() => onExec("insertOrderedList")}
      >
        <ListOrdered className="size-4" />
      </ToolbarIconButton>

      <Separator orientation="vertical" className="mx-1 !h-5" />

      <ToolbarIconButton tooltip="Outdent" onClick={() => onExec("outdent")}>
        <Outdent className="size-4" />
      </ToolbarIconButton>
      <ToolbarIconButton tooltip="Indent" onClick={() => onExec("indent")}>
        <Indent className="size-4" />
      </ToolbarIconButton>

      <Separator orientation="vertical" className="mx-1 !h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Plus className="size-3.5" />
            Add variable
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Insert variable
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {VARIABLE_OPTIONS.map((v) => (
            <DropdownMenuItem
              key={v.key}
              onSelect={() => onInsertVariable(v.key)}
            >
              {v.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {trailing && <div className="ml-auto flex items-center">{trailing}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main composer
// ---------------------------------------------------------------------------

export function EmailComposer({
  initialTemplate,
  context,
  recipientName,
  recipientEmail,
  className,
  footerLeading,
  footerTrailing,
  onTemplateChange,
  customBodyHtml,
}: {
  initialTemplate: EmailTemplateKey;
  context: EmailContext;
  recipientName: string;
  recipientEmail: string;
  className?: string;
  footerLeading?: React.ReactNode;
  footerTrailing?: React.ReactNode;
  onTemplateChange?: (key: EmailTemplateKey) => void;
  /** When provided, the initial body uses this HTML instead of the template.
   * The template dropdown shows "Custom draft" until the user picks a preset. */
  customBodyHtml?: string;
}) {
  const [templateKey, setTemplateKey] =
    useState<EmailTemplateKey>(initialTemplate);
  const [isCustom, setIsCustom] = useState(customBodyHtml != null);
  const [renderKey, setRenderKey] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const initialHtml = compactHtml(
    isCustom && customBodyHtml
      ? customBodyHtml
      : TEMPLATES[templateKey].render(context),
  );

  const handleTemplateChange = useCallback(
    (key: EmailTemplateKey) => {
      savedRangeRef.current = null;
      setTemplateKey(key);
      setIsCustom(false);
      setRenderKey((k) => k + 1);
      onTemplateChange?.(key);
    },
    [onTemplateChange],
  );

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const captured = captureRange(editor);
    if (captured) savedRangeRef.current = captured;
  }, []);

  // Delegate clicks for chip-delete buttons.
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const del = target.closest<HTMLElement>("[data-chip-delete]");
    if (!del) return;
    e.preventDefault();
    const chip = del.closest<HTMLElement>("[data-variable-chip]");
    chip?.remove();
  }, []);

  const exec = useCallback((cmd: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    restoreRange(editor, savedRangeRef.current);
    document.execCommand(cmd, false);
    savedRangeRef.current = captureRange(editor);
  }, []);

  const insertVariable = useCallback(
    (key: EmailVariableKey) => {
      const editor = editorRef.current;
      if (!editor) return;
      restoreRange(editor, savedRangeRef.current);
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const template = document.createElement("template");
      template.innerHTML = chipHtml(context[key], key) + "\u00A0";
      const nodes = Array.from(template.content.childNodes);
      const lastNode = nodes[nodes.length - 1];
      range.insertNode(template.content);

      if (lastNode) {
        range.setStartAfter(lastNode);
        range.setEndAfter(lastNode);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      savedRangeRef.current = captureRange(editor);
    },
    [context],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Drop whitespace-only text nodes at the top level so the caret can't land
    // outside a block element (which would make insertions create new blocks).
    Array.from(editor.childNodes).forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent?.trim()) {
        n.remove();
      }
    });
    editor.querySelectorAll("p:empty, div:empty").forEach((n) => n.remove());
  }, [renderKey]);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card",
        className,
      )}
    >
      {/* Template bar */}
      <div className="flex items-center border-b px-4 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-foreground outline-none"
            >
              Template: {isCustom ? "Custom draft" : TEMPLATES[templateKey].label}
              <ChevronDown className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {(Object.keys(TEMPLATES) as EmailTemplateKey[]).map((k) => (
              <DropdownMenuItem
                key={k}
                onSelect={() => handleTemplateChange(k)}
              >
                {TEMPLATES[k].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* To field */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className={CHIP_CLASSES}>
            {recipientName} ({recipientEmail})
            <X className="size-3 cursor-pointer" />
          </span>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-primary"
        >
          CC/BCC
        </button>
      </div>

      {/* Editable body */}
      <div
        ref={editorRef}
        key={renderKey}
        contentEditable
        suppressContentEditableWarning
        onClick={handleEditorClick}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={saveSelection}
        className={cn(
          "email-composer-body flex-1 overflow-y-auto px-4 py-3 text-base leading-relaxed text-black",
          "focus:outline-none",
        )}
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />

      {/* Format toolbar */}
      <FormatToolbar
        onExec={exec}
        onInsertVariable={insertVariable}
        leading={footerLeading}
        trailing={footerTrailing}
      />
    </div>
  );
}

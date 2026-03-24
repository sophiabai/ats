import * as React from "react";
import type { Value, TElement, TText } from "platejs";
import { KEYS } from "platejs";
import { Plate, usePlateEditor, ParagraphPlugin } from "platejs/react";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  H2Plugin,
  H3Plugin,
  BlockquotePlugin,
} from "@platejs/basic-nodes/react";
import { ListPlugin } from "@platejs/list/react";
import { ListStyleType, toggleList, someList } from "@platejs/list";
import { IndentPlugin } from "@platejs/indent/react";
import { useEditorRef, useEditorSelector } from "platejs/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import {
  UndoToolbarButton,
  RedoToolbarButton,
} from "@/components/ui/history-toolbar-button";
import { ToolbarButton, ToolbarGroup } from "@/components/ui/toolbar";
import { H2Element, H3Element } from "@/components/ui/heading-node";
import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { ParagraphElement } from "@/components/ui/paragraph-node";
import { BlockList } from "@/components/ui/block-list";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// --- Slate → HTML serialization ---

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serializeLeaf(node: TText): string {
  let html = escapeHtml(node.text);
  if (!html) return html;
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;
  return html;
}

function serializeChildren(children: any[]): string {
  return (children || [])
    .map((c: any) => {
      if ("text" in c && !("type" in c)) return serializeLeaf(c as TText);
      return serializeElement(c as TElement);
    })
    .join("");
}

function serializeElement(el: TElement): string {
  const children = serializeChildren(el.children as any[]);
  switch (el.type) {
    case "h2":
      return `<h2>${children}</h2>`;
    case "h3":
      return `<h3>${children}</h3>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    default:
      return `<p>${children}</p>`;
  }
}

function serializeToHtml(value: Value): string {
  const results: string[] = [];
  let listBuffer: { el: TElement; ordered: boolean }[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    const ordered = listBuffer[0].ordered;
    const tag = ordered ? "ol" : "ul";
    const items = listBuffer
      .map((item) => {
        const children = serializeChildren(item.el.children as any[]);
        return `<li>${children}</li>`;
      })
      .join("");
    results.push(`<${tag}>${items}</${tag}>`);
    listBuffer = [];
  }

  for (const node of value) {
    const el = node as TElement;
    if (el.listStyleType) {
      const ordered = [
        ListStyleType.Decimal,
        "lower-alpha",
        "upper-alpha",
        "lower-roman",
        "upper-roman",
      ].includes(el.listStyleType as string);
      if (listBuffer.length > 0 && listBuffer[0].ordered !== ordered) {
        flushList();
      }
      listBuffer.push({ el, ordered });
    } else {
      flushList();
      results.push(serializeElement(el));
    }
  }
  flushList();

  return results.join("");
}

function htmlToSlate(editor: any, html: string): Value {
  if (!html || !html.trim()) {
    return [{ type: "p", children: [{ text: "" }] }];
  }
  try {
    const value = editor.api.html.deserialize({ element: html });
    if (Array.isArray(value) && value.length > 0) return value as Value;
  } catch {
    // fall through
  }
  return [{ type: "p", children: [{ text: "" }] }];
}

// --- Toolbar (rendered inside Plate context) ---

const TARGET_PLUGINS = [...KEYS.heading, KEYS.p, KEYS.blockquote];

function EditorToolbar() {
  const editor = useEditorRef();
  const bulletPressed = useEditorSelector(
    (editor) => someList(editor as any, [ListStyleType.Disc]),
    [],
  );
  const orderedPressed = useEditorSelector(
    (editor) => someList(editor as any, [ListStyleType.Decimal]),
    [],
  );

  return (
    <FixedToolbar className="justify-start rounded-t-lg p-1">
      <ToolbarGroup>
        <ToolbarButton
          tooltip="Heading 2"
          onClick={() => editor.tf.toggleBlock("h2")}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
          <Bold className="size-4" />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
          <Italic className="size-4" />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
          <UnderlineIcon className="size-4" />
        </MarkToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          tooltip="Bullet list"
          pressed={bulletPressed}
          onClick={() =>
            toggleList(editor as any, {
              listStyleType: ListStyleType.Disc,
            })
          }
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Numbered list"
          pressed={orderedPressed}
          onClick={() =>
            toggleList(editor as any, {
              listStyleType: ListStyleType.Decimal,
            })
          }
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <div className="flex-1" />

      <ToolbarGroup>
        <UndoToolbarButton />
        <RedoToolbarButton />
      </ToolbarGroup>
    </FixedToolbar>
  );
}

// --- Main component ---

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const contentRef = React.useRef(content);
  const [key, setKey] = React.useState(0);

  const plugins = React.useMemo(
    () => [
      ParagraphPlugin.withComponent(ParagraphElement),
      H2Plugin.configure({
        node: { component: H2Element },
        rules: { break: { empty: "reset" } },
      }),
      H3Plugin.configure({
        node: { component: H3Element },
        rules: { break: { empty: "reset" } },
      }),
      BlockquotePlugin.configure({
        node: { component: BlockquoteElement },
      }),
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      IndentPlugin.configure({
        inject: { targetPlugins: TARGET_PLUGINS },
        options: { offset: 24 },
      }),
      ListPlugin.configure({
        inject: { targetPlugins: TARGET_PLUGINS },
        render: {
          belowNodes: BlockList as any,
        },
      }),
    ],
    [],
  );

  const editor = usePlateEditor({
    id: `rich-text-editor-${key}`,
    plugins,
  });

  // When external content changes (e.g. AI generation), remount the editor
  React.useEffect(() => {
    if (content !== contentRef.current) {
      contentRef.current = content;
      setKey((k) => k + 1);
    }
  }, [content]);

  // Set initial value after editor is ready
  React.useEffect(() => {
    if (contentRef.current) {
      const value = htmlToSlate(editor, contentRef.current);
      editor.tf.setValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const handleChange = React.useCallback(
    ({ value }: { value: Value }) => {
      const html = serializeToHtml(value);
      contentRef.current = html;
      onChangeRef.current(html);
    },
    [],
  );

  return (
    <div
      className={cn(
        "rounded-md border bg-background focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      <Plate editor={editor} onChange={handleChange}>
        <EditorToolbar />
        <div className="max-h-[40vh] overflow-y-auto">
          <EditorContainer className="h-auto">
            <Editor
              variant="none"
              className="prose prose-sm dark:prose-invert max-w-none px-3 py-2 min-h-[260px] focus:outline-none"
              placeholder={placeholder}
            />
          </EditorContainer>
        </div>
      </Plate>
    </div>
  );
}

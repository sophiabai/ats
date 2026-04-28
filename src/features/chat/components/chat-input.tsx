import {
  useCallback,
  useEffect,
  useRef as useReactRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { ArrowUp, Mic, Paperclip, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputWrapperBaseClass = cn(
  "flex items-center gap-2 rounded-2xl border px-4 py-4 shadow-2xl",
  "focus-within:ring-2 focus-within:ring-ring/50",
);

const inputWrapperClass = cn(inputWrapperBaseClass, "bg-background");

const inputBarWrapperClass = cn(inputWrapperBaseClass, "bg-card");

const textareaClass = cn(
  "flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
);

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  /** Bar variant: icon buttons (paperclip, mic, arrow). Nav: compact search bar. Default: Send button. */
  variant?: "default" | "bar" | "nav";
  /** Controlled value (e.g. for quick actions that prefill). */
  value?: string;
  onChange?: (value: string) => void;
  inputRef?: Ref<HTMLTextAreaElement>;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  activeCommand?: string | null;
  onClearCommand?: () => void;
}

export function ChatInput({
  onSend,
  disabled,
  variant = "default",
  value: controlledValue,
  onChange,
  inputRef,
  onKeyDown: onKeyDownProp,
  activeCommand,
  onClearCommand,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const setValue =
    isControlled && onChange
      ? (v: string) => onChange(v)
      : setInternalValue;

  const trimmed = value.trim();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    if (!isControlled) setInternalValue("");
    else onChange?.("");
  }

  const [commandText, setCommandText] = useState("");

  useEffect(() => {
    setCommandText(activeCommand ? `/${activeCommand}` : "");
  }, [activeCommand]);

  const commandPrefix = commandText ? commandText + " " : "";
  const fullValue = commandPrefix + value;

  function handleFullValueChange(raw: string) {
    if (!commandText) {
      setValue(raw);
      return;
    }
    if (raw.startsWith(commandPrefix)) {
      setValue(raw.slice(commandPrefix.length));
      return;
    }
    let match = 0;
    for (let i = 0; i < Math.min(commandText.length, raw.length); i++) {
      if (raw[i] === commandText[i]) match = i + 1;
      else break;
    }
    if (match === 0) {
      setCommandText("");
      onClearCommand?.();
      setValue(raw);
    } else if (match === commandText.length && raw.length <= commandPrefix.length) {
      // Deleted the separator space (or nothing after the command) — trim one char
      const shortened = commandText.slice(0, -1);
      if (!shortened) {
        setCommandText("");
        onClearCommand?.();
      } else {
        setCommandText(shortened);
      }
      setValue("");
    } else {
      setCommandText(commandText.slice(0, match));
      setValue(raw.slice(match).replace(/^\s+/, ""));
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDownProp?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Backspace" && commandText && !value) {
      e.preventDefault();
      let shortened: string;
      if (e.altKey) {
        // Option+Backspace: delete previous word
        shortened = commandText.replace(/\s*\S+$/, "");
      } else if (e.metaKey) {
        // Cmd+Backspace: delete everything
        shortened = "";
      } else {
        shortened = commandText.slice(0, -1);
      }
      if (!shortened) {
        setCommandText("");
        onClearCommand?.();
      } else {
        setCommandText(shortened);
      }
      return;
    }
    if (e.key === "Escape" && commandText && !value) {
      e.preventDefault();
      setCommandText("");
      onClearCommand?.();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (commandText && !trimmed) {
        onSend("");
        return;
      }
      if (trimmed && !disabled) {
        onSend(trimmed);
        if (!isControlled) setInternalValue("");
        else onChange?.("");
      }
    }
  }

  const internalRef = useReactRef<HTMLTextAreaElement | null>(null);

  const mergedRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef && typeof inputRef === "object")
        (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    },
    [inputRef],
  );

  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, commandText]);

  const handleScroll = useCallback(() => {
    const ta = internalRef.current;
    const mirror = mirrorRef.current;
    if (ta && mirror) mirror.scrollTop = ta.scrollTop;
  }, []);

  const mirrorRef = useReactRef<HTMLDivElement | null>(null);

  if (variant === "nav") {
    return (
      <div className="flex h-9 items-center gap-1.5 rounded-lg bg-top-nav-muted px-3 focus-within:ring-2 focus-within:ring-ring/50">
        <Search className="size-4 shrink-0 text-top-nav-foreground/70" />
        <div className="relative min-w-0 flex-1">
          {commandText && (
            <div
              ref={mirrorRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-nowrap text-sm"
            >
              <span className="text-berry-500">{commandPrefix}</span>
              <span>{value || ""}</span>
            </div>
          )}
          <input
            ref={mergedRef as React.Ref<HTMLInputElement>}
            type="text"
            value={commandText ? fullValue : value}
            onChange={(e) =>
              commandText
                ? handleFullValueChange(e.target.value)
                : setValue(e.target.value)
            }
            onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler<HTMLInputElement>}
            placeholder={commandText ? "Describe the role, or press Enter to skip" : ""}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              commandText &&
                "text-transparent caret-foreground [&::placeholder]:text-muted-foreground [&::selection]:bg-ring/20",
            )}
          />
        </div>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div className={inputBarWrapperClass}>
        <div className="relative min-w-0 flex-1">
          {commandText && (
            <div
              ref={mirrorRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words py-1 text-sm"
            >
              <span className="text-berry-500">
                {commandPrefix}
              </span>
              <span>{value || ""}</span>
            </div>
          )}
          <textarea
            ref={mergedRef}
            value={commandText ? fullValue : value}
            onChange={(e) =>
              commandText
                ? handleFullValueChange(e.target.value)
                : setValue(e.target.value)
            }
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder={
              commandText
                ? "Describe the role, or press Enter to skip"
                : "Search, ask, or type / for actions"
            }
            disabled={disabled}
            rows={1}
            className={cn(
              textareaClass,
              "block w-full",
              commandText &&
                "text-transparent caret-foreground [&::placeholder]:text-muted-foreground [&::selection]:bg-ring/20",
            )}
            style={{ maxHeight: "40vh" }}
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            type="button"
          >
            <Paperclip className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            type="button"
          >
            <Mic className="size-4" />
          </Button>
          {(trimmed || commandText) && (
            <Button
              size="icon-xs"
              className="ml-0.5"
              onClick={() => {
                onSend(trimmed);
                if (!isControlled) setInternalValue("");
                else onChange?.("");
              }}
              disabled={disabled}
              type="button"
            >
              <ArrowUp className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className={inputWrapperClass}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className={cn(textareaClass, "min-w-0")}
        />
      </div>
      <Button
        type="submit"
        disabled={!trimmed || disabled}
        className="self-end"
      >
        Send
      </Button>
    </form>
  );
}

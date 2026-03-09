import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { ArrowUp, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputWrapperClass = cn(
  "flex items-end gap-2 rounded-4xl border bg-background px-4 py-3 transition-shadow",
  "focus-within:ring-2 focus-within:ring-ring/50",
);

const textareaClass = cn(
  "flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
);

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  /** Bar variant: icon buttons (paperclip, mic, arrow). Default: Send button. */
  variant?: "default" | "bar";
  /** Controlled value (e.g. for quick actions that prefill). */
  value?: string;
  onChange?: (value: string) => void;
  inputRef?: Ref<HTMLTextAreaElement>;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatInput({
  onSend,
  disabled,
  variant = "default",
  value: controlledValue,
  onChange,
  inputRef,
  onKeyDown: onKeyDownProp,
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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDownProp?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (trimmed && !disabled) {
        onSend(trimmed);
        if (!isControlled) setInternalValue("");
        else onChange?.("");
      }
    }
  }

  if (variant === "bar") {
    return (
      <div className={inputWrapperClass}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search, ask, or type / for actions"
          disabled={disabled}
          rows={2}
          className={textareaClass}
        />
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
          {trimmed && (
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

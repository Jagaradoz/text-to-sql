import React, { FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";

interface QueryFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  error: string | null;
}

export function QueryForm({
  input,
  setInput,
  isLoading,
  onSubmit,
  apiKey,
  setApiKey,
  error,
}: QueryFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-4 gap-4 items-start">
        <div className="col-span-3 flex flex-col gap-2">
          <div className="rounded-md border border-border bg-card px-4 py-3 transition-focus focus-within:ring-1 focus-within:ring-ring">
            <input
              id="prompt-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Show total revenue by product category..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-3 ml-1">
            <p className="text-[11px] font-medium tracking-wider text-neutral-500">
              Press {typeof window !== "undefined" && navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+Enter to run
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="OpenAI API Key"
              className="rounded border border-border bg-transparent px-2 py-1 text-[11px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <button
          id="execute-btn"
          type="submit"
          disabled={isLoading || input.trim().length === 0}
          className="col-span-1 inline-flex h-[46px] items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-bold uppercase tracking-widest text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Running
            </>
          ) : (
            <>
              Execute
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}
    </form>
  );
}

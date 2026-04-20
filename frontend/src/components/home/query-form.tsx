import React, { FormEvent } from "react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";

interface QueryFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error: string | null;
  provider: string;
  activeModel: string;
  apiKey: string;
}

export function QueryForm({
  input,
  setInput,
  isLoading,
  onSubmit,
  error,
  provider,
  activeModel,
  apiKey,
}: QueryFormProps) {
  const isConfigured = apiKey.startsWith("sk-") || apiKey.startsWith("AIza");

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
          <div className="flex items-center gap-3 ml-1 min-h-[14px]">
            {isConfigured ? (
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {provider}: {activeModel}
              </div>
            ) : (
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-400/60">
                No API Key configured
              </div>
            )}
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

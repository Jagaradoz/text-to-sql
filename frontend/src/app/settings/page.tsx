"use client";

import { useAppStore } from "@/store/useAppStore";
import { Key, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

const MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", desc: "Fast and extremely cheap (Google)" },
  { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash-8B", provider: "google", desc: "Ultra-fast and cheapest (Google)" },
  { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", provider: "google", desc: "Legacy cheap model (Google)" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", desc: "Most capable cheap model (OpenAI)" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", desc: "Legacy fast model (OpenAI)" },
  { id: "gpt-3.5-turbo-16k", name: "GPT-3.5 Turbo 16k", provider: "openai", desc: "Legacy with larger context (OpenAI)" },
] as const;

export default function SettingsPage() {
  const apiKey = useAppStore((state) => state.apiKey);
  const setApiKey = useAppStore((state) => state.setApiKey);
  const provider = useAppStore((state) => state.provider);
  const setProvider = useAppStore((state) => state.setProvider);
  const activeModel = useAppStore((state) => state.activeModel);
  const setActiveModel = useAppStore((state) => state.setActiveModel);

  const [localKey, setLocalKey] = useState(apiKey);

  // Sync local state when store hydrates
  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  const handleKeyChange = (val: string) => {
    setLocalKey(val);
    setApiKey(val);

    if (val.startsWith("sk-")) {
      setProvider("openai");
      if (provider !== "openai") {
        setActiveModel("gpt-4o-mini");
      }
    } else if (val.startsWith("AIza")) {
      setProvider("google");
      if (provider !== "google") {
        setActiveModel("gemini-1.5-flash");
      }
    }
  };

  const detectedProvider = localKey.startsWith("sk-") ? "openai" : localKey.startsWith("AIza") ? "google" : null;
  const visibleModels = detectedProvider ? MODELS.filter((model) => model.provider === detectedProvider) : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Configure your AI provider and model preferences.</p>
      </div>

      <div className="space-y-15">
        {/* API Key Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Key className="h-3.5 w-3.5" />
            API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={localKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="Enter your OpenAI (sk-...) or Gemini (AIza...) key..."
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm focus:ring-1 focus:ring-ring outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
            Your key is stored locally in your browser. It is only sent to the backend for AI generation requests.
          </p>
        </div>

        {/* Model Selection Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Active Models
          </label>
          {visibleModels.length > 0 ? (
            <div className="grid gap-3">
              {visibleModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setActiveModel(model.id);
                    setProvider(model.provider);
                  }}
                  className={`flex items-start justify-between rounded-md border p-4 text-left transition-all ${activeModel === model.id
                    ? "border-foreground bg-secondary/50 ring-1 ring-foreground"
                    : "border-border bg-card hover:border-muted-foreground/50"
                    }`}
                >
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide">{model.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{model.desc}</p>
                  </div>
                  {activeModel === model.id && (
                    <Wand2 className="h-4 w-4 text-foreground" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-md p-32 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                Enter a valid API key above to see available models.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { MessageSquare, Send, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col pt-12">
      {/* Header section */}
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">How can I help you with your data?</h2>
          <p className="text-muted-foreground">Ask questions about orders, revenue, or user growth to get instant insights.</p>
        </div>
      </div>

      {/* Main query area */}
      <div className="flex-1 max-w-2xl w-full mx-auto space-y-8">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-card border border-border rounded-xl p-2 pl-4 shadow-2xl">
            <MessageSquare className="w-5 h-5 text-muted-foreground mr-3" />
            <input 
              type="text" 
              placeholder="e.g. Total revenue by month for the last year..." 
              className="flex-1 bg-transparent border-none outline-none text-sm py-3"
            />
            <button className="bg-primary text-primary-foreground p-2.5 rounded-lg hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Top 5 products by revenue", "Users from USA", "Monthly order growth"].map((tip) => (
            <button key={tip} className="px-3 py-1.5 rounded-full border border-border bg-secondary/30 text-[11px] font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all">
              {tip}
            </button>
          ))}
        </div>
      </div>

      {/* Results placeholder (Phase 5) */}
      <div className="mt-16 flex-1 flex items-center justify-center border-t border-border/50 py-12">
        <div className="text-center space-y-2 opacity-20">
          <p className="text-sm font-medium">Workspace</p>
          <p className="text-xs">Results will appear here after your first query</p>
        </div>
      </div>
    </div>
  );
}


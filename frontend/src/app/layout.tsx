import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Text-to-SQL Assistant",
  description: "AI-powered database analysis system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={`${inter.className} h-full bg-background text-foreground flex overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-80 border-r border-border bg-card flex flex-col h-full shrink-0">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold tracking-tight">Data Assistant</h1>
            <p className="text-xs text-muted-foreground mt-1">v1.0.0 Phase 4</p>
          </div>
          
          <div className="flex-1 overflow-y-auto scroll-thin p-4 space-y-6">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-3">Database Schema</h2>
              <div className="space-y-1">
                {/* Schema items will go here */}
                <div className="px-2 py-1.5 text-sm text-muted-foreground italic">Connect to backend to view...</div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-3">Recent Queries</h2>
              <div className="space-y-1">
                {/* History items will go here */}
                <div className="px-2 py-1.5 text-sm text-muted-foreground italic">No history yet</div>
              </div>
            </section>
          </div>

          <div className="p-4 border-t border-border">
             <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-secondary/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">AI</span>
                </div>
                <div>
                  <div className="text-xs font-medium">Model Status</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase">GPT-4o Connected</span>
                  </div>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-y-auto bg-background">
          <div className="w-full max-w-4xl h-full flex flex-col">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}


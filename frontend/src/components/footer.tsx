export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 mt-auto">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">
            Text-to-SQL
          </h3>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            © 2025 All Rights Reserved
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 md:items-end">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Created By
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
            Jagaradoz
          </span>
        </div>
      </div>
    </footer>
  );
}


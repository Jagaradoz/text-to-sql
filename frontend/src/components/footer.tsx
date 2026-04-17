export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 mt-auto">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-sm font-light">
            Text-to-SQL
          </h3>
          <p className="text-sm font-medium text-muted-foreground/60">
            © 2025 All Rights Reserved
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 md:items-end">
          <span className="text-sm font-light text-muted-foreground/40">
            Created By
          </span>
          <span className="text-sm font-medium">
            Jagaradoz
          </span>
        </div>
      </div>
    </footer>
  );
}


export function Footer() {
  return (
    <footer className="w-full py-6">
      <div className="centered-layout">
        <div className="flex items-center justify-between rounded-md border border-border bg-card px-6 py-4">
          <p className="text-xs text-muted-foreground">
            © 2025 Text-to-SQL
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              PRIVACY
            </a>
            <a
              href="#"
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              TERMS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

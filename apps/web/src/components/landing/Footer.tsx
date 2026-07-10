import { CloudSun } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
              <CloudSun className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="font-bold">EMA</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Estações Meteorológicas Automatizadas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}


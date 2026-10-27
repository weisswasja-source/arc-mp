import { Logo } from '@/components/site-header'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="raider-stripes h-1" />
      <div className="mx-auto flex max-w-content flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <p className="max-w-md text-xs text-muted-foreground">
          Fan-Projekt von Raidern für Raider. Nicht mit Embark Studios
          verbunden. Arc Raiders ist eine Marke der jeweiligen Rechteinhaber.
        </p>
      </div>
    </footer>
  )
}

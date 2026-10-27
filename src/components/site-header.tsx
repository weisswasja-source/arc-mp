import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LogOut, Menu, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AuthDialog } from '@/components/auth-dialog'
import { CreateListingDialog } from '@/components/market/create-listing-dialog'
import { PlayerAvatar } from '@/components/market/player-badge'
import { useSession } from '@/lib/session'

const NAV = [
  { to: '/markt', label: 'Marktplatz' },
  { to: '/tausch', label: 'Meine Tauschgeschäfte' },
] as const

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Raider Exchange – Startseite">
      <span aria-hidden className="flex h-7 flex-col justify-between">
        {['bg-stripe-red', 'bg-stripe-yellow', 'bg-stripe-green', 'bg-stripe-cyan'].map((c) => (
          <span key={c} className={`block h-1 w-5 -skew-x-[30deg] ${c}`} />
        ))}
      </span>
      <span className="font-display text-xl leading-none font-extrabold tracking-wider uppercase">
        Raider<span className="text-primary">Exchange</span>
      </span>
    </Link>
  )
}

export function SiteHeader() {
  const { player, signOut, setAuthOpen, requireAuth, offers } = useSession()
  const [createOpen, setCreateOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const incoming = player
    ? offers.filter((o) => o.toId === player.id && o.status === 'pending').length
    : 0

  const openCreate = () => requireAuth(() => setCreateOpen(true))

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
              activeProps={{ className: 'text-foreground' }}
            >
              {n.label}
              {n.to === '/tausch' && incoming > 0 && (
                <span className="ml-1.5 rounded-full bg-stripe-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {incoming}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={openCreate} className="hidden sm:inline-flex">
            <Plus />
            Angebot erstellen
          </Button>
          {player ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Kontomenü">
                  <PlayerAvatar player={player} className="size-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {player.name}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {player.platform} · {player.region}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/tausch">Meine Tauschgeschäfte</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
              Anmelden
            </Button>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menü öffnen">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-display uppercase tracking-wide">Menü</SheetTitle>
                <SheetDescription>Navigiere durch die Tauschbörse.</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-1 px-4">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2.5 font-medium hover:bg-accent"
                  >
                    {n.label}
                  </Link>
                ))}
                <Button
                  className="mt-4"
                  onClick={() => {
                    setMenuOpen(false)
                    openCreate()
                  }}
                >
                  <Plus />
                  Angebot erstellen
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <AuthDialog />
      <CreateListingDialog open={createOpen} onOpenChange={setCreateOpen} />
    </header>
  )
}

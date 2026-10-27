import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PackageOpen, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListingCard } from '@/components/market/listing-card'
import { CATEGORIES, RARITIES, getItem } from '@/data/catalog'
import type { Category, Listing, Platform, Rarity } from '@/data/types'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/markt')({
  head: () => ({ meta: [{ title: 'Marktplatz – Raider Exchange' }] }),
  component: Marketplace,
})

const RARITY_ORDER: Rarity[] = RARITIES.map((r) => r.id)

function Marketplace() {
  const { listings, getPlayer } = useSession()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [rarity, setRarity] = useState<Rarity | 'all'>('all')
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [sort, setSort] = useState<'new' | 'rarity'>('new')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = listings.filter((l) => {
      if (l.status !== 'open') return false
      const items = [...l.offer, ...l.want].map((s) => getItem(s.itemId))
      const offered = l.offer.map((s) => getItem(s.itemId))
      if (q && !items.some((i) => i.name.toLowerCase().includes(q))) return false
      if (category !== 'all' && !offered.some((i) => i.category === category)) return false
      if (rarity !== 'all' && !offered.some((i) => i.rarity === rarity)) return false
      if (platform !== 'all' && getPlayer(l.sellerId).platform !== platform) return false
      return true
    })
    const topRarity = (l: Listing) =>
      Math.max(...l.offer.map((s) => RARITY_ORDER.indexOf(getItem(s.itemId).rarity)))
    return [...filtered].sort((a, b) =>
      sort === 'new'
        ? b.createdAt.localeCompare(a.createdAt)
        : topRarity(b) - topRarity(a),
    )
  }, [listings, getPlayer, query, category, rarity, platform, sort])

  const hasFilters =
    query !== '' || category !== 'all' || rarity !== 'all' || platform !== 'all'

  const reset = () => {
    setQuery('')
    setCategory('all')
    setRarity('all')
    setPlatform('all')
  }

  return (
    <main className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-wide uppercase md:text-5xl">
            Marktplatz
          </h1>
          <p className="mt-1 text-muted-foreground">
            Finde Raider, die haben, was du brauchst.
          </p>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Kategorie">
        {[{ id: 'all' as const, label: 'Alle' }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              'rounded-sm border px-3 py-1.5 font-display text-sm font-semibold tracking-wide uppercase transition-colors motion-reduce:transition-none',
              category === c.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-md border border-border bg-card p-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nach Items suchen, z. B. Anvil oder ARC-Legierung"
            aria-label="Angebote durchsuchen"
            className="pl-9"
          />
        </div>
        <Select value={rarity} onValueChange={(v) => setRarity(v as Rarity | 'all')}>
          <SelectTrigger aria-label="Seltenheit" className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Seltenheiten</SelectItem>
            {RARITIES.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={(v) => setPlatform(v as Platform | 'all')}>
          <SelectTrigger aria-label="Plattform" className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Plattformen</SelectItem>
            <SelectItem value="PC">PC</SelectItem>
            <SelectItem value="PlayStation">PlayStation</SelectItem>
            <SelectItem value="Xbox">Xbox</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as 'new' | 'rarity')}>
          <SelectTrigger aria-label="Sortierung" className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Neueste zuerst</SelectItem>
            <SelectItem value="rarity">Seltenste zuerst</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? 'Angebot' : 'Angebote'}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X />
            Filter zurücksetzen
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-4 grid place-items-center rounded-md border border-dashed border-border px-6 py-20 text-center">
          <PackageOpen className="size-10 text-muted-foreground" aria-hidden />
          <p className="mt-4 font-display text-xl font-bold uppercase">
            Nichts gefunden
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Für diese Filter gibt es gerade keine Angebote. Versuch es mit
            anderen Filtern oder stell selbst ein Angebot ein.
          </p>
          <Button variant="outline" className="mt-6" onClick={reset}>
            Filter zurücksetzen
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </main>
  )
}

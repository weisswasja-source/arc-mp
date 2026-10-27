import { useMemo, useState } from 'react'
import { Minus, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ItemIcon, RARITY_TEXT, rarityLabel } from '@/components/market/item-tile'
import { getItem } from '@/data/catalog'
import type { ItemStack } from '@/data/types'
import { cn } from '@/lib/utils'

/**
 * Searchable item list with per-item quantity steppers. `options` limits what
 * can be picked; `max` caps the quantity (e.g. what's in the inventory).
 */
export function ItemPicker({
  options,
  value,
  onChange,
  label,
}: {
  options: { itemId: string; max?: number }[]
  value: ItemStack[]
  onChange: (next: ItemStack[]) => void
  label: string
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return options.filter((o) => getItem(o.itemId).name.toLowerCase().includes(q))
  }, [options, query])

  const qtyOf = (id: string) => value.find((v) => v.itemId === id)?.qty ?? 0

  const setQty = (id: string, qty: number) => {
    const rest = value.filter((v) => v.itemId !== id)
    onChange(qty > 0 ? [...rest, { itemId: id, qty }] : rest)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Item suchen …"
          aria-label={`${label}: Item suchen`}
          className="pl-9"
        />
      </div>
      <ul
        aria-label={label}
        className="max-h-60 divide-y divide-border overflow-y-auto rounded-md border border-border"
      >
        {filtered.length === 0 && (
          <li className="p-4 text-center text-sm text-muted-foreground">
            Keine Items gefunden.
          </li>
        )}
        {filtered.map(({ itemId, max }) => {
          const item = getItem(itemId)
          const qty = qtyOf(itemId)
          const limit = max ?? 99
          return (
            <li
              key={itemId}
              className={cn(
                'flex items-center gap-3 px-3 py-2 transition-colors motion-reduce:transition-none',
                qty > 0 && 'bg-primary/10',
              )}
            >
              <ItemIcon itemId={itemId} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className={cn('text-xs', RARITY_TEXT[item.rarity])}>
                  {rarityLabel(item.rarity)}
                  {max !== undefined && (
                    <span className="text-muted-foreground"> · {max} im Lager</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${item.name} weniger`}
                  disabled={qty === 0}
                  onClick={() => setQty(itemId, qty - 1)}
                >
                  <Minus />
                </Button>
                <span className="w-6 text-center font-display text-base font-bold tabular-nums">
                  {qty}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${item.name} mehr`}
                  disabled={qty >= limit}
                  onClick={() => setQty(itemId, qty + 1)}
                >
                  <Plus />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

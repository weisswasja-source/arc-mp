import {
  Cog,
  Cpu,
  Crosshair,
  KeyRound,
  ScrollText,
  Shield,
  type LucideIcon,
} from 'lucide-react'

import { RARITIES, getItem } from '@/data/catalog'
import type { Category, ItemStack, Rarity } from '@/data/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  weapon: Crosshair,
  gear: Shield,
  material: Cog,
  arc: Cpu,
  blueprint: ScrollText,
  key: KeyRound,
}

export const RARITY_TEXT: Record<Rarity, string> = {
  common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon',
  rare: 'text-rarity-rare',
  epic: 'text-rarity-epic',
  legendary: 'text-rarity-legendary',
}

const RARITY_TILE: Record<Rarity, string> = {
  common: 'border-rarity-common/50 bg-rarity-common/10',
  uncommon: 'border-rarity-uncommon/60 bg-rarity-uncommon/10',
  rare: 'border-rarity-rare/60 bg-rarity-rare/10',
  epic: 'border-rarity-epic/60 bg-rarity-epic/10',
  legendary: 'border-rarity-legendary/70 bg-rarity-legendary/15',
}

export function rarityLabel(rarity: Rarity) {
  return RARITIES.find((r) => r.id === rarity)?.label ?? rarity
}

export function ItemIcon({
  itemId,
  size = 'md',
}: {
  itemId: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const item = getItem(itemId)
  const Icon = CATEGORY_ICON[item.category]
  return (
    <span
      aria-hidden
      className={cn(
        'relative grid shrink-0 place-items-center rounded-sm border',
        RARITY_TILE[item.rarity],
        RARITY_TEXT[item.rarity],
        size === 'sm' && 'size-8 [&_svg]:size-4',
        size === 'md' && 'size-11 [&_svg]:size-5',
        size === 'lg' && 'size-16 [&_svg]:size-8',
      )}
    >
      <Icon />
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-80" />
    </span>
  )
}

export function ItemRow({
  stack,
  size = 'md',
}: {
  stack: ItemStack
  size?: 'sm' | 'md' | 'lg'
}) {
  const item = getItem(stack.itemId)
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ItemIcon itemId={item.id} size={size} />
      <div className="min-w-0">
        <p className="truncate font-medium leading-tight">
          {stack.qty > 1 && (
            <span className="mr-1 font-display text-primary">
              {stack.qty}×
            </span>
          )}
          {item.name}
        </p>
        <p className={cn('text-xs', RARITY_TEXT[item.rarity])}>
          {rarityLabel(item.rarity)}
        </p>
      </div>
    </div>
  )
}

export function ItemStackList({
  stacks,
  size = 'md',
  empty = 'Nichts angegeben',
}: {
  stacks: ItemStack[]
  size?: 'sm' | 'md' | 'lg'
  empty?: string
}) {
  if (stacks.length === 0)
    return <p className="text-sm text-muted-foreground italic">{empty}</p>
  return (
    <div className="flex flex-col gap-2">
      {stacks.map((s) => (
        <ItemRow key={s.itemId} stack={s} size={size} />
      ))}
    </div>
  )
}

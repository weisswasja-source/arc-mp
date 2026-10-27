import { Star } from 'lucide-react'

import type { Player } from '@/data/types'
import { cn } from '@/lib/utils'

/** "Neu", "1 Deal", "12 Deals". */
export function dealsLabel(trades: number): string {
  if (trades === 0) return 'Neu'
  return `${trades} ${trades === 1 ? 'Deal' : 'Deals'}`
}

export function PlayerAvatar({
  player,
  className,
}: {
  player: Player
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary font-display text-sm font-bold uppercase',
        className,
      )}
    >
      {player.name.slice(0, 2)}
    </span>
  )
}

export function PlayerBadge({ player }: { player: Player }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <PlayerAvatar player={player} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{player.name}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {player.rating !== null && (
            <>
              <Star className="size-3 fill-primary text-primary" />
              {player.rating.toFixed(1)} ·{' '}
            </>
          )}
          {dealsLabel(player.trades)} · {player.platform}
        </p>
      </div>
    </div>
  )
}

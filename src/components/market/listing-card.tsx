import { Link } from '@tanstack/react-router'
import { ArrowRightLeft, MessageSquareMore } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ItemStackList } from '@/components/market/item-tile'
import { PlayerBadge } from '@/components/market/player-badge'
import type { Listing } from '@/data/types'
import { timeAgo } from '@/lib/format'
import { useSession } from '@/lib/session'

export function ListingCard({ listing }: { listing: Listing }) {
  const { getPlayer } = useSession()
  const seller = getPlayer(listing.sellerId)
  return (
    <Link
      to="/angebot/$listingId"
      params={{ listingId: listing.id }}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none"
    >
      <div className="raider-stripes h-1 w-full opacity-70 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <PlayerBadge player={seller} />
        <span className="shrink-0 text-xs text-muted-foreground">
          {timeAgo(listing.createdAt)}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-start gap-3 p-4">
        <div className="min-w-0">
          <p className="mb-2 font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Bietet
          </p>
          <ItemStackList stacks={listing.offer} size="sm" />
        </div>
        <ArrowRightLeft
          aria-hidden
          className="mt-8 size-4 text-primary"
        />
        <div className="min-w-0">
          <p className="mb-2 font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Sucht
          </p>
          <ItemStackList
            stacks={listing.want}
            size="sm"
            empty="Offen für Angebote"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {listing.note}
        </p>
        {listing.openToOffers && (
          <Badge variant="secondary" className="shrink-0 gap-1">
            <MessageSquareMore className="size-3" />
            Verhandelbar
          </Badge>
        )}
      </div>
    </Link>
  )
}

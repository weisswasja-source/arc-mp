import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarDays,
  Clock,
  Gamepad2,
  Globe,
  MessageSquareMore,
  Star,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ItemStackList } from '@/components/market/item-tile'
import { ListingCard } from '@/components/market/listing-card'
import { PlayerAvatar } from '@/components/market/player-badge'
import { ProposeTradeDialog } from '@/components/market/propose-trade-dialog'
import { memberSince, timeAgo } from '@/lib/format'
import { useSession } from '@/lib/session'

export const Route = createFileRoute('/angebot/$listingId')({
  head: () => ({ meta: [{ title: 'Angebot – Raider Exchange' }] }),
  component: ListingPage,
})

function ListingPage() {
  const { listingId } = Route.useParams()
  const { listings, offers, player, requireAuth, getPlayer } = useSession()
  const [proposeOpen, setProposeOpen] = useState(false)

  const listing = listings.find((l) => l.id === listingId)

  if (!listing) {
    return (
      <main className="mx-auto grid max-w-reading place-items-center px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold uppercase">
          Angebot nicht gefunden
        </h1>
        <p className="mt-2 text-muted-foreground">
          Dieses Angebot existiert nicht mehr oder wurde bereits getauscht.
        </p>
        <Button asChild className="mt-6">
          <Link to="/markt">Zum Marktplatz</Link>
        </Button>
      </main>
    )
  }

  const seller = getPlayer(listing.sellerId)
  const isOwn = player?.id === seller.id
  const alreadyProposed =
    player !== null &&
    offers.some(
      (o) =>
        o.listingId === listing.id &&
        o.fromId === player.id &&
        o.status === 'pending',
    )
  const incomingCount = offers.filter(
    (o) => o.listingId === listing.id && o.status === 'pending',
  ).length
  const more = listings
    .filter((l) => l.sellerId === seller.id && l.id !== listing.id)
    .slice(0, 3)

  return (
    <main className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link to="/markt">
          <ArrowLeft />
          Zurück zum Marktplatz
        </Link>
      </Button>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="overflow-hidden rounded-md border border-border bg-card">
          <div className="raider-stripes h-1.5" />
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" aria-hidden />
              Eingestellt {timeAgo(listing.createdAt)}
              {listing.openToOffers && (
                <Badge variant="secondary" className="ml-2 gap-1">
                  <MessageSquareMore className="size-3" />
                  Offen für Angebote
                </Badge>
              )}
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-wide uppercase md:text-4xl">
              Tauschangebot von {seller.name}
            </h1>

            <div className="mt-8 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-md border border-border bg-background/60 p-5">
                <h2 className="mb-4 font-display text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {seller.name} bietet
                </h2>
                <ItemStackList stacks={listing.offer} size="lg" />
              </div>
              <div className="grid place-items-center">
                <span className="grid size-10 place-items-center rounded-full border border-primary/50 bg-primary/10 text-primary">
                  <ArrowRightLeft className="size-5 rotate-90 md:rotate-0" aria-hidden />
                </span>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-5">
                <h2 className="mb-4 font-display text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {seller.name} sucht
                </h2>
                <ItemStackList
                  stacks={listing.want}
                  size="lg"
                  empty="Keine festen Wünsche – mach ein Angebot."
                />
              </div>
            </div>

            {listing.note && (
              <blockquote className="mt-6 border-l-2 border-primary pl-4 text-muted-foreground italic">
                „{listing.note}“
              </blockquote>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-md border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <PlayerAvatar player={seller} className="size-12 text-base" />
              <div>
                <p className="font-display text-xl font-bold">{seller.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="size-3.5 fill-primary text-primary" aria-hidden />
                  {seller.rating !== null ? `${seller.rating.toFixed(1)} aus ` : ''}{seller.trades} Deals
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Gamepad2 className="size-4 text-muted-foreground" aria-hidden />
                <dt className="sr-only">Plattform</dt>
                <dd>{seller.platform}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" aria-hidden />
                <dt className="sr-only">Region</dt>
                <dd>Region {seller.region}</dd>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                <dt className="sr-only">Mitglied seit</dt>
                <dd>Dabei seit {memberSince(seller.joined)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-md border border-primary/40 bg-primary/5 p-5">
            {isOwn ? (
              <>
                <p className="font-display text-lg font-bold uppercase">
                  Dein Angebot
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {incomingCount === 0
                    ? 'Noch keine Vorschläge eingegangen.'
                    : `${incomingCount} offene${incomingCount === 1 ? 'r' : ''} Vorschl${incomingCount === 1 ? 'ag' : 'äge'} wartet auf dich.`}
                </p>
                <Button asChild className="mt-4 w-full">
                  <Link to="/tausch">Vorschläge ansehen</Link>
                </Button>
              </>
            ) : alreadyProposed ? (
              <>
                <p className="font-display text-lg font-bold uppercase">
                  Vorschlag gesendet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {seller.name} hat deinen Vorschlag erhalten. Du wirst
                  benachrichtigt, sobald es eine Antwort gibt.
                </p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to="/tausch">Meine Tauschgeschäfte</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-bold uppercase">
                  Interesse?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stell deinen Vorschlag aus deinem Lager zusammen.
                </p>
                <Button
                  size="lg"
                  className="mt-4 w-full"
                  onClick={() => requireAuth(() => setProposeOpen(true))}
                >
                  <ArrowRightLeft />
                  Tausch vorschlagen
                </Button>
              </>
            )}
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold tracking-wide uppercase">
            Mehr von {seller.name}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {proposeOpen && (
        <ProposeTradeDialog
          listing={listing}
          open={proposeOpen}
          onOpenChange={setProposeOpen}
        />
      )}
    </main>
  )
}

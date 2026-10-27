import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, Check, Inbox, LogIn, Send, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ItemStackList } from '@/components/market/item-tile'
import { PlayerBadge } from '@/components/market/player-badge'
import type { TradeAction, TradeOffer, TradeStatus } from '@/data/types'
import { timeAgo } from '@/lib/format'
import { errorMessage, useSession } from '@/lib/session'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/tausch')({
  head: () => ({ meta: [{ title: 'Meine Tauschgeschäfte – Raider Exchange' }] }),
  component: TradesPage,
})

const STATUS: Record<TradeStatus, { label: string; className: string }> = {
  pending: { label: 'Offen', className: 'bg-stripe-yellow/15 text-stripe-yellow' },
  accepted: { label: 'Angenommen', className: 'bg-stripe-cyan/15 text-stripe-cyan' },
  withdrawn: { label: 'Zurückgezogen', className: 'bg-muted text-muted-foreground' },
  declined: { label: 'Abgelehnt', className: 'bg-stripe-red/15 text-stripe-red' },
  completed: { label: 'Abgeschlossen', className: 'bg-stripe-green/15 text-stripe-green' },
}

function TradesPage() {
  const { player, offers, setAuthOpen } = useSession()

  if (!player) {
    return (
      <main className="mx-auto grid max-w-reading place-items-center px-4 py-24 text-center sm:px-6">
        <LogIn className="size-10 text-primary" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-bold uppercase">
          Meine Tauschgeschäfte
        </h1>
        <p className="mt-2 text-muted-foreground">
          Melde dich an, um deine eingehenden und gesendeten Tauschvorschläge
          zu sehen.
        </p>
        <Button className="mt-6" onClick={() => setAuthOpen(true)}>
          Anmelden
        </Button>
      </main>
    )
  }

  const incoming = offers.filter(
    (o) => o.toId === player.id && (o.status === 'pending' || o.status === 'accepted'),
  )
  const outgoing = offers.filter(
    (o) => o.fromId === player.id && (o.status === 'pending' || o.status === 'accepted'),
  )
  const history = offers.filter(
    (o) =>
      (o.toId === player.id || o.fromId === player.id) &&
      (o.status === 'declined' || o.status === 'withdrawn' || o.status === 'completed'),
  )

  return (
    <main className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-wide uppercase md:text-5xl">
        Meine Tauschgeschäfte
      </h1>
      <p className="mt-1 text-muted-foreground">
        Nimm Vorschläge an, verfolge deine Anfragen und schließ Deals ab.
      </p>

      <Tabs defaultValue="incoming" className="mt-8">
        <TabsList>
          <TabsTrigger value="incoming">
            Eingehend
            <Count n={incoming.filter((o) => o.status === 'pending').length} />
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Gesendet
            <Count n={outgoing.length} />
          </TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-4">
          <OfferList
            offers={incoming}
            perspective="incoming"
            empty="Noch keine Vorschläge für deine Angebote."
          />
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4">
          <OfferList
            offers={outgoing}
            perspective="outgoing"
            empty="Du hast gerade keine offenen Vorschläge gesendet."
          />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <OfferList
            offers={history}
            perspective="history"
            empty="Hier landen abgeschlossene und abgelehnte Tauschgeschäfte."
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function Count({ n }: { n: number }) {
  if (n === 0) return null
  return (
    <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
      {n}
    </span>
  )
}

function OfferList({
  offers,
  perspective,
  empty,
}: {
  offers: TradeOffer[]
  perspective: 'incoming' | 'outgoing' | 'history'
  empty: string
}) {
  if (offers.length === 0) {
    return (
      <div className="grid place-items-center rounded-md border border-dashed border-border px-6 py-16 text-center">
        <Inbox className="size-9 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-muted-foreground">{empty}</p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/markt">Zum Marktplatz</Link>
        </Button>
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-4">
      {offers.map((o) => (
        <li key={o.id}>
          <OfferCard offer={o} perspective={perspective} />
        </li>
      ))}
    </ul>
  )
}

function OfferCard({
  offer,
  perspective,
}: {
  offer: TradeOffer
  perspective: 'incoming' | 'outgoing' | 'history'
}) {
  const { player, updateTrade, getPlayer } = useSession()
  const mine = offer.fromId === player?.id
  const partner = getPlayer(mine ? offer.toId : offer.fromId)
  // Always show the trade from the signed-in player's side.
  const youGive = mine ? offer.give : offer.get
  const youGet = mine ? offer.get : offer.give
  const status = STATUS[offer.status]

  const update = (action: TradeAction, message: string) =>
    updateTrade(offer.id, action).then(
      (status) =>
        toast.success(
          action === 'confirm' && status !== 'completed'
            ? 'Übergabe bestätigt – wartet auf deinen Tauschpartner.'
            : message,
        ),
      (error) => toast.error(errorMessage(error)),
    )

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          {mine ? (
            <Send className="size-4 text-muted-foreground" aria-label="Gesendet an" />
          ) : (
            <Inbox className="size-4 text-muted-foreground" aria-label="Erhalten von" />
          )}
          <PlayerBadge player={partner} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{timeAgo(offer.createdAt)}</span>
          <Badge className={cn('border-transparent', status.className)}>{status.label}</Badge>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <p className="mb-2 font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Du gibst
          </p>
          <ItemStackList stacks={youGive} size="sm" />
        </div>
        <ArrowRightLeft aria-hidden className="hidden size-4 self-center text-primary md:block" />
        <div>
          <p className="mb-2 font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Du bekommst
          </p>
          <ItemStackList stacks={youGet} size="sm" />
        </div>
      </div>

      {offer.message && (
        <p className="mx-5 mb-4 rounded-sm bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {mine ? 'Du' : partner.name}:
          </span>{' '}
          {offer.message}
        </p>
      )}

      {perspective !== 'history' && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/40 px-5 py-3">
          {offer.status === 'accepted' && (
            <p className="mr-auto text-sm text-stripe-cyan">
              Trefft euch im Spiel und übergebt die Items.
            </p>
          )}
          {perspective === 'incoming' && offer.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => update('decline', 'Vorschlag abgelehnt')}
              >
                <X />
                Ablehnen
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  update('accept', `Tausch mit ${partner.name} vereinbart!`)
                }
              >
                <Check />
                Annehmen
              </Button>
            </>
          )}
          {perspective === 'outgoing' && offer.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => update('withdraw', 'Vorschlag zurückgezogen')}
            >
              Zurückziehen
            </Button>
          )}
          {offer.status === 'accepted' && (
            <Button
              size="sm"
              onClick={() => update('confirm', 'Tausch abgeschlossen. Gute Raids!')}
            >
              <Check />
              Übergabe bestätigen
            </Button>
          )}
        </div>
      )}
    </article>
  )
}

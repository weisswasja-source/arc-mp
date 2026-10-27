import { getUser } from '@netlify/identity'
import { and, desc, eq, inArray, ne, or, sql } from 'drizzle-orm'

import { db } from '../../db'
import { listings, players, tradeOffers } from '../../db/schema'
import type {
  ItemStack,
  Listing,
  MarketState,
  Platform,
  Player,
  Region,
  TradeAction,
  TradeOffer,
  TradeStatus,
} from '@/data/types'

/**
 * Database access for the marketplace. Only imported by server functions in
 * `market.functions.ts`; every write checks the signed-in Identity user here.
 */

/** Error whose message is safe to show to the player. */
export class MarketError extends Error {}

const OPEN_LISTING_LIMIT = 200

const completedTrades = sql<number>`(
  select count(*)::int from ${tradeOffers}
  where ${tradeOffers.status} = 'completed'
    and (${tradeOffers.fromId} = ${players.id} or ${tradeOffers.toId} = ${players.id})
)`

function toPlayer(row: typeof players.$inferSelect & { trades: number }): Player {
  return {
    id: row.id,
    name: row.name,
    platform: row.platform as Platform,
    region: row.region as Region,
    rating: null,
    trades: row.trades,
    joined: row.createdAt.toISOString(),
  }
}

function toListing(row: typeof listings.$inferSelect): Listing {
  return {
    id: row.id,
    sellerId: row.sellerId,
    offer: row.offer,
    want: row.want,
    openToOffers: row.openToOffers,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    status: row.status as Listing['status'],
  }
}

function toOffer(row: typeof tradeOffers.$inferSelect): TradeOffer {
  return {
    id: row.id,
    listingId: row.listingId,
    fromId: row.fromId,
    toId: row.toId,
    give: row.give,
    get: row.get,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    status: row.status as TradeStatus,
    fromConfirmed: row.fromConfirmed,
    toConfirmed: row.toConfirmed,
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

async function findPlayers(ids: string[]): Promise<Player[]> {
  if (ids.length === 0) return []
  const rows = await db
    .select({
      id: players.id,
      name: players.name,
      platform: players.platform,
      region: players.region,
      createdAt: players.createdAt,
      trades: completedTrades,
    })
    .from(players)
    .where(inArray(players.id, ids))
  return rows.map(toPlayer)
}

export async function loadMarketState(): Promise<MarketState> {
  const user = await getUser()

  const [openRows, stats] = await Promise.all([
    db
      .select()
      .from(listings)
      .where(eq(listings.status, 'open'))
      .orderBy(desc(listings.createdAt))
      .limit(OPEN_LISTING_LIMIT),
    Promise.all([
      db.$count(listings, eq(listings.status, 'open')),
      db.$count(tradeOffers, eq(tradeOffers.status, 'completed')),
      db.$count(players),
    ]),
  ])

  let ownRows: (typeof listings.$inferSelect)[] = []
  let offerRows: (typeof tradeOffers.$inferSelect)[] = []
  if (user) {
    ;[ownRows, offerRows] = await Promise.all([
      db
        .select()
        .from(listings)
        .where(and(eq(listings.sellerId, user.id), ne(listings.status, 'open')))
        .orderBy(desc(listings.createdAt)),
      db
        .select()
        .from(tradeOffers)
        .where(or(eq(tradeOffers.fromId, user.id), eq(tradeOffers.toId, user.id)))
        .orderBy(desc(tradeOffers.createdAt)),
    ])
  }

  const allListings = [...openRows, ...ownRows].map(toListing)
  const offers = offerRows.map(toOffer)
  const ids = new Set<string>(allListings.map((l) => l.sellerId))
  for (const o of offers) ids.add(o.fromId).add(o.toId)
  if (user) ids.add(user.id)
  const allPlayers = await findPlayers([...ids])

  const meta = user?.userMetadata ?? {}
  return {
    account: user
      ? {
          id: user.id,
          email: user.email ?? '',
          suggested: {
            name: text(meta.raider_name) || text(meta.full_name),
            platform: text(meta.platform),
            region: text(meta.region),
          },
        }
      : null,
    player: allPlayers.find((p) => p.id === user?.id) ?? null,
    players: allPlayers,
    listings: allListings,
    offers,
    stats: { openListings: stats[0], completedTrades: stats[1], players: stats[2] },
  }
}

async function requireUserId(): Promise<string> {
  const user = await getUser()
  if (!user) throw new MarketError('Bitte melde dich zuerst an.')
  return user.id
}

async function requirePlayerId(): Promise<string> {
  const id = await requireUserId()
  const [row] = await db.select({ id: players.id }).from(players).where(eq(players.id, id))
  if (!row) throw new MarketError('Bitte lege zuerst dein Raider-Profil an.')
  return id
}

export async function saveProfile(input: {
  name: string
  platform: Platform
  region: Region
}): Promise<void> {
  const id = await requireUserId()
  const [taken] = await db
    .select({ id: players.id })
    .from(players)
    .where(and(sql`lower(${players.name}) = lower(${input.name})`, ne(players.id, id)))
  if (taken) throw new MarketError(`Der Raider-Name „${input.name}“ ist schon vergeben.`)

  try {
    await db
      .insert(players)
      .values({ id, ...input })
      .onConflictDoUpdate({ target: players.id, set: input })
  } catch (error) {
    // Lost a race against someone registering the same name.
    if (String(error).includes('players_name_lower_idx')) {
      throw new MarketError(`Der Raider-Name „${input.name}“ ist schon vergeben.`)
    }
    throw error
  }
}

export async function createListing(input: {
  offer: ItemStack[]
  want: ItemStack[]
  openToOffers: boolean
  note: string
}): Promise<string> {
  const sellerId = await requirePlayerId()
  if (input.want.length === 0 && !input.openToOffers) {
    throw new MarketError('Wähle gesuchte Items oder erlaube Gegenangebote.')
  }
  const [row] = await db
    .insert(listings)
    .values({ sellerId, ...input })
    .returning({ id: listings.id })
  return row.id
}

export async function closeListing(listingId: string): Promise<void> {
  const sellerId = await requirePlayerId()
  const closed = await db
    .update(listings)
    .set({ status: 'closed' })
    .where(
      and(
        eq(listings.id, listingId),
        eq(listings.sellerId, sellerId),
        eq(listings.status, 'open'),
      ),
    )
    .returning({ id: listings.id })
  if (closed.length === 0) throw new MarketError('Dieses Angebot ist nicht mehr offen.')
  await declineOpenOffers(listingId)
}

/** Declines every other unfinished proposal on a listing that is no longer open. */
async function declineOpenOffers(listingId: string, exceptId?: string) {
  await db
    .update(tradeOffers)
    .set({ status: 'declined' })
    .where(
      and(
        eq(tradeOffers.listingId, listingId),
        inArray(tradeOffers.status, ['pending', 'accepted']),
        exceptId ? ne(tradeOffers.id, exceptId) : undefined,
      ),
    )
}

export async function proposeTrade(input: {
  listingId: string
  give: ItemStack[]
  message: string
}): Promise<void> {
  const fromId = await requirePlayerId()
  const [listing] = await db.select().from(listings).where(eq(listings.id, input.listingId))
  if (!listing || listing.status !== 'open') {
    throw new MarketError('Dieses Angebot ist nicht mehr verfügbar.')
  }
  if (listing.sellerId === fromId) {
    throw new MarketError('Du kannst nicht auf dein eigenes Angebot bieten.')
  }
  if (
    !listing.openToOffers &&
    input.give.some((g) => !listing.want.some((w) => w.itemId === g.itemId))
  ) {
    throw new MarketError('Dieses Angebot nimmt nur die gesuchten Items an.')
  }
  const [existing] = await db
    .select({ id: tradeOffers.id })
    .from(tradeOffers)
    .where(
      and(
        eq(tradeOffers.listingId, listing.id),
        eq(tradeOffers.fromId, fromId),
        inArray(tradeOffers.status, ['pending', 'accepted']),
      ),
    )
  if (existing) throw new MarketError('Du hast für dieses Angebot schon einen Vorschlag offen.')

  await db.insert(tradeOffers).values({
    listingId: listing.id,
    fromId,
    toId: listing.sellerId,
    give: input.give,
    get: listing.offer,
    message: input.message,
  })
}

/**
 * Applies a status change to a trade proposal. Only the listing owner may
 * accept or decline, only the proposer may withdraw, and the trade completes
 * once both sides have confirmed the hand-over.
 */
export async function updateTrade(offerId: string, action: TradeAction): Promise<TradeStatus> {
  const me = await requirePlayerId()
  const [offer] = await db.select().from(tradeOffers).where(eq(tradeOffers.id, offerId))
  if (!offer || (offer.fromId !== me && offer.toId !== me)) {
    throw new MarketError('Diesen Tauschvorschlag gibt es nicht.')
  }
  const isRecipient = offer.toId === me
  const stale = new MarketError('Der Vorschlag hat sich inzwischen geändert. Lade die Seite neu.')

  const transition = async (
    from: TradeStatus,
    set: Partial<typeof tradeOffers.$inferInsert>,
  ) => {
    const rows = await db
      .update(tradeOffers)
      .set(set)
      .where(and(eq(tradeOffers.id, offerId), eq(tradeOffers.status, from)))
      .returning()
    if (rows.length === 0) throw stale
    return rows[0]
  }

  switch (action) {
    case 'accept': {
      if (!isRecipient) throw new MarketError('Nur der Anbieter kann annehmen.')
      const [listing] = await db
        .select({ status: listings.status })
        .from(listings)
        .where(eq(listings.id, offer.listingId))
      if (listing?.status !== 'open') throw new MarketError('Dein Angebot ist nicht mehr offen.')
      await transition('pending', { status: 'accepted' })
      return 'accepted'
    }
    case 'decline':
      if (!isRecipient) throw new MarketError('Nur der Anbieter kann ablehnen.')
      await transition('pending', { status: 'declined' })
      return 'declined'
    case 'withdraw':
      if (isRecipient) throw new MarketError('Nur der Absender kann zurückziehen.')
      await transition('pending', { status: 'withdrawn' })
      return 'withdrawn'
    case 'confirm': {
      const row = await transition(
        'accepted',
        isRecipient ? { toConfirmed: true } : { fromConfirmed: true },
      )
      if (!row.fromConfirmed || !row.toConfirmed) return 'accepted'
      const done = await db
        .update(tradeOffers)
        .set({ status: 'completed' })
        .where(and(eq(tradeOffers.id, offerId), eq(tradeOffers.status, 'accepted')))
        .returning({ id: tradeOffers.id })
      if (done.length > 0) {
        await db
          .update(listings)
          .set({ status: 'closed' })
          .where(eq(listings.id, offer.listingId))
        await declineOpenOffers(offer.listingId, offerId)
      }
      return 'completed'
    }
  }
}

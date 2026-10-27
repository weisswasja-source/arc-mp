import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import type { ItemStack } from '../src/data/types'

/** One row per Raider, keyed by their Netlify Identity user id. */
export const players = pgTable(
  'players',
  {
    id: text().primaryKey(),
    name: text().notNull(),
    platform: text().notNull(),
    region: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('players_name_lower_idx').on(sql`lower(${t.name})`)],
)

export const listings = pgTable(
  'listings',
  {
    id: uuid().primaryKey().defaultRandom(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    offer: jsonb().$type<ItemStack[]>().notNull(),
    want: jsonb().$type<ItemStack[]>().notNull(),
    openToOffers: boolean('open_to_offers').notNull().default(true),
    note: text().notNull().default(''),
    status: text().notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('listings_status_created_idx').on(t.status, t.createdAt),
    index('listings_seller_idx').on(t.sellerId),
  ],
)

export const tradeOffers = pgTable(
  'trade_offers',
  {
    id: uuid().primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    fromId: text('from_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    toId: text('to_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    /** Items the proposing player hands over. */
    give: jsonb().$type<ItemStack[]>().notNull(),
    /** Items the proposing player receives. */
    get: jsonb().$type<ItemStack[]>().notNull(),
    message: text().notNull().default(''),
    status: text().notNull().default('pending'),
    /** Each side confirms the in-game hand-over; both flags complete the trade. */
    fromConfirmed: boolean('from_confirmed').notNull().default(false),
    toConfirmed: boolean('to_confirmed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('trade_offers_from_idx').on(t.fromId),
    index('trade_offers_to_idx').on(t.toId),
    index('trade_offers_listing_idx').on(t.listingId),
  ],
)

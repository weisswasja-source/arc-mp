import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { isItemId } from '@/data/catalog'
import {
  closeListing,
  createListing,
  loadMarketState,
  proposeTrade,
  saveProfile,
  updateTrade,
} from '@/lib/market.server'

const stacks = z
  .array(
    z.object({
      itemId: z.string().refine(isItemId, 'Unbekanntes Item'),
      qty: z.number().int().min(1).max(999),
    }),
  )
  .max(20)
  .refine(
    (list) => new Set(list.map((s) => s.itemId)).size === list.length,
    'Items doppelt ausgewählt',
  )

const shortText = z.string().trim().max(200)

export const getMarketState = createServerFn({ method: 'GET' }).handler(() =>
  loadMarketState(),
)

export const saveProfileFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z
        .string()
        .trim()
        .regex(/^[\p{L}\p{N}_.-]{3,24}$/u, 'Raider-Name: 3–24 Zeichen, keine Leerzeichen'),
      platform: z.enum(['PC', 'PlayStation', 'Xbox']),
      region: z.enum(['EU', 'NA', 'ASIA']),
    }),
  )
  .handler(({ data }) => saveProfile(data))

export const createListingFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      offer: stacks.min(1),
      want: stacks,
      openToOffers: z.boolean(),
      note: shortText,
    }),
  )
  .handler(({ data }) => createListing(data))

export const closeListingFn = createServerFn({ method: 'POST' })
  .validator(z.object({ listingId: z.uuid() }))
  .handler(({ data }) => closeListing(data.listingId))

export const proposeTradeFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      listingId: z.uuid(),
      give: stacks.min(1),
      message: shortText,
    }),
  )
  .handler(({ data }) => proposeTrade(data))

export const updateTradeFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      offerId: z.uuid(),
      action: z.enum(['accept', 'decline', 'withdraw', 'confirm']),
    }),
  )
  .handler(({ data }) => updateTrade(data.offerId, data.action))

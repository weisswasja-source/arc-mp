export type Category =
  | 'weapon'
  | 'gear'
  | 'material'
  | 'arc'
  | 'blueprint'
  | 'key'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type Platform = 'PC' | 'PlayStation' | 'Xbox'

export interface Item {
  id: string
  name: string
  category: Category
  rarity: Rarity
}

export interface ItemStack {
  itemId: string
  qty: number
}

export type Region = 'EU' | 'NA' | 'ASIA'

export interface Player {
  id: string
  name: string
  platform: Platform
  region: Region
  /** Average review score; `null` until ratings exist (see PLAN.md). */
  rating: number | null
  /** Number of completed trades. */
  trades: number
  joined: string
}

export interface Listing {
  id: string
  sellerId: string
  offer: ItemStack[]
  want: ItemStack[]
  openToOffers: boolean
  note: string
  createdAt: string
  status: 'open' | 'closed'
}

export type TradeStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'completed'

export interface TradeOffer {
  id: string
  listingId: string
  fromId: string
  toId: string
  /** Items the proposing player hands over. */
  give: ItemStack[]
  /** Items the proposing player receives. */
  get: ItemStack[]
  message: string
  createdAt: string
  status: TradeStatus
  /** Whether each side has confirmed the in-game hand-over. */
  fromConfirmed: boolean
  toConfirmed: boolean
}

export type TradeAction = 'accept' | 'decline' | 'withdraw' | 'confirm'

export interface Account {
  id: string
  email: string
  /** Profile values entered at sign-up, used to prefill the profile form. */
  suggested: { name: string; platform: string; region: string }
}

export interface MarketState {
  account: Account | null
  player: Player | null
  players: Player[]
  listings: Listing[]
  offers: TradeOffer[]
  stats: { openListings: number; completedTrades: number; players: number }
}

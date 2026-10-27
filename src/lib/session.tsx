import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import {
  AUTH_EVENTS,
  getUser,
  handleAuthCallback,
  logout,
  onAuthChange,
} from '@netlify/identity'
import { toast } from 'sonner'

import type {
  Account,
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
import {
  closeListingFn,
  createListingFn,
  proposeTradeFn,
  saveProfileFn,
  updateTradeFn,
} from '@/lib/market.functions'

/**
 * Accounts come from Netlify Identity, marketplace data from Netlify Database.
 * The root route loader fetches a `MarketState` snapshot for the signed-in
 * player; every mutation calls a server function and then reloads it.
 */
interface SessionValue {
  account: Account | null
  /** The signed-in player's Raider profile; `null` until it's created. */
  player: Player | null
  signOut: () => Promise<void>
  authOpen: boolean
  setAuthOpen: (open: boolean) => void
  /** Set when a password-recovery link was opened; shows the new-password form. */
  recovering: boolean
  setRecovering: (recovering: boolean) => void
  profileOpen: boolean
  setProfileOpen: (open: boolean) => void
  /** Runs `action` when signed in with a profile, otherwise asks for it. */
  requireAuth: (action: () => void) => void
  /** Looks up a player from the loaded snapshot, with a placeholder fallback. */
  getPlayer: (id: string) => Player
  listings: Listing[]
  offers: TradeOffer[]
  stats: MarketState['stats']
  refresh: () => Promise<void>
  saveProfile: (input: { name: string; platform: Platform; region: Region }) => Promise<void>
  createListing: (input: {
    offer: ItemStack[]
    want: ItemStack[]
    openToOffers: boolean
    note: string
  }) => Promise<string>
  closeListing: (listingId: string) => Promise<void>
  proposeTrade: (input: { listing: Listing; give: ItemStack[]; message: string }) => Promise<void>
  updateTrade: (offerId: string, action: TradeAction) => Promise<TradeStatus>
}

const EMPTY: MarketState = {
  account: null,
  player: null,
  players: [],
  listings: [],
  offers: [],
  stats: { openListings: 0, completedTrades: 0, players: 0 },
}

function unknownPlayer(id: string): Player {
  return {
    id,
    name: 'Unbekannter Raider',
    platform: 'PC',
    region: 'EU',
    rating: null,
    trades: 0,
    joined: new Date(0).toISOString(),
  }
}

const CALLBACK_PARAMS = [
  'confirmation_token',
  'recovery_token',
  'invite_token',
  'email_change_token',
  'access_token',
]

const SessionContext = createContext<SessionValue | null>(null)

/** User-facing text for a failed server call. */
export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Etwas ist schiefgelaufen. Versuch es noch einmal.'
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const state =
    (useRouterState({ select: (s) => s.matches[0]?.loaderData }) as
      | MarketState
      | undefined) ?? EMPTY
  const [authOpen, setAuthOpen] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [profileDismissed, setProfileDismissed] = useState(false)

  const refresh = useCallback(() => router.invalidate(), [router])

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthChange((event) => {
      if (
        event === AUTH_EVENTS.LOGIN ||
        event === AUTH_EVENTS.LOGOUT ||
        event === AUTH_EVENTS.USER_UPDATED
      ) {
        void router.invalidate()
      }
    })

    async function initialize() {
      const hash = new URLSearchParams(window.location.hash.slice(1))
      if (CALLBACK_PARAMS.some((name) => hash.has(name))) {
        try {
          const result = await handleAuthCallback()
          if (!active) return
          if (result?.type === 'confirmation') {
            toast.success('E-Mail bestätigt – willkommen in Speranza!')
          } else if (result?.type === 'recovery') {
            setRecovering(true)
            setAuthOpen(true)
          } else if (result?.type === 'oauth') {
            toast.success('Angemeldet')
          }
        } catch (error) {
          if (active) toast.error(errorMessage(error))
        }
      }
      // Restores the browser session (and its token refresh). If the server
      // saw a different sign-in state than the browser has, reload the data.
      const user = await getUser()
      if (active && (user?.id ?? null) !== (state.account?.id ?? null)) {
        await router.invalidate()
      }
    }
    void initialize()
    return () => {
      active = false
      unsubscribe()
    }
    // Runs once on mount; later changes arrive through onAuthChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { account, player } = state
  const playerById = useMemo(
    () => new Map(state.players.map((p) => [p.id, p])),
    [state.players],
  )

  const requireAuth = useCallback(
    (action: () => void) => {
      if (account && player) action()
      else if (account) setProfileDismissed(false)
      else setAuthOpen(true)
    },
    [account, player],
  )

  const value = useMemo<SessionValue>(
    () => ({
      account,
      player,
      signOut: async () => {
        try {
          await logout()
        } finally {
          await router.invalidate()
        }
      },
      authOpen,
      setAuthOpen: (open) => {
        setAuthOpen(open)
        if (!open) setRecovering(false)
      },
      recovering,
      setRecovering,
      profileOpen: account !== null && player === null && !profileDismissed,
      setProfileOpen: (open) => setProfileDismissed(!open),
      requireAuth,
      getPlayer: (id) => playerById.get(id) ?? unknownPlayer(id),
      listings: state.listings,
      offers: state.offers,
      stats: state.stats,
      refresh,
      saveProfile: async (data) => {
        await saveProfileFn({ data })
        await refresh()
      },
      createListing: async (data) => {
        const id = await createListingFn({ data })
        await refresh()
        return id
      },
      closeListing: async (listingId) => {
        await closeListingFn({ data: { listingId } })
        await refresh()
      },
      proposeTrade: async ({ listing, give, message }) => {
        await proposeTradeFn({ data: { listingId: listing.id, give, message } })
        await refresh()
      },
      updateTrade: async (offerId, action) => {
        const status = await updateTradeFn({ data: { offerId, action } })
        await refresh()
        return status
      },
    }),
    [
      account,
      player,
      authOpen,
      recovering,
      profileDismissed,
      requireAuth,
      playerById,
      state,
      refresh,
      router,
    ],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}

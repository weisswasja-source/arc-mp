import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ItemPicker } from '@/components/market/item-picker'
import { ItemStackList } from '@/components/market/item-tile'
import { ITEMS } from '@/data/catalog'
import type { ItemStack, Listing } from '@/data/types'
import { errorMessage, useSession } from '@/lib/session'

// Until inventories exist (PLAN.md, milestone 5) any catalog item can be offered.
const INVENTORY = ITEMS.map((i) => ({ itemId: i.id }))

/** Pre-selects what the seller asked for. */
function suggestedGive(listing: Listing): ItemStack[] {
  return listing.want.map((w) => ({ ...w }))
}

export function ProposeTradeDialog({
  listing,
  open,
  onOpenChange,
}: {
  listing: Listing
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { proposeTrade, getPlayer } = useSession()
  const seller = getPlayer(listing.sellerId)
  const [give, setGive] = useState<ItemStack[]>(() => suggestedGive(listing))
  const [message, setMessage] = useState('')

  const options = listing.openToOffers
    ? INVENTORY
    : INVENTORY.filter((o) => listing.want.some((w) => w.itemId === o.itemId))

  const send = async () => {
    try {
      await proposeTrade({ listing, give, message: message.trim() })
    } catch (error) {
      toast.error(errorMessage(error))
      return
    }
    onOpenChange(false)
    toast.success(`Tauschvorschlag an ${seller.name} gesendet`, {
      action: (
        <Button asChild size="xs" variant="outline">
          <Link to="/tausch">Ansehen</Link>
        </Button>
      ),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <div className="raider-stripes absolute inset-x-0 top-0 h-1 rounded-t-lg" />
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide uppercase">
            Tausch vorschlagen
          </DialogTitle>
          <DialogDescription>
            {seller.name} bekommt deinen Vorschlag und kann annehmen oder
            ablehnen.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/40 p-3">
          <p className="mb-2 font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Du bekommst
          </p>
          <ItemStackList stacks={listing.offer} size="sm" />
        </div>

        <ArrowDown aria-hidden className="mx-auto size-4 text-primary" />

        <div className="space-y-2">
          <p className="font-display text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Du gibst
          </p>
          {options.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              Du hast keines der gesuchten Items im Lager.
            </p>
          ) : (
            <ItemPicker
              label="Deine Items"
              options={options}
              value={give}
              onChange={setGive}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="trade-message">Nachricht (optional)</Label>
          <Textarea
            id="trade-message"
            value={message}
            maxLength={200}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="z. B. Bin heute ab 20 Uhr in Speranza"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button disabled={give.length === 0} onClick={send}>
            Vorschlag senden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

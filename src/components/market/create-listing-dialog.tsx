import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ItemPicker } from '@/components/market/item-picker'
import { ITEMS } from '@/data/catalog'
import type { ItemStack } from '@/data/types'
import { errorMessage, useSession } from '@/lib/session'

const ALL_ITEMS = ITEMS.map((i) => ({ itemId: i.id }))
// Until inventories exist (PLAN.md, milestone 5) any catalog item can be offered.
const INVENTORY = ALL_ITEMS

export function CreateListingDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { createListing } = useSession()
  const navigate = useNavigate()
  const [step, setStep] = useState<'offer' | 'want'>('offer')
  const [offer, setOffer] = useState<ItemStack[]>([])
  const [want, setWant] = useState<ItemStack[]>([])
  const [openToOffers, setOpenToOffers] = useState(true)
  const [note, setNote] = useState('')

  const reset = () => {
    setStep('offer')
    setOffer([])
    setWant([])
    setOpenToOffers(true)
    setNote('')
  }

  const publish = async () => {
    try {
      const listingId = await createListing({ offer, want, openToOffers, note: note.trim() })
      toast.success('Angebot veröffentlicht')
      onOpenChange(false)
      reset()
      void navigate({ to: '/angebot/$listingId', params: { listingId } })
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <div className="raider-stripes absolute inset-x-0 top-0 h-1 rounded-t-lg" />
        <DialogHeader>
          <p className="font-display text-xs font-semibold tracking-widest text-primary uppercase">
            Schritt {step === 'offer' ? '1' : '2'} von 2
          </p>
          <DialogTitle className="font-display text-2xl tracking-wide uppercase">
            {step === 'offer' ? 'Was bietest du an?' : 'Was suchst du dafür?'}
          </DialogTitle>
          <DialogDescription>
            {step === 'offer'
              ? 'Wähle Items aus deinem Lager, die du tauschen möchtest.'
              : 'Wähle die Items, die du im Gegenzug haben willst – oder lass dir Angebote machen.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'offer' ? (
          <ItemPicker
            label="Angebotene Items"
            options={INVENTORY}
            value={offer}
            onChange={setOffer}
          />
        ) : (
          <div className="space-y-4">
            <ItemPicker
              label="Gesuchte Items"
              options={ALL_ITEMS}
              value={want}
              onChange={setWant}
            />
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <Label htmlFor="open-offers" className="flex-col items-start gap-1">
                Offen für andere Angebote
                <span className="text-xs font-normal text-muted-foreground">
                  Andere Raider dürfen Gegenvorschläge machen.
                </span>
              </Label>
              <Switch
                id="open-offers"
                checked={openToOffers}
                onCheckedChange={setOpenToOffers}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-note">Notiz (optional)</Label>
              <Textarea
                id="listing-note"
                value={note}
                maxLength={200}
                onChange={(e) => setNote(e.target.value)}
                placeholder="z. B. Wann du online bist oder wo die Übergabe stattfindet"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'offer' ? (
            <Button disabled={offer.length === 0} onClick={() => setStep('want')}>
              Weiter
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('offer')}>
                Zurück
              </Button>
              <Button
                disabled={want.length === 0 && !openToOffers}
                onClick={publish}
              >
                Angebot veröffentlichen
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

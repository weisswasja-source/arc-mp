import { useState } from 'react'
import { toast } from 'sonner'
import { login, signup } from '@netlify/identity'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { errorMessage, useSession } from '@/lib/session'

export function AuthDialog() {
  const { authOpen, setAuthOpen, refresh } = useSession()
  const [tab, setTab] = useState('login')
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>, mode: 'login' | 'register') => {
    e.preventDefault()
    if (pending) return
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email'))
    const password = String(f.get('password'))
    setPending(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        toast.success('Angemeldet')
      } else {
        const user = await signup(email, password, { full_name: String(f.get('name')) })
        toast.success(
          user.emailVerified
            ? 'Konto erstellt – willkommen in Speranza!'
            : 'Fast geschafft: Bestätige deine E-Mail über den Link in deinem Postfach.',
        )
      }
      setAuthOpen(false)
      await refresh()
    } catch (error) {
      toast.error(mode === 'login' ? 'Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.' : errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="raider-stripes absolute inset-x-0 top-0 h-1 rounded-t-lg" />
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide uppercase">
            Willkommen, Raider
          </DialogTitle>
          <DialogDescription>
            Melde dich an, um Angebote zu erstellen und Tauschgeschäfte zu
            vereinbaren.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Anmelden</TabsTrigger>
            <TabsTrigger value="register">Registrieren</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form
              className="space-y-4 pt-2"
              onSubmit={(e) => void submit(e, 'login')}
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">E-Mail</Label>
                <Input id="login-email" name="email" type="email" autoComplete="email" required placeholder="raider@speranza.de" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Passwort</Label>
                <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                Anmelden
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form
              className="space-y-4 pt-2"
              onSubmit={(e) => void submit(e, 'register')}
            >
              <div className="space-y-2">
                <Label htmlFor="reg-name">Raider-Name</Label>
                <Input id="reg-name" name="name" required minLength={3} placeholder="z. B. Speranza_Fox" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">E-Mail</Label>
                <Input id="reg-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Passwort</Label>
                <Input id="reg-password" name="password" type="password" autoComplete="new-password" required minLength={8} />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                Konto erstellen
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

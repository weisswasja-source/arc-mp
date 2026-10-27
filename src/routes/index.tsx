import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Handshake,
  PackageSearch,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ListingCard } from '@/components/market/listing-card'
import { useSession } from '@/lib/session'

export const Route = createFileRoute('/')({
  component: Home,
})

const STEPS = [
  {
    icon: PackageSearch,
    title: 'Angebot einstellen',
    text: 'Wähle Items aus deinem Lager und sag, was du dafür suchst – oder lass dir Angebote machen.',
  },
  {
    icon: Handshake,
    title: 'Tausch vorschlagen',
    text: 'Siehst du etwas, das du brauchst? Stell dein Gegenangebot zusammen und schick es ab.',
  },
  {
    icon: ShieldCheck,
    title: 'Topside übergeben',
    text: 'Angenommen? Trefft euch im Spiel, übergebt die Items und bewertet euch gegenseitig.',
  },
]

function Home() {
  const { listings, player, setAuthOpen } = useSession()
  const latest = listings.slice(0, 6)

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src="/.netlify/images?url=/img/hero.png&w=1920&fm=webp&q=75"
          srcSet="/.netlify/images?url=/img/hero.png&w=800&fm=webp&q=70 800w, /.netlify/images?url=/img/hero.png&w=1280&fm=webp&q=75 1280w, /.netlify/images?url=/img/hero.png&w=1920&fm=webp&q=75 1920w"
          sizes="100vw"
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="mx-auto max-w-content px-4 py-24 sm:px-6 md:py-36">
          <p className="mb-5 inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-3 py-1 font-display text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            <span className="size-1.5 rounded-full bg-stripe-green" />
            Die Tauschbörse für Arc Raiders
          </p>
          <h1 className="max-w-2xl font-display text-5xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl md:text-7xl">
            Tausch deinen Loot. <span className="text-primary">Raider zu Raider.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Doppelte Blaupause? Zu viel ARC-Legierung im Lager? Finde Spieler,
            die genau das suchen, und vereinbare einen fairen Tausch – bevor
            du das nächste Mal Topside gehst.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="font-semibold">
              <Link to="/markt">
                Marktplatz durchsuchen
                <ArrowRight />
              </Link>
            </Button>
            {!player && (
              <Button
                size="lg"
                variant="outline"
                className="bg-background/50"
                onClick={() => setAuthOpen(true)}
              >
                Kostenlos registrieren
              </Button>
            )}
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6">
            {[
              ['1.240', 'aktive Angebote'],
              ['8.900+', 'erfolgreiche Deals'],
              ['4,8', 'Ø Bewertung'],
            ].map(([value, label]) => (
              <div key={label} className="border-l-2 border-primary/60 pl-3">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-bold">{value}</dd>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-wide uppercase">
          So funktioniert's
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative overflow-hidden rounded-md border border-border bg-card p-6"
            >
              <span
                aria-hidden
                className="absolute -top-4 right-3 font-display text-8xl font-extrabold text-foreground/5"
              >
                {i + 1}
              </span>
              <s.icon className="size-7 text-primary" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-bold uppercase">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grain border-y border-border bg-card/40">
        <div className="mx-auto max-w-content px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-wide uppercase">
                Neu auf dem Markt
              </h2>
              <p className="mt-1 text-muted-foreground">
                Die neuesten Angebote aus der Community.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/markt">
                Alle Angebote
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-md border border-primary/30 bg-primary/10 p-8 md:p-12">
          <div className="raider-stripes absolute inset-y-0 left-0 w-1.5" />
          <Users className="size-8 text-primary" aria-hidden />
          <h2 className="mt-4 max-w-xl font-display text-3xl font-bold uppercase md:text-4xl">
            Speranza handelt. Mach mit.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Erstell dein Raider-Profil, sammle Bewertungen und baue dir einen
            Ruf als verlässlicher Tauschpartner auf.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/markt">
              Jetzt loslegen
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

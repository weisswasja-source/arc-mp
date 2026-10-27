# AGENTS.md

This document describes the project for developers and AI agents working on this codebase.

## Project Overview

**Raider Exchange** is a German-language trading marketplace for the game Arc Raiders. Players sign in, list items from their inventory, propose trades on other players' listings, and accept/decline/complete trades.

**Status:** Milestone 1 (product surface) is done. All data is stubbed. Continue with the roadmap in [PLAN.md](PLAN.md) — next up are Netlify Identity accounts and the Netlify Database data model.

### Stubbed data and state

- `src/data/types.ts` – domain types (`Item`, `Player`, `Listing`, `TradeOffer`). Keep these shapes stable when moving to real persistence.
- `src/data/fixtures.ts` – the only source of demo data (item catalog, players, inventory, listings, trade offers) plus lookup helpers.
- `src/lib/session.tsx` – `SessionProvider`/`useSession()`: in-memory sign-in flag, listings and offers, and all mutations (`createListing`, `proposeTrade`, `setTradeStatus`, `requireAuth`). Later milestones replace these with Identity + server functions; screens only talk to `useSession()`, so swap the internals there.

### Screens

| Route                 | File                           | Purpose                                        |
| --------------------- | ------------------------------ | ---------------------------------------------- |
| `/`                   | `src/routes/index.tsx`         | Landing page, how-it-works, latest listings     |
| `/markt`              | `src/routes/markt.tsx`         | Marketplace with search, filters, sort          |
| `/angebot/$listingId` | `src/routes/angebot/$listingId.tsx` | Listing detail, seller card, propose trade |
| `/tausch`             | `src/routes/tausch.tsx`        | Incoming / outgoing / history of trade offers   |

Shared pieces: `src/components/site-header.tsx` (nav, account menu, mounts `AuthDialog` and `CreateListingDialog`), `src/components/site-footer.tsx`, and `src/components/market/*` (item tiles, item picker, listing card, player badge, dialogs).

### Design

- Dark-only theme (`<html class="dark">`), warm dusty palette with amber primary. Both `:root` and `.dark` in `src/styles.css` hold the same values.
- Extra tokens: `stripe-red|yellow|green|cyan` (the Arc Raiders four-colour band, `.raider-stripes` utility) and `rarity-common…legendary` for item rarity.
- Fonts: Barlow Condensed (headings, `font-display`, usually uppercase) and Barlow (body), loaded from Google Fonts in `__root.tsx`.
- Hero image `public/img/hero.png` (AI-generated) is served via the Netlify Image CDN.
- All UI copy is German.

### Tech Stack

| Layer         | Technology                                          |
| ------------- | --------------------------------------------------- |
| Framework     | TanStack Start                                      |
| Frontend      | React 19, TanStack Router                           |
| Build         | Vite 8                                              |
| Styling       | Tailwind CSS 4, theme variables in `src/styles.css` |
| UI Components | shadcn/ui (Radix UI + Tailwind)                     |
| Toasts        | sonner                                              |
| Icons         | lucide-react                                        |
| Language      | TypeScript 6.0 (strict mode)                        |
| Deployment    | Netlify, via `@netlify/vite-plugin-tanstack-start`  |

## Directory Structure

```
├── public
│   ├── favicon.ico
│   └── img/hero.png    # Landing hero, served through /.netlify/images.
├── src
│   ├── components
│   │   ├── auth-dialog.tsx # Sign-in / register dialog (stubbed).
│   │   ├── error-pages.tsx # Themed 404 and route error pages with home/retry actions.
│   │   ├── market      # Marketplace building blocks: item tiles, picker, listing card, dialogs.
│   │   ├── site-footer.tsx
│   │   ├── site-header.tsx
│   │   └── ui          # shadcn/ui controls, overlays, feedback, forms, and tables.
│   ├── data
│   │   ├── fixtures.ts # All stub data (see Project Overview).
│   │   └── types.ts    # Domain types.
│   ├── examples
│   │   └── validated-form.tsx # Unmounted form pattern with validation, pending, error, and success states.
│   ├── lib
│   │   ├── format.ts   # German relative time / date helpers.
│   │   ├── session.tsx # In-memory session + marketplace state (stub for Identity/DB).
│   │   └── utils.ts    # cn() helper for merging Tailwind classes.
│   ├── routes
│   │   ├── __root.tsx  # HTML shell, fonts, header/footer, SessionProvider, toasts.
│   │   ├── index.tsx   # Landing page (/).
│   │   ├── markt.tsx   # Marketplace (/markt).
│   │   ├── angebot/$listingId.tsx # Listing detail.
│   │   └── tausch.tsx  # My trades (/tausch).
│   ├── router.tsx      # Creates the router from the generated route tree.
│   └── styles.css      # Tailwind import, theme variables for light and dark mode, base styles.
├── components.json     # shadcn/ui config, used by `npx shadcn add`.
├── netlify.toml        # Build command, publish directory, dev server ports.
├── package.json
├── tsconfig.json
└── vite.config.ts      # Vite path aliases and Tailwind, Netlify, TanStack Start, React plugins.
```

`src/routeTree.gen.ts` is generated by the router plugin when the dev server or build runs. Don't edit it.

Shared framework skill source lives in `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the matching framework/Netlify skills when available in a generated app; don't assume the starter contains a `.claude` directory.

## Key Concepts

### File-Based Routing

Route files in `src/routes/` define pages and endpoints:

- `__root.tsx` wraps every page.
- `index.tsx` is `/`.
- `about.tsx` would be `/about`.
- `api.*.ts` files are server API endpoints. See the `tanstack-start-api-routes` skill.

### Theme Variables

Colors and corner radius are CSS variables in `src/styles.css` (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--radius`, and more), with a second set under `.dark`. Tailwind exposes them as classes such as `bg-primary`, `text-muted-foreground`, and `border-border`.

Set these variables for the product before you build any page. In components, use the variable classes instead of raw colors like `bg-white` or `text-gray-600`, so the whole site changes when a variable changes.

### UI Components

Ready-made components are in `src/components/ui/`. Use them before writing your own, and restyle them through the theme variables or their variants. Add more with `npx shadcn add <name>`. Show a toast by calling `toast()` from `sonner`; the container is already mounted in `__root.tsx`. `TooltipProvider` is mounted there too, so `Tooltip` works anywhere without its own provider.

| Need               | Components                                                         |
| ------------------ | ------------------------------------------------------------------ |
| Actions and status | Button, Badge, Progress, Skeleton, Alert, Sonner                   |
| Forms              | Input, Textarea, Label, Checkbox, RadioGroup, Switch, Select, Form |
| Overlays and menus | Dialog, Sheet, Popover, DropdownMenu, Tooltip                      |
| Content and layout | Card, Tabs, Accordion, Separator, Table                            |

Use `Form` with React Hook Form and the Zod resolver. Start from `src/examples/validated-form.tsx`; it isn't mounted or connected to a backend. Its required `onSubmit` callback must reject on failure. See [the form pattern](docs/forms.md) for HTTP submission and error handling.

Use Sheet for a mobile menu and DropdownMenu for short action lists. Give Dialog and Sheet an accessible title and description. Pair Checkbox, RadioGroup, Switch, and inputs with visible labels. Reserve tables for tabular data and wrap them in their provided scroll container.

### Design Choices

Set the product's palette, heading/body fonts, and layout before building its screens. Use an explicit user design when supplied; otherwise choose defaults that fit the product. Keep Basic's placeholder until you replace it with the requested product.

- Set `--font-body` and `--font-heading` in `src/styles.css`. Use `font-display` for headings when the product needs a separate heading font.
- Use `max-w-content` for a page container and `max-w-reading` for long text. Keep consistent horizontal padding, such as `px-4 sm:px-6`, and a small repeated spacing scale, such as `gap-4`, `gap-6`, and `py-12`.
- Keep one main heading per page and a clear heading order. Use muted text for supporting copy, not essential low-contrast labels.
- Preserve focus rings. Give icon-only buttons an accessible name. Ensure actions work with a keyboard and on narrow screens.
- Use short color/opacity transitions. Add `motion-reduce:transition-none` or `motion-reduce:animate-none` when adding motion; don't make essential content depend on animation.
- Provide loading, empty, error, and success states for each data-driven screen. Skeletons should follow the shape of the content they replace.

### Routing and Server Data

Router types are registered in `src/router.tsx`, so use typed `Link` destinations and route parameters. The root route supplies the themed 404 page; the router's default error component supplies the safe retry/home page, including child-route SSR failures. Use `throw notFound()` for absent records; keep unexpected failures on the error path. See [routing conventions](src/routes/README.md).

Start with route loaders and server functions for server data. Validate server-function input with `.validator(...)`, keep secrets on the server, and handle HTTP failures before returning data. See [the data-fetching pattern](docs/data-fetching.md). Add TanStack Query only when client-side caching, mutations, or background refresh are needed.

### Browser Storage

Pages are rendered on the server first, where `window` and `localStorage` don't exist. Read `localStorage` inside `useEffect`, not during render or in a `useState` initializer, or the first render will differ from the server HTML and React will log a hydration error.

## Configuration Files

| File             | Purpose                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `vite.config.ts` | Vite path aliases and Tailwind, Netlify, TanStack Start, React plugins                           |
| `tsconfig.json`  | Strict TypeScript, with the `@/*` alias for `src/*`                                              |
| `netlify.toml`   | Builds with `vite build`, publishes `dist/client`, dev server on port 8888 proxying Vite on 3000 |

## Development Commands

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. The installed lint and test tools set this minimum alongside the framework.

```bash
npm run dev        # Start the Vite dev server on port 3000
npm run build      # Production build
npm run typecheck  # Type-check with tsc; the build doesn't
npm run lint       # Check TypeScript and React Hooks rules
npm run format:check # Check formatting
npm run format     # Format project files
npm test           # Run local form, control, and error page tests
npm run preview    # Preview the production build
```

## Conventions

- Components: PascalCase. Utilities and hooks: camelCase. Route files: kebab-case.
- Import from `src` with the `@/` alias.
- TypeScript fails on unused locals and parameters, so remove what you don't use.
- Use React hooks for state.
- Run the dev server or build once to generate route types before type-checking a fresh copy.
- Run build, typecheck, lint, format:check, and tests before reporting completion. Verify changed user flows locally; a passing build doesn't prove an interaction works.

## Application Name

Set the product's name and description in `src/routes/__root.tsx`:

- `siteName` is the page title and the title shown when the link is shared.
- `siteDescription` is the meta description and the description shown when the link is shared.

These are already set for Raider Exchange.

# CardWise

UAE credit card rewards optimization web app. Two user paths:
- **Path A:** Optimize rewards across cards the user already owns
- **Path B:** Recommend the best card portfolio for their spending profile

## Stack
- Frontend: Next.js 14 + React + Tailwind CSS
- Backend: Supabase (PostgreSQL) + RLS
- Hosting: Vercel

## Key files
- `app/` — Next.js pages and routes
- `components/` — React components
- `lib/` — Utilities and Supabase client
- `docs/` — Schema, project brief, card data (reference manually when needed)

## Database
13 tables. Core flow: `cards` → `card_rewards` → `spending_categories`
The `effective_return_pct` field on `card_rewards` is the single normalized AED return % that powers all rankings. Never change this without a verified T&C source.
Supabase credentials in `.env.local`.

## Current status
86 cards verified across 13 banks. Verification essentially complete.
Banks: FAB (17), ENBD (26), Mashreq (4), Liv (2), ADIB (3), ADCB (11), RAKBank (3), Citi (3), Wio (1), HSBC (2), Standard Chartered (2), DIB (5), CBD (4).
Frontend: Path A and Path B implemented. Focus is now on frontend polish and data integrity.

## Conventions
- Always use `source_url` + `last_verified_date` when writing card_rewards rows
- Points/miles cards: use `reward_currency_value_aed` to normalize to AED
- Brand bonuses go in `notes` field with 🎁 emoji, not in `effective_return_pct`
- `notes` is user-facing — no `Source: filename.pdf` citations, no file paths, no clause refs; put those in `source_url` only
- Caps: `monthly_cap_spend_aed` (spend threshold) or `monthly_cap_reward` (AED reward ceiling) — use whichever the T&C specifies
- 17 category slugs: dining, groceries, fuel, airlines, shopping, hotels, other_travel, online_shopping, entertainment, utilities, education, insurance, government, rent, healthcare, international, general

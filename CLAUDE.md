# CardWise — Card Verification Agent

## Project Overview

Building a UAE credit card rewards optimization web app. Current phase: **Card verification** — comparing Supabase `card_rewards` and `card_benefits` tables against official bank T&Cs to ensure accuracy before launch.

Users will ask: "Which card should I use right now at [merchant]?" CardWise answers with the best card ranked by effective reward %, caps, exclusions, and active offers.

---

## Immediate Task: Verify All 46 UAE Credit Cards

For each card, complete the verification workflow:

1. **Read the official T&C PDF** from the bank (stored in `/tcpdfs/`)
2. **Extract exact reward rates** for all spending categories
3. **Query current Supabase data** to see what's stored
4. **Identify discrepancies** between T&C and database
5. **[IMPORTANT] Check if this card is actually multiple tiers** (see "Discovering Card Variants" below)
6. **Update Supabase** with correct data + metadata (source_url, last_verified_date)
7. **Update verification status markdown** (`docs/cards_verification_status.md`)
8. **Document patterns & insights** in research summary

### ⚠️ Discovering Card Variants During Verification

**You may discover that what appears to be ONE card is actually MULTIPLE different tier variants.** This happened with FAB Etihad Guest (Signature, Platinum, Infinite are separate cards with different reward rates and benefits).

#### How to Recognize Card Variants

When reading the T&C PDF, look for:
- **Different reward rates by tier** (e.g., Signature earns 1.375% domestic, Infinite earns 1.75% domestic)
- **Different benefits by tier** (e.g., Platinum has 0 lounge visits, Signature has 4, Infinite has 6)
- **Different annual fees by tier** (e.g., AED 500 for Platinum, AED 700 for Signature, AED 1,500 for Infinite)
- **Different min salary requirements** (e.g., AED 8,000 for Signature, AED 25,000 for Infinite)
- **Different card networks/tiers** (Visa Signature vs Visa Infinite vs Mastercard World)
- **Section headers** in T&C like "Tier Comparison Table" or "Available Tiers" or "Card Variants"

#### What to Do When You Find Multiple Tiers

1. **Do NOT merge them into one card entry**
2. **Create separate card entries** in the `cards` table (one per tier variant)
3. **Use distinct naming:** Include tier in card name (e.g., "FAB Etihad Guest Signature Credit Card")
4. **Create separate card_rewards rows** for each card (different card_id per tier)
5. **Update the total card count** in `docs/cards_verification_status.md` (e.g., "46 cards → 49 cards")
6. **Document the split** with a note explaining the discovery

#### Example: FAB Etihad Guest Split

**Before verification:** 1 card entry
```
FAB Etihad Guest Signature Credit Card
```

**After discovering tiers:** 3 card entries with separate reward rates
```
FAB Etihad Guest Signature Credit Card  (AED 700 fee, 1.375% domestic)
FAB Etihad Guest Platinum Credit Card   (AED 500 fee, 1.0% domestic)
FAB Etihad Guest Infinite Credit Card   (AED 1,500 fee, 1.75% domestic)
```

Each tier has distinct reward rates → requires separate database entries.

#### SQL to Create New Card Variants

When you find variants, INSERT new cards:
```sql
INSERT INTO cards (
  id, bank_id, name, card_network, card_tier, 
  annual_fee_aed, min_salary_aed, reward_currency_name, reward_currency_value_aed,
  base_earn_rate, base_earn_unit, forex_markup_pct, interest_rate_monthly_pct,
  lounge_access_count, lounge_access_network, valet_parking_count,
  travel_insurance, purchase_protection, concierge, airport_transfer_count,
  source_url, summary, is_active
)
VALUES (
  gen_random_uuid(),
  'e9c6979d-2066-4225-94ce-c38bec744a4f',  -- FAB bank_id
  'FAB Etihad Guest [TIER] Credit Card',
  'visa',
  '[signature/platinum/infinite]',
  [annual_fee],
  [min_salary],
  'Etihad Guest Miles',
  0.05,
  [base_earn_rate],
  'miles_per_aed',
  2.49,
  3.5,
  [lounge_count],
  'priority_pass',
  [valet_count],
  true,
  true,
  false,
  [airport_transfers],
  'https://[bank-tc-pdf-url]',
  'VERIFIED. [Description of tier-specific rates and benefits]',
  true
);
```

Then create corresponding `card_rewards` rows for each tier's distinct reward rates.

#### Update the Card Count

Update `docs/cards_verification_status.md`:
```
Before: **Total cards to verify:** 46
After:  **Total cards to verify:** 49 (split 1 multi-tier card into 3 separate cards)
```

#### Document the Split in Verification Status

When you document the split, use this format:
```markdown
### FAB Etihad Guest — DISCOVERED 3 TIERS ✅

Originally entered as 1 card during initial data entry. During verification of the official T&C, discovered 3 distinct tiers with different reward rates, annual fees, and benefits. Split into 3 separate card entries in the database.

| Card | Tier | Annual Fee | Min Salary | Domestic Earn | Status |
|------|------|------------|-----------|---------------|--------|
| FAB Etihad Guest Signature | Signature | AED 700 | AED 15,000 | 1.375% | ✅ |
| FAB Etihad Guest Platinum | Platinum | AED 500 | AED 8,000 | 1.0% | ✅ |
| FAB Etihad Guest Infinite | Infinite | AED 1,500 | AED 25,000 | 1.75% | ✅ |

**Discovery note:** Tier comparison found in T&C Section 3.2 (page 8). Each tier has distinct reward rates and benefit packages. Card count increased from 46 → 49.
```

#### Update Research Summary

Add findings to `docs/research_summary.md`:
```markdown
### Card Variants Discovery Pattern

When verifying, we discovered that some card products are actually **multi-tier offerings** with distinct product lines:

**FAB Etihad Guest** (example):
- Signature tier: Mid-level product (AED 700/year, 1.375% domestic)
- Platinum tier: Entry-level product (AED 500/year, 1.0% domestic)  
- Infinite tier: Premium product (AED 1,500/year, 1.75% domestic)

**Implication:** Banks often market one "card name" but internally operate 2-3 distinct products with different reward structures. The database must treat each tier as a separate card to accurately represent earning potential.

**Recommendation:** When verifying future cards (e.g., ENBD Skywards), check the T&C for tier variants before finalizing data entry.
```

#### Key Principle

**Each distinct product with different reward rates = one separate card entry**

- If tiers have identical reward rates but different benefits (lounge access, etc.), they CAN be one entry with detailed notes.
- If reward rates differ between tiers, they MUST be separate entries (different card_id, different card_rewards rows).

**This increases overall card count but provides accurate data for recommendations.**

---

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Backend:** Supabase (PostgreSQL) + Row-Level Security (RLS)
- **Database:** 13 tables (see `docs/schema.md`)
- **Environment:** Node.js + TypeScript + npm
- **Hosting:** Vercel (Next.js native)

---

## Key Database Tables (for verification)

### cards
All UAE credit card products. Key fields:
- `id` (uuid), `bank_id`, `name`, `card_network`, `card_tier`
- `annual_fee_aed`, `reward_currency_name`, `reward_currency_value_aed`
- `is_active`, `source_url`, `summary`

### card_rewards ⭐ (CORE TABLE)
Maps each card × spending_category to an earn rate. **This is where verification happens.**

| Column | Usage |
|--------|-------|
| `card_id` | Which card |
| `category_id` | Which spending category (dining, groceries, airlines, etc.) |
| `reward_type` | 'points', 'miles', 'cashback' |
| `earn_rate` | Raw earn rate (e.g., 3 per USD, or 12 percent) |
| `earn_unit` | 'per_aed', 'per_usd', 'pct' |
| `effective_return_pct` | **Normalized AED return %** (this powers rankings) |
| `monthly_cap_spend_aed` | Max spend to earn cap (e.g., first AED 10k/month) |
| `monthly_cap_reward` | Max reward per month (e.g., AED 300 cashback/month) |
| `min_txn_amount_aed` | Minimum transaction to earn (e.g., AED 100+) |
| `is_promotional` | Is this a temporary promo rate? |
| `promo_end_date` | When does promo end? |
| `exclusions` | Category-level gotchas (text field) |
| `source_url` | Link to bank T&C PDF (ALWAYS REQUIRED) |
| `last_verified_date` | Date this row was verified (ALWAYS REQUIRED) |
| `notes` | Brand bonuses, conditions, etc. (e.g., "🎁 Earns 2.45% at Marriott, 1.23% general") |
| `is_active` | Is this reward currently active? |

### card_benefits
Benefits tied to each card (not category-specific). Examples:
- Lounge access (Priority Pass, 4 visits/year)
- Valet parking (2 complimentary per month)
- Travel insurance
- Welcome bonus (cashback, miles)

### spending_categories
Fixed list of 17 spending categories (sorted by sort_order):
1. **dining** (🍽️) — Restaurants, cafés, food delivery (Talabat, Deliveroo)
2. **groceries** (🛒) — Supermarkets (Carrefour, Lulu, Spinneys, Choithrams)
3. **fuel** (⛽) — Petrol stations (ADNOC, ENOC, Emarat)
4. **airlines** (✈️) — Airline ticket purchases direct from airlines
5. **shopping** (🛍️) — Clothing, fashion, department stores, electronics, home goods (H&M, Zara, Sharaf DG, IKEA)
6. **hotels** (🏨) — Hotel bookings (direct or via booking platforms)
7. **other_travel** (✈️) — Travel agencies, booking sites (Booking.com, MakeMyTrip), car rentals
8. **online_shopping** (💻) — Amazon.ae, Noon, general e-commerce
9. **entertainment** (🎬) — Cinema, theme parks, concerts, streaming
10. **utilities** (💡) — DEWA, Etisalat, du, SEWA, FEWA, Salik
11. **education** (📚) — School fees, university tuition, courses
12. **insurance** (🛡️) — Health, motor, property insurance premiums
13. **government** (🏛️) — Government fees, fines, visa charges
14. **rent** (🏠) — Rental payments (if payable by card)
15. **healthcare** (🏥) — Hospitals, clinics, pharmacies
16. **international** (🌍) — Any spend in foreign currency
17. **general** (💳) — All other spend not in above categories

### merchants
Maps real-world merchant names to categories. Examples:
- Carrefour → groceries
- Talabat → dining (or excluded from dining on certain cards)
- Emirates → airlines
- Marriott → hotels

---

## Verification Checklist (per card)

### Read the T&C
- [ ] Download official T&C PDF from bank website
- [ ] Save to `/tcpdfs/[bank]-[card-name]-tc.pdf`
- [ ] Note page numbers where rewards are defined
- [ ] **Check for tier variants** (Signature vs Platinum vs Infinite, etc.)

### Check for Card Variants/Tiers
- [ ] Does the T&C mention multiple tiers or variants?
- [ ] Do different tiers have different reward rates?
- [ ] Do different tiers have different annual fees?
- [ ] Do different tiers have different benefits?
- [ ] If YES to any above: This is multiple cards, not one card

### Extract Reward Rates
- [ ] Find reward rate for EACH of the 16 spending categories: dining, groceries, fuel, airlines, shopping, hotels, other_travel, online_shopping, entertainment, utilities, education, insurance, government, rent, healthcare, international, general
- [ ] Note if category is excluded entirely (earns 0%)
- [ ] Extract earn rate (e.g., "3 points per USD", "12% cashback", "1 mile per AED")
- [ ] Record earn_unit: 'per_aed', 'per_usd', or 'pct'

### Calculate effective_return_pct
Use this formula:
```
effective_return_pct = (earn_rate × reward_currency_value_aed) / (100 if earn_unit is 'pct' else 1)

Examples:
- 3 points/USD × 0.01 AED per point ÷ 3.67 (USD to AED) = 0.82% ✓
- 12% cashback = 12.0% ✓
- 1.5 miles/AED × 0.03 AED per mile = 0.045% → 4.5% (if displayed as percent) ✓
```

### Identify Caps
- [ ] Monthly spend cap: e.g., "Earns 5% on first AED 10k, then 1%"
  - Store in `monthly_cap_spend_aed`
- [ ] Monthly reward cap: e.g., "Max AED 300 cashback per month"
  - Store in `monthly_cap_reward`
- [ ] Minimum transaction: e.g., "Must spend AED 100+ per transaction"
  - Store in `min_txn_amount_aed`

### Document Exclusions
- [ ] Food delivery excluded from dining? (Talabat, Deliveroo, etc.)
- [ ] Online bookings excluded from travel? (Booking.com, Agoda, etc.)
- [ ] Specific merchants excluded?
  - If yes: use `card_reward_exclusions` table
  - If no/general: use `notes` field with callout

### Extract Brand Bonuses
- [ ] Higher earn rate at specific brands? (e.g., Marriott, Emirates)
- [ ] Store base rate in `effective_return_pct` (e.g., 1.23%)
- [ ] Store brand bonus in `notes` field with 🎁 emoji:
  - Example: "1.23% at any hotel. 🎁 Earns 2.45% at Marriott Bonvoy properties (3 pts/USD vs 1.5 pts/USD)."

### Update Supabase
- [ ] Query current `card_rewards` rows for this card
- [ ] For each category: compare T&C data vs. Supabase
- [ ] Update discrepancies:
  - ALWAYS set `source_url` = link to T&C PDF
  - ALWAYS set `last_verified_date` = today's date
  - Add `notes` field with findings/gotchas
  - Set `is_active` = true (unless rate expired)
- [ ] If you discovered multiple tiers: Create NEW card entries for each tier

### Update Verification Status
- [ ] Update `docs/cards_verification_status.md`
- [ ] Change status from ⏳ Pending → ✅ Verified
- [ ] Add `last_verified_date` (today)
- [ ] Add brief notes (gotchas, interesting patterns)
- [ ] If you split a card: Increase total card count and explain the split

### Document Findings
- [ ] Update `docs/research_summary.md` if patterns emerge
- [ ] Examples: "Most cards cap dining at AED 300/month", "ENBD has best travel rewards"
- [ ] If you discovered card variants: Note the pattern for future reference

---

## Database Connection

### Supabase Setup
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Query card_rewards for a card
const { data } = await supabase
  .from('cards')
  .select('*, card_rewards(*)')
  .eq('name', 'Emirates NBD Skywards Signature Credit Card');

// Update a card_rewards row
await supabase
  .from('card_rewards')
  .update({
    effective_return_pct: 1.43,
    source_url: 'https://...',
    last_verified_date: new Date().toISOString().split('T')[0],
    notes: 'Verified against official T&C'
  })
  .eq('card_id', cardId)
  .eq('category_id', categoryId);
```

---

## File Locations

```
CARDWISE/
├── CLAUDE.md                          ← This file
├── tcpdfs/                            ← Bank T&C PDFs
│   ├── enbd-skywards-sig-tc.pdf
│   ├── fab-travel-card-tc.pdf
│   └── ... (one per card)
├── docs/
│   ├── schema.md                      ← Full database schema (13 tables)
│   ├── cards_verification_status.md   ← Track verified vs. pending
│   ├── project_brief.md               ← Project context & JTBD
│   └── research_summary.md            ← Insights from verification
├── scripts/
│   └── verify_cards.js                ← Helper script
├── .claude/                           ← Claude Code config (auto-generated)
├── app/                               ← Next.js app
├── components/                        ← React components
├── lib/                               ← Utilities
├── public/                            ← Static assets
├── .env.local                         ← Environment variables
├── package.json
├── tsconfig.json
└── ...
```

---

## Data Entry Standards

### Required Fields (never skip)
- `effective_return_pct` — Always calculated and verified
- `source_url` — Direct link to bank T&C (primary source)
- `last_verified_date` — Date of verification (YYYY-MM-DD)

### Recommended Fields
- `notes` — Plain English explanation of rewards, brand bonuses, gotchas
- `is_active` — Set to true unless rate is expired/discontinued

### Format Examples

**Dining rewards (no brand bonus):**
```
card_id: [ENBD Skywards Sig]
category_id: [dining]
reward_type: 'miles'
earn_rate: 1
earn_unit: 'per_aed'
effective_return_pct: 1.43
source_url: 'https://www.emiratesnbd.ae/skywards-signature-tc.pdf'
last_verified_date: '2026-03-31'
notes: '1 Skywards mile per AED spent on dining. Standard earn rate (no dining bonus on this card).'
```

**Travel rewards with brand bonus:**
```
card_id: [ENBD Marriott]
category_id: [hotels]
reward_type: 'points'
earn_rate: 1.5
earn_unit: 'per_aed'
earn_per_x_aed: 3.67 (conversion factor)
effective_return_pct: 1.23
monthly_cap_spend_aed: null (no cap)
source_url: 'https://www.marriott.com/uae-credit-card-tc.pdf'
last_verified_date: '2026-03-31'
notes: '1.23% at any hotel. 🎁 Earns 2.45% at Marriott Bonvoy properties (3 pts/USD vs 1.5 pts/USD).'
```

**Capped reward:**
```
card_id: [RAKBank World]
category_id: [airlines]
reward_type: 'cashback'
earn_rate: 10
earn_unit: 'pct'
effective_return_pct: 10.0
monthly_cap_reward: 400 (AED 400 max/month)
min_monthly_spend_aed: 10000 (need AED 10k to hit cap)
source_url: 'https://www.rakbank.ae/world-card-tc.pdf'
last_verified_date: '2026-03-31'
notes: '10% cashback on airline tickets. ⚠️ Airlines + Hotels share a combined cap of AED 400/month.'
```

---

## Key Instructions

### On PDFs
- Extract exact numbers from T&Cs
- Use page references in notes: "See page 5, section 2.3"
- Convert USD rates to AED using 1 USD = 3.67 AED
- If rate is ambiguous, flag with "Verify with bank" in exclusions
- **Always check for tier variants before assuming it's one card**

### On Database Updates
- NEVER update without `source_url` + `last_verified_date`
- Always check for existing `card_rewards` rows before inserting
- If row doesn't exist, create it (INSERT)
- If row exists, update it (UPDATE)
- Set `is_active = true` unless rate is expired/discontinued
- **If you discover the card is multiple tiers: Create separate card entries, do NOT merge**

### On Brand Bonuses
- Store base rate in `effective_return_pct` (applies to all merchants in category)
- Store bonus in `notes` field with emoji callout
- Example: "🎁 Earns 2.45% at Marriott (higher than 1.23% general rate)"

### On Exclusions
- Food delivery excluded from dining? → Use `card_reward_exclusions` table
- Category entirely excluded? → Leave `card_rewards` row blank (null effective_return_pct)
- Minor gotchas? → Use `notes` field with ⚠️ emoji

### On Ambiguity
- Never guess rates
- Always cite the T&C page
- If unclear: flag with notes: "Verify with bank" + escalate to human review

---

## Important Notes

- **Primary source:** Official bank T&C PDFs (ALWAYS verify here first)
- **Never assume:** Rates change; always check the document
- **One source of truth:** Supabase `card_rewards` table (after verification)
- **Traceability:** Every row must have source_url + last_verified_date
- **Card variants matter:** One marketing name ≠ one card product if tiers differ
- **Human review:** Flag ambiguities for manual verification

---

## Success Criteria

✅ Card is "verified" when:
1. All categories (16) have reward rates extracted and entered
2. All caps documented (monthly_cap_reward, monthly_cap_spend_aed)
3. All exclusions identified (card_reward_exclusions table OR notes)
4. `source_url` = official bank T&C link
5. `last_verified_date` = verification date
6. `notes` field explains gotchas + brand bonuses
7. `docs/cards_verification_status.md` updated with ✅ status
8. **If multiple tiers discovered: All tier variants created as separate cards**

---

## Questions to Ask Claude Code

When you're unsure about a rate, cap, or whether you've found card variants, ask:

```
"I'm verifying [Card Name]. The T&C shows [quote]. 
I notice there are different rates for [Signature/Platinum/Infinite].
Should these be one card or multiple cards?
How should I enter this in Supabase?"
```

Claude Code will:
- Analyze the rate differences
- Confirm if multiple cards are needed
- Help create separate entries if required
- Update Supabase appropriately

---

## Let's Go!

You're ready to verify. Start with the first bank (FAB). Pick the FAB Infinite card. Read the T&C. Check for tiers. Extract the rewards. Update Supabase. Update the markdown.

**One card at a time. Watch for variants. You've got this.**

# CardWise — Project Brief

> What CardWise is, why it exists, and how it works. Reference this when onboarding to new chats or clarifying scope.

---

## What is CardWise?

**CardWise** is a UAE credit card rewards optimization web app. It answers the question: **"Which credit card should I use right now?"**

Users tell CardWise:
1. Which cards they have
2. How much they typically spend in each category (dining, groceries, travel, etc.)

CardWise tells them:
- Which card gives the highest rewards **right now** at a specific merchant or category
- Which new card would add the most value to their portfolio annually
- Whether they're "leaving money on the table" (missing out on better rewards across categories)
- What active promotions apply to their cards

---

## The Core Insight

Most UAE credit card users carry 2–4 cards but use the wrong one 60–70% of the time. A 10-second lookup could save them AED 5,000–10,000 per year by optimizing their card choice per transaction.

**No tool exists for this in the UAE market.** Comparison sites (Soulwallet, Yallacompare) show card features; they don't optimize spend or answer "which card do I tap right now?"

---

## Core User Jobs (JTBD)

### Job 1: "Which card do I use right now?" (In-the-moment optimization)
- **Trigger:** User is at a merchant (Carrefour, Emirates, Marriott) or knows the category (dining, travel)
- **Need:** Instant ranked answer with effective return % + any caps/conditions
- **Time budget:** Under 3 seconds
- **Delivered by:** Search bar (merchant name) → Recommendation view → Ranked cards

### Job 2: "Which new card should I get?" (Portfolio building)
- **Trigger:** User asks, "Am I missing value? Should I add another card?"
- **Need:** Calculator showing annual rewards by spending profile + welcome bonuses − fees = net annual value
- **Delivered by:** Card browser → Detail page → Value calculator

### Job 3: "Am I leaving money on the table?" (Portfolio audit)
- **Trigger:** User sets their spending profile
- **Need:** Category-by-category gap analysis: current best card vs. market best card
- **Delivered by:** My wallet → Spending profile setup → Audit view

### Job 4: "Any deals I should know about?" (Offer discovery)
- **Trigger:** New offers posted by banks
- **Need:** Filter to user's cards, show value, alert on expiring offers
- **Delivered by:** Offers page + in-app notifications

---

## Tech Stack

**Frontend:** Next.js (React) + Tailwind CSS  
**Backend:** Supabase (PostgreSQL) + Row-Level Security (RLS)  
**State:** React hooks (useState, useContext for user's cards)  
**Hosting:** Vercel (Next.js native)

---

## Database Overview

**13 tables, ~46 credit cards, ~16 spending categories.**

**Core data flow:**
```
User searches "Carrefour" 
  → Lookup in merchants table (Carrefour = groceries category)
  → Query card_rewards for all cards + groceries
  → Filter to user's cards from user_cards table
  → Sort by effective_return_pct DESC
  → Show top card with caps, exclusions, last_verified_date
```

**Key innovation:** `effective_return_pct` normalizes all reward types (points, miles, cashback %) into one comparable number.

---

## Current Status (March 31, 2026)

### ✅ Complete
- Database schema finalized (13 tables)
- Spending categories structured
- SQL migration scripts written + tested
- Initial seed data for banks, categories, merchants (~50 popular stores)
- Research spreadsheet: 46 UAE credit cards mapped with initial rewards data

### 🔄 In Progress
- **Card-by-card T&C verification** (currently in progress — reading official bank PDFs, cross-checking reward rates, identifying caps/exclusions)
- Data entry into Supabase (card_rewards table is the bottleneck)

### ⏳ Pending (Post-MVP)
- Offers table seeding (top 20 current promotions)
- Loyalty program integration (Skywards, Marriott, etc.)
- Reward tiers (cards with stepped earn rates)
- Frontend components (recommendation engine, portfolio audit, card browser)
- User auth + spending profile onboarding

---

## Data Quality Standards

Every row in `card_rewards` must have:
- ✅ `effective_return_pct` — verified from T&C
- ✅ `source_url` — link to bank T&C PDF or website
- ✅ `last_verified_date` — date of verification
- ✅ `notes` — gotchas, brand bonuses, conditions in plain English

**Verification cadence:** Weekly for active cards, monthly for secondary cards.

---

## Design Principles (why the schema is shaped this way)

### 1. Jobs to Be Done (JTBD)
Every table exists to serve a user job. Banks table → filters cards by issuer. Merchants table → maps real names to categories (Carrefour, Talabat, Emirates).

### 2. Choice Architecture
Don't show users a spreadsheet of numbers. Show one ranked card + effective return %. Hide complexity (caps, exclusions) in toggles/tooltips, but never hidden.

### 3. Trust & Transparency
- `last_verified_date` + `source_url` on every reward row (show when/where data came from)
- `exclusions` field for per-card gotchas
- `is_promotional` flag so users aren't surprised when a rate expires
- UI must say "estimated return" not "guaranteed return"

### 4. Context-Awareness
Users think in merchants ("I'm at Carrefour"), not MCC codes. The `merchants` table bridges this gap. The `card_reward_exclusions` table handles per-card exceptions.

### 5. Normalization for Comparison
Different cards offer different reward types (points, miles, cashback %). `reward_currency_value_aed` + `effective_return_pct` normalize these into one currency so users can compare apples-to-apples.

---

## Known Constraints & Trade-offs

| Constraint | Impact | Rationale |
|-----------|--------|-----------|
| Manual data entry for card T&Cs | Slow MVP, but high trust | No web scraping / API access to bank T&Cs; manual verification ensures accuracy |
| No live merchant transaction history | Can't auto-categorize actual spend | PSD2/UAE regulations limit data access; users manually set spending profile |
| Fixed spending categories (14) | Simplifies logic, but less granular | MVP scope; categories cover ~95% of spend patterns |
| Caps modeled as monthly, not annual | May not fit all cards | Most UAE cards use monthly caps; can add annual cap field if needed |
| No fees modeled in recommendation engine yet | Oversimplifies card value | Fees will be added in Job 2 (new card calculator) |

---

## Revenue & Sustainability (Future)

MVP is free. Monetization paths being explored:
- Referral fees from bank partner links
- Premium "white-label" dashboard for corporate/HR integrations
- Data licensing to fintech partners (anonymized rewards patterns)

---

## Success Metrics (Post-Launch)

1. **Engagement:** % of users who search a merchant within 7 days (target: 60%)
2. **Utility:** Average estimated annual savings per user (target: AED 4,000)
3. **Trust:** % of users who return within 30 days (target: 40%)
4. **Data quality:** % of last_verified_date < 90 days old (target: 95%)

---

## What's NOT in Scope (MVP)

- ❌ Credit score / eligibility checker
- ❌ Application workflow (deep links to banks only)
- ❌ Live transaction categorization
- ❌ Credit counseling / financial advice
- ❌ International cards (non-UAE issuers)
- ❌ Debit cards

---

## Key Contacts & Resources

**Data sources:**
- Bank websites (primary)
- Soulwallet.com (good UAE card comparison)
- Bank T&C PDFs (definitive for caps/exclusions)
- CardMaven.in forum (community discussions)

**UAE Banking Context:**
- ~13 major banks issue credit cards
- ~500 credit card products exist, but ~42 dominate (top 5 banks account for 70% of market)
- Mandatory free-for-life cards + supplementary cards are common
- Forex markup 1.5–3.5% standard; some premium cards offer 0%
- Lounge access & valet more valuable than cash rewards for high earners

---

## Next Immediate Steps

1. **Complete card-by-card verification** against T&C PDFs
2. **Populate card_rewards table** with all 46 cards × 16 categories (expect ~200+ rows)
3. **Add card_benefits** (lounge, valet, welcome bonuses) for all cards
4. **Seed offers table** with top 20 active promotions
5. **Build frontend recommendation engine** (search + ranking logic)
6. **Test with beta users** (friends with multiple UAE credit cards)

---

## Questions?

If a new chat/Claude session needs context: reference this brief + the schema.md file. That should be 80% of what's needed to resume work.

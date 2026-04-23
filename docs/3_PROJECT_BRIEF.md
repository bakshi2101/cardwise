# CardWise — Project Brief (Revised April 2026)
*UAE Credit Card Rewards Optimization Platform*

---

## What is CardWise?

CardWise is a UAE credit card rewards optimization web app. It answers the question: **"Do I have the right cards for my spending, and am I maximizing rewards across my portfolio?"**

Users tell CardWise:
1. Which cards they currently have (if optimizing) OR what their spending profile is (if seeking recommendation)
2. How much they typically spend in each category (dining, groceries, travel, etc.)
3. Their preferences (number of cards, benefits they care about)

CardWise tells them:
- **Path A (Optimize):** How to get the maximum value out of the cards they already own — which card to use for which category, what they're earning, and how much more is possible
- **Path B (Recommend):** Which cards to get based on their spending profile and preferences
- Optional: Quick reference for specific merchants or categories for in-the-moment card selection
- Optional: Exploration of all UAE cards to understand the broader market

---

## The Core Insight

Most UAE credit card users carry 2–4 cards but **don't know which of their cards works best for each spending category**, leaving AED 5,000–15,000 on the table annually. They lack a clear map of which card to prioritize for each category, and they don't know if their current card portfolio is even optimal for their lifestyle.

> ⚠️ **Gap in the market:** No tool exists for this in the UAE market. Comparison sites (Soulwallet, Yallacompare) show card features; they don't help users audit their portfolio or answer "do I have the right set of cards for how I actually spend?"

---

## Core User Jobs (JTBD)

### Job 1: "How do I get the most from my cards?" (Portfolio optimization) — PATH A

> **Primary focus — Path A.** This is a personal optimization moment. The user wants to know how to correctly use the cards they already carry to maximize rewards, without needing to change anything.

- **Trigger:** User signs up with existing cards and wants to stop leaving rewards on the table
- **Need:** A clear, actionable guide showing which of their cards to use for each category, how much value they're actually generating, and a realistic sense of their upside
- **Delivered by:** Add cards → Set spending profile → Portfolio optimization view (card assignment matrix + earnings snapshot + upside teaser)

*Key insight: This is an optimization-first moment. The user is not shopping for new cards. They want to use what they have more intelligently. All outputs in Path A are scoped to their wallet only.*

---

### Job 2: "Should I get a better portfolio?" (Portfolio recommendation) — PATH B

> **Primary focus — Path B.** This is a decision-support moment. CardWise helps users build an intentional portfolio from scratch or upgrade an underperforming one.

- **Trigger:** User has completed Path A and wants to explore their upside, OR is starting fresh with no strong card preference
- **Need:** Understand which set of cards would work best for their spending profile and preferences, accounting for welcome bonuses, annual fees, and lifestyle benefits
- **Delivered by:** Set spending profile → Select preferences → Get recommendation → See why each card matters

*Key insight: Path B is the natural next step after Path A. The "money left on the table" teaser at the end of Path A is the primary handoff trigger.*

---

### Job 3: "Which card should I use right now?" (In-the-moment reference)

> **Supporting focus — enables both paths.** This is a reference/execution moment. The user already knows their strategy; they need a quick tiebreaker.

- **Trigger:** User is at checkout or a specific merchant and wants a quick card recommendation from their wallet
- **Need:** Simple category-level guide ("Dining → FAB Cashback at 5%") or specific merchant lookup
- **Delivered by:** Category optimization matrix → Optional merchant/category search

---

## Path A — Portfolio Optimization: Detailed Design

> 🎯 **Design Principle:** Path A is entirely scoped to the user's own cards. No market comparisons. No "best card available." No cards the user doesn't own. The entire experience should feel like a personal financial report card on their existing wallet.

### Step 1 — Add Cards

User selects which credit cards they currently carry from the CardWise database. Only their selected cards are used in all subsequent calculations.

### Step 2 — Set Spending Profile

User enters estimated monthly AED spend per category (dining, groceries, fuel, etc.). This becomes the basis for all reward calculations in Path A.

### Step 3 — Portfolio Optimization Output

The output screen has three distinct sections:

---

#### Section A — Card Assignment Matrix *(the core)*
*"Here's which of your cards to use for each category."*

For each spending category, show which of the user's cards yields the highest `effective_return_pct`. Displayed as a glanceable guide — category by category — with the recommended card from their wallet, its effective return %, and any key conditions or caps to be aware of.

**Example output row:**
```
Dining → FAB Cashback (5%) | Groceries → ENBD LuLu (7%) | Fuel → FAB ADNOC (15%)
```

> ⚠️ **Rules:** Never show cards the user does not own. Never reference market alternatives or competitors. Never label anything "best in market."

---

#### Section B — Estimated Rewards Snapshot
*"Here's what you're earning by using your cards correctly."*

Based on the user's spending profile and the card assignment matrix, calculate and display:
- Per-category estimated reward value (AED/month)
- Total monthly rewards value (sum across all categories)
- Total projected annual rewards value

Label this clearly as **estimated earnings when cards are used optimally**. Respect `monthly_cap_spend_aed` and `monthly_cap_reward` in calculations. Always display as "estimated" not "guaranteed."

---

#### Section C — Upside Teaser + Path B CTA *(bottom of screen only)*
*"You could be earning more. Ready to find out how?"*

A single, visually distinct callout at the bottom of the screen showing:
- The aggregate estimated annual gap: *"You could be earning an estimated AED [X] more per year with a better card portfolio."*
- A single CTA button: **"Build my ideal portfolio →"** (routes to Path B)

Gap calculation: `sum of (market_best_effective_return_pct − user_best_effective_return_pct) × monthly_spend_aed`, annualized. The gap figure references **no specific card by name** — it is a single aggregate number only.

> ⚠️ This section must be visually contained and secondary — not the dominant element. It is a teaser, not a comparison view.

---

### Path A Tone & Language Rules

| ✅ Use this language | ❌ Never say this |
|---|---|
| "Here's how to get the most from what you have." | "Compared to the best card on the market..." |
| "Your estimated earnings using your cards optimally." | "The top card for this category is X." |
| "You're leaving AED X on the table overall." | "You could switch to Y card for a better rate." |
| "Ready to upgrade your portfolio?" (CTA only) | "Best in market: 7% at groceries." |

---

## User Journey (MVP Scope)

Both paths begin from a shared entry point where the user chooses their objective.

| PATH A: Optimize Existing Cards | PATH B: Get Portfolio Recommendation |
|---|---|
| Add my cards (which cards do you have?) | Set spending profile (monthly spend by category) |
| Set spending profile (monthly spend by category) | How many cards are you comfortable with? |
| Card assignment matrix: which of your cards wins each category | What benefits matter to you? (Lounge, Valet, Travel insurance, etc.) |
| Estimated earnings snapshot (monthly + annual, from your cards) | Recommended portfolio: cards that fit your profile, why each card, estimated annual rewards |
| Upside teaser + CTA to Path B at bottom | |

**Both paths converge → Optional features available from either path:**
- Search specific merchant/category for in-the-moment card selection from your wallet
- Browse UAE card repository: explore all 52 cards, understand reward structures, compare features

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) + Tailwind CSS |
| Backend | Supabase (PostgreSQL) + Row-Level Security (RLS) |
| State | React hooks (useState, useContext for user's cards and spending profile) |
| Hosting | Vercel (Next.js native) |

---

## Database Overview

**13 tables, ~52 credit cards (post tier splits), 17 spending categories.**

### Core data flow — Path A (Optimize)

```
User provides:
  - Cards in their wallet (user_cards table)
  - Monthly spending by category (user_spending_profile table)

CardWise calculates (scoped to user's cards only):
  - For each category: which of the user's cards gives the highest effective_return_pct
  - Per-category monthly reward value: spending × effective_return_pct (capped at monthly limits)
  - Aggregate gap: max(effective_return_pct across all cards) − user's best, × spend, annualized

Output:
  - Card assignment matrix: best card from user's wallet per category
  - Earnings snapshot: monthly + annual estimated rewards
  - Upside teaser: single aggregate gap figure + CTA to Path B
```

*Key innovation: `effective_return_pct` normalizes all reward types (points, miles, cashback %) into one comparable number in AED, enabling like-for-like comparison across any card type.*

### Core data flow — Path B (Recommend)

```
User provides:
  - Monthly spending by category (user_spending_profile table)
  - Number of cards they want (preference)
  - Benefits they care about (lounge, valet, etc.)

CardWise calculates:
  - Score each card for fit: coverage of their categories + preferences
  - Recommend N cards that maximize annual value
  - Include welcome bonuses, annual fees, benefits weighting

Output:
  - Ranked portfolio recommendations (1–3 portfolios)
  - For each: estimated annual rewards, why each card matters
  - Next steps: how to apply, welcome bonus timeline
```

---

## Current Status (April 2026)

| | Item |
|---|---|
| ✅ | Database schema finalized (13 tables); 17 spending categories structured |
| ✅ | SQL migration scripts written and tested; initial seed data for banks, categories, merchants (~50 stores) |
| ✅ | **47 of 52 cards fully verified** against official T&C PDFs and bank websites |
| ✅ | FAB: all 17 cards verified (Cashback Islamic, Cashback, Rewards Indulge, Elite, Travel, Z, GEMS; Etihad Guest ×3; SHARE ×3; Blue FAB ×3) |
| ✅ | Emirates NBD: all 6 cards verified (Skywards Infinite, Skywards Signature, Marriott Bonvoy World Elite, Marriott Bonvoy World, LuLu 247 Platinum, LuLu 247 Titanium) |
| ✅ | Mashreq: 2 cards verified (Cashback, Noon) |
| ✅ | Liv (ENBD Digital): 2 cards verified (Cashback, Cashback+) |
| ✅ | ADIB: 3 cards verified (Cashback Visa, SHARE Infinite, SHARE Platinum) |
| ✅ | RAKBank: 3 cards verified (World, Titanium, Elevate) |
| ✅ | Citi: 3 cards verified (Cash Back, Premier, Prestige) |
| ✅ | Wio Bank: 1 card verified (Wio Credit Card) |
| ✅ | HSBC UAE: 2 cards verified (Live+, Cash+) |
| ✅ | Standard Chartered: 2 cards verified (Platinum X, Journey — replaced Simply Cash) |
| ✅ | DIB: 5 cards verified (Consumer Cashback Platinum, Consumer Cashback Reward, Prime Infinite, Prime Signature, Prime Platinum — replaced Wala'a Infinite) |
| ❌ | ADCB TouchPoints: 3 cards — earn rates blocked (adcb.com returns 403; supplemental benefits T&C only) |
| ⏳ | CBD: ~5 cards — scraped data only, pending T&C verification |
| ⏳ | Frontend: portfolio optimization view (Path A), recommendation engine (Path B), category matrix, merchant search |
| ⏳ | User auth + spending profile onboarding flow |
| ⏳ | Offers table seeding (top 20 promotions); loyalty program integration; reward tiers |

---

## Data Quality Standards

Every row in `card_rewards` must have:
- `effective_return_pct` — verified from T&C
- `source_url` — link to bank T&C PDF or website
- `last_verified_date` — date of verification
- `notes` — gotchas, brand bonuses, conditions in plain English

*Verification cadence: Weekly for active cards, monthly for secondary cards.*

---

## Design Principles

| Principle | What it means | Why |
|---|---|---|
| JTBD-first | Every table and view exists to serve a specific user job | Prevents scope creep and keeps the product focused |
| Path A = wallet-only | Path A never shows or references cards outside the user's wallet | Clarity and trust: users optimize what they have, not what they don't |
| Two-path architecture | Optimize (Path A) and Recommend (Path B) are distinct flows with a clear handoff | Matches two distinct user mindsets at the right moment |
| Trust & transparency | `last_verified_date` + `source_url` on every reward row; always say "estimated" | UAE users are skeptical of financial tools; provenance builds trust |
| Normalization for comparison | `effective_return_pct` converts points, miles, and cashback to a single AED number | Enables apples-to-apples comparison across all card types |

---

## Known Constraints & Trade-offs

| Constraint | Impact | Rationale |
|---|---|---|
| Manual T&C verification | Slow initial data build, but high trust | No API access to bank T&Cs; manual verification ensures accuracy |
| No live transaction history | Users manually estimate spend per category | UAE regulations limit data access |
| Fixed 17 spending categories | Simplifies logic, slightly less granular | MVP scope; covers ~95% of spend patterns |
| Caps modeled as monthly | May not fit all cards | Most UAE cards use monthly caps; annual cap field can be added if needed |
| Fees excluded from Path A | More complete picture in Path B | Path A focuses on optimization, not acquisition decisions |

---

## Success Metrics (Post-Launch)

| Metric | Definition | Target |
|---|---|---|
| Engagement | % completing Path A or B within 7 days of signup | 70% |
| Utility | Average estimated annual savings surfaced per user (Path A + B combined) | AED 5,000+ |
| Retention | % of users returning within 30 days | 50% |
| Data quality | % of card_rewards rows with last_verified_date < 90 days old | 95% |

---

## What's NOT in Scope (MVP)

- ❌ Credit score / eligibility checker
- ❌ Application workflow (deep links to banks only)
- ❌ Live transaction categorization
- ❌ Credit counseling / financial advice
- ❌ International cards (non-UAE issuers)
- ❌ Debit cards

---

## Next Immediate Steps

1. **Complete CBD card verification** (~5 cards pending; last unverified UAE bank in scope)
2. **Resolve ADCB earn rates** — adcb.com returns 403 on product pages; try direct PDF download or contact bank for T&C (3 cards blocked)
3. Build user spending profile setup flow (shared by both paths)
4. Build Path A output: card assignment matrix + earnings snapshot + upside teaser
5. Build Path B recommendation engine (suggest best card portfolio for spending profile)
6. Build category optimization matrix (shared reference for both paths)
7. Build optional merchant search (in-the-moment card selection)
8. Build card repository browser (optional: explore all cards)
9. Test with beta users (friends with multiple UAE credit cards)

---

## Key Resources

### Data Sources
- **Bank T&C PDFs** — definitive source for caps, exclusions, and earn rates
- **Bank websites** — product pages and KFS documents
- **Soulwallet.com** — useful UAE card comparison reference

### UAE Banking Context
- ~13 major banks issue credit cards; ~52 dominant products (post tier splits)
- Top 5 banks account for ~70% of market; FAB + ENBD alone estimated at 45–55%
- Forex markup 1.5–3.5% standard; some premium cards offer 0%
- Lounge access & valet more valuable than cash rewards for high earners
- Mandatory free-for-life cards + supplementary cards common

---

> 📋 **Onboarding note for new sessions:** If a new Claude session needs context, reference this brief + `1_SCHEMA.md`. That should be 80% of what's needed to resume work.
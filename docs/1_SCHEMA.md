# CardWise — Database Schema (Current)

> Latest schema as of June 2026. Update this when tables are added or restructured.

---

## Quick Overview

**13 tables total:** 9 core + 4 supporting.

**Core purpose:** Map cards → spending categories → reward rates. Support users' JTBD: "Which card should I use right now?"

---

## Core Tables

### 1. banks
Stores the 14 UAE banks that issue credit cards.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | — |
| short_name | text | NO | — |
| logo_url | text | YES | null |
| website_url | text | YES | null |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**Seeded:** FAB, Emirates NBD (ENBD), ADCB, Mashreq, DIB, CBD, RAKBank, Citi, HSBC, StanChart, ADIB, Liv, Wio, Emirates Islamic (EI — added June 2026 as bank #14).

---

### 2. cards
Each credit card product. **Currently 91 rows (1 per card product). All 91 verified against official T&Cs as of June 2026.**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| bank_id | uuid | YES | null |
| name | text | NO | — |
| card_network | text | YES | null |
| card_tier | text | YES | null |
| annual_fee_aed | numeric | YES | 0 |
| annual_fee_waiver_spend | numeric | YES | null |
| supplementary_fee_aed | numeric | YES | null |
| min_salary_aed | numeric | YES | null |
| is_islamic | boolean | YES | false |
| reward_currency_name | text | YES | null |
| reward_currency_value_aed | numeric | YES | null |
| base_earn_rate | numeric | YES | null |
| base_earn_unit | text | YES | null |
| forex_markup_pct | numeric | YES | null |
| interest_rate_monthly_pct | numeric | YES | null |
| lounge_access_count | integer | YES | 0 |
| lounge_access_network | text | YES | null |
| valet_parking_count | integer | YES | 0 |
| travel_insurance | boolean | YES | false |
| purchase_protection | boolean | YES | false |
| concierge | boolean | YES | false |
| airport_transfer_count | integer | YES | 0 |
| min_age | integer | YES | 21 |
| image_url | text | YES | null |
| apply_url | text | YES | null |
| source_url | text | YES | null |
| summary | text | YES | null |
| is_estimated | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**Key fields:**
- `reward_currency_value_aed`: AED value per reward point/mile. Powers cross-card comparison via `effective_return_pct`. Three sourcing tiers: (1) direct cash-redemption rate stated in T&C (most reliable); (2) industry benchmark when no cash-out rate exists (e.g. Skywards Miles = AED 0.044 per The Points Guy 1.2¢/mile); (3) assumed from a lower card tier when the target tier has no published rate — in this case `card_rewards.is_estimated` is set to `true` on affected rows (e.g. CBD Visa Infinite uses Platinum/Titanium card rate of AED 0.004/pt). Never change without updating all dependent `card_rewards.effective_return_pct` rows.
- `is_estimated`: `true` when the salary requirement (min_salary_aed) is estimated rather than a bank-published figure. The UI shows a "⚠ est." warning badge next to the salary when this is set.
- `source_url`: Where this card's data came from (bank website, T&C PDF, etc.).

---

### 3. spending_categories
Fixed list of 17 spending categories. Users earn different rewards for different categories.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | — |
| slug | text | NO | — |
| icon | text | YES | null |
| description | text | YES | null |
| sort_order | integer | YES | null |

**Seeded categories (17 total, sorted by sort_order):**
1. dining (🍽️) — Restaurants, cafés, food delivery (Talabat, Deliveroo)
2. groceries (🛒) — Supermarkets (Carrefour, Lulu, Spinneys, Choithrams)
3. fuel (⛽) — Petrol stations (ADNOC, ENOC, Emarat)
4. airlines (✈️) — Airline ticket purchases direct from airlines
5. shopping (🛍️) — Clothing, fashion, department stores, electronics, home goods (H&M, Zara, Sharaf DG, IKEA)
6. hotels (🏨) — Hotel bookings (direct or via booking platforms)
7. other_travel (✈️) — Travel agencies, booking sites (Booking.com, MakeMyTrip), car rentals
8. online_shopping (💻) — Amazon.ae, Noon, general e-commerce
9. entertainment (🎬) — Cinema, theme parks, concerts, streaming
10. utilities (💡) — DEWA, Etisalat, du, SEWA, FEWA, Salik
11. education (📚) — School fees, university tuition, courses
12. insurance (🛡️) — Health, motor, property insurance premiums
13. government (🏛️) — Government fees, fines, visa charges
14. rent (🏠) — Rental payments (if payable by card)
15. healthcare (🏥) — Hospitals, clinics, pharmacies
16. international (🌍) — Any spend in foreign currency
17. general (💳) — All other spend not in above categories

*(Note: `shopping` is a dedicated category. `airlines` and `hotels` were split out from `travel` to enable category-specific bonuses.)*

---

### 4. card_rewards ⭐ (CORE)
**The heart of the data.** Maps each card × category to an earn rate. One row per card–category combination.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| card_id | uuid | YES | null |
| category_id | uuid | YES | null |
| **reward_event_type** | text | YES | 'ongoing' |
| reward_type | text | YES | null |
| earn_rate | numeric | YES | null |
| earn_unit | text | YES | null |
| earn_per_x_aed | numeric | YES | null |
| **effective_return_pct** | numeric | NO | — |
| absolute_value_aed | numeric | YES | null |
| display_label | text | YES | null |
| monthly_cap_spend_aed | numeric | YES | null |
| monthly_cap_reward | numeric | YES | null |
| min_txn_amount_aed | numeric | YES | null |
| min_monthly_spend_aed | numeric | YES | null |
| is_promotional | boolean | YES | false |
| promo_end_date | date | YES | null |
| is_estimated | boolean | YES | false |
| exclusions | text | YES | null |
| source_url | text | YES | null |
| last_verified_date | date | YES | null |
| notes | text | YES | null |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**Key fields:**
- `reward_event_type`: Distinguishes the kind of reward row. Values: `'ongoing'` (regular earn rate — powers all ranking), `'welcome_bonus'` (one-time sign-up bonus), `'limited_promo'` (time-limited offer, expires at `promo_end_date`), `'anniversary_bonus'` (annual renewal benefit). The recommendation engine filters to `'ongoing'` for scoring; welcome bonuses and promos are surfaced separately. **Convention:** `welcome_bonus` and `anniversary_bonus` rows use `category_id = '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f'` (the 'general' category) since they aren't tied to a spending category.
- `effective_return_pct`: Normalized AED return per AED spent (e.g., 3% = 3 fils per AED). **This powers the recommendation engine.** For points/miles cards: `earn_rate × reward_currency_value_aed × 100` (per_aed) or `earn_rate × reward_currency_value_aed / exchange_rate × 100` (per_usd). Set to 0 for welcome_bonus rows (they are valued via `absolute_value_aed` instead).
- `absolute_value_aed`: Total AED value of a welcome bonus or promo (e.g., 75,000 Bonvoy points ≈ AED 2,250). Used for display and for Path B's annual-value calculation. Only populated on non-ongoing rows.
- `display_label`: Short user-facing label for welcome/promo bonus rows (e.g., "75,000 Bonvoy points on activation"). Falls back to auto-generated label from `notes` if null.
- `is_estimated`: `true` when the `effective_return_pct` was computed using an assumed or cross-tier redemption value rather than a rate confirmed directly from that card's own T&C. The UI should treat these rows as approximate.
- `monthly_cap_spend_aed`, `monthly_cap_reward`: Caps apply per month.
- `notes`: User-facing conditions, caveats, and brand bonuses. E.g., "2 miles/USD on Emirates = 2.40%. ⚠️ Other airlines = 1.20%." For welcome bonus rows, this holds the eligibility condition (e.g., "Spend USD 15,000 in first 3 billing cycles"). **Do not store source file citations here** — those belong in `source_url` only. Notes must be readable as standalone plain English by an end user (no `Source: xyz.pdf` trails).
- `last_verified_date`: When this row was last checked against T&Cs.

**Example rows:**
```
ENBD Marriott Bonvoy World Elite + hotels → 4.90% (Marriott participating), ⚠️ 2.45% at non-Marriott (in notes)
ENBD Skywards Infinite + airlines → 2.40% (Emirates/flydubai), ⚠️ 1.20% other airlines (in notes)
FAB Travel Card + airlines → 12%
DIB Prime Infinite + airlines → 5%
Citi Premier + dining → 3% (earned via points)
```

---

### 5. card_benefits
Non-category perks tied to each card. Lounge access, valet, insurance, dining privileges, etc.

> ⚠️ **Welcome bonuses do NOT live here.** As of 2026-06-30 (Migration C), all welcome bonus data was migrated from this table into `card_rewards` (reward_event_type='welcome_bonus'). Any `benefit_type='welcome_bonus'` rows have been deleted. See `card_rewards.reward_event_type` for the single source of truth.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| card_id | uuid | YES | null |
| benefit_type | text | YES | null |
| title | text | NO | — |
| description | text | YES | null |
| usage_limit | integer | YES | null |
| usage_period | text | YES | null |
| monetary_value_aed | numeric | YES | null |
| conditions | text | YES | null |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**Typical rows:**
- Lounge access: Priority Pass, 4 visits/year
- Valet parking: 2 complimentary per month
- Purchase protection: Up to AED 2,500
- Golf privileges, cinema BOGOF, concierge, travel insurance

---

### 6. merchants
Maps real-world merchant names to categories (enables "I'm at Carrefour" search).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | — |
| aliases | text[] | YES | null |
| category_id | uuid | YES | null |
| is_online | boolean | YES | null |
| is_popular | boolean | YES | null |
| sort_order | integer | YES | null |
| created_at | timestamptz | YES | now() |

**Typical rows:**
- Carrefour → groceries
- Talabat → dining
- Emirates → airlines
- Marriott → hotels
- Amazon.ae → online_shopping

---

### 7. card_reward_exclusions
Flags per-card exceptions. E.g., "5% dining on DIB Prime, but NOT Talabat (food delivery)."

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| card_reward_id | uuid | YES | null |
| merchant_id | uuid | YES | null |
| exclusion_type | text | YES | null |
| description | text | YES | null |
| alternative_rate_pct | numeric | YES | null |
| created_at | timestamptz | YES | now() |

**Example:** "DIB Prime gives 5% dining, but food delivery (Talabat, Deliveroo) earn 0%."

---

## Supporting Tables

### 8. offers
Time-limited promotions (e.g., "Spend AED 500 at Spinneys, get AED 100 cashback").

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| card_id | uuid | YES | null |
| title | text | NO | — |
| description | text | YES | null |
| offer_type | text | YES | null |
| bonus_amount_aed | numeric | YES | null |
| min_spend_aed | numeric | YES | null |
| start_date | date | YES | null |
| end_date | date | YES | null |
| terms | text | YES | null |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |

---

### 9. loyalty_programs
Reward programs that cards transfer points to (e.g., Skywards, Marriott Bonvoy, ThankYou).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | — |
| description | text | YES | null |
| website_url | text | YES | null |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |

**Seeded:** Skywards, Marriott Bonvoy, IHG One Rewards, ThankYou, Smiles, etc.

---

### 10. transfer_partners
Maps which loyalty programs each card can transfer to and the transfer rate.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| card_id | uuid | YES | null |
| loyalty_program_id | uuid | YES | null |
| transfer_ratio | numeric | YES | null |
| min_transfer_amount | numeric | YES | null |
| notes | text | YES | null |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |

**Example:** "FAB Infinite can transfer to Skywards at 1:1 ratio."

---

### 11. reward_tiers
For cards with tiered earn rates based on cumulative spend level (e.g., "first AED 10k at 1%, then 2%").

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| card_reward_id | uuid | YES | null |
| tier_order | integer | YES | null |
| min_spend_aed | numeric | YES | null |
| earn_rate | numeric | YES | null |
| earn_unit | text | YES | null |
| effective_return_pct | numeric | YES | null |
| created_at | timestamptz | YES | now() |

---

### 12. user_spending_profile
Per-user monthly spending estimates across categories (e.g., "I spend AED 5,000/month on dining").

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | null |
| category_id | uuid | YES | null |
| monthly_spend_aed | numeric | YES | null |
| updated_at | timestamptz | YES | now() |

---

### 13. user_cards
Which cards each user has added to their wallet (enables portfolio audit + personalized ranking).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | null |
| card_id | uuid | YES | null |
| added_at | timestamptz | YES | now() |
| is_primary | boolean | YES | false |

---

## Views (Helpful for Frontend)

### cards_with_bank
Denormalized join of cards + bank info. **Use this for card listing pages.**

```sql
SELECT c.*, b.name as bank_name, b.short_name, b.logo_url
FROM cards c JOIN banks b ON c.bank_id = b.id
WHERE c.is_active AND b.is_active;
```

### rewards_ranked
Fully denormalized rewards view with card, bank, and category details. **Use this for the recommendation engine.**

```sql
SELECT cr.*, c.name as card_name, c.image_url, c.annual_fee_aed,
       b.name as bank_name, b.short_name, sc.name as category_name,
       sc.slug as category_slug, sc.icon as category_icon
FROM card_rewards cr
JOIN cards c ON cr.card_id = c.id
JOIN banks b ON c.bank_id = b.id
JOIN spending_categories sc ON cr.category_id = sc.id
WHERE cr.is_active AND c.is_active;
```

---

## Key Indexes

```sql
CREATE INDEX idx_card_rewards_card ON card_rewards(card_id);
CREATE INDEX idx_card_rewards_category ON card_rewards(category_id);
CREATE INDEX idx_card_rewards_effective ON card_rewards(effective_return_pct DESC);
CREATE INDEX idx_offers_active ON offers(is_active, end_date);
CREATE INDEX idx_cards_bank ON cards(bank_id);
CREATE INDEX idx_merchants_category ON merchants(category_id);
CREATE INDEX idx_merchants_popular ON merchants(is_popular, sort_order);
CREATE INDEX idx_user_spending ON user_spending_profile(user_id);
```

---

## Data Verification Status

| Table | Rows | Verified | Last Check |
|-------|------|----------|------------|
| banks | 14 | ✅ | June 2026 (EI added as bank #14) |
| spending_categories | 17 | ✅ | March 2026 |
| cards | 91 | ✅ | June 2026 — all 91 verified against T&Cs |
| card_rewards | ~1,500+ | ✅ | June 2026 |
| merchants | ~50 | ✅ | Initial seed |
| card_benefits | ~500+ | ✅ | June 2026 |
| offers | ~20 | ⏳ | Pending |
| loyalty_programs | ~10 | ✅ | Initial seed |
| transfer_partners | ~30 | ⏳ | Pending |

---

## Notes for Updates

- **When adding categories:** Update `spending_categories` + adjust `sort_order` of existing rows if needed.
- **When updating card rewards:** Always set `last_verified_date` to today + include `source_url` (bank T&C link).
- **Brand bonuses (general):** Store in the `notes` field of `card_rewards` with emoji callouts (🎁 for bonus, ⚠️ for gotchas). Keep notes user-facing: no `Source: filename.pdf` trails, no internal file paths, no clause references — those belong in `source_url`.
- **Structural loyalty co-brands:** For cards where the loyalty program IS the card's identity (e.g. Skywards = Emirates, Marriott Bonvoy = Marriott), set `effective_return_pct` to the brand-specific (elevated) rate on the card's "home" category. Document the reduced non-brand rate in `notes` with ⚠️. Do NOT use the brand rate for ecosystem/portal bonuses (SHARE, U by Emaar, Darna, dnata Travel) — those keep the base rate in `effective_return_pct`.
- **Exclusions (two distinct mechanisms):** The `exclusions` text column on `card_rewards` holds a single short sentence shown as an amber ⚠ callout in the UI — use it for a meaningful rate caveat on that specific category row (e.g., "Non-Marriott hotels earn only 3 pts/USD = 2.45%"). Only populate it when the caveat is genuinely relevant to that category. The separate `card_reward_exclusions` table is reserved for merchant-specific exceptions (e.g., "5% dining on DIB Prime, but NOT Talabat"). General conditions and gotchas that don't warrant a dedicated callout belong in `notes` with a ⚠️ emoji.

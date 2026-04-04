# CardWise — Database Schema (Current)

> Latest schema as of March 31, 2026. Update this when tables are added or restructured.

---

## Quick Overview

**13 tables total:** 9 core + 4 supporting.

**Core purpose:** Map cards → spending categories → reward rates. Support users' JTBD: "Which card should I use right now?"

---

## Core Tables

### 1. banks
Stores the ~10–13 UAE banks that issue credit cards.

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

**Seeded:** FAB, Emirates NBD (ENBD), ADCB, Mashreq, DIB, CBD, RAKBank, Citi, HSBC, StanChart, ADIB, Liv, Wio.

---

### 2. cards
Each credit card product. **The largest table — expect 42–60 rows (1 per card product).**

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
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**Key fields:**
- `reward_currency_value_aed`: Estimated AED value per point (e.g., 0.01 = 1 fil per point). Powers cross-card comparison.
- `source_url`: Where this card's data came from (bank website, T&C PDF, etc.).

---

### 3. spending_categories
Fixed list of 16 spending categories. Users earn different rewards for different categories.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | — |
| slug | text | NO | — |
| icon | text | YES | null |
| description | text | YES | null |
| sort_order | integer | YES | null |

**Seeded categories (16 total, sorted by sort_order):**
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
| reward_type | text | YES | null |
| earn_rate | numeric | YES | null |
| earn_unit | text | YES | null |
| earn_per_x_aed | numeric | YES | null |
| **effective_return_pct** | numeric | NO | — |
| monthly_cap_spend_aed | numeric | YES | null |
| monthly_cap_reward | numeric | YES | null |
| min_txn_amount_aed | numeric | YES | null |
| min_monthly_spend_aed | numeric | YES | null |
| is_promotional | boolean | YES | false |
| promo_end_date | date | YES | null |
| exclusions | text | YES | null |
| source_url | text | YES | null |
| last_verified_date | date | YES | null |
| notes | text | YES | null |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**Key fields:**
- `effective_return_pct`: Normalized AED return per AED spent (e.g., 3% = 3 fils per AED). **This powers the recommendation engine.**
- `monthly_cap_spend_aed`, `monthly_cap_reward`: Caps apply per month.
- `notes`: Brand bonuses, conditions, gotchas. E.g., "1.23% at any hotel. 🎁 Earns 2.45% at Marriott Bonvoy."
- `last_verified_date`: When this row was last checked against T&Cs.

**Example rows:**
```
ENBD Marriott Bonvoy + hotels → 1.23% (general), 2.45% at Marriott (in notes)
FAB Travel Card + airlines → 12%
DIB Prime Infinite + airlines → 5%
Citi Premier + dining → 3% (earned via points)
```

---

### 5. card_benefits
Benefits tied to each card (not category-specific). Lounge access, valet, insurance, welcome bonuses, etc.

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
- Welcome bonus: 200 AED cashback (first 3 months)
- Lounge access: Priority Pass, 4 visits/year
- Valet parking: 2 complimentary per month
- Purchase protection: Up to AED 2,500

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
| banks | 13 | ✅ | Initial seed |
| spending_categories | 16 | ✅ | March 31 |
| cards | ~42 | 🔄 | In progress (card-by-card verification) |
| card_rewards | ~200+ | 🔄 | In progress |
| merchants | ~50 | ✅ | Initial seed |
| card_benefits | ~100+ | 🔄 | In progress |
| offers | ~20 | ⏳ | Pending |
| loyalty_programs | ~10 | ✅ | Initial seed |
| transfer_partners | ~30 | ⏳ | Pending |

---

## Notes for Updates

- **When adding categories:** Update `spending_categories` + adjust `sort_order` of existing rows if needed.
- **When updating card rewards:** Always set `last_verified_date` to today + include `source_url` (bank T&C link).
- **Brand bonuses:** Store in the `notes` field of `card_rewards` with emoji callouts (🎁 for bonus, ⚠️ for gotchas).
- **Exclusions:** Use `card_reward_exclusions` table *only* for merchant-specific exceptions; use `notes` for general caveats.

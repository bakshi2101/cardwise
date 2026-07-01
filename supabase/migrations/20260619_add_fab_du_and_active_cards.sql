-- Migration: Add FAB du Credit Card and FAB Rewards Active Credit Card
-- Date: 2026-06-19
-- Sources:
--   FAB du Credit Card T&C — June 2025, Version 3 (FAB du creditcard_tnc.pdf)
--   FAB Rewards Terms & Conditions — April 2025, Version 4 (FAB-Rewards-Terms-and-Conditions-En.pdf)
--   FAB du Lounge T&C — February 2022, Version 2 (FAB Du_Platinum.pdf) [historical, card now Titanium]
--   FAB Rewards Active Card Benefits T&C — December 2025 (FAB Rewards Active card-benefits-terms-and-conditions-en.pdf)
--   bankfab.com/en-ae/personal/credit-cards/du-credit-card
--   bankfab.com/en-ae/personal/credit-cards/fab-rewards-active-credit-card
--
-- ⚠️ Data gaps:
--   Both cards: forex_markup_pct and interest_rate_monthly_pct not published in T&Cs (get from Schedule of Charges)
--   du card: annual fee "for life" not explicitly stated (site says "no annual fees"); no welcome/joining bonus found
--   du card: lounge benefit confirmed as flight-delay only via Mastercard Travel Pass (Titanium tier)
--             [Old 2022 Platinum T&C showed 4 LoungeKey + unlimited Mastercard lounges — superseded]

-- ============================================================
-- SECTION 1: FAB du Credit Card (Mastercard Titanium, Free)
-- ============================================================

INSERT INTO cards (
  bank_id,
  name,
  card_network,
  card_tier,
  annual_fee_aed,
  min_salary_aed,
  reward_currency_name,
  reward_currency_value_aed,
  base_earn_rate,
  base_earn_unit,
  lounge_access_count,
  lounge_access_network,
  travel_insurance,
  purchase_protection,
  concierge,
  source_url,
  summary,
  is_active
)
VALUES (
  (SELECT id FROM banks WHERE short_name = 'FAB'),
  'FAB du Credit Card',
  'mastercard',
  'titanium',
  0,
  5000,
  'FAB Rewards',
  0.003,
  1,
  'per_aed',
  0,
  NULL,
  false,
  false,
  false,
  'https://www.bankfab.com/en-ae/personal/credit-cards/du-credit-card',
  'VERIFIED. du co-branded card (Mastercard Titanium). 15% back in FAB Rewards at du merchants (51 pts/AED per FAB Rewards T&C; cap 167,000 pts/month = AED 501 max; requires AED 2,500 min spend prev month + active du subscription). 1 pt/AED = 0.30% all other domestic & international. 0.5 pts/AED = 0.15% low-interchange (groceries, telecom non-du, fuel, education, govt, charities, transport, rental, car rental, utilities non-du, florists, bookstores, laundry, lottery, insurance, fast-food). Non-du monthly cap 50,000 pts = AED 150. Free for life (⚠️ not explicitly stated). 0% installment plan on du EPP >= AED 1,000. 20% off Talabat 1x/month. Flight delay lounge access via Mastercard Travel Pass. ⚠️ Forex markup unconfirmed. Source: FAB du Credit Card T&C June 2025 V3; FAB Rewards T&C April 2025 V4.',
  true
);

-- Card rewards — FAB du Credit Card (17 categories)
-- All source_url: FAB Rewards T&C April 2025 V4 + du card-specific T&C June 2025 V3

INSERT INTO card_rewards (
  card_id, category_id,
  reward_type, earn_rate, earn_unit, earn_per_x_aed,
  effective_return_pct,
  monthly_cap_reward, min_monthly_spend_aed,
  source_url, last_verified_date, notes
)
VALUES

-- utilities: du-specific rate (overrides low-interchange for du merchant spend)
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'utilities'),
  'points', 51, 'per_aed', 1,
  15.00,
  167000, 2500,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'AT DU MERCHANTS ONLY (du.ae bills, post-paid, pre-paid recharges, home plans, EPP devices). 51 pts/AED per FAB Rewards T&C = 15% per du Card T&C clause 5.1. Cap 167,000 pts/month (= AED 501 value). Min AED 2,500 total card spend in previous month + active du subscription required. Non-du utility/telecom providers (e&/Etisalat, DEWA, SEWA) earn 0.15% low-interchange rate.'
),

-- dining: general domestic rate
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'dining'),
  'points', 1, 'per_aed', 1,
  0.30,
  50000, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED on all domestic & international spend (general rate). Aggregate non-du monthly cap 50,000 pts = AED 150.'
),

-- groceries: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'groceries'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Supermarkets (MCC 5411) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- fuel: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'fuel'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Fuel (MCC 5541, 5542) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- airlines: low interchange (MCC 4511, 3000-3299 in telecom/transport group)
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'airlines'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Airlines (MCC 4511, 3000-3299) fall under low-interchange transport group. 0.5 pts/AED = 0.15%.'
),

-- shopping: general domestic rate
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'shopping'),
  'points', 1, 'per_aed', 1,
  0.30,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED general domestic rate. Department stores (MCC 5311) are low interchange = 0.15% per FAB Rewards T&C footnote.'
),

-- hotels: general domestic rate
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'hotels'),
  'points', 1, 'per_aed', 1,
  0.30,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED general domestic rate.'
),

-- other_travel: low interchange (car rental, travel agencies MCC 4722 in telecom/transport group)
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'travel'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Car rental and travel agencies in low-interchange transport group. 0.5 pts/AED = 0.15%.'
),

-- online_shopping: general domestic rate
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'online_shopping'),
  'points', 1, 'per_aed', 1,
  0.30,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED general domestic rate (no e-commerce bonus on Titanium tier).'
),

-- entertainment: general domestic rate
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'entertainment'),
  'points', 1, 'per_aed', 1,
  0.30,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED general domestic rate. Lottery (MCC) = low interchange = 0.15%.'
),

-- education: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'education'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Education MCCs = low interchange. 0.5 pts/AED = 0.15%.'
),

-- insurance: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'insurance'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Insurance (MCC 3429, 5960, 6300) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- government: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'government'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Government services (MCC 7800, 9211-9406) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- rent: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'rent'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Rental/real estate (MCC 6513 etc.) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- healthcare: general domestic rate
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'healthcare'),
  'points', 1, 'per_aed', 1,
  0.30,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED general domestic rate.'
),

-- international: general rate (same as domestic per FAB Rewards T&C for Titanium)
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'international'),
  'points', 1, 'per_aed', 1,
  0.30,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED on international (non-AED) spend. Same as domestic general rate per FAB Rewards T&C Table 3.1.'
),

-- general: base rate
(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'general'),
  'points', 1, 'per_aed', 1,
  0.30,
  50000, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '1 pt/AED general domestic & international rate. Aggregate non-du monthly cap 50,000 FAB Rewards = AED 150 value.'
);

-- Card benefits — FAB du Credit Card
INSERT INTO card_benefits (card_id, benefit_type, title, description, usage_limit, usage_period, conditions)
VALUES

(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'lounge_access',
  'Flight Delay Lounge Access',
  'Complimentary airport lounge access via Mastercard Travel Pass app during confirmed flight delays.',
  NULL,
  'per_occurrence',
  'Flight delay must be confirmed. Access via Mastercard Travel Pass app. ⚠️ Exact conditions and eligible lounges to be confirmed from Mastercard Travel Pass T&Cs. Note: older 2022 T&C (when card was Platinum tier) showed 4 LoungeKey visits + unlimited Mastercard lounges — superseded by current Titanium tier.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'dining_discount',
  '20% Off Talabat',
  '20% discount on Talabat food and grocery orders, valid once per month.',
  1,
  'monthly',
  'One discount per month. Offer details and validity period to be confirmed from FAB product page.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'installment_plan',
  '0% Installment Plan on du EPP Purchases',
  'Convert du Easy Payment Plan (EPP) purchases of AED 1,000+ to 0% installment for 3, 6, 9 or 12 months via Easy Buy Scheme.',
  NULL,
  NULL,
  'Subject to FAB Easy Buy T&Cs. Min purchase AED 1,000. du EPP = bundled smartphone and data package.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB du Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'other',
  '25% Off Fiit.tv Subscription',
  '25% discount on Fiit.tv fitness streaming subscription (applicable on first payment).',
  1,
  NULL,
  'Applicable on first payment only per web page. Other T&Cs apply.'
);


-- ============================================================
-- SECTION 2: FAB Rewards Active Credit Card (Mastercard Platinum, AED 300/yr)
-- ============================================================

INSERT INTO cards (
  bank_id,
  name,
  card_network,
  card_tier,
  annual_fee_aed,
  min_salary_aed,
  reward_currency_name,
  reward_currency_value_aed,
  base_earn_rate,
  base_earn_unit,
  lounge_access_count,
  lounge_access_network,
  travel_insurance,
  purchase_protection,
  concierge,
  source_url,
  summary,
  is_active
)
VALUES (
  (SELECT id FROM banks WHERE short_name = 'FAB'),
  'FAB Rewards Active Credit Card',
  'mastercard',
  'platinum',
  300,
  5000,
  'FAB Rewards',
  0.003,
  2,
  'per_aed',
  4,
  'mastercard_travel_pass',
  false,
  true,
  false,
  'https://www.bankfab.com/en-ae/personal/credit-cards/fab-rewards-active-credit-card',
  'VERIFIED. Sports-focused card (Mastercard Platinum). 5 pts/AED = 1.5% at sports MCCs (sporting goods 5941, gyms/clubs 7997, athletic fields 7941, sports apparel 5655, public golf 7992, sports camps 7032, swimming pools 5996). 2 pts/AED = 0.60% all other domestic & international. 0.5 pts/AED = 0.15% low-interchange (groceries, fuel, utilities, education, govt, insurance, rent, airlines, transport, car rental, fast-food, etc.). Bonus: 25 FAB Rewards per 1,000 steps via STEPPI app (min 6,000 steps/day, max 10,000 steps/day). Total cap 50,000 pts/month = AED 150 max. AED 300 annual fee (1st year free promo June–July 2026). Free fitness payment ring (Tappy Pay, contactless). ADV+ gym membership (25+ gyms; free w/ AED 3K/month spend). 4 lounge visits/yr via Mastercard Travel Pass. Purchase Protection USD 2,000/claim, USD 5,000/year, 180 days. ⚠️ Forex markup unconfirmed. Source: FAB Rewards Active Card Benefits T&C Dec 2025; FAB Rewards T&C April 2025 V4.',
  true
);

-- Card rewards — FAB Rewards Active Credit Card (17 categories)

INSERT INTO card_rewards (
  card_id, category_id,
  reward_type, earn_rate, earn_unit, earn_per_x_aed,
  effective_return_pct,
  monthly_cap_reward, min_monthly_spend_aed,
  source_url, last_verified_date, notes
)
VALUES

-- dining: general rate
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'dining'),
  'points', 2, 'per_aed', 1,
  0.60,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED on all domestic & international spend (general rate). Fast food (MCC 5814) = low interchange = 0.15%.'
),

-- groceries: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'groceries'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Supermarkets (MCC 5411) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- fuel: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'fuel'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Fuel (MCC 5541, 5542) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- airlines: low interchange (MCC 4511, 3000-3299 in telecom/transport group)
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'airlines'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Airlines (MCC 4511, 3000-3299) in low-interchange transport/telecom group. 0.5 pts/AED = 0.15%.'
),

-- shopping: general rate (with sports goods/apparel brand bonus in notes)
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'shopping'),
  'points', 2, 'per_aed', 1,
  0.60,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED general rate. 🎁 1.5% (5 pts/AED) at sporting goods stores (MCC 5941) and sports apparel/riding apparel stores (MCC 5655). 20% off Sun & Sand Sports online (code FAB10 for 10% no-min; code FAB20 for 20% on AED 250+ spend, max AED 100 discount; valid to Dec 2026).'
),

-- hotels: general rate
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'hotels'),
  'points', 2, 'per_aed', 1,
  0.60,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED general domestic rate.'
),

-- other_travel: low interchange (car rental MCC 3351-3500/7512/7513/7519, travel agencies MCC 4722 in telecom group)
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'travel'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Car rental (MCC 3351-3500, 7512, 7513, 7519) and travel agencies (MCC 4722) in low-interchange group. 0.5 pts/AED = 0.15%.'
),

-- online_shopping: general rate
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'online_shopping'),
  'points', 2, 'per_aed', 1,
  0.60,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED on domestic & international e-commerce (general rate).'
),

-- entertainment: general rate (sports venue MCCs earn 1.5% per notes)
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'entertainment'),
  'points', 2, 'per_aed', 1,
  0.60,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED general entertainment (cinemas, events, streaming). 🎁 1.5% (5 pts/AED) at sports venues: country clubs/athletic clubs (MCC 7997), athletic fields/professional sports (MCC 7941), public golf courses (MCC 7992), sporting/recreational camps (MCC 7032), swimming pools (MCC 5996). 20% off Emaar attractions + 20% off Dubai Holding Entertainment (Wild Wadi, Green Planet, Inside Burj Al Arab, Dubai Parks & Resorts, The View Palm).'
),

-- utilities: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'utilities'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Utilities (MCC 4900) = low interchange. 0.5 pts/AED = 0.15%. Telecom (MCC 4111, 4112, 4119, 4121, 4131, 4411, 4468, 4511, 4722, 4784, 4789) also low interchange.'
),

-- education: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'education'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Education (MCC 8220, 8241, 8244, 8249, 8299) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- insurance: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'insurance'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Insurance (MCC 3429, 5960, 6300) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- government: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'government'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Government services (MCC 7800, 9223, 9211, 9222, 9311, 9399, 9402, 9405, 9406) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- rent: low interchange
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'rent'),
  'points', 0.5, 'per_aed', 1,
  0.15,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  'Rental/real estate (MCC 3351-3500, 4457, 5978, 6513, 7296, 7394, 7512-7519, 7538, 7542, 7549, 7841) = low interchange. 0.5 pts/AED = 0.15%.'
),

-- healthcare: general domestic rate
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'healthcare'),
  'points', 2, 'per_aed', 1,
  0.60,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED general domestic rate. Healthcare not in low-interchange list.'
),

-- international: general rate (same as domestic per FAB Rewards T&C Table 3.1)
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'international'),
  'points', 2, 'per_aed', 1,
  0.60,
  NULL, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED on international (non-AED) spend. Same rate as domestic per FAB Rewards T&C Table 3.1 (FAB Rewards Active earns on Domestic & International at same rate).'
),

-- general: base rate with total monthly cap note
(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  (SELECT id FROM spending_categories WHERE slug = 'general'),
  'points', 2, 'per_aed', 1,
  0.60,
  50000, NULL,
  'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf',
  '2026-06-19',
  '2 pts/AED general domestic & international rate. Total monthly cap 50,000 FAB Rewards = AED 150 value (shared across all non-sports categories). Bonus: 25 FAB Rewards per 1,000 steps via STEPPI app (min 6,000 steps/day, max 10,000 steps/day; counts toward 50,000 cap).'
);

-- Card benefits — FAB Rewards Active Credit Card
INSERT INTO card_benefits (card_id, benefit_type, title, description, usage_limit, usage_period, monetary_value_aed, conditions)
VALUES

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'lounge_access',
  '4 Complimentary Airport Lounge Visits/Year',
  '4 complimentary access to 25+ regional and international airport lounges via Mastercard Travel Pass app.',
  4,
  'annual',
  NULL,
  'Access via Mastercard Travel Pass app. Register FAB Mastercard, use app QR code at lounge reception. Source: FAB Rewards Active Card Benefits T&C December 2025. For updated lounge list visit priceless.com.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'fitness',
  'ADV+ Gym Membership (25+ Premium Gyms)',
  'Complimentary ADV+ membership giving access to a network of 25+ premium gyms across the UAE for 12 months.',
  NULL,
  'annual',
  NULL,
  'Minimum AED 3,000 monthly spend required for free access. If spend falls below AED 3,000, visits are chargeable at AED 100/visit. Activate via unique code shared by FAB within 1 month of card activation at adv+ website.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'other',
  'Free Fitness Payment Ring (Tappy Pay)',
  'Complimentary contactless payment ring linked to FAB Rewards Active card. Use for contactless payments at NFC terminals. Health and fitness data accessible via Tappy app.',
  1,
  NULL,
  NULL,
  'Issued once per primary cardholder, cannot be replaced or exchanged. Requires registration via Tappy Pay in FAB Mobile app. Must register with STEPPI app to earn FAB Rewards from steps.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'purchase_protection',
  'Purchase Protection (Mastercard)',
  'Purchases protected against theft or accidental damage for up to 180 days from purchase date.',
  NULL,
  NULL,
  7340,
  'Coverage up to USD 2,000 per claim, maximum USD 5,000 over a 12-month period. File claims at mcpeaceofmind.com. Source: FAB Rewards Active Card Benefits T&C December 2025.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'shopping_discount',
  '20% Off Sun & Sand Sports Online',
  'Up to 20% discount on online purchases at Sun & Sand Sports. Use code FAB10 for 10% off (no min, max AED 75) or FAB20 for 20% off on AED 250+ spend (max AED 100). Valid on full-price items; FAB20 for full price only.',
  NULL,
  NULL,
  100,
  'Not valid on Apple Pay, Samsung Pay, or wallet payments. Valid until 31 December 2026. Other Sun & Sand Sports T&Cs apply.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'entertainment_discount',
  '20% Off Emaar Attractions',
  '20% discount at Emaar attractions: KidZania Dubai/Abu Dhabi, Play DXB, E-KART Zabeel, Dubai Aquarium & Underwater Zoo, Dubai Ice Rink, The Storm Coaster, Zabeel Sports District.',
  NULL,
  NULL,
  NULL,
  'POS purchase only. Cardholder must be present. Not valid on public holidays or with other promotions. Valid until 30 November 2026.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'entertainment_discount',
  '20% Off Dubai Holding Entertainment',
  '20% discount at Dubai Holding Entertainment: Wild Wadi, The Green Planet, Inside Burj Al Arab, Dubai Parks & Resorts (Motiongate, Legoland, Real Madrid World), The View Palm.',
  NULL,
  NULL,
  NULL,
  'POS purchase only at attractions (not online, except The View Palm with code THVFAB20%). Wild Wadi includes 15% retail, 30% valet, 20% F&B. Other attraction T&Cs apply.'
),

(
  (SELECT id FROM cards WHERE name = 'FAB Rewards Active Credit Card' AND bank_id = (SELECT id FROM banks WHERE short_name = 'FAB')),
  'sports_discount',
  '15% Off Esmplay Sports Facilities',
  '15% discount on sports facility bookings via the Esmplay app using promo code FABSPORTS15.',
  NULL,
  NULL,
  NULL,
  'Download Esmplay from App Store. No booking cap. Valid until 4 December 2026. Other Esmplay T&Cs apply.'
);

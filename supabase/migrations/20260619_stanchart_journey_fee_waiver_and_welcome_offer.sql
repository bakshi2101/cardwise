-- Migration: Standard Chartered Journey Credit Card — annual fee waiver benefits + cashback welcome offer
-- Date: 2026-06-19
-- Sources:
--   StanChart-ae-welcome-book-digital-journey.pdf — "Illustration to Unlock annual fee waiver" section
--   StanChart-ae-cc-welcome-cashbackback-offer-english-apr.pdf — Cashback Welcome Offer T&C (01 Apr–30 Jun 2026)
--
-- Card ID: e3a393f5-bf83-4be8-82aa-44d5d6de3234 (Standard Chartered Journey Credit Card)
--
--
-- Note on fee figures: The welcome book illustrates the fee as "AED 1,500" (pre-VAT).
-- The database correctly stores AED 1,575 (AED 1,500 + 5% VAT). No correction needed.

-- ============================================================
-- SECTION 1: Annual Fee Waiver — Year 1
-- Condition: Spend AED 10,000 within first 60 days of card opening
-- Source: SC Journey Welcome Book
-- ============================================================

INSERT INTO card_benefits (
  card_id,
  benefit_type,
  title,
  description,
  usage_limit,
  usage_period,
  monetary_value_aed,
  conditions,
  is_active
)
SELECT
  'e3a393f5-bf83-4be8-82aa-44d5d6de3234'::uuid,
  'annual_fee_waiver',
  'First Year Annual Fee Waiver',
  'The first year annual fee of AED 1,575 is automatically waived if you spend AED 10,000 within the first 60 days of card account opening.',
  1,
  'one_time',
  1575,
  'Minimum spend of AED 10,000 must be made within the first 60 days of the credit card account opening date. Waiver is applied automatically — no manual claim required. Source: SC Journey Welcome Book (Annual Fee Waiver Illustration).',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM card_benefits
  WHERE card_id = 'e3a393f5-bf83-4be8-82aa-44d5d6de3234'::uuid
    AND benefit_type = 'annual_fee_waiver'
    AND title = 'First Year Annual Fee Waiver'
);

-- ============================================================
-- SECTION 2: Annual Fee Waiver — Year 2 and Beyond
-- Condition: Spend AED 150,000 per 12-month annual cycle
-- Source: SC Journey Welcome Book
-- ============================================================

INSERT INTO card_benefits (
  card_id,
  benefit_type,
  title,
  description,
  usage_limit,
  usage_period,
  monetary_value_aed,
  conditions,
  is_active
)
SELECT
  'e3a393f5-bf83-4be8-82aa-44d5d6de3234'::uuid,
  'annual_fee_waiver',
  'Annual Fee Waiver (Year 2 Onwards)',
  'The annual fee of AED 1,575 is automatically waived for each renewal year in which you spend a minimum of AED 150,000 in the preceding 12-month annual cycle.',
  NULL,
  'yearly',
  1575,
  'Minimum spend of AED 150,000 per 12-month annual cycle required. Applied automatically on each annual renewal. Example per welcome book: spend AED 150,000 Jan–Dec 2025 → Jan 2026 renewal fee waived. Same conditions apply indefinitely. Source: SC Journey Welcome Book (Annual Fee Waiver Illustration).',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM card_benefits
  WHERE card_id = 'e3a393f5-bf83-4be8-82aa-44d5d6de3234'::uuid
    AND benefit_type = 'annual_fee_waiver'
    AND title = 'Annual Fee Waiver (Year 2 Onwards)'
);

-- ============================================================
-- SECTION 3: Ensure cards.annual_fee_waiver_spend is set correctly
-- ============================================================

UPDATE cards
SET
  annual_fee_waiver_spend = 150000,
  updated_at = now()
WHERE id = 'e3a393f5-bf83-4be8-82aa-44d5d6de3234'::uuid
  AND (annual_fee_waiver_spend IS DISTINCT FROM 150000);

-- ============================================================
-- SECTION 4: Cashback Welcome Offer — April–June 2026 Campaign
-- Source: StanChart-ae-cc-welcome-cashbackback-offer-english-apr.pdf
--
--
-- Auto-expiry: The app filters offers with is_active = true AND end_date >= CURRENT_DATE.
-- Setting end_date = '2026-06-30' means this offer will not surface in queries after
-- June 30, 2026 without any manual intervention.
-- ============================================================

INSERT INTO offers (
  card_id,
  bank_id,
  title,
  description,
  merchant_name,
  merchant_category,
  discount_type,
  discount_value,
  min_spend_aed,
  max_discount_aed,
  start_date,
  end_date,
  terms,
  offer_url,
  is_active
)
SELECT
  'e3a393f5-bf83-4be8-82aa-44d5d6de3234'::uuid,
  '49755e08-4178-406e-b279-5f10fafbfe4d'::uuid,
  'Welcome Cashback Offer (Apr–Jun 2026)',
  'New Journey credit card applicants who apply between 01 April and 30 June 2026 receive AED 1,000 cashback upon spending AED 10,000 within their first 60 days.',
  null,
  null,
  'cashback',
  1000,  -- AED 1,000 cashback (confirmed by user 2026-06-19)
  10000,
  1000,
  '2026-04-01',
  '2026-06-30',
  'Eligibility: New Standard Chartered primary credit card holders only; must not currently hold or have held any SC primary credit card in the 12 months prior to applying. Application period: 01 Apr – 30 Jun 2026; approval must be received by 31 Jul 2026. Qualifying spend: AED 10,000 within first 60 days of account opening (retail purchases only; balance transfers, cash instalment plans, cash withdrawals, fees and charges excluded). Cashback credited to card account by 31 Oct 2026. Card must not be cancelled within 180 days of opening (cashback reversible if cancelled). Offer not valid for applications via third-party sales agents (Appro, Ekra, or other agencies) — apply directly via SC mobile app, website, or relationship manager. One cashback per customer; credited to first primary card account opened. Not combinable with other special promotions. Source: StanChart-ae-cc-welcome-cashbackback-offer-english-apr.pdf (01 Apr–30 Jun 2026 T&C).',
  'https://www.sc.com/ae/credit-cards/journey/',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM offers
  WHERE card_id = 'e3a393f5-bf83-4be8-82aa-44d5d6de3234'::uuid
    AND title = 'Welcome Cashback Offer (Apr–Jun 2026)'
);

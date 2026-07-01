-- Adds an `is_estimated` flag so the frontend can visibly mark data points
-- that are not bank-confirmed (e.g. an invite-only tier's min_salary, or a
-- reward rate inferred by exclusion/analogy rather than read directly off a
-- T&C document). Boolean is per-row (whole record), not per-field — when a
-- row mixes confirmed and unconfirmed figures, `notes` still carries the
-- field-level detail; this flag only says "something in this row needs the
-- ⚠️ treatment, see notes."
--
-- Run this in the Supabase SQL editor (Database → SQL Editor → New query).
-- Safe to re-run: ADD COLUMN IF NOT EXISTS / CREATE OR REPLACE don't error
-- or drop dependent objects.

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS is_estimated boolean NOT NULL DEFAULT false;

ALTER TABLE card_rewards
  ADD COLUMN IF NOT EXISTS is_estimated boolean NOT NULL DEFAULT false;

-- cards_with_bank uses `c.*` so the new cards.is_estimated column is already
-- exposed there with no view change needed. rewards_ranked uses an explicit
-- column list, so it needs cr.is_estimated added explicitly.
--
-- IMPORTANT: Postgres only allows CREATE OR REPLACE VIEW to *append* columns
-- at the end — it errors (42P16 "cannot drop columns from view") if any
-- existing column is reordered or omitted. The list below preserves the
-- live view's exact current column order (including created_at/updated_at,
-- which the original Migration A definition omitted but a later live edit
-- added) and appends is_estimated as the very last column.
CREATE OR REPLACE VIEW rewards_ranked AS
SELECT
  cr.id,
  cr.card_id,
  cr.category_id,
  cr.reward_type,
  cr.earn_rate,
  cr.earn_unit,
  cr.earn_per_x_aed,
  cr.effective_return_pct,
  cr.monthly_cap_spend_aed,
  cr.monthly_cap_reward,
  cr.min_txn_amount_aed,
  cr.min_monthly_spend_aed,
  cr.is_promotional,
  cr.promo_end_date,
  cr.exclusions,
  cr.source_url,
  cr.last_verified_date,
  cr.notes,
  cr.is_active,
  cr.created_at,
  cr.updated_at,
  c.name            AS card_name,
  c.image_url       AS card_image,
  c.annual_fee_aed,
  c.forex_markup_pct,
  c.bank_id,
  b.name            AS bank_name,
  b.short_name      AS bank_short_name,
  sc.name           AS category_name,
  sc.slug           AS category_slug,
  sc.icon           AS category_icon,
  cr.reward_event_type,
  cr.absolute_value_aed,
  cr.annual_spend_threshold_aed,
  cr.display_label,
  cr.is_estimated
FROM card_rewards cr
JOIN cards              c  ON cr.card_id    = c.id
JOIN banks              b  ON c.bank_id     = b.id
JOIN spending_categories sc ON cr.category_id = sc.id
WHERE cr.is_active
  AND c.is_active;

-- Retroactively flag known estimated data points (2026-06-29 sweep).

-- ENBD SHARE Visa Private: min_salary_aed is an estimated floor (matches
-- ENBD's other Visa Infinite-tier cards), not a published KFS figure — this
-- is an invite-only private-banking tier with no public eligibility page.
UPDATE cards SET is_estimated = true
WHERE id = '01e72932-8a77-447a-86ca-6c7161290608';

-- card_rewards rows whose effective_return_pct (or absolute_value_aed for
-- welcome bonuses) was assumed/inferred rather than read directly off a
-- bank T&C document for this exact field.
UPDATE card_rewards SET is_estimated = true
WHERE id IN (
  'b754b64a-dd65-4195-928c-550c2b3202b0', -- ENBD Plus Points: government rate assumed by analogy
  '599b913d-b781-465f-bc2e-3f3dda95d731', -- CBD Smiles: 1 Smiles = AED 0.01 point value assumed
  'd73689f6-b5df-4de0-9f55-c853e4e6f530', -- CBD Smiles: 1 Smiles = AED 0.01 point value assumed
  '47f8ce71-4811-4044-b8f5-644ab001022d', -- Darna: healthcare rate assumed = general domestic
  '902be825-a3ee-49e0-b14b-fd4614ab0460', -- Darna: international rate assumed
  'e811ea4f-a65f-48cc-b2f1-bd799cc24dd1', -- Darna: international rate assumed
  'd71a7366-0eee-4956-ada8-4932a4efab7f', -- Darna: healthcare rate assumed = general domestic
  'c54fc7a7-e410-4836-a915-cb6d70a4b671', -- Darna: international rate assumed
  '4cf4e560-57ef-47d2-a8b5-dc06f705f703', -- Darna: healthcare rate assumed = general domestic
  '704a50f7-9600-4ff1-897e-fa1157d0ac32', -- SHARE: healthcare rate assumed = general domestic
  '45e07fd8-0c05-451d-ae4e-d8ad5c348523', -- SHARE: healthcare rate assumed = general domestic
  'f40c4d0f-f12e-442f-ba69-55b043d26487', -- SHARE: healthcare rate assumed = general domestic
  '38b05b1c-4fff-44f8-abdc-d251203d88bc', -- SHARE: healthcare rate assumed = general domestic
  '7669a1c4-a684-4386-8ed3-ac206eca6bfd', -- healthcare rate assumed = retail rate
  'efa78abc-e107-4080-8ded-3d16433d0a6f', -- healthcare rate assumed = retail rate
  'a5499bad-8e6e-4b71-b1d2-85a462dc04d3'  -- ADCB TouchPoints Infinite welcome bonus: AED 1,200 marketing-page estimate (Expedia vs Hotels.com source conflict)
);

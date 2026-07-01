-- Follow-up to 20260629_add_is_estimated_flag.sql.
--
-- That migration assumed cards_with_bank (which selects `c.*` from cards)
-- would automatically expose the new cards.is_estimated column. That
-- assumption was wrong: Postgres expands `SELECT *` into an explicit column
-- list at CREATE VIEW time, so a column added to the underlying table later
-- does NOT propagate into the view — confirmed by querying cards_with_bank
-- after running the prior migration and getting "column
-- cards_with_bank.is_estimated does not exist".
--
-- This recreates cards_with_bank with the same column order PostgREST
-- currently reports (querying cards_with_bank?limit=1 live), with
-- is_estimated appended at the end — required because CREATE OR REPLACE
-- VIEW can only append columns, not reorder or omit existing ones (see the
-- 42P16 note in the prior migration).
--
-- Run this in the Supabase SQL editor. Safe to re-run.

CREATE OR REPLACE VIEW cards_with_bank AS
SELECT
  c.id,
  c.bank_id,
  c.name,
  c.card_network,
  c.card_tier,
  c.annual_fee_aed,
  c.annual_fee_waiver_spend,
  c.supplementary_fee_aed,
  c.min_salary_aed,
  c.is_islamic,
  c.reward_currency_name,
  c.reward_currency_value_aed,
  c.base_earn_rate,
  c.base_earn_unit,
  c.forex_markup_pct,
  c.interest_rate_monthly_pct,
  c.lounge_access_count,
  c.lounge_access_network,
  c.valet_parking_count,
  c.travel_insurance,
  c.purchase_protection,
  c.concierge,
  c.airport_transfer_count,
  c.min_age,
  c.image_url,
  c.apply_url,
  c.source_url,
  c.summary,
  c.is_active,
  c.created_at,
  c.updated_at,
  b.name        AS bank_name,
  b.short_name  AS bank_short_name,
  b.logo_url    AS bank_logo_url,
  c.is_estimated
FROM cards c
JOIN banks b ON c.bank_id = b.id;

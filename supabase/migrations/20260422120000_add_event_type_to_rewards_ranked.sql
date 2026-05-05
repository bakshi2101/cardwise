-- Migration A: expose reward_event_type, absolute_value_aed,
-- annual_spend_threshold_aed in the rewards_ranked view.
--
-- The previous view used cr.* which silently omits newly-added columns in some
-- PostgREST versions (same issue that already bit monthly_cap_spend_aed /
-- monthly_cap_reward). This revision switches to an explicit column list so
-- every column the application selects is guaranteed to be present.
--
-- Run this in the Supabase SQL editor (Database → SQL Editor → New query).
-- It is safe to re-run: CREATE OR REPLACE does not drop dependent objects.
-- No data is changed; this is a view definition only.

CREATE OR REPLACE VIEW rewards_ranked AS
SELECT
  -- card_rewards columns (explicit — avoids PostgREST wildcard-expansion issues)
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
  -- new columns added in Migration A
  cr.reward_event_type,
  cr.absolute_value_aed,
  cr.annual_spend_threshold_aed,
  -- from cards
  c.name            AS card_name,
  c.image_url       AS card_image,
  c.annual_fee_aed,
  c.forex_markup_pct,
  c.bank_id,
  -- from banks
  b.name            AS bank_name,
  b.short_name      AS bank_short_name,
  -- from spending_categories
  sc.name           AS category_name,
  sc.slug           AS category_slug,
  sc.icon           AS category_icon
FROM card_rewards cr
JOIN cards              c  ON cr.card_id    = c.id
JOIN banks              b  ON c.bank_id     = b.id
JOIN spending_categories sc ON cr.category_id = sc.id
WHERE cr.is_active
  AND c.is_active;

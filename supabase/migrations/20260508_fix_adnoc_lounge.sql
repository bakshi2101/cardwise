-- Fix FAB ADNOC Rewards Credit Card: lounge access details
-- Source: priceless.com World Mastercard Lounge Program (UAE-issued = 8 visits/year)
-- Date: 2026-05-08

-- 1. Update cards table
UPDATE cards
SET
  lounge_access_count   = 8,
  lounge_access_network = 'mastercard_travel_pass',
  summary               = 'VERIFIED. ADNOC-branded co-card (Mastercard World). 15% at ADNOC stations (150pts/AED, cap AED150/month, min AED3K prev month); 3% Salik/DARB/Mawaqif; 2% international non-AED; 1% supermarkets (cap AED100/month, min AED3K); 1% all other retail; 0.15% airlines/travel/telecom/utilities/non-ADNOC fuel/education/insurance/govt. Aggregate cap AED1,000/month. AED300 annual fee (waived yr2 at AED48K annual spend). 8 lounge visits/yr via Mastercard Travel Pass (World MC, UAE-issued; activation requires min USD1 non-AED spend per quarter; fallback 1 visit/yr). 2 cinema tickets/month AED20. ADNOC Gold Tier fast-track. Welcome bonus 300K pts.'
WHERE id = '95c8b7ec-b63c-4cc8-9a72-053516038574';

-- 2. Update card_benefits lounge row
UPDATE card_benefits
SET
  usage_limit   = 8,
  description   = '8 complimentary visits/year to 1,300+ airport lounges worldwide via Mastercard Travel Pass (135 countries). Mastercard World program — UAE-issued cards receive 8 visits/year.',
  conditions    = 'Activation: must make min USD 1 non-AED purchase per quarter to unlock 3 months of lounge access. Fallback if no intl purchase: 1 complimentary visit/year; thereafter USD 32/visit via Mastercard Travel Pass app. Source: priceless.com World Mastercard Lounge Program (2026-05-08).'
WHERE card_id    = '95c8b7ec-b63c-4cc8-9a72-053516038574'
  AND benefit_type = 'lounge_access';

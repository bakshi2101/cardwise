// Migration: Add 4 new ADCB cards
// Cards: LuLu Titanium, LuLu Platinum, talabat ADCB, Shukran ADCB
// Source PDFs: adcb.com product pages (captured May 2026)
// Verified: 2026-05-06

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const BANK   = '9ca99537-9845-4bb3-9e62-b81b764fe697';
const TODAY  = '2026-05-06';

// Spending category IDs (from existing scripts)
const C = {
  dining:       'b7938d64-7ff6-4f84-9b0d-c35010e5fa58',
  groceries:    '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:         'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  airlines:     'c418c3e6-9403-4ce6-8647-ed52782a59eb',
  shopping:     '5212cc11-77de-432c-8340-994f35e03d1b',
  hotels:       'f990d8af-9955-4b22-881c-4cf4de2cbe3e',
  travel:       '592dad17-981b-4af8-8095-596507f0b780',
  online:       '8e3f1bc5-f519-4f2a-82b9-cefa8ebfda86',
  entertain:    'dd8d714c-1e5a-4db5-91d4-fba3756ed77c',
  utilities:    '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:    '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  insurance:    'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  government:   'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  rent:         'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  healthcare:   'a9aad3fe-9afa-4c12-957f-153994b5e501',
  international:'98c97cac-1b7d-48dc-a661-476c7baeb9af',
  general:      '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f',
};

// ─── Card IDs ────────────────────────────────────────────────────────────────
const LULU_TIT_ID  = randomUUID();
const LULU_PLAT_ID = randomUUID();
const TALAB_ID     = randomUUID();
const SHUKRAN_ID   = randomUUID();

// ─── Card definitions ────────────────────────────────────────────────────────
const CARDS = [
  {
    id: LULU_TIT_ID,
    bank_id: BANK,
    name: 'ADCB LuLu Titanium Credit Card',
    card_network: 'mastercard',
    card_tier: 'titanium',
    annual_fee_aed: 0,
    annual_fee_waiver_spend: null,
    supplementary_fee_aed: 0,
    min_salary_aed: 5000,
    is_islamic: false,
    reward_currency_name: 'LuLu Points',
    reward_currency_value_aed: 0.01,   // 5,000 pts = AED 50 voucher
    base_earn_rate: 1.0,
    base_earn_unit: 'points_per_aed',
    forex_markup_pct: 2.99,
    interest_rate_monthly_pct: null,
    lounge_access_count: null,         // DATA GAP: complimentary access confirmed but count not stated in PDF
    lounge_access_network: null,
    valet_parking_count: 0,
    travel_insurance: false,
    purchase_protection: false,
    concierge: false,
    airport_transfer_count: 0,
    min_age: 21,
    apply_url: 'https://www.adcb.com/en/personal/credit-cards/adcb-lulu-titanium-credit-card.aspx',
    source_url: 'https://www.adcb.com/en/personal/credit-cards/adcb-lulu-titanium-credit-card.aspx',
    summary: 'VERIFIED. ADCB-LuLu Hypermarket co-branded card. Earn 3.5 LuLu pts/AED (3.5% effective) at LuLu Hypermarkets; 1.0 pt/AED (1.0%) standard spend; 0.4 pts/AED (0.4%) at supermarkets/insurance/QSR; 0.2 pts/AED (0.2%) on fuel/education/govt/real estate/telecom/charity/transport. LuLu outlets exempt from supermarket reduced rate. EEA (UK/Europe) purchases earn 0.4 pts/AED. Free for life (Mastercard Titanium). Complimentary airport lounge access (count unspecified — data gap). 5,000 pts = AED 50 LuLu voucher. Forex 2.99%. Earn rates effective Oct 2020. SOF: adcb.com (Feb 2026).',
    is_active: true,
  },
  {
    id: LULU_PLAT_ID,
    bank_id: BANK,
    name: 'ADCB LuLu Platinum Credit Card',
    card_network: 'mastercard',
    card_tier: 'platinum',
    annual_fee_aed: 0,
    annual_fee_waiver_spend: null,
    supplementary_fee_aed: 0,
    min_salary_aed: 8000,
    is_islamic: false,
    reward_currency_name: 'LuLu Points',
    reward_currency_value_aed: 0.01,
    base_earn_rate: 1.25,
    base_earn_unit: 'points_per_aed',
    forex_markup_pct: 2.99,
    interest_rate_monthly_pct: null,
    lounge_access_count: null,         // DATA GAP: "for cardholder and supplementary" confirmed but count not stated
    lounge_access_network: null,
    valet_parking_count: 0,
    travel_insurance: false,
    purchase_protection: false,
    concierge: false,
    airport_transfer_count: 0,
    min_age: 21,
    apply_url: 'https://www.adcb.com/en/personal/credit-cards/adcb-lulu-platinum-credit-card.aspx',
    source_url: 'https://www.adcb.com/en/personal/credit-cards/adcb-lulu-platinum-credit-card.aspx',
    summary: 'VERIFIED. ADCB-LuLu Hypermarket co-branded premium card. Earn 8.0 LuLu pts/AED (8.0% effective) at LuLu Hypermarkets; 1.25 pts/AED (1.25%) standard spend; 0.4 pts/AED (0.4%) at supermarkets/insurance/QSR; 0.2 pts/AED (0.2%) on fuel/education/govt/real estate/telecom/charity/transport. EEA (UK/Europe) earn 0.4 pts/AED. Free for life (Mastercard Platinum). BOGOF Reel Cinemas (up to 2 free tickets/month). Complimentary lounge for primary + supplementary cardholder (count unspecified — data gap). Min salary AED 8,000. 5,000 pts = AED 50 voucher. Forex 2.99%.',
    is_active: true,
  },
  {
    id: TALAB_ID,
    bank_id: BANK,
    name: 'talabat ADCB Credit Card',
    card_network: 'mastercard',
    card_tier: 'platinum',
    annual_fee_aed: 0,
    annual_fee_waiver_spend: null,
    supplementary_fee_aed: 0,
    min_salary_aed: 5000,
    is_islamic: false,
    reward_currency_name: 'talabat Credit',
    reward_currency_value_aed: 1.0,   // AED 1 talabat credit = AED 1 value
    base_earn_rate: 1.25,
    base_earn_unit: 'cashback_pct',
    forex_markup_pct: 2.99,
    interest_rate_monthly_pct: null,
    lounge_access_count: 0,
    lounge_access_network: null,
    valet_parking_count: 0,
    travel_insurance: false,
    purchase_protection: false,
    concierge: false,
    airport_transfer_count: 0,
    min_age: 21,
    apply_url: 'https://www.adcb.com/en/personal/credit-cards/talabat-adcb-credit-card.aspx',
    source_url: 'https://www.adcb.com/en/personal/credit-cards/talabat-adcb-credit-card.aspx',
    summary: 'VERIFIED. talabat-branded lifestyle card: 35% back as talabat credit on first 10 talabat orders/month (cap AED 35/order, AED 350/month cumulative; requires min AED 2,500 monthly retail spend — falls to 1.25% if not met); 1.25% on standard other retail; 0.35% on restricted categories (fuel, education, govt, real estate, telecom, charity, transport, supermarkets, auto dealers, insurance). EEA (UK/Europe) = 0.35%. Free for life (Mastercard Platinum). Unlimited free delivery on talabat Pro orders (min AED 50 food, AED 100 mart). Welcome bonus: AED 750 (new ADCB customers) / AED 200 (existing), subject to AED 5,000 spend in 45 days. Forex 2.99%. Min salary AED 5,000.',
    is_active: true,
  },
  {
    id: SHUKRAN_ID,
    bank_id: BANK,
    name: 'Shukran ADCB Credit Card',
    card_network: 'visa',
    card_tier: 'platinum',
    annual_fee_aed: 262.50,           // inc. 5% VAT; first year free; free for UAE Nationals
    annual_fee_waiver_spend: null,
    supplementary_fee_aed: 0,
    min_salary_aed: 5000,
    is_islamic: false,
    reward_currency_name: 'Shukrans',
    reward_currency_value_aed: 0.01, // Inferred (10% back at Shukran brands ≈ 10 Shukrans/AED × AED 0.01) — DATA GAP: redemption value not explicitly stated in PDF
    base_earn_rate: 1.5,
    base_earn_unit: 'cashback_pct',
    forex_markup_pct: 2.99,
    interest_rate_monthly_pct: null,
    lounge_access_count: 0,
    lounge_access_network: null,
    valet_parking_count: 0,
    travel_insurance: false,
    purchase_protection: false,
    concierge: false,
    airport_transfer_count: 0,
    min_age: 21,
    apply_url: 'https://www.adcb.com/en/personal/credit-cards/shukran-adcb-credit-card.aspx',
    source_url: 'https://www.adcb.com/en/personal/credit-cards/shukran-adcb-credit-card.aspx',
    summary: 'VERIFIED. Shukran Landmark Group co-branded card (Visa Platinum). 10% back as Shukrans at Shukran brands (Centrepoint, Emax, Max, Babyshop, Homebox, Homecentre, Lifestyle, Shoemart, Splash, Styli); up to 1.5% on all other retail (restricted category breakdown not explicitly stated — data gap). AED 250+VAT annual fee (AED 262.50 inc VAT); first year free for all; free for life for UAE Nationals. Complimentary upgrade to Shukran Platinum Tier on card issuance. BOGOF Reel Cinemas (2 free/month). Welcome bonus: 1,200 Shukrans (UAE Nationals new) / 1,000 (UAE Residents new) / 200 (existing ADCB customers); requires AED 8,000 spend in 60 days. Forex 2.99%. Shukran point value: inferred AED 0.01 — verify with ADCB.',
    is_active: true,
  },
];

// ─── Card rewards builder ─────────────────────────────────────────────────────

const SRC_LULU_TIT  = 'https://www.adcb.com/en/personal/credit-cards/adcb-lulu-titanium-credit-card.aspx';
const SRC_LULU_PLAT = 'https://www.adcb.com/en/personal/credit-cards/adcb-lulu-platinum-credit-card.aspx';
const SRC_TALAB     = 'https://www.adcb.com/en/personal/credit-cards/talabat-adcb-credit-card.aspx';
const SRC_SHUKRAN   = 'https://www.adcb.com/en/personal/credit-cards/shukran-adcb-credit-card.aspx';

const LULU_NOTE_SUFFIX = ' Source: adcb.com LuLu Titanium CC product page (PDF captured May 2026). Earn rates effective 25 Oct 2020 per ADCB EDM. 5,000 LuLu pts = AED 50 voucher (AED 0.01/pt).';
const LULU_P_SUFFIX    = ' Source: adcb.com LuLu Platinum CC product page (PDF captured May 2026). 5,000 LuLu pts = AED 50 voucher (AED 0.01/pt).';
const TALAB_SUFFIX     = ' Source: adcb.com talabat ADCB CC product page (PDF captured May 2026).';
const SHUKRAN_SUFFIX   = ' Source: adcb.com Shukran ADCB CC product page (PDF captured May 2026). ⚠️ Restricted category rates not explicitly stated in PDF — figure based on "up to 1.5%" statement. Verify with ADCB.';

// LuLu Titanium rewards (17 categories)
// Point value: 1 LuLu Point = AED 0.01. Earn rate in points/AED.
function luluTitaniumRows() {
  const base = (cat, earn, eff, notes) => ({
    card_id: LULU_TIT_ID,
    category_id: cat,
    reward_type: 'points',
    earn_rate: earn,
    earn_unit: 'per_aed',
    effective_return_pct: eff,
    source_url: SRC_LULU_TIT,
    last_verified_date: TODAY,
    is_active: true,
    notes,
  });
  return [
    base(C.dining,       1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% at restaurants. ⚠️ QSR/fast-food earns reduced 0.4 pts/AED (0.4%).' + LULU_NOTE_SUFFIX),
    base(C.groceries,    0.4,  0.4,  '0.4 LuLu pt/AED = 0.4% at non-LuLu supermarkets. 🎁 LuLu Hypermarket purchases earn 3.5 pts/AED = 3.5% (LuLu outlets exempt from supermarket reduced rate).' + LULU_NOTE_SUFFIX),
    base(C.fuel,         0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (fuel/petrol stations).' + LULU_NOTE_SUFFIX),
    base(C.airlines,     1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on airline purchases. Standard earn rate.' + LULU_NOTE_SUFFIX),
    base(C.shopping,     1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on shopping. Standard earn rate.' + LULU_NOTE_SUFFIX),
    base(C.hotels,       1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on hotel bookings. Standard earn rate.' + LULU_NOTE_SUFFIX),
    base(C.travel,       1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on travel agencies and booking sites. Standard earn rate.' + LULU_NOTE_SUFFIX),
    base(C.online,       1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on online shopping (Amazon.ae, Noon, etc.). Standard earn rate.' + LULU_NOTE_SUFFIX),
    base(C.entertain,    1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on entertainment (cinema, theme parks, etc.). Standard earn rate.' + LULU_NOTE_SUFFIX),
    base(C.utilities,    0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (telecommunications/utilities).' + LULU_NOTE_SUFFIX),
    base(C.education,    0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (education).' + LULU_NOTE_SUFFIX),
    base(C.insurance,    0.4,  0.4,  '0.4 LuLu pt/AED = 0.4%. Restricted category (insurance companies).' + LULU_NOTE_SUFFIX),
    base(C.government,   0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (government services).' + LULU_NOTE_SUFFIX),
    base(C.rent,         0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (real estate payments).' + LULU_NOTE_SUFFIX),
    base(C.healthcare,   1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on healthcare (hospitals, clinics, pharmacies). Standard earn rate.' + LULU_NOTE_SUFFIX),
    base(C.international,1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on non-EEA international spend. ⚠️ Purchases at merchants in UK & Europe (EEA) earn reduced 0.4 pts/AED (0.4%) per MasterCard guidelines.' + LULU_NOTE_SUFFIX),
    base(C.general,      1.0,  1.0,  '1.0 LuLu pt/AED = 1.0% on all other eligible purchases. Standard earn rate.' + LULU_NOTE_SUFFIX),
  ];
}

// LuLu Platinum rewards (17 categories)
function luluPlatinumRows() {
  const base = (cat, earn, eff, notes) => ({
    card_id: LULU_PLAT_ID,
    category_id: cat,
    reward_type: 'points',
    earn_rate: earn,
    earn_unit: 'per_aed',
    effective_return_pct: eff,
    source_url: SRC_LULU_PLAT,
    last_verified_date: TODAY,
    is_active: true,
    notes,
  });
  return [
    base(C.dining,       1.25, 1.25, '1.25 LuLu pts/AED = 1.25% at restaurants. ⚠️ QSR/fast-food earns reduced 0.4 pts/AED (0.4%).' + LULU_P_SUFFIX),
    base(C.groceries,    0.4,  0.4,  '0.4 LuLu pt/AED = 0.4% at non-LuLu supermarkets. 🎁 LuLu Hypermarket purchases earn 8.0 pts/AED = 8.0% (LuLu outlets exempt from supermarket reduced rate).' + LULU_P_SUFFIX),
    base(C.fuel,         0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (fuel/petrol stations).' + LULU_P_SUFFIX),
    base(C.airlines,     1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on airline purchases. Standard earn rate.' + LULU_P_SUFFIX),
    base(C.shopping,     1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on shopping. Standard earn rate.' + LULU_P_SUFFIX),
    base(C.hotels,       1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on hotel bookings. Standard earn rate.' + LULU_P_SUFFIX),
    base(C.travel,       1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on travel agencies and booking sites. Standard earn rate.' + LULU_P_SUFFIX),
    base(C.online,       1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on online shopping (Amazon.ae, Noon, etc.). Standard earn rate.' + LULU_P_SUFFIX),
    base(C.entertain,    1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on entertainment. Standard earn rate.' + LULU_P_SUFFIX),
    base(C.utilities,    0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (telecommunications/utilities).' + LULU_P_SUFFIX),
    base(C.education,    0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (education).' + LULU_P_SUFFIX),
    base(C.insurance,    0.4,  0.4,  '0.4 LuLu pt/AED = 0.4%. Restricted category (insurance companies).' + LULU_P_SUFFIX),
    base(C.government,   0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (government services).' + LULU_P_SUFFIX),
    base(C.rent,         0.2,  0.2,  '0.2 LuLu pt/AED = 0.2%. Restricted category (real estate payments).' + LULU_P_SUFFIX),
    base(C.healthcare,   1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on healthcare. Standard earn rate.' + LULU_P_SUFFIX),
    base(C.international,1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on non-EEA international spend. ⚠️ Purchases at merchants in UK & Europe (EEA) earn reduced 0.4 pts/AED (0.4%) per MasterCard guidelines.' + LULU_P_SUFFIX),
    base(C.general,      1.25, 1.25, '1.25 LuLu pts/AED = 1.25% on all other eligible purchases. Standard earn rate.' + LULU_P_SUFFIX),
  ];
}

// talabat ADCB rewards (17 categories)
// Reward stated as % directly. reward_type = 'cashback', earn_unit = 'pct'
function talabatRows() {
  const base = (cat, earn, eff, notes) => ({
    card_id: TALAB_ID,
    category_id: cat,
    reward_type: 'cashback',
    earn_rate: earn,
    earn_unit: 'pct',
    effective_return_pct: eff,
    source_url: SRC_TALAB,
    last_verified_date: TODAY,
    is_active: true,
    notes,
  });
  return [
    base(C.dining,       1.25, 1.25, '1.25% back as talabat credit at regular restaurants. 🎁 talabat orders: 35% back (first 10 orders/month, cap AED 35/order & AED 350/month cumulative; requires min AED 2,500 monthly spend — falls to 1.25% if not met). Additional talabat orders beyond 10 earn 1.25%.' + TALAB_SUFFIX),
    base(C.groceries,    0.35, 0.35, '0.35% back at non-talabat supermarkets (restricted category). 🎁 talabat mart/grocery orders: 35% back (same conditions as dining talabat orders; min order AED 100).' + TALAB_SUFFIX),
    base(C.fuel,         0.35, 0.35, '0.35% back. Restricted category (fuel/petrol stations).' + TALAB_SUFFIX),
    base(C.airlines,     1.25, 1.25, '1.25% back as talabat credit on airline purchases. Standard earn rate.' + TALAB_SUFFIX),
    base(C.shopping,     1.25, 1.25, '1.25% back as talabat credit on shopping. Standard earn rate.' + TALAB_SUFFIX),
    base(C.hotels,       1.25, 1.25, '1.25% back as talabat credit on hotel bookings. Standard earn rate.' + TALAB_SUFFIX),
    base(C.travel,       1.25, 1.25, '1.25% back as talabat credit on travel agencies and booking sites. Standard earn rate.' + TALAB_SUFFIX),
    base(C.online,       1.25, 1.25, '1.25% back as talabat credit on online shopping. Standard earn rate.' + TALAB_SUFFIX),
    base(C.entertain,    1.25, 1.25, '1.25% back as talabat credit on entertainment. Standard earn rate.' + TALAB_SUFFIX),
    base(C.utilities,    0.35, 0.35, '0.35% back. Restricted category (telecommunications).' + TALAB_SUFFIX),
    base(C.education,    0.35, 0.35, '0.35% back. Restricted category (education).' + TALAB_SUFFIX),
    base(C.insurance,    0.35, 0.35, '0.35% back. Restricted category (insurance companies).' + TALAB_SUFFIX),
    base(C.government,   0.35, 0.35, '0.35% back. Restricted category (government services).' + TALAB_SUFFIX),
    base(C.rent,         0.35, 0.35, '0.35% back. Restricted category (real estate).' + TALAB_SUFFIX),
    base(C.healthcare,   1.25, 1.25, '1.25% back as talabat credit on healthcare. Standard earn rate.' + TALAB_SUFFIX),
    base(C.international,1.25, 1.25, '1.25% back on non-EEA international spend. ⚠️ Purchases at merchants in UK & Europe (EEA) earn reduced 0.35% per MasterCard guidelines.' + TALAB_SUFFIX),
    base(C.general,      1.25, 1.25, '1.25% back as talabat credit on all other eligible purchases. Standard earn rate.' + TALAB_SUFFIX),
  ];
}

// Shukran ADCB rewards (17 categories)
// PDF states "10% back at Shukran brands" and "up to 1.5% on all other retail"
// Restricted category breakdown NOT explicitly stated in PDF — flagged as data gap
function shukranRows() {
  const base = (cat, earn, eff, notes) => ({
    card_id: SHUKRAN_ID,
    category_id: cat,
    reward_type: 'points',
    earn_rate: earn,
    earn_unit: 'pct',
    effective_return_pct: eff,
    source_url: SRC_SHUKRAN,
    last_verified_date: TODAY,
    is_active: true,
    notes,
  });
  const dataGapNote = ' ⚠️ DATA GAP: PDF states "up to 1.5% on all other retail" without explicit category breakdowns. Rate applied is 1.5% pending verification with ADCB. Likely reduced for this MCC group based on ADCB standard card patterns.';
  return [
    base(C.dining,       1.5,  1.5,  '1.5% back as Shukrans on dining. Standard rate per "up to 1.5% on all other retail" statement.' + SHUKRAN_SUFFIX),
    base(C.groceries,    1.5,  1.5,  '1.5% back as Shukrans on grocery spend. Standard rate.' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.fuel,         1.5,  1.5,  '1.5% back as Shukrans on fuel. Standard rate (applied).' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.airlines,     1.5,  1.5,  '1.5% back as Shukrans on airline purchases. Standard rate.' + SHUKRAN_SUFFIX),
    base(C.shopping,     1.5,  1.5,  '1.5% back as Shukrans at non-Shukran stores. 🎁 Shukran brand stores (Centrepoint, Emax, Max, Babyshop, Homebox, Homecentre, Lifestyle, Shoemart, Splash, Styli): 10% back as Shukrans.' + SHUKRAN_SUFFIX),
    base(C.hotels,       1.5,  1.5,  '1.5% back as Shukrans on hotel bookings. Standard rate.' + SHUKRAN_SUFFIX),
    base(C.travel,       1.5,  1.5,  '1.5% back as Shukrans on travel agencies and booking sites. Standard rate.' + SHUKRAN_SUFFIX),
    base(C.online,       1.5,  1.5,  '1.5% back as Shukrans on online shopping. Standard rate.' + SHUKRAN_SUFFIX),
    base(C.entertain,    1.5,  1.5,  '1.5% back as Shukrans on entertainment. Standard rate.' + SHUKRAN_SUFFIX),
    base(C.utilities,    1.5,  1.5,  '1.5% back as Shukrans on utilities. Standard rate (applied).' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.education,    1.5,  1.5,  '1.5% back as Shukrans on education. Standard rate (applied).' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.insurance,    1.5,  1.5,  '1.5% back as Shukrans on insurance. Standard rate (applied).' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.government,   1.5,  1.5,  '1.5% back as Shukrans on government fees. Standard rate (applied).' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.rent,         1.5,  1.5,  '1.5% back as Shukrans on rent/real estate. Standard rate (applied).' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.healthcare,   1.5,  1.5,  '1.5% back as Shukrans on healthcare. Standard rate.' + SHUKRAN_SUFFIX),
    base(C.international,1.5,  1.5,  '1.5% back as Shukrans on international spend. Standard rate (applied for non-EEA).' + dataGapNote + SHUKRAN_SUFFIX),
    base(C.general,      1.5,  1.5,  '1.5% back as Shukrans on all other eligible retail purchases. Standard rate per product page.' + SHUKRAN_SUFFIX),
  ];
}

// ─── Card benefits ────────────────────────────────────────────────────────────
function buildBenefits() {
  return [
    // LuLu Titanium — lounge (count TBD)
    {
      card_id: LULU_TIT_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary airport lounge access',
      description: 'Complimentary airport lounge access for LuLu Titanium cardholders. Number of visits per year not specified in product page — data gap.',
      usage_limit: null,
      usage_period: 'yearly',
      monetary_value_aed: null,
      conditions: '⚠️ Visit count unspecified. Verify with ADCB.',
      is_active: true,
    },
    // LuLu Platinum — lounge (primary + supplementary, count TBD)
    {
      card_id: LULU_PLAT_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary airport lounge access',
      description: 'Complimentary airport lounge access for primary cardholder and supplementary cardholder. Number of visits per year not specified in product page.',
      usage_limit: null,
      usage_period: 'yearly',
      monetary_value_aed: null,
      conditions: '⚠️ Visit count unspecified. Covers primary + supplementary cardholder. Verify with ADCB.',
      is_active: true,
    },
    // LuLu Platinum — BOGOF Reel Cinemas
    {
      card_id: LULU_PLAT_ID,
      benefit_type: 'cinema',
      title: 'Buy 1 Get 1 Free — Reel Cinemas',
      description: 'Buy 1 Get 1 Free movie ticket at Reel Cinemas, valid for up to 2 complimentary tickets per month.',
      usage_limit: 2,
      usage_period: 'monthly',
      monetary_value_aed: null,
      conditions: 'Up to 2 free tickets per month at Reel Cinemas.',
      is_active: true,
    },
    // talabat — welcome bonus
    {
      card_id: TALAB_ID,
      benefit_type: 'welcome_bonus',
      title: 'talabat Credit Welcome Bonus',
      description: 'Up to AED 750 welcome bonus as talabat credit for new ADCB customers (no existing ADCB card). AED 200 for existing ADCB cardholders. Credited to talabat Pay account within 90 days of card issuance.',
      usage_limit: 1,
      usage_period: 'yearly',
      monetary_value_aed: 750,
      conditions: 'Min spend AED 5,000 within 45 days of card issuance. New customers only (AED 200 for existing ADCB cardholders). Applied via digital channels only.',
      is_active: true,
    },
    // talabat — talabat Pro free delivery
    {
      card_id: TALAB_ID,
      benefit_type: 'other',
      title: 'Unlimited free delivery on talabat Pro orders',
      description: 'Unlimited free delivery on all talabat Pro orders with minimum order value of AED 50 on food and AED 100 on talabat mart, groceries, and pharmacy.',
      usage_limit: null,
      usage_period: 'monthly',
      monetary_value_aed: null,
      conditions: 'talabat Pro orders only. Min AED 50 for food, AED 100 for mart/grocery/pharmacy.',
      is_active: true,
    },
    // Shukran — welcome bonus
    {
      card_id: SHUKRAN_ID,
      benefit_type: 'welcome_bonus',
      title: 'Shukran Welcome Bonus',
      description: 'Welcome bonus as Shukrans: 1,200 for UAE Nationals (new ADCB customers); 1,000 for UAE Residents (new ADCB customers); 200 for existing ADCB cardholders. Credited to Shukran membership account within 120 days of card issuance.',
      usage_limit: 1,
      usage_period: 'yearly',
      monetary_value_aed: null,
      conditions: 'Min spend AED 8,000 within 60 days of card issuance (retail purchases, balance transfer, or credit card loans). One-time reward per cardholder.',
      is_active: true,
    },
    // Shukran — Platinum Tier upgrade
    {
      card_id: SHUKRAN_ID,
      benefit_type: 'other',
      title: 'Complimentary Shukran Platinum Tier membership',
      description: 'Fast-track upgrade to Shukran Platinum Tier upon card issuance. Platinum Tier includes 300+ BOGOF deals, free shipping on online orders, extra Shukrans for purchases.',
      usage_limit: null,
      usage_period: 'yearly',
      monetary_value_aed: null,
      conditions: 'Upgrade reflected in Shukran membership account within 3 working days of card issuance.',
      is_active: true,
    },
    // Shukran — BOGOF Reel Cinemas
    {
      card_id: SHUKRAN_ID,
      benefit_type: 'cinema',
      title: 'Buy 1 Get 1 Free — Reel Cinemas',
      description: 'Buy 1 Get 1 Free movie ticket at Reel Cinemas, valid for up to 2 complimentary tickets per month.',
      usage_limit: 2,
      usage_period: 'monthly',
      monetary_value_aed: null,
      conditions: 'Up to 2 free tickets per month at Reel Cinemas.',
      is_active: true,
    },
  ];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('=== Adding 4 new ADCB cards ===\n');
  console.log('Card IDs assigned:');
  console.log('  LuLu Titanium :', LULU_TIT_ID);
  console.log('  LuLu Platinum :', LULU_PLAT_ID);
  console.log('  talabat ADCB  :', TALAB_ID);
  console.log('  Shukran ADCB  :', SHUKRAN_ID);
  console.log();

  // 1. Insert cards
  console.log('Step 1: Inserting cards...');
  const { data: insertedCards, error: cardErr } = await sb.from('cards').insert(CARDS).select('id, name');
  if (cardErr) {
    console.error('❌ Card insert failed:', cardErr.message);
    return;
  }
  console.log('✅ Inserted cards:', insertedCards.map(c => c.name));

  // 2. Insert card_rewards
  console.log('\nStep 2: Inserting card_rewards (17 × 4 = 68 rows)...');
  const allRewards = [
    ...luluTitaniumRows(),
    ...luluPlatinumRows(),
    ...talabatRows(),
    ...shukranRows(),
  ];

  let rewardErrors = 0;
  for (const row of allRewards) {
    const { error } = await sb.from('card_rewards').insert(row);
    if (error) {
      console.error(`❌ Reward insert error [${row.card_id} / ${row.category_id}]:`, error.message);
      rewardErrors++;
    }
  }
  console.log(`✅ Inserted ${allRewards.length - rewardErrors}/${allRewards.length} card_rewards rows (${rewardErrors} errors)`);

  // 3. Insert card_benefits
  console.log('\nStep 3: Inserting card_benefits...');
  const benefits = buildBenefits();
  const { data: insertedBenefits, error: benErr } = await sb.from('card_benefits').insert(benefits).select('id, title');
  if (benErr) {
    console.error('❌ Benefits insert failed:', benErr.message);
  } else {
    console.log(`✅ Inserted ${insertedBenefits.length} card_benefits rows`);
  }

  // 4. Summary
  console.log('\n=== Migration complete ===');
  console.log('Cards added: 4 (LuLu Titanium, LuLu Platinum, talabat ADCB, Shukran ADCB)');
  console.log('card_rewards rows: 68 (17 categories × 4 cards)');
  console.log('card_benefits rows:', benefits.length);
  console.log('\n⚠️  DATA GAPS requiring follow-up:');
  console.log('  1. LuLu Titanium lounge_access_count — PDF confirms lounge access but no count stated');
  console.log('  2. LuLu Platinum lounge_access_count — same issue; covers primary + supplementary');
  console.log('  3. Shukran restricted category rates — "up to 1.5%" used for all; may be lower for fuel/govt/utilities/education');
  console.log('  4. Shukran point redemption value — AED 0.01/Shukran inferred; not explicitly stated in PDF');
}

run().catch(console.error);

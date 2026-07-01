// Add ENBD Voyager World Mastercard / Voyager World Elite Mastercard Credit Cards
//
// ENBD Voyager Miles Programme
// 100 Voyager Miles = AED 1  →  reward_currency_value_aed = 0.01
// (Confirmed by SRC_REDEEM: "100 Voyager Miles will be equivalent to AED 1")
//
// Sources:
//   SRC_EARN → tcpdfs/ENBD Earning Voyager Miles _ Support _ Emirates NBD.pdf
//     AUTHORITATIVE EARN RATE TABLE (both cards side-by-side):
//       Type of spends          | Voyager World Elite | Voyager World
//       ----------------------- | ------------------- | -------------
//       Voyager Portal Spends   | 12 Miles / AED 1    | 6 Miles / AED 1
//       Other travel spends     | 6 Miles / AED 1     | 3 Miles / AED 1
//       Retail Spends           | 1 Mile / AED 1      | 0.5 Miles / AED 1
//       Low MCC (Mastercard Interchange-based) — two reduced tiers:
//         25% of base retail:  Insurance, car dealerships, grocery/supermarkets,
//                               fast-food restaurants, EU/UK spends
//         10% of base retail:  Fuel, transit, government services, utility payments,
//                               real estate, education, charity, telecom
//     Miles expiry: 36 calendar months from earning date.
//     NOTE on Voyager Portal: 6×/12× rate ONLY applies when booking via the ENBD X
//       Voyager Travel Portal — NOT for direct airline/hotel spend at those merchants.
//
//   SRC_REDEEM → tcpdfs/ENBD Redeeming Voyager Miles _ Support _ Emirates NBD.pdf
//     100 Voyager Miles = AED 1. Miles redeemable only via Voyager Travel Portal in ENBD X.
//     NOT transferable for cash. Minimum 1,000 Miles for partner airline transfer.
//     Transfer partners (airlines only; hotels "coming soon"):
//       Flynas, Air Arabia, Ethiopian Airlines, Pegasus Airlines, Air India, Azerbaijan Airlines.
//
//   SRC_WORLD_PRODUCT → tcpdfs/ENBD Voyager World Credit Card _ Emirates NBD.pdf
//     Free for life. Min salary AED 12,000. Joining fee NIL.
//     Welcome offer: 75,000 Miles on AED 35,000 spend in first 3 billing statements.
//     Benefits: Mastercard Travel Pass (1,000+ lounges), airport transfers (Dubai & Abu Dhabi),
//       OneVasco Visa Concierge (4 apps/year, ≈AED 1,346), golf UAE (≈AED 2,400), VOX BOGOF
//       (≈AED 660), dining discounts (≈AED 600), complimentary valet Abu Dhabi (≈AED 360).
//
//   SRC_ELITE_PRODUCT → tcpdfs/ENBD Voyager World Elite Credit Card _ Emirates NBD.pdf
//     Joining fee NIL, first year free, AED 1,500 from year 2. Min salary AED 25,000.
//     Welcome offer: 150,000 Miles on AED 70,000 spend in first 3 billing statements.
//     Benefits: unlimited lounge access (≈AED 470), domestic & international airport transfers
//       (≈AED 1,600), International Meet & Greet (≈AED 1,395), immigration fast track 3×/year,
//       OneVasco visa (≈AED 2,600), golf UAE (≈AED 7,200), dining (≈AED 1,200), valet (≈AED 720),
//       VOX + Reel Cinemas BOGOF (≈AED 1,395).
//
//   SRC_BENEFITS → tcpdfs/ENBD Voyager Benefits _ Emirates NBD.pdf
//     OneVasco Visa Concierge (both cards): 4 complimentary visa applications/year.
//     International Airport Transfers (Voyager World): Standard rides at selected international
//       airports up to 4 times/year via Thriwe (emiratesnbdbenefits.thriwe.com).
//     Min monthly spend AED 5,000 required during the month a benefit is used; if below:
//       International Airport Transfers: AED 250 (World) / AED 500 (Elite) fee charged
//       International Meet & Greet:      N/A (World)      / AED 500 (Elite) fee charged
//       OneVasco Visa Concierge:         AED 250 (World)  / AED 500 (Elite) fee charged
//       Airport Security Fast Track:     N/A (World)      / AED 100 (Elite) fee charged
//     Other benefits confirmed for both: Airport Lounge Access, Concierge services,
//       Travel Medical Insurance (Mastercard), Golf, VOX Cinemas, Reel Cinemas, Valet Abu Dhabi,
//       Roadside Assistance, Free Global eSIM, Discounts on car rentals.
//
//   SRC_WORLD_TNCS → tcpdfs/ENBD voyager_tncs_booklet_world.pdf
//     Confirms earn rates, welcome offer (75,000 Miles / AED 35,000 / 3 months),
//     monthly cap: 100,000 Miles per statement.
//
//   SRC_ELITE_TNCS → tcpdfs/ENBD voyager_tncs_booklet_world_elite.pdf
//     Confirms earn rates, welcome offer (150,000 Miles / AED 70,000 / 3 months),
//     monthly cap: 200,000 Miles per statement.
//
//   SRC_FEES → tcpdfs/emiratesnbd_credit_card_fees_charges.pdf (Feb 2026)
//     Annual fees (VAT-inclusive): Voyager World Elite = AED 1,575 / Voyager World = AED 315.
//     NB: Voyager World product page says "Free for life" — product page is authoritative;
//       AED 315 in fees schedule is a discrepancy (may be conditional/standard market rate).
//     Finance charges: Voyager World Elite = 3.25%/month | Voyager World = 3.69%/month.
//     International Transaction Fee: 1.99% (both cards). Late payment: AED 241.50/month.
//     Cash advance: 3.15% or AED 103.95 (whichever higher).
//
//   SRC_KFS → tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf (March 2026)
//     Renewal Fees: Voyager World Elite = AED 1,575 / Voyager World = AED 315.
//     Joining Fees: Voyager World Elite = AED 2,098.95 / Voyager World = Free.
//     APR: Voyager World Elite = 39.00% | Voyager World = 44.28%.
//     NB: KFS joining fee 2,098.95 for Elite conflicts with product page ("Joining fees NIL /
//       First Year Free") — product page is authoritative for the customer-facing offer.
//
// COMPUTED effective_return_pct (formula: earn_rate_miles_per_aed × 0.01 × 100 = pct):
//   Because reward_currency_value_aed = 0.01: earn_rate (Miles/AED) = pct / (0.01 × 100) = pct
//
//   Voyager World (base retail = 0.5 Miles/AED):
//     airlines / hotels / travel  (other travel): 3 Miles/AED   → 3.00%
//     dining / shopping / online_shopping /
//       entertainment / healthcare / international / general (retail): 0.5 Miles/AED → 0.50%
//     groceries / insurance (25% of 0.5):         0.125 Miles/AED → 0.125%
//     fuel / utilities / government / education / rent (10% of 0.5): 0.05 Miles/AED → 0.05%
//     🎁 Voyager Portal (airlines/hotels via ENBD X only): 6 Miles/AED → 6.00% [noted only]
//
//   Voyager World Elite (base retail = 1 Mile/AED):
//     airlines / hotels / travel  (other travel):  6 Miles/AED   → 6.00%
//     dining / shopping / online_shopping /
//       entertainment / healthcare / international / general (retail): 1 Mile/AED → 1.00%
//     groceries / insurance (25% of 1):            0.25 Miles/AED → 0.25%
//     fuel / utilities / government / education / rent (10% of 1):  0.10 Miles/AED → 0.10%
//     🎁 Voyager Portal (airlines/hotels via ENBD X only): 12 Miles/AED → 12.00% [noted only]
//
// CATEGORY MAPPING (17 CardWise slugs → rate buckets):
//   TRAVEL (other travel spends):  airlines, hotels, travel
//   RETAIL (general):              dining, shopping, online_shopping, entertainment,
//                                   healthcare, international, general
//   25%-REDUCED retail:            groceries, insurance
//   10%-REDUCED retail:            fuel, utilities, education, government, rent
//
// CATEGORY-SPECIFIC MAPPING NOTES:
//   - dining: fast-food restaurants earn 25% of base per SRC_EARN Low MCC table, but CardWise
//     uses a single "dining" category; full retail rate used here with ⚠️ note.
//   - international: EU/UK spends earn 25% of base per SRC_EARN; other international earns
//     full retail rate. Single category uses retail rate with ⚠️ EU/UK note.
//   - rent: mapped from "real estate" in the 10%-reduced bucket.
//   - healthcare: not explicitly listed in SRC_EARN rate table — assumed retail rate.
//
// FLAGGED FOR HUMAN REVIEW:
//   - Voyager World "Free for Life" vs AED 315 in SRC_FEES: product page used as authoritative.
//   - Voyager World Elite KFS joining fee (AED 2,098.95) vs product page "NIL": product page used.
//   - "healthcare" category rate assumption (retail) — verify with bank.
//   - Fast-food dining rate (25% of retail) not reflected in "dining" row — noted with ⚠️.
//   - EU/UK international rate (25% of retail) not reflected in "international" row — noted with ⚠️.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-16';

const SRC_EARN          = 'tcpdfs/ENBD Earning Voyager Miles _ Support _ Emirates NBD.pdf';
const SRC_REDEEM        = 'tcpdfs/ENBD Redeeming Voyager Miles _ Support _ Emirates NBD.pdf';
const SRC_WORLD_PRODUCT = 'tcpdfs/ENBD Voyager World Credit Card _ Emirates NBD.pdf';
const SRC_ELITE_PRODUCT = 'tcpdfs/ENBD Voyager World Elite Credit Card _ Emirates NBD.pdf';
const SRC_BENEFITS      = 'tcpdfs/ENBD Voyager Benefits _ Emirates NBD.pdf';
const SRC_WORLD_TNCS    = 'tcpdfs/ENBD voyager_tncs_booklet_world.pdf';
const SRC_ELITE_TNCS    = 'tcpdfs/ENBD voyager_tncs_booklet_world_elite.pdf';
const SRC_FEES          = 'tcpdfs/emiratesnbd_credit_card_fees_charges.pdf';
const SRC_KFS           = 'tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf';

const SLUGS_ALL = [
  'groceries', 'dining', 'fuel', 'rent', 'utilities', 'education', 'insurance',
  'online_shopping', 'shopping', 'entertainment', 'healthcare', 'airlines',
  'hotels', 'travel', 'international', 'government', 'general',
];

const TRAVEL_CATS     = ['airlines', 'hotels', 'travel'];
const REDUCED_25_CATS = ['groceries', 'insurance'];
const REDUCED_10_CATS = ['fuel', 'utilities', 'education', 'government', 'rent'];

const TIERS = {
  WORLD: {
    name:                      'Emirates NBD Voyager World Mastercard Credit Card',
    card_tier:                 'world',
    annual_fee_aed:            0,
    min_salary_aed:            12000,
    interest_rate_monthly_pct: 3.69,
    travelPct:                 3.00,
    retailPct:                 0.50,
    reduced25Pct:              0.125,
    reduced10Pct:              0.05,
    portalPct:                 6.00,
    monthlyCapMiles:           100000,
    monthlyCapAed:             1000,
    tncSrc:                    SRC_WORLD_TNCS,
  },
  ELITE: {
    name:                      'Emirates NBD Voyager World Elite Mastercard Credit Card',
    card_tier:                 'world_elite',
    annual_fee_aed:            1575,
    min_salary_aed:            25000,
    interest_rate_monthly_pct: 3.25,
    travelPct:                 6.00,
    retailPct:                 1.00,
    reduced25Pct:              0.25,
    reduced10Pct:              0.10,
    portalPct:                 12.00,
    monthlyCapMiles:           200000,
    monthlyCapAed:             2000,
    tncSrc:                    SRC_ELITE_TNCS,
  },
};

function pctFor(slug, t) {
  if (TRAVEL_CATS.includes(slug))     return t.travelPct;
  if (REDUCED_25_CATS.includes(slug)) return t.reduced25Pct;
  if (REDUCED_10_CATS.includes(slug)) return t.reduced10Pct;
  return t.retailPct;
}

function capNote(t) {
  return `⚠️ Monthly statement cap: ${t.monthlyCapMiles.toLocaleString()} Voyager Miles (≈AED ${t.monthlyCapAed.toLocaleString()}) per statement, per ${t.tncSrc}.`;
}

function getNotes(slug, t) {
  const redemption = `100 Voyager Miles = AED 1 (${SRC_REDEEM}). Redeemable via Voyager Travel Portal in ENBD X app only. Not transferable for cash.`;
  const expiry = 'Miles expire 36 calendar months from earning date.';
  const cap = capNote(t);

  switch (slug) {
    case 'airlines':
      return `${t.travelPct}% return on airline ticket purchases ("other travel spends" — ${t.travelPct / 0.01 / 100} Miles/AED 1). 🎁 Earns ${t.portalPct}% (${t.portalPct / 0.01 / 100} Miles/AED 1) when booking via the ENBD X Voyager Travel Portal — portal rate ONLY applies to bookings made through the in-app portal, not direct airline spend. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'hotels':
      return `${t.travelPct}% return on hotel bookings ("other travel spends" — ${t.travelPct / 0.01 / 100} Miles/AED 1). 🎁 Earns ${t.portalPct}% (${t.portalPct / 0.01 / 100} Miles/AED 1) when booking via the ENBD X Voyager Travel Portal — portal rate ONLY applies to bookings made through the in-app portal, not direct hotel spend. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'travel':
      return `${t.travelPct}% return on travel agency/booking platform spend ("other travel spends" — ${t.travelPct / 0.01 / 100} Miles/AED 1). Covers travel agencies, car rentals, booking platforms (Booking.com, Expedia, etc.). ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'dining':
      return `${t.retailPct}% return on dining/restaurants/cafés (retail rate — ${t.retailPct / 0.01 / 100} Miles/AED 1). ⚠️ Fast-food/quick-service restaurants (fast-food MCC) earn only 25% of this rate (${t.reduced25Pct}%) per ${SRC_EARN} Low MCC table — CardWise "dining" category uses the full retail rate as conservative baseline. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'groceries':
      return `${t.reduced25Pct}% return on groceries/supermarkets (25% of retail rate — ${t.reduced25Pct / 0.01 / 100} Miles/AED 1). Grouped with insurance, car dealerships, fast-food restaurants, and EU/UK spends in the Low MCC 25%-reduced bucket per ${SRC_EARN}. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'fuel':
      return `${t.reduced10Pct}% return on fuel/petrol station spend (10% of retail rate — ${t.reduced10Pct / 0.01 / 100} Miles/AED 1). Grouped with transit, government services, utility payments, real estate, education, charity, telecom in the Low MCC 10%-reduced bucket per ${SRC_EARN}. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'utilities':
      return `${t.reduced10Pct}% return on utility payments & telecom (DEWA/Etisalat/du/SEWA/FEWA/Salik) — 10% of retail rate (${t.reduced10Pct / 0.01 / 100} Miles/AED 1), per ${SRC_EARN} Low MCC table. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'education':
      return `${t.reduced10Pct}% return on education/school fees/tuition — 10% of retail rate (${t.reduced10Pct / 0.01 / 100} Miles/AED 1), per ${SRC_EARN} Low MCC table. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'insurance':
      return `${t.reduced25Pct}% return on insurance premium payments — 25% of retail rate (${t.reduced25Pct / 0.01 / 100} Miles/AED 1), grouped with groceries/supermarkets/fast-food restaurants/car dealerships per ${SRC_EARN} Low MCC table. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'government':
      return `${t.reduced10Pct}% return on government services/fees — 10% of retail rate (${t.reduced10Pct / 0.01 / 100} Miles/AED 1), per ${SRC_EARN} Low MCC table. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'rent':
      return `${t.reduced10Pct}% return on rental payments — 10% of retail rate (${t.reduced10Pct / 0.01 / 100} Miles/AED 1). Mapped from "real estate" in the Low MCC 10%-reduced bucket per ${SRC_EARN}. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'shopping':
      return `${t.retailPct}% return on shopping (retail rate — ${t.retailPct / 0.01 / 100} Miles/AED 1). ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'online_shopping':
      return `${t.retailPct}% return on online shopping (retail rate — ${t.retailPct / 0.01 / 100} Miles/AED 1). Covers Amazon.ae, Noon, and general e-commerce. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'entertainment':
      return `${t.retailPct}% return on entertainment/cinema (retail rate — ${t.retailPct / 0.01 / 100} Miles/AED 1). ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'healthcare':
      return `${t.retailPct}% return on healthcare (hospitals/clinics/pharmacies) — retail rate (${t.retailPct / 0.01 / 100} Miles/AED 1). ⚠️ Healthcare is not explicitly listed in the ${SRC_EARN} rate table — assumed to fall under the general retail rate. Verify with bank. ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'international':
      return `${t.retailPct}% return on international/foreign-currency spend (retail rate — ${t.retailPct / 0.01 / 100} Miles/AED 1). ⚠️ EU/UK spends specifically earn only 25% of the retail rate (${t.reduced25Pct}%) per ${SRC_EARN} Low MCC table — grouped with groceries/supermarkets. Non-EU/UK international spend earns the full retail rate. International Transaction Fee of 1.99% applies separately (${SRC_FEES}, ${SRC_KFS}). ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    case 'general':
      return `${t.retailPct}% return on all other retail spend (retail rate — ${t.retailPct / 0.01 / 100} Miles/AED 1). ${redemption} ${expiry} ${cap} Source: ${SRC_EARN}`;
    default:
      throw new Error(`No notes defined for slug: ${slug}`);
  }
}

async function run() {
  let errors = 0;

  // ─── 0. Load categories ────────────────────────────────────────────────────
  console.log('[0] Loading spending categories...');
  const { data: catRows, error: catErr } = await sb
    .from('spending_categories').select('id, slug');
  if (catErr) { console.error('FATAL:', catErr.message); process.exit(1); }
  const cat = {};
  for (const r of catRows) cat[r.slug] = r.id;
  console.log(`  Loaded ${catRows.length} categories`);

  let WORLD_ID, ELITE_ID;

  // ─── 1. Insert Voyager World card ─────────────────────────────────────────
  console.log('\n[1/5] Inserting Voyager World Mastercard...');
  {
    const t = TIERS.WORLD;
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id:                   ENBD_BANK_ID,
        name:                      t.name,
        card_network:              'mastercard',
        card_tier:                 t.card_tier,
        annual_fee_aed:            t.annual_fee_aed,
        min_salary_aed:            t.min_salary_aed,
        reward_currency_name:      'Voyager Miles',
        reward_currency_value_aed: 0.01,
        base_earn_rate:            0.5,
        base_earn_unit:            'per_aed',
        forex_markup_pct:          1.99,
        interest_rate_monthly_pct: t.interest_rate_monthly_pct,
        lounge_access_count:       null,
        lounge_access_network:     'mastercard_travel_pass',
        valet_parking_count:       null,
        travel_insurance:          true,
        purchase_protection:       false,
        concierge:                 true,
        airport_transfer_count:    4,
        source_url:                SRC_WORLD_PRODUCT,
        summary: [
          `VERIFIED ${TODAY}. Emirates NBD Voyager World Mastercard Credit Card — Free for Life`,
          `(AED 0 annual fee per ${SRC_WORLD_PRODUCT}; ${SRC_FEES} shows AED 315 renewal but product`,
          'page "Free for life" is authoritative). Min salary: AED 12,000.',
          'Interest: 3.69%/month (44.28% APR per KFS).',
          'VOYAGER MILES EARNING (100 Miles = AED 1, reward_currency_value_aed = 0.01):',
          '3 Miles/AED 1 (3.00%) on other travel spends (airlines, hotels, travel agencies);',
          `🎁 6 Miles/AED 1 (6.00%) via Voyager Travel Portal in ENBD X app (portal only);`,
          '0.5 Miles/AED 1 (0.50%) on all other retail spends;',
          '0.125 Miles/AED 1 (0.125%) on groceries/supermarkets/insurance/car dealerships (25% of retail);',
          '0.05 Miles/AED 1 (0.05%) on fuel/utilities/government/education/rent (10% of retail).',
          `⚠️ Monthly cap: 100,000 Miles (≈AED 1,000) per statement, per ${SRC_WORLD_TNCS}.`,
          'Miles expire 36 calendar months from earning date.',
          'WELCOME OFFER: 75,000 Miles (≈AED 750 portal value) on AED 35,000 spend in first',
          `3 billing statements, per ${SRC_WORLD_TNCS}.`,
          'BENEFITS: Mastercard Travel Pass lounge access (1,000+ lounges); international airport',
          `transfers up to 4×/year at selected airports via Thriwe (min spend AED 5,000/month or`,
          `AED 250 fee per ${SRC_BENEFITS}); OneVasco Visa Concierge 4 apps/year (≈AED 1,346 value,`,
          `min spend AED 5,000/month or AED 250 fee per ${SRC_BENEFITS}); complimentary golf UAE`,
          '(≈AED 2,400/year); VOX Cinemas BOGOF (≈AED 660/year); dining discounts (≈AED 600/year);',
          'complimentary valet Abu Dhabi (≈AED 360/year); Travel & Medical Insurance; Roadside',
          'Assistance; Free Global eSIM; car rental discounts.',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, ${SRC_KFS}).`,
          `Sources: ${SRC_WORLD_PRODUCT}, ${SRC_EARN}, ${SRC_REDEEM}, ${SRC_WORLD_TNCS}, ${SRC_BENEFITS}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { WORLD_ID = data.id; console.log(`  OK — WORLD_ID: ${WORLD_ID}`); }
  }

  // ─── 2. Insert Voyager World Elite card ────────────────────────────────────
  console.log('\n[2/5] Inserting Voyager World Elite Mastercard...');
  {
    const t = TIERS.ELITE;
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id:                   ENBD_BANK_ID,
        name:                      t.name,
        card_network:              'mastercard',
        card_tier:                 t.card_tier,
        annual_fee_aed:            t.annual_fee_aed,
        min_salary_aed:            t.min_salary_aed,
        reward_currency_name:      'Voyager Miles',
        reward_currency_value_aed: 0.01,
        base_earn_rate:            1.0,
        base_earn_unit:            'per_aed',
        forex_markup_pct:          1.99,
        interest_rate_monthly_pct: t.interest_rate_monthly_pct,
        lounge_access_count:       null,
        lounge_access_network:     'mastercard_travel_pass',
        valet_parking_count:       null,
        travel_insurance:          true,
        purchase_protection:       false,
        concierge:                 true,
        airport_transfer_count:    null,
        source_url:                SRC_ELITE_PRODUCT,
        summary: [
          `VERIFIED ${TODAY}. Emirates NBD Voyager World Elite Mastercard Credit Card.`,
          `Joining Fee: NIL (per ${SRC_ELITE_PRODUCT}; KFS shows AED 2,098.95 — product page is`,
          `authoritative). Annual Fee: AED 1,500 from year 2 (AED 1,575 VAT-inclusive per ${SRC_FEES},`,
          `${SRC_KFS}; AED 1,500 × 1.05 = AED 1,575). First year free. Min salary: AED 25,000.`,
          'Interest: 3.25%/month (39.00% APR).',
          'VOYAGER MILES EARNING (100 Miles = AED 1, reward_currency_value_aed = 0.01):',
          '6 Miles/AED 1 (6.00%) on other travel spends (airlines, hotels, travel agencies);',
          `🎁 12 Miles/AED 1 (12.00%) via Voyager Travel Portal in ENBD X app (portal only);`,
          '1 Mile/AED 1 (1.00%) on all other retail spends;',
          '0.25 Miles/AED 1 (0.25%) on groceries/supermarkets/insurance/car dealerships (25% of retail);',
          '0.10 Miles/AED 1 (0.10%) on fuel/utilities/government/education/rent (10% of retail).',
          `⚠️ Monthly cap: 200,000 Miles (≈AED 2,000) per statement, per ${SRC_ELITE_TNCS}.`,
          'Miles expire 36 calendar months from earning date.',
          'WELCOME OFFER: 150,000 Miles (≈AED 1,500 portal value) on AED 70,000 spend in first',
          `3 billing statements, per ${SRC_ELITE_TNCS}.`,
          'BENEFITS: unlimited lounge access via Mastercard Travel Pass (≈AED 470/year);',
          `domestic & international airport transfers (≈AED 1,600/year, min spend AED 5,000/month`,
          `or AED 500 fee per ${SRC_BENEFITS}); International Meet & Greet (≈AED 1,395/year, min spend`,
          `AED 5,000/month or AED 500 fee per ${SRC_BENEFITS}); immigration fast track 3×/year (AED 100`,
          `fee if spend below AED 5,000/month per ${SRC_BENEFITS}); OneVasco Visa Concierge 4 apps/year`,
          `(≈AED 2,600/year, min spend AED 5,000/month or AED 500 fee per ${SRC_BENEFITS}); golf UAE`,
          '(≈AED 7,200/year); dining discounts (≈AED 1,200/year); valet (≈AED 720/year); VOX &',
          'Reel Cinemas BOGOF (≈AED 1,395/year); Travel & Medical Insurance; Roadside Assistance;',
          'Free Global eSIM; car rental discounts.',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, ${SRC_KFS}).`,
          `Sources: ${SRC_ELITE_PRODUCT}, ${SRC_EARN}, ${SRC_REDEEM}, ${SRC_ELITE_TNCS}, ${SRC_BENEFITS}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { ELITE_ID = data.id; console.log(`  OK — ELITE_ID: ${ELITE_ID}`); }
  }

  if (!WORLD_ID || !ELITE_ID) {
    console.error('\nCard insertion failed — aborting');
    process.exit(1);
  }

  const cardIdByTier = { WORLD: WORLD_ID, ELITE: ELITE_ID };

  // ─── 3. card_rewards (17 per card = 34 total) ─────────────────────────────
  // earn_rate (Miles/AED) = pct / (reward_currency_value_aed × 100) = pct / (0.01 × 100) = pct
  console.log('\n[3/5] Inserting card_rewards (17 per card)...');

  for (const tierKey of Object.keys(TIERS)) {
    const t = TIERS[tierKey];
    const cardId = cardIdByTier[tierKey];
    console.log(`\n  ${t.name}:`);
    for (const slug of SLUGS_ALL) {
      const catId = cat[slug];
      if (!catId) { console.error(`    ERROR: unknown slug "${slug}"`); errors++; continue; }
      const pct = pctFor(slug, t);
      const { error } = await sb.from('card_rewards').insert({
        card_id:             cardId,
        category_id:         catId,
        reward_type:         'miles',
        earn_rate:           pct,       // Miles per AED (= pct because 100 Miles = AED 1)
        earn_unit:           'per_aed',
        effective_return_pct: pct,
        monthly_cap_reward:  t.monthlyCapAed,
        source_url:          SRC_EARN,
        last_verified_date:  TODAY,
        is_active:           true,
        notes:               getNotes(slug, t),
      });
      if (error) { console.error(`    ERROR (${slug}):`, error.message); errors++; }
      else process.stdout.write('.');
    }
    console.log(' done');
  }

  // ─── 4. card_benefits ─────────────────────────────────────────────────────
  console.log('\n[4/5] Inserting card_benefits...');

  const world_benefits = [
    {
      card_id: WORLD_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Bonus — 75,000 Voyager Miles',
      description: 'Earn 75,000 Voyager Miles (≈AED 750 portal value) on spending AED 35,000 within the first 3 billing statements.',
      monetary_value_aed: 750,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: `Requires AED 35,000 spend within first 3 billing statements. Source: ${SRC_WORLD_TNCS}`,
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'lounge_access',
      title: 'Airport Lounge Access — Mastercard Travel Pass (1,000+ Lounges)',
      description: 'Complimentary airport lounge access at 1,000+ lounges worldwide via Mastercard Travel Pass.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Mastercard Travel Pass app.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'airport_transfer',
      title: 'International Airport Transfers — Up to 4×/Year (Thriwe)',
      description: 'Complimentary standard rides at selected international airports up to 4 times per year via Thriwe. Airports include: London Heathrow/Gatwick, Istanbul (2 airports), Paris CDG, Barcelona El Prat, Madrid Barajas, Bangkok (3 airports), Hong Kong, Milan (2 airports), New York JFK/LaGuardia, Singapore Changi.',
      monetary_value_aed: null,
      usage_limit: 4,
      usage_period: 'yearly',
      conditions: `Minimum monthly spend of AED 5,000 required in the month benefit is used. If below AED 5,000, a fee of AED 250 is charged. Book via emiratesnbdbenefits.thriwe.com. Source: ${SRC_BENEFITS}`,
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'other',
      title: 'OneVasco Travel Visa Concierge — 4 Applications/Year',
      description: 'End-to-end travel visa application support via OneVasco: consultation, document preparation, appointment scheduling, pre-submission verification, embassy submission, covering letter, application kit, photocopy & printouts, passport pickup & delivery. 4 complimentary applications per year (each family member counted separately).',
      monetary_value_aed: 1346,
      usage_limit: 4,
      usage_period: 'yearly',
      conditions: `Minimum monthly spend of AED 5,000 required. If below, AED 250 fee applies. Access via Voyager Travel Portal in ENBD X app or OneVasco portal directly. Source: ${SRC_BENEFITS}`,
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'golf',
      title: 'Complimentary Golf — UAE',
      description: 'Complimentary golf rounds at selected golf courses across UAE.',
      monetary_value_aed: 2400,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to tee time availability and partner golf course T&Cs.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'buy_one_get_one',
      title: 'VOX Cinemas — Buy 1 Get 1 Free',
      description: 'Buy 1 get 1 free cinema tickets at VOX Cinemas.',
      monetary_value_aed: 660,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'other',
      title: 'Dining Discounts at Partner Restaurants',
      description: 'Dining discounts at select partner restaurants.',
      monetary_value_aed: 600,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to partner restaurant T&Cs — verify current list with bank.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking — Abu Dhabi',
      description: 'Complimentary valet parking service at select locations in Abu Dhabi.',
      monetary_value_aed: 360,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Available at select Abu Dhabi locations.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'travel_insurance',
      title: 'Travel & Medical Insurance (Mastercard Benefit)',
      description: 'Travel and medical insurance coverage as part of Mastercard World benefits.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Mastercard insurance T&Cs.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'other',
      title: 'Roadside Assistance',
      description: 'Roadside assistance coverage via Mastercard World benefits.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Mastercard benefit T&Cs.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'other',
      title: 'Free Global eSIM',
      description: 'Complimentary global eSIM for international travel.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Details subject to provider T&Cs.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'other',
      title: 'Car Rental Discounts',
      description: 'Discounts on car rental bookings via the Voyager Travel Portal.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Voyager Travel Portal in ENBD X app.',
      is_active: true,
    },
    {
      card_id: WORLD_ID,
      benefit_type: 'concierge',
      title: 'Mastercard Concierge Services',
      description: '24/7 Mastercard Concierge services.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Mastercard concierge T&Cs.',
      is_active: true,
    },
  ];

  const elite_benefits = [
    {
      card_id: ELITE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Bonus — 150,000 Voyager Miles',
      description: 'Earn 150,000 Voyager Miles (≈AED 1,500 portal value) on spending AED 70,000 within the first 3 billing statements.',
      monetary_value_aed: 1500,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: `Requires AED 70,000 spend within first 3 billing statements. Source: ${SRC_ELITE_TNCS}`,
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'lounge_access',
      title: 'Unlimited Airport Lounge Access — Mastercard Travel Pass',
      description: 'Unlimited complimentary access to airport lounges worldwide via Mastercard Travel Pass.',
      monetary_value_aed: 470,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Mastercard Travel Pass app.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'airport_transfer',
      title: 'Domestic & International Airport Transfers (Thriwe)',
      description: 'Complimentary domestic (Dubai, Abu Dhabi) and international airport transfers.',
      monetary_value_aed: 1600,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: `Minimum monthly spend of AED 5,000 required. If below, AED 500 fee applies. Book via emiratesnbdbenefits.thriwe.com. Source: ${SRC_BENEFITS}`,
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'other',
      title: 'International Meet & Greet Service',
      description: 'Complimentary international airport Meet & Greet service.',
      monetary_value_aed: 1395,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: `Minimum monthly spend of AED 5,000 required. If below, AED 500 fee applies. Source: ${SRC_BENEFITS}`,
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'other',
      title: 'Airport Immigration Fast Track — 3×/Year',
      description: 'Complimentary airport immigration fast track at selected airports, 3 times per year.',
      monetary_value_aed: null,
      usage_limit: 3,
      usage_period: 'yearly',
      conditions: `Minimum monthly spend of AED 5,000 required. If below, AED 100 fee applies. Source: ${SRC_BENEFITS}`,
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'other',
      title: 'OneVasco Travel Visa Concierge — 4 Applications/Year',
      description: 'End-to-end travel visa application support via OneVasco: consultation, document preparation, appointment scheduling, pre-submission verification, embassy submission, covering letter, application kit, photocopy & printouts, passport pickup & delivery. 4 complimentary applications per year.',
      monetary_value_aed: 2600,
      usage_limit: 4,
      usage_period: 'yearly',
      conditions: `Minimum monthly spend of AED 5,000 required. If below, AED 500 fee applies. Access via Voyager Travel Portal in ENBD X app. Source: ${SRC_BENEFITS}`,
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'golf',
      title: 'Complimentary Golf — UAE',
      description: 'Complimentary golf rounds at selected golf courses across UAE.',
      monetary_value_aed: 7200,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to tee time availability and partner golf course T&Cs.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'buy_one_get_one',
      title: 'VOX Cinemas & Reel Cinemas — Buy 1 Get 1 Free',
      description: 'Buy 1 get 1 free cinema tickets at VOX Cinemas and Reel Cinemas.',
      monetary_value_aed: 1395,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'other',
      title: 'Dining Discounts at Partner Restaurants',
      description: 'Dining discounts at select partner restaurants.',
      monetary_value_aed: 1200,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to partner restaurant T&Cs — verify current list with bank.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking',
      description: 'Complimentary valet parking service at select locations.',
      monetary_value_aed: 720,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Available at select locations.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'travel_insurance',
      title: 'Travel & Medical Insurance (Mastercard Benefit)',
      description: 'Travel and medical insurance coverage as part of Mastercard World Elite benefits.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Mastercard insurance T&Cs.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'other',
      title: 'Roadside Assistance',
      description: 'Roadside assistance coverage via Mastercard World Elite benefits.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Mastercard benefit T&Cs.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'other',
      title: 'Free Global eSIM',
      description: 'Complimentary global eSIM for international travel.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Details subject to provider T&Cs.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'other',
      title: 'Car Rental Discounts',
      description: 'Discounts on car rental bookings via the Voyager Travel Portal.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Voyager Travel Portal in ENBD X app.',
      is_active: true,
    },
    {
      card_id: ELITE_ID,
      benefit_type: 'concierge',
      title: 'Mastercard Concierge Services (World Elite)',
      description: '24/7 Mastercard Concierge services at World Elite level.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Mastercard concierge T&Cs.',
      is_active: true,
    },
  ];

  for (const [label, benefits] of [['Voyager World', world_benefits], ['Voyager World Elite', elite_benefits]]) {
    console.log(`\n  ${label}:`);
    for (const b of benefits) {
      const { error } = await sb.from('card_benefits').insert(b);
      if (error) { console.error(`    ERROR (${b.benefit_type} — ${b.title}):`, error.message); errors++; }
      else console.log(`    OK — ${b.title}`);
    }
  }

  // ─── 5. Verify ──────────────────────────────────────────────────────────────
  console.log('\n[5/5] Verifying final state...');

  const ALL_IDS = [WORLD_ID, ELITE_ID];

  const { data: cards } = await sb
    .from('cards')
    .select('id, name, card_tier, min_salary_aed, annual_fee_aed, interest_rate_monthly_pct')
    .in('id', ALL_IDS);
  for (const c of cards) {
    console.log(`  ${c.name}`);
    console.log(`    tier=${c.card_tier}, salary=${c.min_salary_aed}, fee=${c.annual_fee_aed}, interest=${c.interest_rate_monthly_pct}%`);
  }

  const { data: rewards } = await sb
    .from('card_rewards')
    .select('card_id, effective_return_pct, monthly_cap_reward')
    .in('card_id', ALL_IDS);
  for (const [tierKey, cardId] of Object.entries(cardIdByTier)) {
    const r = rewards.filter(x => x.card_id === cardId);
    const t = TIERS[tierKey];
    console.log(`\n  ${t.name}: ${r.length} reward rows, cap=AED ${r[0]?.monthly_cap_reward}/month, travel=${t.travelPct}%, retail=${t.retailPct}%`);
  }

  const { data: benefits } = await sb
    .from('card_benefits')
    .select('card_id, benefit_type, title')
    .in('card_id', ALL_IDS)
    .order('card_id');
  console.log(`\n  card_benefits (${benefits.length} total):`);
  for (const b of benefits) {
    const tierKey = Object.entries(cardIdByTier).find(([, id]) => id === b.card_id)?.[0];
    console.log(`    [${tierKey}] ${b.benefit_type} — ${b.title}`);
  }

  // ─── Done ───────────────────────────────────────────────────────────────────
  console.log('\nDone.');
  if (errors === 0) console.log('  All data inserted successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);

  console.log('\nCard IDs:');
  console.log(`  WORLD_ID: ${WORLD_ID}`);
  console.log(`  ELITE_ID: ${ELITE_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

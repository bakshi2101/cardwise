// Add ENBD SHARE Visa Platinum / SHARE Visa Signature / SHARE Visa Infinite Credit Cards
//
// SHARE Rewards Programme (by Majid Al Futtaim) — 10 SHARE Points = AED 1
// (reward_currency_value_aed = 0.1)
//
// Sources:
//   SRC_TC → tcpdfs/ENBD share_visa_credit_card_en_tncs.pdf
//     Table 1.1 (p.4) — definitive per-tier rate table (Platinum / Signature / Infinite / Private):
//       Joining Fee:                Free For Life / Free For Life / AED 1,500 / AED 1,500
//       Welcome Spend Bonus:        NA / 5,000 SHARE pts (AED 500) on AED 25,000/3mo /
//                                    10,000 SHARE pts (AED 1,000) on AED 40,000/3mo / same as Infinite
//       Joining Fee Reversal Offer: NA / NA / on AED 40,000/3mo / on AED 40,000/3mo
//       Rewards Capping per month:  25,000 / 50,000 / 100,000 / 200,000 SHARE Points
//                                    (≈AED 2,500 / 5,000 / 10,000 / 20,000) — combined
//                                    account-wide cap across ALL categories (Section 4.6).
//       🎁 SHARE Ecosystem:         4% / 6% / 8% / 10%
//       General Domestic/International (non-SHARE): 0.75% / 1% / 1.5% / 2%
//       Grocery/supermarkets/fast-food restaurants/insurance/car dealerships
//         (outside SHARE):          0.19% / 0.25% / 0.375% / 0.5%
//       EU Spends (incl. UK):       SAME AS grocery-reduced row above (0.19%/0.25%/0.375%/0.5%)
//         -> KEY DIFFERENCE FROM DARNA, where EU/UK matched the GENERAL rate.
//       Petroleum/transit/government services/utility payments/real estate/
//         education/telecom:        0.075% / 0.10% / 0.15% / 0.2%
//     SHARE ecosystem partner directory (Table 1.1 footnote, p.5): "Tenants in Mall of the
//       Emirates, City Centres, my City Centres, Distrikt, and Matajer malls. Carrefour, Vox
//       Cinemas, Ski Dubai, Snow Abu Dhabi, Magic Planet, Little Explorers, Activate, iFly,
//       Crate & Barrel, CB2, Lego, All Saints, THAT Concept Store, Lululemon, Poltrona Frau,
//       Eleventy, Psycho Bunny, Ceccotticollezioni, Shiseido, Fashion for Less. Spa and F&B
//       outlets in Kempinski MOE, Sheraton MOE, Pullman Deira City Centre, Aloft Deira City
//       Centre. Plus any other future MAF owned brand that may be added to this list."
//     Ineligible-for-points transactions (p.5-6): cash advances, balance transfers,
//       "transactions converted into installment plans on Emirates NBD SHARE Visa Platinum
//       variant only" (Platinum-specific exclusion), fees/charges, dial-a-cheque, credit
//       voucher, foreign currency purchases/exchange houses, utility bill payments via the
//       Bank's Online Banking or other Bank payment channels, savings certificates/bonds,
//       disputed/fraudulent transactions.
//     10 SHARE Points = AED 1 redemption rate.
//
//   SRC_PLATINUM_PRODUCT → tcpdfs/ENBD Share Visa Platinum Credit Card _ Rewards & Lounge Access _ Emirates NBD.pdf
//     Confirms 4% SHARE ecosystem / 0.75% general. Min salary AED 5,000. Free for life.
//     Benefits: BOGOF VOX Cinemas (min AED 3,500/month), 0% Installment Plan (3/6/12/24/36mo),
//     Purchase Protection + Extended Warranty (+12mo), optional Credit Shield Pro, 20-25%
//     dining discounts at select partner restaurants, SHARE App (+3% back), signup promo:
//     AED 250 Majid Al Futtaim Mall eGift Card by YOUGotaGift.
//
//   SRC_SIGNATURE_PRODUCT → tcpdfs/ENBD Share Visa Signature Credit Card _ Travel & Lifestyle Perks _ Emirates NBD.pdf
//     Confirms 6% SHARE ecosystem / 1% general. Min salary AED 12,000.
//     Welcome offer: 5,000 SHARE Points (AED 500) on AED 25,000 spend in first 3 months.
//     Benefits: same as Platinum PLUS unlimited complimentary airport lounge access (1,200+
//     lounges / 300+ cities via Visa Airport Companion App), Concierge services + Roadside
//     assistance (both require min monthly spend AED 5,000), Visa Privileges bundle (airport
//     dining, Avis, medical/travel assistance, BOGOF Entertainer, Bicester Village,
//     BookingBash, digital concierge). Signup promo: AED 350 Majid Al Futtaim Mall eGift Card.
//
//   SRC_INFINITE_PRODUCT → tcpdfs/ENBD Share Visa Infinite Credit Card _ Earn SHARE Points _ Emirates NBD.pdf
//     Confirms 8% SHARE ecosystem / 1.5% general. Min salary AED 30,000.
//     Welcome offer: 10,000 SHARE Points (AED 1,000) + Joining Fee Reversal on AED 40,000
//     spend in first 3 months.
//     Benefits: same as Signature PLUS Golf Privileges (free golf in UAE twice/month, min
//     spend AED 5,000 + up to 40% off premium golf worldwide), Valet Parking, and lounge
//     access extends to cardholder + 1 guest. Signup promo: AED 500 Majid Al Futtaim Mall
//     eGift Card. Also discovered: "SHARE Visa Private Credit Card" 4th tier (see below).
//
//   SRC_PLATINUM_LEAFLET / SRC_SIGNATURE_LEAFLET / SRC_INFINITE_LEAFLET
//     → tcpdfs/ENBD share-a5-leaflet-{platinum,signature,infinite}-en-updated.pdf
//     Cross-confirm rates, Welcome offers, SHARE App "+3% back" feature, 0% Installment Plan
//     (3/6/12/24/36mo), Purchase Protection +12mo extended warranty, BOGOF VOX Cinemas (min
//     AED 3,500/month). Common "SHARE Ecosystem 2025" exclusive discounts page (all 3 tiers):
//     ACTIVATE 25% off (excl. public holidays), Ski Dubai free Snow Bullet experience (1x,
//     with Snow Fun package purchase), Snow Abu Dhabi 20% off (excl. public holidays), Magic
//     Planet (package >AED 155 -> 20% additional points + 5 free blue swiper rides), 10% off
//     at THAT Concept Store/All Saints/Psycho Bunny/Shiseido/Crate & Barrel/CB2. Infinite
//     leaflet additionally lists 5% off at Poltrona Frau/Eleventy.
//
//   SRC_FEES → tcpdfs/emiratesnbd_credit_card_fees_charges.pdf (Feb 2026)
//     "SHARE Private/Infinite/Signature/Platinum: Annual Fee 1,575/1,575/Free/Free, Finance
//     Charges 3.25%/3.25%/3.69%/3.69%". International Transaction Fee 1.99% applies to all
//     products except dnata World -> CONFIRMED for all 3 SHARE cards.
//
//   SRC_KFS → tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf (March 2026)
//     Cross-confirms Joining/Renewal Fees (Platinum/Signature=Free, Infinite=1,575) and APR
//     (Platinum/Signature=44.28% -> 3.69%/mo, Infinite=39.00% -> 3.25%/mo). AED 1,575 =
//     VAT-inclusive figure for the T&C's "AED 1,500" Joining Fee (1,500 x 1.05 = 1,575),
//     consistent with the Darna precedent. Also confirms 1.99% foreign currency transaction
//     fee "charged on all foreign currency transactions".
//
// DISCOVERED 4TH TIER (NOT ENTERED — see CLAUDE.md "Discovering Card Variants"):
//   SRC_TC's Table 1.1 also lists "SHARE Visa Private Credit Card" (AED 1,500 Joining Fee,
//   200,000 pts/month cap, same Welcome Spend Bonus + Joining Fee Reversal structure as
//   Infinite). UNLIKE Darna's Infinite Privilege (identical rates to Infinite), SHARE
//   Private's PER-CATEGORY REWARD PERCENTAGES genuinely DIFFER from Infinite:
//     🎁 SHARE Ecosystem: 10% (vs Infinite 8%) | General: 2% (vs 1.5%) |
//     Grocery-reduced/EU: 0.5% (vs 0.375%) | Petrol-reduced: 0.2% (vs 0.15%)
//   Per CLAUDE.md's "Key Principle" ("If reward rates differ between tiers, they MUST be
//   separate entries"), SHARE Private would normally require its own card entry. It was
//   NOT entered here because the user explicitly requested only the 3 cards listed above
//   (Platinum/Signature/Infinite). Flagged as a candidate for a future addition.
//
// CATEGORY MAPPING (17 CardWise categories -> 3 SHARE rate buckets, + EU/UK special case):
//   GENERAL (full rate):              dining, online_shopping, shopping, entertainment,
//                                      healthcare, airlines, hotels, travel, international
//                                      (non-EU), general
//   GROCERY-REDUCED:                  groceries, insurance, AND "EU Spends (incl. UK)"
//                                      portion of international
//   PETROL-REDUCED:                   fuel, rent, utilities, education, government
//   🎁 SHARE-ECOSYSTEM BONUS eligible (within GENERAL/GROCERY buckets, at SHARE-ecosystem
//   destinations): groceries (Carrefour/Carrefour Market), dining (Hotel Dining at Kempinski
//   MOE/Sheraton MOE/Pullman Deira City Centre/Aloft Deira City Centre + mall F&B), shopping
//   (MAF malls + listed retail brands), entertainment (VOX/Ski Dubai/Snow Abu Dhabi/Magic
//   Planet/Little Explorers/ACTIVATE/iFly).
//
// FLAGGED FOR HUMAN REVIEW:
//   - "healthcare": not explicitly listed in any T&C rate bucket — assumed General
//     Domestic/International rate (default bucket). ⚠️ Verify with bank.
//   - "hotels": hotel ROOM/STAY bookings assumed General rate; only "Hotel Dining" (spa/F&B
//     at the 4 named hotel properties) is confirmed part of the SHARE ecosystem bonus.
//   - "utilities": utility bill payments made via the Bank's Online Banking (or any other
//     Bank-provided payment channel) are EXPLICITLY EXCLUDED from earning SHARE Points
//     entirely per SRC_TC — only payments made directly to the biller earn the reduced rate.
//   - "Platinum-only" exclusion: transactions converted to installment plans on the SHARE
//     Visa Platinum variant ONLY do not earn SHARE Points (noted in Platinum card summary).

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-15';

const SRC_TC = 'tcpdfs/ENBD share_visa_credit_card_en_tncs.pdf';
const SRC_PLATINUM_PRODUCT = 'tcpdfs/ENBD Share Visa Platinum Credit Card _ Rewards & Lounge Access _ Emirates NBD.pdf';
const SRC_SIGNATURE_PRODUCT = 'tcpdfs/ENBD Share Visa Signature Credit Card _ Travel & Lifestyle Perks _ Emirates NBD.pdf';
const SRC_INFINITE_PRODUCT = 'tcpdfs/ENBD Share Visa Infinite Credit Card _ Earn SHARE Points _ Emirates NBD.pdf';
const SRC_PLATINUM_LEAFLET = 'tcpdfs/ENBD share-a5-leaflet-platinum-en-updated.pdf';
const SRC_SIGNATURE_LEAFLET = 'tcpdfs/ENBD share-a5-leaflet-signature-en-updated.pdf';
const SRC_INFINITE_LEAFLET = 'tcpdfs/ENBD share-a5-leaflet-infinite-updated.pdf';
const SRC_FEES = 'tcpdfs/emiratesnbd_credit_card_fees_charges.pdf';
const SRC_KFS = 'tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf';

const SLUGS_ALL = [
  'groceries', 'dining', 'fuel', 'rent', 'utilities', 'education', 'insurance',
  'online_shopping', 'shopping', 'entertainment', 'healthcare', 'airlines',
  'hotels', 'travel', 'international', 'government', 'general',
];

const GROCERY_REDUCED_CATS = ['groceries', 'insurance'];
const PETROL_REDUCED_CATS = ['fuel', 'rent', 'utilities', 'education', 'government'];

const SHARE_GROCERY = 'SHARE retail partners (Carrefour, Carrefour Market)';
const SHARE_DINING = 'SHARE Hotel Dining partners (spa & F&B outlets at Kempinski Mall of the Emirates, Sheraton Mall of the Emirates, Pullman Deira City Centre, and Aloft Deira City Centre) plus restaurants within Mall of the Emirates, City Centres, my City Centres, Distrikt, and Matajer malls';
const SHARE_SHOPPING = 'SHARE retail/lifestyle brands and malls (Mall of the Emirates, City Centres, my City Centres, Distrikt, Matajer malls; Crate & Barrel, CB2, LEGO, All Saints, THAT Concept Store, Lululemon, Poltrona Frau, Eleventy, Psycho Bunny, Ceccotticollezioni, Shiseido, Fashion for Less)';
const SHARE_ENTERTAINMENT = 'SHARE entertainment partners (Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic Planet, Little Explorers, Activate, iFly)';

const TIERS = {
  PLATINUM: {
    name: 'Emirates NBD SHARE Visa Platinum Credit Card',
    card_tier: 'platinum',
    annual_fee_aed: 0,
    min_salary_aed: 5000,
    interest_rate_monthly_pct: 3.69,
    ecoPct: 4.0, genPct: 0.75, grocPct: 0.19, petrolPct: 0.075,
    monthlyCapPoints: 25000, monthlyCapAed: 2500,
    src: SRC_PLATINUM_PRODUCT,
  },
  SIGNATURE: {
    name: 'Emirates NBD SHARE Visa Signature Credit Card',
    card_tier: 'signature',
    annual_fee_aed: 0,
    min_salary_aed: 12000,
    interest_rate_monthly_pct: 3.69,
    ecoPct: 6.0, genPct: 1.0, grocPct: 0.25, petrolPct: 0.10,
    monthlyCapPoints: 50000, monthlyCapAed: 5000,
    src: SRC_SIGNATURE_PRODUCT,
  },
  INFINITE: {
    name: 'Emirates NBD SHARE Visa Infinite Credit Card',
    card_tier: 'infinite',
    annual_fee_aed: 1575,
    min_salary_aed: 30000,
    interest_rate_monthly_pct: 3.25,
    ecoPct: 8.0, genPct: 1.5, grocPct: 0.375, petrolPct: 0.15,
    monthlyCapPoints: 100000, monthlyCapAed: 10000,
    src: SRC_INFINITE_PRODUCT,
  },
};

function pctFor(slug, t) {
  if (GROCERY_REDUCED_CATS.includes(slug)) return t.grocPct;
  if (PETROL_REDUCED_CATS.includes(slug)) return t.petrolPct;
  return t.genPct;
}

function capNote(t) {
  return `⚠️ Shared account-wide cap: ${t.monthlyCapPoints.toLocaleString()} SHARE Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), combined across ALL spend categories per the "Rewards Capping per month" row in ${SRC_TC} Table 1.1.`;
}

function getNotes(slug, t) {
  const redemption = '10 SHARE Points = AED 1.';
  const cap = capNote(t);

  switch (slug) {
    case 'groceries':
      return `${t.grocPct}% SHARE Points back on groceries/supermarkets (outside the SHARE ecosystem) — grouped with fast-food restaurants/insurance/car dealerships per ${SRC_TC} Table 1.1. 🎁 Earns ${t.ecoPct}% at ${SHARE_GROCERY}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'dining':
      return `${t.genPct}% SHARE Points back on dining (restaurants/cafés) at the General Domestic/International rate. ⚠️ Fast-food/quick-service restaurants are grouped into the reduced-rate bucket and earn ${t.grocPct}% instead, per ${SRC_TC}. 🎁 Earns ${t.ecoPct}% at ${SHARE_DINING}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'fuel':
      return `${t.petrolPct}% SHARE Points back on fuel/petrol station spend — reduced rate, grouped with transit/government services/utility payments/real estate/education/telecom per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'rent':
      return `${t.petrolPct}% SHARE Points back — mapped from "real estate" in the reduced-rate bucket per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'utilities':
      return `${t.petrolPct}% SHARE Points back on utility bill payments & telecom (DEWA/Etisalat/du/SEWA/FEWA/Salik) — reduced rate per ${SRC_TC} Table 1.1. ⚠️ Utility bill payments made through the Bank's Online Banking (or any other Bank-provided payment channel) are EXPLICITLY EXCLUDED from earning SHARE Points entirely per ${SRC_TC} — only payments made directly to the biller (outside ENBD's own payment channels) earn ${t.petrolPct}%. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'education':
      return `${t.petrolPct}% SHARE Points back on education/school fees/tuition — reduced rate, grouped with petroleum/transit/government services/utility payments/real estate/telecom per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'insurance':
      return `${t.grocPct}% SHARE Points back on insurance premium payments — grouped with groceries/supermarkets/fast-food restaurants/car dealerships per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'online_shopping':
      return `${t.genPct}% SHARE Points back on online shopping/e-commerce (Amazon.ae, Noon, etc.) at the General Domestic/International rate. Amazon.ae/Noon are not SHARE-ecosystem (MAF) brands, so no 🎁 ecosystem bonus applies. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'shopping':
      return `${t.genPct}% SHARE Points back on shopping at the General Domestic/International rate. 🎁 Earns ${t.ecoPct}% at ${SHARE_SHOPPING}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'entertainment':
      return `${t.genPct}% SHARE Points back on entertainment at the General Domestic/International rate. 🎁 Earns ${t.ecoPct}% at ${SHARE_ENTERTAINMENT}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'healthcare':
      return `${t.genPct}% SHARE Points back on healthcare (hospitals/clinics/pharmacies). ⚠️ Healthcare is not explicitly listed as a distinct category in the SHARE T&C rate table (Table 1.1) — assumed to fall under the "General Domestic/International" default rate. Verify with bank. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'airlines':
      return `${t.genPct}% SHARE Points back on airline ticket purchases at the General Domestic/International rate. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'hotels':
      return `${t.genPct}% SHARE Points back on hotel bookings/stays at the General Domestic/International rate. ⚠️ "Hotel Dining" — spa & F&B outlets at Kempinski Mall of the Emirates, Sheraton Mall of the Emirates, Pullman Deira City Centre, and Aloft Deira City Centre — IS part of the SHARE ecosystem and earns 🎁 ${t.ecoPct}% (see "dining" category notes), but the hotel ROOM/STAY booking itself is not confirmed to earn the ecosystem bonus rate at any property. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'travel':
      return `${t.genPct}% SHARE Points back on travel agencies/booking platforms/car rentals at the General Domestic/International rate. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'international':
      return `${t.genPct}% SHARE Points back on international spend at the General Domestic/International rate. ⚠️ KEY DIFFERENCE FROM DARNA: "EU Spends (including UK)" are EXPLICITLY listed as a SEPARATE row in ${SRC_TC} Table 1.1 and earn the REDUCED rate of ${t.grocPct}% instead — the SAME rate as groceries/fast-food restaurants/insurance/car dealerships — NOT the general rate. Non-EU international spend earns the general ${t.genPct}% rate. Foreign-currency transaction fee of 1.99% CONFIRMED (${SRC_FEES}, ${SRC_KFS}) applies separately on all foreign-currency transactions and does not affect SHARE Points earning. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'government':
      return `${t.petrolPct}% SHARE Points back on government services/fees — reduced rate, grouped with petroleum/transit/utility payments/real estate/education/telecom per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'general':
      return `${t.genPct}% SHARE Points back (General Domestic/International rate — the standard rate applied to all spend not in a special-rate bucket). ${redemption} ${cap} Source: ${SRC_TC}`;
    default:
      throw new Error(`No notes defined for slug ${slug}`);
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

  let PLATINUM_ID, SIGNATURE_ID, INFINITE_ID;

  // ─── 1. Insert SHARE Visa Platinum ─────────────────────────────────────────
  console.log('\n[1/6] Inserting SHARE Visa Platinum card...');
  {
    const t = TIERS.PLATINUM;
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: t.name,
        card_network: 'visa',
        card_tier: t.card_tier,
        annual_fee_aed: t.annual_fee_aed,
        min_salary_aed: t.min_salary_aed,
        reward_currency_name: 'SHARE Points',
        reward_currency_value_aed: 0.1,
        base_earn_rate: t.genPct / 10,   // 0.75% general = 0.075 SHARE Points/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: t.interest_rate_monthly_pct,
        lounge_access_count: null,
        lounge_access_network: null,
        valet_parking_count: null,
        travel_insurance: false,
        purchase_protection: true,
        concierge: false,
        airport_transfer_count: null,
        source_url: SRC_PLATINUM_PRODUCT,
        summary: [
          'VERIFIED 2026-06-15. Emirates NBD SHARE Visa Platinum Credit Card — "Free For Life"',
          `(AED 0 Joining/Annual Fee, CONFIRMED ${SRC_KFS}, ${SRC_FEES}).`,
          'NEW CARD (part of the SHARE Rewards Programme by Majid Al Futtaim). Min salary:',
          'AED 5,000. Interest: 3.69%/month (44.28% APR).',
          'SHARE POINTS EARNING (10 SHARE Points = AED 1):',
          '0.75% general (Domestic/International); 🎁 4% at SHARE-ecosystem destinations',
          '(Majid Al Futtaim malls, Carrefour, Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic',
          'Planet, and more);',
          '0.19% on groceries/supermarkets/fast-food restaurants/insurance/car dealerships',
          '(outside SHARE) AND on "EU Spends (including UK)";',
          '0.075% on fuel/transit/government services/utility payments/real estate/education/telecom.',
          `⚠️ Account-wide cap: ${t.monthlyCapPoints.toLocaleString()} SHARE Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), per ${SRC_TC} Table 1.1.`,
          '⚠️ Platinum-specific exclusion: transactions converted into installment plans on the',
          `SHARE Visa Platinum variant ONLY are NOT eligible to earn SHARE Points, per ${SRC_TC}.`,
          'No Welcome Spend Bonus / Joining Fee Reversal offer for this tier (Table 1.1: "NA").',
          'BENEFITS: Buy 1 Get 1 Free VOX Cinemas tickets (min AED 3,500/month spend); 0%',
          'Installment Plan (3/6/12/24/36 months); Purchase Protection + Extended Warranty',
          '(+12 months); optional Credit Shield Pro; 20-25% dining discounts at select partner',
          'restaurants; SHARE App — up to an additional 3% back on purchases within the SHARE',
          'ecosystem; exclusive SHARE Ecosystem 2025 discounts (ACTIVATE 25% off, Ski Dubai free',
          'Snow Bullet experience, Snow Abu Dhabi 20% off, Magic Planet 20% extra points + 5 free',
          'rides, 10% off THAT Concept Store/All Saints/Psycho Bunny/Shiseido/Crate & Barrel/CB2);',
          'signup promo: Majid Al Futtaim Mall eGift Card worth AED 250 by YOUGotaGift (one-time,',
          'not entered as a card_benefit row).',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, ${SRC_KFS}) — International Transaction`,
          'Fee applies to all ENBD card products except dnata World.',
          `Sources: ${SRC_PLATINUM_PRODUCT}, ${SRC_PLATINUM_LEAFLET}, ${SRC_TC}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { PLATINUM_ID = data.id; console.log(`  OK — PLATINUM_ID: ${PLATINUM_ID}`); }
  }

  // ─── 2. Insert SHARE Visa Signature ────────────────────────────────────────
  console.log('\n[2/6] Inserting SHARE Visa Signature card...');
  {
    const t = TIERS.SIGNATURE;
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: t.name,
        card_network: 'visa',
        card_tier: t.card_tier,
        annual_fee_aed: t.annual_fee_aed,
        min_salary_aed: t.min_salary_aed,
        reward_currency_name: 'SHARE Points',
        reward_currency_value_aed: 0.1,
        base_earn_rate: t.genPct / 10,   // 1.0% general = 0.10 SHARE Points/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: t.interest_rate_monthly_pct,
        lounge_access_count: null,   // Visa Airport Companion App — visit count unspecified
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,
        travel_insurance: false,
        purchase_protection: true,   // Purchase Protection + Extended Warranty
        concierge: true,             // Concierge services (min spend AED 5,000/month)
        airport_transfer_count: null,
        source_url: SRC_SIGNATURE_PRODUCT,
        summary: [
          'VERIFIED 2026-06-15. Emirates NBD SHARE Visa Signature Credit Card — "Free For Life"',
          `(AED 0 Joining/Annual Fee, CONFIRMED ${SRC_KFS}, ${SRC_FEES}).`,
          'NEW CARD (part of the SHARE Rewards Programme by Majid Al Futtaim). Min salary:',
          'AED 12,000. Interest: 3.69%/month (44.28% APR).',
          'SHARE POINTS EARNING (10 SHARE Points = AED 1):',
          '1.0% general (Domestic/International); 🎁 6% at SHARE-ecosystem destinations',
          '(Majid Al Futtaim malls, Carrefour, Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic',
          'Planet, and more);',
          '0.25% on groceries/supermarkets/fast-food restaurants/insurance/car dealerships',
          '(outside SHARE) AND on "EU Spends (including UK)";',
          '0.10% on fuel/transit/government services/utility payments/real estate/education/telecom.',
          `⚠️ Account-wide cap: ${t.monthlyCapPoints.toLocaleString()} SHARE Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), per ${SRC_TC} Table 1.1.`,
          'WELCOME OFFER: 5,000 SHARE Points (worth AED 500) on spending AED 25,000 within the',
          `first 3 months, per ${SRC_TC} Table 1.1. No Joining Fee Reversal offer (Table 1.1: "NA").`,
          'BENEFITS: unlimited complimentary airport lounge access at 1,200+ premium lounges in',
          '300+ cities worldwide via the Visa Airport Companion App; Concierge services',
          '(airport drop-offs, car servicing/registration, local courier — min AED 5,000/month',
          'spend); 24/7 Roadside Assistance (min AED 5,000/month spend); Buy 1 Get 1 Free VOX',
          'Cinemas tickets (min AED 3,500/month spend); 0% Installment Plan (3/6/12/24/36',
          'months); Purchase Protection + Extended Warranty (+12 months); optional Credit',
          'Shield Pro; Visa Privileges bundle (airport dining discount, Avis car rental, Visa',
          'Medical & Travel Assistance, Visa BOGOF The Entertainer, Visa Bicester Village',
          'Shopping, Visa BookingBash, Visa Digital Concierge); 20-25% dining discounts at',
          'select partner restaurants; SHARE App — up to an additional 3% back on purchases',
          'within the SHARE ecosystem; exclusive SHARE Ecosystem 2025 discounts (ACTIVATE 25%',
          'off, Ski Dubai free Snow Bullet experience, Snow Abu Dhabi 20% off, Magic Planet 20%',
          'extra points + 5 free rides, 10% off THAT Concept Store/All Saints/Psycho',
          'Bunny/Shiseido/Crate & Barrel/CB2); signup promo: Majid Al Futtaim Mall eGift Card',
          'worth AED 350 by YOUGotaGift (one-time, not entered as a card_benefit row).',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, ${SRC_KFS}) — International Transaction`,
          'Fee applies to all ENBD card products except dnata World.',
          `Sources: ${SRC_SIGNATURE_PRODUCT}, ${SRC_SIGNATURE_LEAFLET}, ${SRC_TC}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { SIGNATURE_ID = data.id; console.log(`  OK — SIGNATURE_ID: ${SIGNATURE_ID}`); }
  }

  // ─── 3. Insert SHARE Visa Infinite ─────────────────────────────────────────
  console.log('\n[3/6] Inserting SHARE Visa Infinite card...');
  {
    const t = TIERS.INFINITE;
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: t.name,
        card_network: 'visa',
        card_tier: t.card_tier,
        annual_fee_aed: t.annual_fee_aed,
        min_salary_aed: t.min_salary_aed,
        reward_currency_name: 'SHARE Points',
        reward_currency_value_aed: 0.1,
        base_earn_rate: t.genPct / 10,   // 1.5% general = 0.15 SHARE Points/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: t.interest_rate_monthly_pct,
        lounge_access_count: null,   // Visa Airport Companion App — cardholder + 1 guest
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,   // count unspecified
        travel_insurance: false,
        purchase_protection: true,
        concierge: true,             // Concierge services (min spend AED 5,000/month)
        airport_transfer_count: null,
        source_url: SRC_INFINITE_PRODUCT,
        summary: [
          'VERIFIED 2026-06-15. Emirates NBD SHARE Visa Infinite Credit Card. Joining/Annual',
          `Fee: AED 1,575 (CONFIRMED ${SRC_KFS}, ${SRC_FEES} — VAT-inclusive figure for the`,
          `T&C's "AED 1,500" Joining Fee, consistent with the Darna precedent). Min salary:`,
          'AED 30,000. Interest: 3.25%/month (39.00% APR).',
          'SHARE POINTS EARNING (10 SHARE Points = AED 1):',
          '1.5% general (Domestic/International); 🎁 8% at SHARE-ecosystem destinations',
          '(Majid Al Futtaim malls, Carrefour, Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic',
          'Planet, and more);',
          '0.375% on groceries/supermarkets/fast-food restaurants/insurance/car dealerships',
          '(outside SHARE) AND on "EU Spends (including UK)";',
          '0.15% on fuel/transit/government services/utility payments/real estate/education/telecom.',
          `⚠️ Account-wide cap: ${t.monthlyCapPoints.toLocaleString()} SHARE Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), per ${SRC_TC} Table 1.1.`,
          'WELCOME OFFER: 10,000 SHARE Points (worth AED 1,000) + Joining Fee Reversal, both on',
          `spending AED 40,000 within the first 3 months, per ${SRC_TC} Table 1.1.`,
          'BENEFITS: unlimited complimentary airport lounge access for cardholder + 1 guest at',
          '1,200+ premium lounges in 300+ cities worldwide via the Visa Airport Companion App;',
          'Golf Privileges (free golf in UAE up to twice/month, min AED 5,000/month spend, +',
          'up to 40% off premium golf courses worldwide); complimentary Valet Parking (count',
          'unspecified); Concierge services (min AED 5,000/month spend); 24/7 Roadside',
          'Assistance (min AED 5,000/month spend); Buy 1 Get 1 Free VOX Cinemas tickets (min',
          'AED 3,500/month spend); 0% Installment Plan (3/6/12/24/36 months); Purchase',
          'Protection + Extended Warranty (+12 months); optional Credit Shield Pro; Visa',
          'Privileges bundle (airport dining discount, Avis car rental, Visa Medical & Travel',
          'Assistance, Visa BOGOF The Entertainer, Visa Bicester Village Shopping, Visa',
          'BookingBash, Visa Digital Concierge); 20-25% dining discounts at select partner',
          'restaurants; SHARE App — up to an additional 3% back on purchases within the SHARE',
          'ecosystem; exclusive SHARE Ecosystem 2025 discounts (ACTIVATE 25% off, Ski Dubai',
          'free Snow Bullet experience, Snow Abu Dhabi 20% off, Magic Planet 20% extra points',
          '+ 5 free rides, 10% off THAT Concept Store/All Saints/Psycho Bunny/Shiseido/Crate &',
          'Barrel/CB2, PLUS an additional 5% off Poltrona Frau/Eleventy per the Infinite',
          'leaflet); signup promo: Majid Al Futtaim Mall eGift Card worth AED 500 by',
          'YOUGotaGift (one-time, not entered as a card_benefit row).',
          'DISCOVERED 4TH TIER (NOT ENTERED): T&C Table 1.1 also lists "SHARE Visa Private',
          'Credit Card" (AED 1,500/1,575 Joining Fee, 200,000 pts/month cap, same Welcome',
          'Spend Bonus + Joining Fee Reversal structure as Infinite) — but UNLIKE Darna',
          'Infinite Privilege, its per-category reward PERCENTAGES genuinely DIFFER from this',
          "Infinite card (🎁10%/2%/0.5%/0.2% vs Infinite's 8%/1.5%/0.375%/0.15%). Per",
          'CLAUDE.md\'s "Key Principle", differing per-category rates normally REQUIRE a',
          'separate card entry. SHARE Private was NOT entered because the user explicitly',
          'requested only the 3 cards (Platinum/Signature/Infinite) — flagged here as a',
          'candidate for a future addition.',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, ${SRC_KFS}) — International Transaction`,
          'Fee applies to all ENBD card products except dnata World.',
          `Sources: ${SRC_INFINITE_PRODUCT}, ${SRC_INFINITE_LEAFLET}, ${SRC_TC}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { INFINITE_ID = data.id; console.log(`  OK — INFINITE_ID: ${INFINITE_ID}`); }
  }

  if (!PLATINUM_ID || !SIGNATURE_ID || !INFINITE_ID) {
    console.error('\nCard insertion failed — aborting');
    process.exit(1);
  }

  // ─── 4. card_rewards (17 per card = 51 total) ──────────────────────────────
  console.log('\n[4/6] Inserting card_rewards (17 per card)...');
  const cardIdByTier = { PLATINUM: PLATINUM_ID, SIGNATURE: SIGNATURE_ID, INFINITE: INFINITE_ID };

  for (const tierKey of Object.keys(TIERS)) {
    const t = TIERS[tierKey];
    const cardId = cardIdByTier[tierKey];
    console.log(`\n  ${t.name}:`);
    for (const slug of SLUGS_ALL) {
      const catId = cat[slug];
      if (!catId) { console.error(`    ERROR: unknown slug ${slug}`); errors++; continue; }
      const pct = pctFor(slug, t);
      const { error } = await sb.from('card_rewards').insert({
        card_id: cardId,
        category_id: catId,
        reward_type: 'points',
        earn_rate: pct / 10,          // SHARE Points per AED (1 SHARE Point = AED 0.1)
        earn_unit: 'per_aed',
        effective_return_pct: pct,
        monthly_cap_reward: t.monthlyCapAed,
        source_url: SRC_TC,
        last_verified_date: TODAY,
        is_active: true,
        notes: getNotes(slug, t),
      });
      if (error) { console.error(`    ERROR (${slug}):`, error.message); errors++; }
      else process.stdout.write('.');
    }
    console.log(' done');
  }

  // ─── 5. card_benefits ───────────────────────────────────────────────────────
  console.log('\n[5/6] Inserting card_benefits...');

  const ECOSYSTEM_DISCOUNTS_DESC = 'ACTIVATE 25% off (excl. public holidays); Ski Dubai free Snow Bullet experience (1x, with Snow Fun package purchase); Snow Abu Dhabi 20% off (excl. public holidays); Magic Planet — package >AED 155 unlocks 20% additional points + 5 free blue swiper rides; 10% off at THAT Concept Store, All Saints, Psycho Bunny, Shiseido, Crate & Barrel, and CB2.';

  const platinum_benefits = [
    {
      card_id: PLATINUM_ID,
      benefit_type: 'buy_one_get_one',
      title: 'Buy 1 Get 1 Free — VOX Cinemas',
      description: 'Buy one get one free cinema tickets at VOX Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Minimum monthly card spend of AED 3,500 required.',
      is_active: true,
    },
    {
      card_id: PLATINUM_ID,
      benefit_type: 'other',
      title: '0% Installment Plan',
      description: '0% interest installment plan on eligible purchases over 3/6/12/24/36 months.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: PLATINUM_ID,
      benefit_type: 'purchase_protection',
      title: 'Purchase Protection + Extended Warranty (+12 months)',
      description: 'Purchase protection on eligible items plus an additional 12 months of extended warranty beyond the manufacturer warranty.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: PLATINUM_ID,
      benefit_type: 'credit_shield',
      title: 'Credit Shield Pro (Optional)',
      description: 'Optional Credit Shield Pro insurance covering outstanding balance in case of death, disability, or job loss.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Optional add-on, additional fee applies.',
      is_active: true,
    },
    {
      card_id: PLATINUM_ID,
      benefit_type: 'other',
      title: 'SHARE App — Up to Additional 3% Back',
      description: 'Earn up to an additional 3% back as SHARE Points on purchases made within the SHARE ecosystem, tracked via the SHARE App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Requires use of the SHARE App; subject to SHARE Rewards Programme rules.',
      is_active: true,
    },
    {
      card_id: PLATINUM_ID,
      benefit_type: 'entertainment_discount',
      title: 'Exclusive SHARE Ecosystem Discounts',
      description: ECOSYSTEM_DISCOUNTS_DESC,
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual partner T&Cs; some exclude public holidays.',
      is_active: true,
    },
    {
      card_id: PLATINUM_ID,
      benefit_type: 'other',
      title: 'Dining Discounts (20-25% at Select Restaurants)',
      description: '20-25% dining discounts at select partner restaurants.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Restaurant list and exact discount tiers per product T&Cs — verify with bank.',
      is_active: true,
    },
    {
      card_id: PLATINUM_ID,
      benefit_type: 'welcome_bonus',
      title: 'Signup Promo — Majid Al Futtaim Mall eGift Card (AED 250)',
      description: 'One-time signup promotion: Majid Al Futtaim Mall eGift Card by YOUGotaGift worth AED 250 for new cardholders.',
      monetary_value_aed: 250,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'One-time new cardholder promotion — verify current availability with bank.',
      is_active: true,
    },
  ];

  const signature_benefits = [
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Offer — 5,000 SHARE Points',
      description: 'Earn 5,000 SHARE Points (worth AED 500 at 10 SHARE Points = AED 1) on spending AED 25,000 within the first 3 months.',
      monetary_value_aed: 500,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'Requires AED 25,000 spend within first 3 months of card issuance.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Signup Promo — Majid Al Futtaim Mall eGift Card (AED 350)',
      description: 'One-time signup promotion: Majid Al Futtaim Mall eGift Card by YOUGotaGift worth AED 350 for new cardholders.',
      monetary_value_aed: 350,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'One-time new cardholder promotion — verify current availability with bank.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion App)',
      description: 'Unlimited complimentary access to over 1,200 premium airport lounges in more than 300 cities worldwide, via the Visa Airport Companion App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'concierge',
      title: 'Concierge Services',
      description: 'Automatic enrollment in concierge services covering airport drop-offs, car servicing and registration, and local courier services.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'other',
      title: 'Roadside Assistance (24/7)',
      description: '24/7 roadside assistance: vehicle recovery/towing, fuel delivery, and battery boost.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'buy_one_get_one',
      title: 'Buy 1 Get 1 Free — VOX Cinemas',
      description: 'Buy one get one free cinema tickets at VOX Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Minimum monthly card spend of AED 3,500 required.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'other',
      title: '0% Installment Plan',
      description: '0% interest installment plan on eligible purchases over 3/6/12/24/36 months.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'purchase_protection',
      title: 'Purchase Protection + Extended Warranty (+12 months)',
      description: 'Purchase protection on eligible items plus an additional 12 months of extended warranty beyond the manufacturer warranty.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'credit_shield',
      title: 'Credit Shield Pro (Optional)',
      description: 'Optional Credit Shield Pro insurance covering outstanding balance in case of death, disability, or job loss.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Optional add-on, additional fee applies.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'other',
      title: 'Visa Privileges Bundle (Airport Dining, Avis, The Entertainer, Bicester Village, BookingBash, Digital Concierge)',
      description: 'Visa airport dining discount, Avis car rental discount, Visa Medical & Travel Assistance, Visa BOGOF The Entertainer, Visa Bicester Village Shopping, Visa BookingBash, and Visa Digital Concierge.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual Visa benefit T&Cs.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'other',
      title: 'Dining Discounts (20-25% at Select Restaurants)',
      description: '20-25% dining discounts at select partner restaurants.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Restaurant list and exact discount tiers per product T&Cs — verify with bank.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'other',
      title: 'SHARE App — Up to Additional 3% Back',
      description: 'Earn up to an additional 3% back as SHARE Points on purchases made within the SHARE ecosystem, tracked via the SHARE App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Requires use of the SHARE App; subject to SHARE Rewards Programme rules.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'entertainment_discount',
      title: 'Exclusive SHARE Ecosystem Discounts',
      description: ECOSYSTEM_DISCOUNTS_DESC,
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual partner T&Cs; some exclude public holidays.',
      is_active: true,
    },
  ];

  const infinite_benefits = [
    {
      card_id: INFINITE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Offer — 10,000 SHARE Points + Joining Fee Reversal',
      description: 'Earn 10,000 SHARE Points (worth AED 1,000 at 10 SHARE Points = AED 1) AND a reversal of the AED 1,575 Joining Fee, both on spending AED 40,000 within the first 3 months.',
      monetary_value_aed: 1000,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'Requires AED 40,000 spend within first 3 months of card issuance. Joining Fee Reversal value (AED 1,575) is in addition to the AED 1,000 points value.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Signup Promo — Majid Al Futtaim Mall eGift Card (AED 500)',
      description: 'One-time signup promotion: Majid Al Futtaim Mall eGift Card by YOUGotaGift worth AED 500 for new cardholders.',
      monetary_value_aed: 500,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'One-time new cardholder promotion — verify current availability with bank.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion App) — Cardholder + 1 Guest',
      description: 'Unlimited complimentary access to over 1,200 premium airport lounges in more than 300 cities worldwide, via the Visa Airport Companion App, for the cardholder plus 1 guest.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'golf',
      title: 'Golf Privileges',
      description: 'Free golf rounds in the UAE (up to twice per month) plus up to 40% off premium golf courses worldwide.',
      monetary_value_aed: null,
      usage_limit: 2,
      usage_period: 'monthly',
      conditions: 'Free UAE golf requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking',
      description: 'Complimentary valet parking at select locations.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Locations and visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'concierge',
      title: 'Concierge Services',
      description: 'Automatic enrollment in concierge services covering airport drop-offs, car servicing and registration, and local courier services.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'other',
      title: 'Roadside Assistance (24/7)',
      description: '24/7 roadside assistance: vehicle recovery/towing, fuel delivery, and battery boost.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'buy_one_get_one',
      title: 'Buy 1 Get 1 Free — VOX Cinemas',
      description: 'Buy one get one free cinema tickets at VOX Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Minimum monthly card spend of AED 3,500 required.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'other',
      title: '0% Installment Plan',
      description: '0% interest installment plan on eligible purchases over 3/6/12/24/36 months.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'purchase_protection',
      title: 'Purchase Protection + Extended Warranty (+12 months)',
      description: 'Purchase protection on eligible items plus an additional 12 months of extended warranty beyond the manufacturer warranty.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'credit_shield',
      title: 'Credit Shield Pro (Optional)',
      description: 'Optional Credit Shield Pro insurance covering outstanding balance in case of death, disability, or job loss.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Optional add-on, additional fee applies.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'other',
      title: 'Visa Privileges Bundle (Airport Dining, Avis, The Entertainer, Bicester Village, BookingBash, Digital Concierge)',
      description: 'Visa airport dining discount, Avis car rental discount, Visa Medical & Travel Assistance, Visa BOGOF The Entertainer, Visa Bicester Village Shopping, Visa BookingBash, and Visa Digital Concierge.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual Visa benefit T&Cs.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'other',
      title: 'Dining Discounts (20-25% at Select Restaurants)',
      description: '20-25% dining discounts at select partner restaurants.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Restaurant list and exact discount tiers per product T&Cs — verify with bank.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'other',
      title: 'SHARE App — Up to Additional 3% Back',
      description: 'Earn up to an additional 3% back as SHARE Points on purchases made within the SHARE ecosystem, tracked via the SHARE App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Requires use of the SHARE App; subject to SHARE Rewards Programme rules.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'entertainment_discount',
      title: 'Exclusive SHARE Ecosystem Discounts (Plus Poltrona Frau/Eleventy)',
      description: ECOSYSTEM_DISCOUNTS_DESC + ' PLUS an additional 5% off at Poltrona Frau and Eleventy (Infinite leaflet only).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual partner T&Cs; some exclude public holidays.',
      is_active: true,
    },
  ];

  for (const [label, benefits] of [['Platinum', platinum_benefits], ['Signature', signature_benefits], ['Infinite', infinite_benefits]]) {
    console.log(`\n  ${label}:`);
    for (const b of benefits) {
      const { error } = await sb.from('card_benefits').insert(b);
      if (error) { console.error(`    ERROR (${b.benefit_type}):`, error.message); errors++; }
      else console.log(`    OK — ${b.title}`);
    }
  }

  // ─── 6. Verify ──────────────────────────────────────────────────────────────
  console.log('\n[6/6] Verifying final state...');

  const ALL_IDS = [PLATINUM_ID, SIGNATURE_ID, INFINITE_ID];

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
    console.log(`\n  ${TIERS[tierKey].name}: ${r.length} reward rows, cap=AED ${r[0]?.monthly_cap_reward}/month, general rate=${TIERS[tierKey].genPct}%, SHARE ecosystem bonus=${TIERS[tierKey].ecoPct}%`);
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

  console.log(`\nCard IDs:`);
  console.log(`  PLATINUM_ID:  ${PLATINUM_ID}`);
  console.log(`  SIGNATURE_ID: ${SIGNATURE_ID}`);
  console.log(`  INFINITE_ID:  ${INFINITE_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

// Add ENBD Darna Select Visa / Darna Visa Signature / Darna Visa Infinite Credit Cards
//
// Darna Rewards (by Aldar) — 10 Darna Points = AED 1 (reward_currency_value_aed = 0.1)
//
// Sources:
//   SRC_TC       → tcpdfs/ENBD darna_visa_credit_card_tncs.pdf
//     Table 1.1 (p.5) — definitive per-tier reward rate table (pts per AED 100):
//       Aldar-destination spends:                Select=62.5  Signature=75   Infinite=100  (Privilege=100)
//       General Domestic/International:         Select=7.5   Signature=10   Infinite=15   (Privilege=15)
//       EU Spends (incl. UK): same as General Domestic/International row.
//       Grocery/supermarkets/fast-food/insurance/car dealerships (outside Aldar):
//                                                 Select=1.875 Signature=2.5  Infinite=3.75 (Privilege=3.75)
//       Petroleum/transit/govt/utility/real estate/education/telecom:
//                                                 Select=0.75  Signature=1    Infinite=1.5  (Privilege=1.5)
//       Footnote: "*Aldar properties and education is excluded from this earn qualification"
//         -> real estate (rent) and education NEVER earn the Aldar-bonus rate, even at
//            Aldar-owned developments/schools.
//       Rewards Capping per month: Select=25,000 pts  Signature=50,000 pts  Infinite=100,000 pts
//         (Privilege=200,000 pts) — combined account-wide cap across ALL categories.
//       10 Darna Points = AED 1 (redemption rate, clause 28).
//
//   SRC_SELECT_PRODUCT  → tcpdfs/ENBD Darna Select Visa Credit Card _ Exclusive Rewards & Benefits _ Emirates NBD.pdf
//     Confirms 6.25% Aldar / 0.75% general. Min salary AED 5,000. Free for life.
//     Benefits: 0% Installment Plan (Aldar Education & Property), BOGOF VOX Cinemas,
//     20% off Yas Island theme parks (both require min AED 5,000/month spend),
//     Purchase Protection + Extended Warranty (+12mo), optional Credit Shield Pro,
//     Complimentary Darna Silver tier, YOUGotaGift HappyYOU Card worth AED 250 (signup promo).
//
//   SRC_SIGNATURE_PRODUCT → tcpdfs/ENBD Darna Visa Signature Credit Card _ Exclusive Rewards & Benefits _ Emirates NBD.pdf
//     Confirms 7.5% Aldar / 1.0% general. Min salary AED 12,000.
//     Welcome offer: 3,000 Darna Points (= Spends Bonus @ AED 15,000 in 3mo, per SRC_TC).
//     YOUGotaGift HappyYOU Card worth AED 350 (signup promo).
//     Benefits: 0% Installment Plan, Roadside Assistance, Visa Airport Companion App lounge
//     access, BOGOF movies, Multitrip Travel Insurance, Buyers Protection, Concierge desk +
//     Digital concierge, Visa airport dining discount, Avis car rental, Visa Bicester Village,
//     Visa BOGOF The Entertainer, Visa BookingBash, DoubleSecure, Credit Shield Pro (optional).
//     Complimentary Darna Gold tier (up to 30% off hotel stays + 20% off dining at select
//     hotels, golf/padel/country club discounts).
//
//   SRC_INFINITE_PRODUCT → tcpdfs/ENBD Darna Visa Infinite Credit Card _ Premium Rewards & Benefits _ Emirates NBD.pdf
//     Confirms 10% Aldar / 1.5% general. Min salary AED 30,000.
//     Welcome offer: up to 15,000 Darna Points (7,500 Welcome Bonus on joining-fee payment +
//     7,500 Spends Bonus @ AED 20,000 in 3mo, per SRC_TC).
//     YOUGotaGift HappyYOU Card worth AED 500 (signup promo).
//     Benefits: same as Signature PLUS Golf Privileges (free golf UAE + up to 40% off premium
//     golf worldwide) and Valet Parking (select Abu Dhabi locations).
//     Complimentary Darna Platinum tier.
//
//   SRC_SELECT_BENEFITS → tcpdfs/ENBD darna_select_credit_card_benefits.pdf
//     Cross-confirms Select category percentages (6.25% / 0.75% / 0.18% / 0.075%) and provides
//     the Darna ecosystem partner directory used for 🎁 Aldar-bonus notes below:
//       Malls: Yas Mall, WTC Mall Souk Hub, Al Qana/Alqimi Mall, Alhamra Mall
//       Hotels: Rixos Bab Al Bahr, Centro Yas Island, Crowne Plaza Abu Dhabi-Yas Island,
//         Park Inn by Radisson, Radisson Blu, Courtyard by Marriott, Yas Island Rotana,
//         Hala Arjaan by Rotana, Staybridge Suites, W Abu Dhabi Yas Island, DoubleTree by
//         Hilton, Aldhafra Resort
//       Beach clubs: Saadiyat Beach Club, Kai Beach, Mamsha Beach
//       Theme parks (Miral partnership, not Aldar assets): Ferrari World, Warner Bros World
//         Abu Dhabi, Yas Waterworld
//       Golf: Yas Links Abu Dhabi, Saadiyat Beach Golf Club, Yas Acres Golf & Country Club
//       Attractions: Qasr Al Watan, CLYMB, Yas Marina Circuit
//       Complimentary Darna Silver benefits: up to 15% off dining at 7 named Yas Island hotels;
//       golf/padel/country club discounts.
//
//   SRC_FEES → tcpdfs/emiratesnbd_credit_card_fees_charges.pdf (Feb 2026)
//     "Darna Infinite Privilege/Infinite/Signature/Select": Annual Fee 2,625/1,575/315/Free,
//     Finance Charges 3.25%/3.25%/3.69%/3.69%. Resolves the AED 300 (T&C "Joining Fee") vs
//     AED 315 (product page "Annual Fee") discrepancy for Signature — AED 315 is the official
//     VAT-inclusive figure used here. International Transaction Fee 1.99% applies to all
//     products except dnata World -> CONFIRMED for all 3 Darna cards.
//
//   SRC_KFS → tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf (March 2026)
//     Cross-confirms Joining/Renewal Fees (Select=Free, Signature=315, Infinite=1,575) and
//     APR (Select/Signature=44.28% -> 3.69%/mo, Infinite=39.00% -> 3.25%/mo). Also confirms
//     1.99% foreign currency transaction fee "charged on all foreign currency transactions".
//
// DISCOVERED 4TH TIER (NOT ENTERED — see CLAUDE.md "Discovering Card Variants"):
//   SRC_TC also lists "Darna Visa Infinite Privilege" (AED 2,625 annual fee, Invite Only Darna
//   tier, 200,000 pts/month cap, larger joining bonus). Its PER-CATEGORY REWARD PERCENTAGES
//   (100% Aldar / 1.5% general / 0.375% grocery-reduced / 0.15% petrol-reduced) are IDENTICAL
//   to Darna Infinite. Per CLAUDE.md's "Key Principle" — tiers with IDENTICAL reward rates but
//   different benefits/fees CAN remain a single entry with notes, rather than a separate card.
//   Infinite Privilege is also an invite-only product (not generally available / not requested
//   by the user), so it is documented here for reference only and NOT inserted as a card.
//
// CATEGORY MAPPING (17 CardWise categories -> 3 Darna rate buckets):
//   GENERAL (full rate):              dining, airlines, shopping, hotels, travel,
//                                      online_shopping, entertainment, healthcare,
//                                      international, general
//   GROCERY-REDUCED (25% of general): groceries, insurance
//   PETROL-REDUCED (10% of general):  fuel, rent, utilities, education, government
//   🎁 ALDAR-BONUS eligible (within GENERAL bucket, at Aldar-ecosystem destinations):
//                                      groceries, dining, shopping, hotels, entertainment
//                                      (NOT education or rent/real estate — explicitly
//                                      excluded from Aldar-bonus qualification per T&C footnote)
//
// FLAGGED FOR HUMAN REVIEW:
//   - "healthcare": not explicitly listed in any T&C rate bucket — assumed General
//     Domestic/International rate (default bucket). ⚠️ Verify with bank.
//   - "international": T&C explicitly states "EU Spends (incl. UK)" earn the General
//     Domestic/International rate; assumed non-EU international spend earns the same
//     (no separate international rate is listed). ⚠️ Verify with bank.
//   - "dining": fast-food/quick-service restaurants are explicitly grouped into the
//     GROCERY-REDUCED bucket per T&C, while regular restaurants/cafés earn the GENERAL
//     rate — both rates are documented in the dining row's notes.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-15';

const SRC_TC = 'tcpdfs/ENBD darna_visa_credit_card_tncs.pdf';
const SRC_SELECT_PRODUCT = 'tcpdfs/ENBD Darna Select Visa Credit Card _ Exclusive Rewards & Benefits _ Emirates NBD.pdf';
const SRC_SIGNATURE_PRODUCT = 'tcpdfs/ENBD Darna Visa Signature Credit Card _ Exclusive Rewards & Benefits _ Emirates NBD.pdf';
const SRC_INFINITE_PRODUCT = 'tcpdfs/ENBD Darna Visa Infinite Credit Card _ Premium Rewards & Benefits _ Emirates NBD.pdf';
const SRC_SELECT_BENEFITS = 'tcpdfs/ENBD darna_select_credit_card_benefits.pdf';
const SRC_FEES = 'tcpdfs/emiratesnbd_credit_card_fees_charges.pdf';
const SRC_KFS = 'tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf';

const SLUGS_ALL = [
  'groceries', 'dining', 'fuel', 'rent', 'utilities', 'education', 'insurance',
  'online_shopping', 'shopping', 'entertainment', 'healthcare', 'airlines',
  'hotels', 'travel', 'international', 'government', 'general',
];

const GROCERY_REDUCED_CATS = ['groceries', 'insurance'];
const PETROL_REDUCED_CATS = ['fuel', 'rent', 'utilities', 'education', 'government'];
const ALDAR_BONUS_CATS = ['groceries', 'dining', 'shopping', 'hotels', 'entertainment'];

const ALDAR_MALLS = 'Aldar malls (Yas Mall, WTC Mall Souk Hub, Al Qana/Alqimi Mall, Alhamra Mall)';
const ALDAR_HOTELS = 'Aldar-affiliated hotels (Rixos Bab Al Bahr, Centro Yas Island, Crowne Plaza Abu Dhabi-Yas Island, Park Inn by Radisson, Radisson Blu, Courtyard by Marriott, Yas Island Rotana, Hala Arjaan by Rotana, Staybridge Suites, W Abu Dhabi Yas Island, DoubleTree by Hilton, Aldhafra Resort)';
const ALDAR_ENTERTAINMENT = 'Aldar-ecosystem entertainment destinations, incl. Miral theme parks (Ferrari World, Warner Bros World Abu Dhabi, Yas Waterworld — included via Aldar\'s strategic partnership with Miral, though Miral itself is not an Aldar asset), beach clubs (Saadiyat Beach Club, Kai Beach, Mamsha Beach), golf (Yas Links Abu Dhabi, Saadiyat Beach Golf Club, Yas Acres Golf & Country Club), and attractions (Qasr Al Watan, CLYMB, Yas Marina Circuit)';
const ALDAR_GROCERY = 'Aldar-affiliated grocery stores/malls (Yas Mall, Al Qana/Alqimi Mall, Alhamra Mall, WTC Mall Souk Hub)';
const ALDAR_DINING = 'Aldar-ecosystem F&B venues (hotels, beach clubs, malls within the Darna ecosystem)';

const TIERS = {
  SELECT: {
    name: 'Emirates NBD Darna Select Visa Credit Card',
    card_tier: 'standard',
    annual_fee_aed: 0,
    min_salary_aed: 5000,
    interest_rate_monthly_pct: 3.69,
    aldarPct: 6.25, genPct: 0.75, grocPct: 0.1875, petrolPct: 0.075,
    monthlyCapPoints: 25000, monthlyCapAed: 2500,
    darnaTier: 'Silver',
    src: SRC_SELECT_PRODUCT,
  },
  SIGNATURE: {
    name: 'Emirates NBD Darna Visa Signature Credit Card',
    card_tier: 'signature',
    annual_fee_aed: 315,
    min_salary_aed: 12000,
    interest_rate_monthly_pct: 3.69,
    aldarPct: 7.5, genPct: 1.0, grocPct: 0.25, petrolPct: 0.1,
    monthlyCapPoints: 50000, monthlyCapAed: 5000,
    darnaTier: 'Gold',
    src: SRC_SIGNATURE_PRODUCT,
  },
  INFINITE: {
    name: 'Emirates NBD Darna Visa Infinite Credit Card',
    card_tier: 'infinite',
    annual_fee_aed: 1575,
    min_salary_aed: 30000,
    interest_rate_monthly_pct: 3.25,
    aldarPct: 10.0, genPct: 1.5, grocPct: 0.375, petrolPct: 0.15,
    monthlyCapPoints: 100000, monthlyCapAed: 10000,
    darnaTier: 'Platinum',
    src: SRC_INFINITE_PRODUCT,
  },
};

function pctFor(slug, t) {
  if (GROCERY_REDUCED_CATS.includes(slug)) return t.grocPct;
  if (PETROL_REDUCED_CATS.includes(slug)) return t.petrolPct;
  return t.genPct;
}

function capNote(t) {
  return `⚠️ Shared account-wide cap: ${t.monthlyCapPoints.toLocaleString()} Darna Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), combined across ALL spend categories per the "Rewards Capping per month" row in ${SRC_TC}.`;
}

function getNotes(slug, t) {
  const redemption = '10 Darna Points = AED 1.';
  const cap = capNote(t);

  switch (slug) {
    case 'groceries':
      return `${t.grocPct}% Darna Points back on groceries/supermarkets (outside Aldar) — reduced rate (25% of the ${t.genPct}% general rate), grouped with fast-food/insurance/car dealerships per ${SRC_TC}. 🎁 Earns ${t.aldarPct}% at ${ALDAR_GROCERY}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'dining':
      return `${t.genPct}% Darna Points back on dining (restaurants/cafés) at the General Domestic/International rate. ⚠️ Fast-food/quick-service restaurants are grouped into the reduced-rate bucket and earn ${t.grocPct}% instead, per ${SRC_TC}. 🎁 Earns ${t.aldarPct}% at ${ALDAR_DINING}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'fuel':
      return `${t.petrolPct}% Darna Points back on fuel/petrol station spend — reduced rate (10% of the ${t.genPct}% general rate), grouped with transit/government/utility/telecom per ${SRC_TC}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'rent':
      return `${t.petrolPct}% Darna Points back — mapped from "real estate" in the reduced-rate bucket (10% of the ${t.genPct}% general rate) per ${SRC_TC}. ⚠️ Real estate/Aldar property payments are explicitly EXCLUDED from the Aldar-bonus rate per the T&C footnote, even at Aldar-owned developments. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'utilities':
      return `${t.petrolPct}% Darna Points back on utility bill payments & telecom (DEWA/Etisalat/du/SEWA/FEWA/Salik) — reduced rate (10% of the ${t.genPct}% general rate) per ${SRC_TC}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'education':
      return `${t.petrolPct}% Darna Points back on education/school fees — reduced rate (10% of the ${t.genPct}% general rate) per ${SRC_TC}. ⚠️ Education spend is explicitly EXCLUDED from the Aldar-bonus rate per the T&C footnote, even at Aldar-affiliated schools (Yasmina/Al Ain/Muna/Bateen/Mamoura/Pearl/Yas Academies). A separate 0% Installment Plan benefit is available for Aldar Education payments (see card_benefits). ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'insurance':
      return `${t.grocPct}% Darna Points back on insurance premium payments — reduced rate (25% of the ${t.genPct}% general rate), grouped with groceries/supermarkets/fast-food/car dealerships per ${SRC_TC}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'online_shopping':
      return `${t.genPct}% Darna Points back on online shopping/e-commerce (Amazon.ae, Noon, etc.) at the General Domestic/International rate. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'shopping':
      return `${t.genPct}% Darna Points back on shopping at the General Domestic/International rate. 🎁 Earns ${t.aldarPct}% at ${ALDAR_MALLS}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'entertainment':
      return `${t.genPct}% Darna Points back on entertainment at the General Domestic/International rate. 🎁 Earns ${t.aldarPct}% at ${ALDAR_ENTERTAINMENT}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'healthcare':
      return `${t.genPct}% Darna Points back on healthcare (hospitals/clinics/pharmacies). ⚠️ Healthcare is not explicitly listed as a distinct category in the Darna T&C rate table — assumed to fall under the "General Domestic/International" default rate. Verify with bank. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'airlines':
      return `${t.genPct}% Darna Points back on airline ticket purchases at the General Domestic/International rate. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'hotels':
      return `${t.genPct}% Darna Points back on hotel bookings at the General Domestic/International rate. 🎁 Earns ${t.aldarPct}% at ${ALDAR_HOTELS}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'travel':
      return `${t.genPct}% Darna Points back on travel agencies/booking platforms/car rentals at the General Domestic/International rate. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'international':
      return `${t.genPct}% Darna Points back on international spend. "EU Spends (incl. UK)" are explicitly confirmed to earn the same as the General Domestic/International rate per ${SRC_TC}; other international spend is assumed to earn the same (no separate international rate is listed — ⚠️ verify with bank). Foreign-currency transaction fee of 1.99% CONFIRMED (applies to all foreign-currency transactions per ${SRC_FEES} and ${SRC_KFS}) applies separately and does not affect Darna Points earning. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'government':
      return `${t.petrolPct}% Darna Points back on government services/fees — reduced rate (10% of the ${t.genPct}% general rate) per ${SRC_TC}. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'general':
      return `${t.genPct}% Darna Points back (General Domestic/International rate — the standard rate applied to all spend not in a special-rate bucket). ${redemption} ${cap} Source: ${SRC_TC}`;
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

  let SELECT_ID, SIGNATURE_ID, INFINITE_ID;

  // ─── 1. Insert Darna Select ─────────────────────────────────────────────────
  console.log('\n[1/6] Inserting Darna Select Visa card...');
  {
    const t = TIERS.SELECT;
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: t.name,
        card_network: 'visa',
        card_tier: t.card_tier,
        annual_fee_aed: t.annual_fee_aed,
        min_salary_aed: t.min_salary_aed,
        reward_currency_name: 'Darna Points',
        reward_currency_value_aed: 0.1,
        base_earn_rate: t.genPct / 10,   // 0.75% general = 0.075 Darna Points/AED
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
        source_url: SRC_SELECT_PRODUCT,
        summary: [
          'VERIFIED 2026-06-15. Emirates NBD Darna Select Visa Credit Card — "Free For Life" (AED 0 annual fee).',
          'NEW CARD (part of the Darna Rewards by Aldar family). Min salary: AED 5,000. Interest: 3.69%/month.',
          'DARNA POINTS EARNING (10 Darna Points = AED 1):',
          '0.75% general (Domestic/International, incl. EU/UK); 🎁 6.25% at Aldar-ecosystem destinations',
          '(malls, hotels, beach clubs, theme parks via Miral partnership, golf, attractions);',
          '0.1875% (25% of general) on groceries/supermarkets/fast-food/insurance/car dealerships;',
          '0.075% (10% of general) on fuel/transit/government/utilities/telecom/real estate/education.',
          `⚠️ Account-wide cap: ${t.monthlyCapPoints.toLocaleString()} Darna Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), per ${SRC_TC}.`,
          '⚠️ Real estate and education spend NEVER qualify for the Aldar-bonus rate, even at Aldar-owned',
          'developments/schools, per T&C footnote.',
          `STATUS: Complimentary Darna ${t.darnaTier} tier (up to 15% off dining at 7 Yas Island hotels;`,
          'golf/padel/country club discounts).',
          'BENEFITS: 0% Installment Plan for Aldar Education & Property (3/6/12/24/36mo); Buy 1 Get 1 Free',
          'VOX Cinemas tickets (min AED 5,000/month spend); 20% off Yas Island theme parks/attractions',
          '(min AED 5,000/month spend); Purchase Protection + Extended Warranty (+12 months); optional',
          'Credit Shield Pro (0.99%/month, AED 300k decease cover, AED 100/day hospitalization, up to AED',
          '60k job-loss cover for 12mo); signup promo: YOUGotaGift HappyYOU Card worth AED 250 (one-time,',
          'not recurring — not entered as a card_benefit row).',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, Feb 2026; cross-confirmed in ${SRC_KFS}, March 2026)`,
          '— International Transaction Fee applies to all ENBD card products except dnata World.',
          `Sources: ${SRC_SELECT_PRODUCT}, ${SRC_SELECT_BENEFITS}, ${SRC_TC}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { SELECT_ID = data.id; console.log(`  OK — SELECT_ID: ${SELECT_ID}`); }
  }

  // ─── 2. Insert Darna Signature ─────────────────────────────────────────────
  console.log('\n[2/6] Inserting Darna Visa Signature card...');
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
        reward_currency_name: 'Darna Points',
        reward_currency_value_aed: 0.1,
        base_earn_rate: t.genPct / 10,   // 1.0% general = 0.10 Darna Points/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: t.interest_rate_monthly_pct,
        lounge_access_count: null,   // Visa Airport Companion App — visit count unspecified
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,
        travel_insurance: true,      // Multitrip Travel Insurance
        purchase_protection: true,   // Buyers Protection
        concierge: true,             // Concierge desk + Digital concierge
        airport_transfer_count: null,
        source_url: SRC_SIGNATURE_PRODUCT,
        summary: [
          'VERIFIED 2026-06-15. Emirates NBD Darna Visa Signature Credit Card.',
          'NEW CARD (part of the Darna Rewards by Aldar family). Joining/Annual fee: AED 315',
          `(CONFIRMED ${SRC_FEES} — resolves discrepancy with T&C "Joining Fee: AED 300", which appears`,
          'to be pre-VAT; AED 315 is the official VAT-inclusive figure used here). Min salary: AED 12,000.',
          'Interest: 3.69%/month. "Free for life for a limited time only" promotional offer noted on',
          'product page.',
          'DARNA POINTS EARNING (10 Darna Points = AED 1):',
          '1.0% general (Domestic/International, incl. EU/UK); 🎁 7.5% at Aldar-ecosystem destinations',
          '(malls, hotels, beach clubs, theme parks via Miral partnership, golf, attractions);',
          '0.25% (25% of general) on groceries/supermarkets/fast-food/insurance/car dealerships;',
          '0.1% (10% of general) on fuel/transit/government/utilities/telecom/real estate/education.',
          `⚠️ Account-wide cap: ${t.monthlyCapPoints.toLocaleString()} Darna Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), per ${SRC_TC}.`,
          '⚠️ Real estate and education spend NEVER qualify for the Aldar-bonus rate, even at Aldar-owned',
          'developments/schools, per T&C footnote.',
          `STATUS: Complimentary Darna ${t.darnaTier} tier (up to 30% off hotel stays + 20% off dining at`,
          'select hotels; golf/padel/country club discounts).',
          'WELCOME OFFER: 3,000 Darna Points (= Spends Bonus on AED 15,000 spend within first 3 months,',
          `per ${SRC_TC}); signup promo: YOUGotaGift HappyYOU Card worth AED 350 (one-time).`,
          'BENEFITS: 0% Installment Plan; Roadside Assistance (recovery/towing/fuel delivery/battery',
          'boost); Visa Airport Companion App lounge access (visit count unspecified); Buy 1 Get 1 Free',
          'movie tickets; Multitrip Travel Insurance; Buyers Protection; Business Card Liability Waiver;',
          'Concierge desk + Visa Digital Concierge; Visa airport dining discount; Avis car rental discount;',
          'Visa Medical & Travel Assistance; Visa BOGOF The Entertainer; Visa Bicester Village Shopping;',
          'Visa BookingBash; DoubleSecure protection; optional Credit Shield Pro.',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, Feb 2026; cross-confirmed in ${SRC_KFS}, March 2026)`,
          '— International Transaction Fee applies to all ENBD card products except dnata World.',
          `Sources: ${SRC_SIGNATURE_PRODUCT}, ${SRC_TC}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { SIGNATURE_ID = data.id; console.log(`  OK — SIGNATURE_ID: ${SIGNATURE_ID}`); }
  }

  // ─── 3. Insert Darna Infinite ──────────────────────────────────────────────
  console.log('\n[3/6] Inserting Darna Visa Infinite card...');
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
        reward_currency_name: 'Darna Points',
        reward_currency_value_aed: 0.1,
        base_earn_rate: t.genPct / 10,   // 1.5% general = 0.15 Darna Points/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: t.interest_rate_monthly_pct,
        lounge_access_count: null,   // Visa Airport Companion App — visit count unspecified
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,   // select Abu Dhabi locations — count unspecified
        travel_insurance: true,      // Multitrip Travel Insurance
        purchase_protection: true,   // Buyers Protection
        concierge: true,             // Concierge desk + Digital concierge
        airport_transfer_count: null,
        source_url: SRC_INFINITE_PRODUCT,
        summary: [
          'VERIFIED 2026-06-15. Emirates NBD Darna Visa Infinite Credit Card.',
          'NEW CARD (part of the Darna Rewards by Aldar family). Joining/Annual fee: AED 1,575',
          `(CONFIRMED ${SRC_FEES}, ${SRC_KFS}). Min salary: AED 30,000. Interest: 3.25%/month.`,
          'DARNA POINTS EARNING (10 Darna Points = AED 1):',
          '1.5% general (Domestic/International, incl. EU/UK); 🎁 10% at Aldar-ecosystem destinations',
          '(malls, hotels, beach clubs, theme parks via Miral partnership, golf, attractions);',
          '0.375% (25% of general) on groceries/supermarkets/fast-food/insurance/car dealerships;',
          '0.15% (10% of general) on fuel/transit/government/utilities/telecom/real estate/education.',
          `⚠️ Account-wide cap: ${t.monthlyCapPoints.toLocaleString()} Darna Points/month (≈AED ${t.monthlyCapAed.toLocaleString()}), per ${SRC_TC}.`,
          '⚠️ Real estate and education spend NEVER qualify for the Aldar-bonus rate, even at Aldar-owned',
          'developments/schools, per T&C footnote.',
          `STATUS: Complimentary Darna ${t.darnaTier} tier (highest Darna status; generally-available`,
          'top tier).',
          'WELCOME OFFER: up to 15,000 Darna Points (7,500 Welcome Bonus on payment of joining fee +',
          `7,500 Spends Bonus on AED 20,000 spend within first 3 months, per ${SRC_TC}); signup promo:`,
          'YOUGotaGift HappyYOU Card worth AED 500 (one-time).',
          'BENEFITS: 0% Installment Plan; Golf Privileges (free golf in UAE + up to 40% off premium golf',
          'worldwide); Roadside Assistance; complimentary Valet Parking (select Abu Dhabi locations,',
          'count unspecified); Visa Airport Companion App lounge access (visit count unspecified); Buy 1',
          'Get 1 Free movie tickets; Multitrip Travel Insurance; Buyers Protection; Business Card Liability',
          'Waiver; Concierge desk + Visa Digital Concierge; Visa airport dining discount; Avis car rental',
          'discount; Visa Medical & Travel Assistance; Visa BOGOF The Entertainer; Visa Bicester Village',
          'Shopping; Visa BookingBash; DoubleSecure protection; optional Credit Shield Pro.',
          'DISCOVERED 4TH TIER (NOT ENTERED): T&C also lists "Darna Visa Infinite Privilege" (AED 2,625',
          'annual fee, Invite Only Darna tier, 200,000 pts/month cap, larger welcome bonus) — its',
          'per-category reward PERCENTAGES are IDENTICAL to this Infinite card (100%/1.5%/0.375%/0.15%',
          'Aldar/general/grocery-reduced/petrol-reduced buckets). Per CLAUDE.md, identical-rate tiers',
          'with differing fees/benefits can remain one entry — Infinite Privilege is also invite-only',
          'and not user-requested, so it was not entered as a separate card.',
          `Forex markup: 1.99% CONFIRMED (${SRC_FEES}, Feb 2026; cross-confirmed in ${SRC_KFS}, March 2026)`,
          '— International Transaction Fee applies to all ENBD card products except dnata World.',
          `Sources: ${SRC_INFINITE_PRODUCT}, ${SRC_TC}, ${SRC_FEES}, ${SRC_KFS}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { INFINITE_ID = data.id; console.log(`  OK — INFINITE_ID: ${INFINITE_ID}`); }
  }

  if (!SELECT_ID || !SIGNATURE_ID || !INFINITE_ID) {
    console.error('\nCard insertion failed — aborting');
    process.exit(1);
  }

  // ─── 4. card_rewards (17 per card = 51 total) ──────────────────────────────
  console.log('\n[4/6] Inserting card_rewards (17 per card)...');
  const cardIdByTier = { SELECT: SELECT_ID, SIGNATURE: SIGNATURE_ID, INFINITE: INFINITE_ID };

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
        earn_rate: pct / 10,          // Darna Points per AED (1 Darna Point = AED 0.1)
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

  const select_benefits = [
    {
      card_id: SELECT_ID,
      benefit_type: 'other',
      title: '0% Installment Plan — Aldar Education & Property',
      description: '0% interest installment plan (3/6/12/24/36 months) for payments at Aldar Education and Aldar Properties.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SELECT_ID,
      benefit_type: 'buy_one_get_one',
      title: 'Buy 1 Get 1 Free — VOX Cinemas',
      description: 'Buy one get one free cinema tickets at VOX Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Minimum monthly card spend of AED 5,000 required.',
      is_active: true,
    },
    {
      card_id: SELECT_ID,
      benefit_type: 'entertainment_discount',
      title: '20% Off Yas Island Theme Parks & Attractions',
      description: '20% discount at Yas Island theme parks and attractions (Ferrari World, Warner Bros World Abu Dhabi, Yas Waterworld, etc.).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Minimum monthly card spend of AED 5,000 required.',
      is_active: true,
    },
    {
      card_id: SELECT_ID,
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
      card_id: SELECT_ID,
      benefit_type: 'tier_status',
      title: 'Complimentary Darna Silver Tier',
      description: 'Automatic Darna Silver tier status: up to 15% off dining at 7 named Yas Island hotels, plus golf/padel/country club discounts.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SELECT_ID,
      benefit_type: 'credit_shield',
      title: 'Credit Shield Pro (Optional)',
      description: 'Optional Credit Shield Pro insurance at 0.99%/month of outstanding balance — covers up to AED 300k on death, AED 100/day hospitalization, and up to AED 60k job-loss cover for 12 months.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Optional add-on, additional fee applies.',
      is_active: true,
    },
    {
      card_id: SELECT_ID,
      benefit_type: 'welcome_bonus',
      title: 'Signup Promo — YOUGotaGift HappyYOU Card (AED 250)',
      description: 'One-time signup promotion: YOUGotaGift HappyYOU Card worth AED 250 for new cardholders.',
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
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion App)',
      description: 'Complimentary access to airport lounges worldwide via the Visa Airport Companion App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Offer — 3,000 Darna Points',
      description: 'Earn 3,000 Darna Points (worth AED 300 at 10 Darna Points = AED 1) on spending AED 15,000 within the first 3 months.',
      monetary_value_aed: 300,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'Requires AED 15,000 spend within first 3 months of card issuance.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Signup Promo — YOUGotaGift HappyYOU Card (AED 350)',
      description: 'One-time signup promotion: YOUGotaGift HappyYOU Card worth AED 350 for new cardholders.',
      monetary_value_aed: 350,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'One-time new cardholder promotion — verify current availability with bank.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'other',
      title: 'Roadside Assistance',
      description: 'Complimentary roadside assistance: vehicle recovery/towing, fuel delivery, and battery boost.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'travel_insurance',
      title: 'Multitrip Travel Insurance + Visa Medical & Travel Assistance',
      description: 'Multitrip travel insurance coverage plus Visa Medical & Travel Assistance services.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Visa benefit T&Cs.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'purchase_protection',
      title: 'Buyers Protection + Business Card Liability Waiver + DoubleSecure',
      description: 'Buyers Protection on eligible purchases, Business Card Liability Waiver, and DoubleSecure protection.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'concierge',
      title: 'Concierge Desk + Visa Digital Concierge',
      description: 'Dedicated concierge desk plus Visa Digital Concierge for travel, dining, and lifestyle assistance.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'tier_status',
      title: 'Complimentary Darna Gold Tier',
      description: 'Automatic Darna Gold tier status: up to 30% off hotel stays and 20% off dining at select hotels, plus golf/padel/country club discounts.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'other',
      title: 'Visa Privileges Bundle (BOGOF Movies, The Entertainer, Bicester Village, BookingBash, Airport Dining, Avis)',
      description: 'Buy 1 Get 1 Free movie tickets, Visa BOGOF The Entertainer, Visa Bicester Village Shopping discounts, Visa BookingBash, Visa airport dining discount, and Avis car rental discount.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual Visa benefit T&Cs.',
      is_active: true,
    },
  ];

  const infinite_benefits = [
    {
      card_id: INFINITE_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion App)',
      description: 'Complimentary access to airport lounges worldwide via the Visa Airport Companion App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking (Select Abu Dhabi Locations)',
      description: 'Complimentary valet parking at select Abu Dhabi locations.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Locations and visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'golf',
      title: 'Golf Privileges',
      description: 'Free golf rounds in the UAE plus up to 40% off premium golf courses worldwide.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Offer — Up to 15,000 Darna Points',
      description: 'Earn up to 15,000 Darna Points (worth up to AED 1,500 at 10 Darna Points = AED 1): 7,500 points on payment of the joining fee + 7,500 points on spending AED 20,000 within the first 3 months.',
      monetary_value_aed: 1500,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'Requires joining fee payment + AED 20,000 spend within first 3 months of card issuance.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Signup Promo — YOUGotaGift HappyYOU Card (AED 500)',
      description: 'One-time signup promotion: YOUGotaGift HappyYOU Card worth AED 500 for new cardholders.',
      monetary_value_aed: 500,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'One-time new cardholder promotion — verify current availability with bank.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'other',
      title: 'Roadside Assistance',
      description: 'Complimentary roadside assistance: vehicle recovery/towing, fuel delivery, and battery boost.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'travel_insurance',
      title: 'Multitrip Travel Insurance + Visa Medical & Travel Assistance',
      description: 'Multitrip travel insurance coverage plus Visa Medical & Travel Assistance services.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Visa benefit T&Cs.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'purchase_protection',
      title: 'Buyers Protection + Business Card Liability Waiver + DoubleSecure',
      description: 'Buyers Protection on eligible purchases, Business Card Liability Waiver, and DoubleSecure protection.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'concierge',
      title: 'Concierge Desk + Visa Digital Concierge',
      description: 'Dedicated concierge desk plus Visa Digital Concierge for travel, dining, and lifestyle assistance.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'tier_status',
      title: 'Complimentary Darna Platinum Tier',
      description: 'Automatic Darna Platinum tier status — the highest generally-available Darna loyalty tier, unlocking the full range of Darna ecosystem privileges.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'other',
      title: 'Visa Privileges Bundle (BOGOF Movies, The Entertainer, Bicester Village, BookingBash, Airport Dining, Avis)',
      description: 'Buy 1 Get 1 Free movie tickets, Visa BOGOF The Entertainer, Visa Bicester Village Shopping discounts, Visa BookingBash, Visa airport dining discount, and Avis car rental discount.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual Visa benefit T&Cs.',
      is_active: true,
    },
  ];

  for (const [label, benefits] of [['Select', select_benefits], ['Signature', signature_benefits], ['Infinite', infinite_benefits]]) {
    console.log(`\n  ${label}:`);
    for (const b of benefits) {
      const { error } = await sb.from('card_benefits').insert(b);
      if (error) { console.error(`    ERROR (${b.benefit_type}):`, error.message); errors++; }
      else console.log(`    OK — ${b.title}`);
    }
  }

  // ─── 6. Verify ──────────────────────────────────────────────────────────────
  console.log('\n[6/6] Verifying final state...');

  const ALL_IDS = [SELECT_ID, SIGNATURE_ID, INFINITE_ID];

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
    console.log(`\n  ${TIERS[tierKey].name}: ${r.length} reward rows, cap=AED ${r[0]?.monthly_cap_reward}/month, general rate=${TIERS[tierKey].genPct}%, Aldar bonus=${TIERS[tierKey].aldarPct}%`);
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
  console.log(`  SELECT_ID:    ${SELECT_ID}`);
  console.log(`  SIGNATURE_ID: ${SIGNATURE_ID}`);
  console.log(`  INFINITE_ID:  ${INFINITE_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

// Add ENBD SHARE Visa Private Credit Card (4th SHARE tier — discovered during
// SHARE Visa Platinum/Signature/Infinite verification, see add_enbd_share_cards.js)
//
// SHARE Rewards Programme (by Majid Al Futtaim) — 10 SHARE Points = AED 1
// (reward_currency_value_aed = 0.1)
//
// Sources:
//   SRC_PRODUCT → tcpdfs/ENBD SHARE Visa Private Credit Card – Elite Banking Benefits _ Emirates NBD.pdf
//     Confirms rate table: 🎁10% SHARE ecosystem (5,000+ stores/18 malls incl. Mall of the
//     Emirates & City Centres) / 2% general domestic+online+international / 0.5% grocery,
//     supermarkets, fast-food restaurants, insurance, car dealerships (outside SHARE) + EU
//     Spends (incl. UK) / 0.2% petroleum, transit, government services, utility payments,
//     real estate, education, telecom. 10 SHARE Points = AED 1. Welcome offer: 10,000 SHARE
//     Points (AED 1,000) + Joining Fee Reversal on AED 40,000 spend in first 3 months.
//     Joining/Annual Fee: AED 1,500 (pre-VAT). Lists "Visa Private" elite/exclusive benefits:
//     DUBZ 15% off home check-in (p.a.), YQ Meet & Assist 25% off (450+ destinations),
//     complimentary BookingBash Pro Ultimate subscription, Agoda 12% off, booking.com up to
//     8% off, IHG 15% off, gettransfer.com 11% off (150 countries), OneVasco Concierge (2
//     free visa concierge services/year + 25% off subsequent for cardholder+family),
//     complimentary Supper Club Signature Dining Membership (up to 60% off / BOGOF, valid
//     until 30 Apr 2026), Bliss Club Beach Discounts (up to 50% off at 50 luxury clubs, valid
//     until 30 Apr 2026), Complimentary Padel Courts Access (4 sessions/year). Higher-end
//     dining discount examples: Palazzo Versace Dubai (Enigma, Amalfi), W Dubai The Palm
//     (Olivino), AkiraBack Al Tasneem, Shabestan, Atrium Café, Fenk Sunset Terrace (20-25%).
//     Also: New Credit Shield Pro (0.99%/month, AED 300k decease, AED 100/day hospitalization,
//     up to AED 60k job-loss/12mo), 0% Installment Plans (page shows 3/6/12/24mo).
//
//   SRC_TC → tcpdfs/ENBD share_visa_credit_card_en_tncs.pdf
//     Table 1.1 (p.4) — Private column: Joining Fee AED 1,500; Welcome Spend Bonus 10,000
//     SHARE pts (AED 1,000) on AED 40,000/3mo (same as Infinite); Joining Fee Reversal on AED
//     40,000/3mo (same as Infinite); Rewards Capping per month: 200,000 SHARE Points (≈AED
//     20,000) — combined account-wide cap across ALL categories (Section 4.6); rates
//     🎁10%/2%/0.5%/0.2% — CONFIRMS product page exactly, no discrepancy.
//
//   SRC_LEAFLET → tcpdfs/ENBD share-a5-leaflet-private-en-updated.pdf
//     Cross-confirms all rates + welcome offer + redemption (10 SHARE Points = AED 1) +
//     SHARE Ecosystem 2025 categories (Lifestyle, Retail, Malls, Hotel Dining, Leisure &
//     Entertainment, Snow — same partner list as Platinum/Signature/Infinite, including
//     5% off Poltrona Frau/Eleventy and 10% off THAT/All Saints/Psycho Bunny/Shiseido/Crate &
//     Barrel/CB2). RESOLVES 24-vs-36-month ambiguity: 0% Installment Plan = 3/6/12/24/36
//     months (same as other 3 tiers — product page's "3,6,12,24" was incomplete).
//     NEW vs Infinite: airport lounge access for cardholder + TWO guests (Infinite = +1
//     guest); Concierge services described as automatic enrollment with NO stated minimum
//     spend (Infinite requires AED 5,000/month); Golf (twice/month, min AED 5,000/month —
//     same as Infinite, marked **); Valet parking at named Abu Dhabi locations (Yas Mall,
//     Ferrari World, Warner Bros, Al Jimi Mall, min AED 5,000/month — Infinite's was
//     unspecified); Roadside assistance (min AED 5,000/month, same as Infinite); VOX BOGOF
//     (min AED 3,500/month, same as Infinite); Airport Transfers in UAE — up to AED 100/ride
//     discount (NEW, not on other 3 tiers); Harrod's Gold Membership (NEW, valid until 30 Apr
//     2026, not on other 3 tiers).
//
//   SRC_KFS → tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf
//     SHARE Private: Joining Fee = AED 1,575, Renewal Fee = AED 1,575, APR = 39.00%
//     (3.25%/month), forex 1.99% — matches Infinite exactly. AED 1,575 = VAT-inclusive figure
//     for the T&C's "AED 1,500" Joining Fee (1,500 x 1.05 = 1,575).
//
//   SRC_FEES → tcpdfs/emiratesnbd_credit_card_fees_charges.pdf
//     "SHARE Private/Infinite: Annual Fee 1,575/1,575, Finance Charges 3.25%/3.25%".
//     International Transaction Fee 1.99% applies to all products except dnata World.
//
// CARD_TIER ENUM MAPPING:
//   The card_tier enum (classic, gold, infinite, platinum, signature, standard, titanium,
//   world, world_elite) has no "private" value. "Visa Private" is Visa's invitation-only
//   tier ABOVE Visa Infinite. Mapped to 'world_elite' — the only enum value representing a
//   tier above 'infinite' (cross-network "ultra-premium" equivalent), consistent with how
//   Darna Select was mapped to 'standard' when its exact name wasn't in the enum.
//
// MIN SALARY:
//   Not published in any of the 5 sources. "Visa Private" / "Elite Banking" tiers are
//   typically issued on an invitation/relationship basis (Emirates NBD Priority/Private
//   Banking), so a min_salary_aed figure may not be publicly disclosed. Set to NULL and
//   flagged ⚠️ "verify with bank" in the card summary — per CLAUDE.md, never guess.
//
// CATEGORY MAPPING (same as Platinum/Signature/Infinite — 17 CardWise categories -> 3 SHARE
// rate buckets, + EU/UK special case):
//   GENERAL (full rate):      dining, online_shopping, shopping, entertainment, healthcare,
//                              airlines, hotels, travel, international (non-EU), general
//   GROCERY-REDUCED:          groceries, insurance, AND "EU Spends (incl. UK)" portion of
//                              international
//   PETROL-REDUCED:           fuel, rent, utilities, education, government
//   🎁 SHARE-ECOSYSTEM BONUS eligible (10%): groceries (Carrefour/Carrefour Market), dining
//   (Hotel Dining at Kempinski MOE/Sheraton MOE/Pullman Deira City Centre/Aloft Deira City
//   Centre + mall F&B), shopping (MAF malls + listed retail brands), entertainment
//   (VOX/Ski Dubai/Snow Abu Dhabi/Magic Planet/Little Explorers/ACTIVATE/iFly).
//
// FLAGGED FOR HUMAN REVIEW (same caveats as other 3 SHARE tiers):
//   - "healthcare": not explicitly listed in any SHARE rate bucket — assumed General rate.
//   - "hotels": hotel ROOM/STAY bookings assumed General rate; only "Hotel Dining" (spa/F&B
//     at the 4 named hotel properties) confirmed part of the SHARE ecosystem bonus.
//   - "utilities": utility bill payments made via the Bank's Online Banking (or any other
//     Bank-provided payment channel) are EXPLICITLY EXCLUDED from earning SHARE Points
//     entirely per SRC_TC — only direct-to-biller payments earn the reduced rate.
//   - min_salary_aed: not published — verify with bank (see above).

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-16';

const SRC_PRODUCT = 'tcpdfs/ENBD SHARE Visa Private Credit Card – Elite Banking Benefits _ Emirates NBD.pdf';
const SRC_TC = 'tcpdfs/ENBD share_visa_credit_card_en_tncs.pdf';
const SRC_LEAFLET = 'tcpdfs/ENBD share-a5-leaflet-private-en-updated.pdf';
const SRC_KFS = 'tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf';
const SRC_FEES = 'tcpdfs/emiratesnbd_credit_card_fees_charges.pdf';

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

const T = {
  name: 'Emirates NBD SHARE Visa Private Credit Card',
  card_tier: 'world_elite',
  annual_fee_aed: 1575,
  min_salary_aed: null,
  interest_rate_monthly_pct: 3.25,
  ecoPct: 10.0, genPct: 2.0, grocPct: 0.5, petrolPct: 0.2,
  monthlyCapPoints: 200000, monthlyCapAed: 20000,
};

function pctFor(slug) {
  if (GROCERY_REDUCED_CATS.includes(slug)) return T.grocPct;
  if (PETROL_REDUCED_CATS.includes(slug)) return T.petrolPct;
  return T.genPct;
}

function capNote() {
  return `⚠️ Shared account-wide cap: ${T.monthlyCapPoints.toLocaleString()} SHARE Points/month (≈AED ${T.monthlyCapAed.toLocaleString()}), combined across ALL spend categories per the "Rewards Capping per month" row in ${SRC_TC} Table 1.1.`;
}

function getNotes(slug) {
  const redemption = '10 SHARE Points = AED 1.';
  const cap = capNote();

  switch (slug) {
    case 'groceries':
      return `${T.grocPct}% SHARE Points back on groceries/supermarkets (outside the SHARE ecosystem) — grouped with fast-food restaurants/insurance/car dealerships per ${SRC_TC} Table 1.1. 🎁 Earns ${T.ecoPct}% at ${SHARE_GROCERY}. ${redemption} ${cap} Source: ${SRC_PRODUCT}, ${SRC_TC}`;
    case 'dining':
      return `${T.genPct}% SHARE Points back on dining (restaurants/cafés) at the General Domestic/International rate. ⚠️ Fast-food/quick-service restaurants are grouped into the reduced-rate bucket and earn ${T.grocPct}% instead, per ${SRC_TC}. 🎁 Earns ${T.ecoPct}% at ${SHARE_DINING}. ${redemption} ${cap} Source: ${SRC_PRODUCT}, ${SRC_TC}`;
    case 'fuel':
      return `${T.petrolPct}% SHARE Points back on fuel/petrol station spend — reduced rate, grouped with transit/government services/utility payments/real estate/education/telecom per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'rent':
      return `${T.petrolPct}% SHARE Points back — mapped from "real estate" in the reduced-rate bucket per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'utilities':
      return `${T.petrolPct}% SHARE Points back on utility bill payments & telecom (DEWA/Etisalat/du/SEWA/FEWA/Salik) — reduced rate per ${SRC_TC} Table 1.1. ⚠️ Utility bill payments made through the Bank's Online Banking (or any other Bank-provided payment channel) are EXPLICITLY EXCLUDED from earning SHARE Points entirely per ${SRC_TC} — only payments made directly to the biller (outside ENBD's own payment channels) earn ${T.petrolPct}%. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'education':
      return `${T.petrolPct}% SHARE Points back on education/school fees/tuition — reduced rate, grouped with petroleum/transit/government services/utility payments/real estate/telecom per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'insurance':
      return `${T.grocPct}% SHARE Points back on insurance premium payments — grouped with groceries/supermarkets/fast-food restaurants/car dealerships per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'online_shopping':
      return `${T.genPct}% SHARE Points back on online shopping/e-commerce (Amazon.ae, Noon, etc.) at the General Domestic/International rate. Amazon.ae/Noon are not SHARE-ecosystem (MAF) brands, so no 🎁 ecosystem bonus applies. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'shopping':
      return `${T.genPct}% SHARE Points back on shopping at the General Domestic/International rate. 🎁 Earns ${T.ecoPct}% at ${SHARE_SHOPPING}. ${redemption} ${cap} Source: ${SRC_PRODUCT}, ${SRC_TC}`;
    case 'entertainment':
      return `${T.genPct}% SHARE Points back on entertainment at the General Domestic/International rate. 🎁 Earns ${T.ecoPct}% at ${SHARE_ENTERTAINMENT}. ${redemption} ${cap} Source: ${SRC_PRODUCT}, ${SRC_TC}`;
    case 'healthcare':
      return `${T.genPct}% SHARE Points back on healthcare (hospitals/clinics/pharmacies). ⚠️ Healthcare is not explicitly listed as a distinct category in the SHARE rate table (Table 1.1) — assumed to fall under the "General Domestic/International" default rate. Verify with bank. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'airlines':
      return `${T.genPct}% SHARE Points back on airline ticket purchases at the General Domestic/International rate. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'hotels':
      return `${T.genPct}% SHARE Points back on hotel bookings/stays at the General Domestic/International rate. ⚠️ "Hotel Dining" — spa & F&B outlets at Kempinski Mall of the Emirates, Sheraton Mall of the Emirates, Pullman Deira City Centre, and Aloft Deira City Centre — IS part of the SHARE ecosystem and earns 🎁 ${T.ecoPct}% (see "dining" category notes), but the hotel ROOM/STAY booking itself is not confirmed to earn the ecosystem bonus rate at any property. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'travel':
      return `${T.genPct}% SHARE Points back on travel agencies/booking platforms/car rentals at the General Domestic/International rate. ⚠️ Note: discounted bookings via the Visa Private-exclusive Agoda (12% off)/booking.com (up to 8% off)/IHG (15% off)/gettransfer.com (11% off) partnerships are separate merchant-level DISCOUNTS, not additional SHARE Points. ${redemption} ${cap} Source: ${SRC_PRODUCT}, ${SRC_TC}`;
    case 'international':
      return `${T.genPct}% SHARE Points back on international spend at the General Domestic/International rate. ⚠️ "EU Spends (including UK)" are EXPLICITLY listed as a SEPARATE row in ${SRC_TC} Table 1.1 and earn the REDUCED rate of ${T.grocPct}% instead — the SAME rate as groceries/fast-food restaurants/insurance/car dealerships — NOT the general rate. Non-EU international spend earns the general ${T.genPct}% rate. Foreign-currency transaction fee of 1.99% (${SRC_FEES}, ${SRC_KFS}) applies separately on all foreign-currency transactions and does not affect SHARE Points earning. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'government':
      return `${T.petrolPct}% SHARE Points back on government services/fees — reduced rate, grouped with petroleum/transit/utility payments/real estate/education/telecom per ${SRC_TC} Table 1.1. ${redemption} ${cap} Source: ${SRC_TC}`;
    case 'general':
      return `${T.genPct}% SHARE Points back (General Domestic/International rate — the standard rate applied to all spend not in a special-rate bucket). ${redemption} ${cap} Source: ${SRC_TC}`;
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

  let PRIVATE_ID;

  // ─── 1. Insert SHARE Visa Private card ─────────────────────────────────────
  console.log('\n[1/3] Inserting SHARE Visa Private card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: T.name,
        card_network: 'visa',
        card_tier: T.card_tier,
        annual_fee_aed: T.annual_fee_aed,
        min_salary_aed: T.min_salary_aed,
        reward_currency_name: 'SHARE Points',
        reward_currency_value_aed: 0.1,
        base_earn_rate: T.genPct / 10,   // 2% general = 0.20 SHARE Points/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: T.interest_rate_monthly_pct,
        lounge_access_count: null,   // Visa Airport Companion App — cardholder + 2 guests, unlimited
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,   // select Abu Dhabi locations (Yas Mall, Ferrari World, Warner Bros, Al Jimi Mall), min AED 5,000/month
        travel_insurance: false,
        purchase_protection: true,
        concierge: true,             // automatic enrollment, no stated minimum spend
        airport_transfer_count: null, // discount-based (up to AED 100/ride), not a free-count benefit
        source_url: SRC_PRODUCT,
        summary: [
          `VERIFIED ${TODAY}. Emirates NBD SHARE Visa Private Credit Card — 4th SHARE tier`,
          '(discovered during SHARE Visa Platinum/Signature/Infinite verification; per',
          'CLAUDE.md\'s "Key Principle", entered as a SEPARATE card because its per-category',
          "reward PERCENTAGES genuinely DIFFER from Infinite's).",
          `Joining/Annual Fee: AED 1,575 (VAT-inclusive, CONFIRMED ${SRC_KFS}, ${SRC_FEES} —`,
          `consistent with the T&C's "AED 1,500" pre-VAT figure x 1.05). Interest: 3.25%/month`,
          '(39.00% APR).',
          '⚠️ card_tier mapped to "world_elite" — "Visa Private" (Visa\'s invitation-only tier',
          'above Visa Infinite) is not in the card_tier enum (classic/gold/infinite/platinum/',
          'signature/standard/titanium/world/world_elite); world_elite is the only enum value',
          'representing a tier above infinite.',
          '⚠️ min_salary_aed: NOT PUBLISHED in any of the 5 source documents — "Visa',
          'Private"/"Elite Banking" tiers are typically issued on an invitation/relationship',
          'basis (Emirates NBD Priority/Private Banking). Verify with bank.',
          'SHARE POINTS EARNING (10 SHARE Points = AED 1):',
          '2% general (Domestic/International); 🎁 10% at SHARE-ecosystem destinations (5,000+',
          'stores across 18 malls in the UAE, including Mall of the Emirates and City Centres,',
          'Carrefour, Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic Planet, and more);',
          '0.5% on groceries/supermarkets/fast-food restaurants/insurance/car dealerships',
          '(outside SHARE) AND on "EU Spends (including UK)";',
          '0.2% on fuel/transit/government services/utility payments/real estate/education/telecom.',
          `⚠️ Account-wide cap: ${T.monthlyCapPoints.toLocaleString()} SHARE Points/month (≈AED ${T.monthlyCapAed.toLocaleString()}), per ${SRC_TC} Table 1.1.`,
          'WELCOME OFFER: 10,000 SHARE Points (worth AED 1,000) + Joining Fee Reversal, both on',
          `spending AED 40,000 within the first 3 months, per ${SRC_PRODUCT} and ${SRC_TC} Table 1.1`,
          '(identical structure to SHARE Infinite).',
          'BENEFITS: unlimited complimentary airport lounge access for cardholder + TWO guests',
          '(upgrade vs Infinite\'s +1 guest) at 1,200+ premium lounges in 300+ cities worldwide',
          'via the Visa Airport Companion App; Concierge services (automatic enrollment, no',
          'stated minimum spend — upgrade vs Infinite\'s AED 5,000/month requirement); Golf',
          'Privileges (free golf in UAE up to twice/month, min AED 5,000/month spend, + up to',
          '40% off premium golf worldwide); complimentary Valet Parking at select Abu Dhabi',
          'locations (Yas Mall, Ferrari World, Warner Bros, Al Jimi Mall, min AED 5,000/month',
          'spend); 24/7 Roadside Assistance (min AED 5,000/month spend); Buy 1 Get 1 Free VOX',
          'Cinemas tickets (min AED 3,500/month spend); 0% Installment Plan (3/6/12/24/36',
          'months, CONFIRMED via leaflet); Purchase Protection + Extended Warranty (+12',
          'months); New Credit Shield Pro (optional, 0.99%/month, AED 300,000 decease cover,',
          'AED 100/day hospitalization cash benefit, up to AED 60,000 job-loss cover for 12',
          'months); SHARE App — up to an additional 3% back on purchases within the SHARE',
          'ecosystem; exclusive SHARE Ecosystem 2025 discounts (ACTIVATE 25% off, Ski Dubai',
          'free Snow Bullet experience, Snow Abu Dhabi 20% off, Magic Planet 20% extra points',
          '+ 5 free rides, 10% off THAT Concept Store/All Saints/Psycho Bunny/Shiseido/Crate &',
          'Barrel/CB2, 5% off Poltrona Frau/Eleventy); premium dining discounts of 20-25% at',
          'select restaurants (examples: Palazzo Versace Dubai — Enigma/Amalfi, W Dubai The',
          'Palm — Olivino, AkiraBack Al Tasneem, Shabestan, Atrium Café, Fenk Sunset Terrace).',
          'VISA PRIVATE-EXCLUSIVE BENEFITS (NOT on Platinum/Signature/Infinite): 15% off DUBZ',
          'home check-in (per annum); 25% off YQ Meet & Assist at 450+ destinations;',
          'complimentary BookingBash Pro Ultimate subscription; 12% off Agoda (hotels &',
          'vacation rentals); up to 8% off booking.com; 15% off IHG; 11% off gettransfer.com',
          '(150 countries); OneVasco Concierge — 2 complimentary visa application concierge',
          'services/year + 25% off subsequent applications for cardholder + immediate family;',
          'complimentary Supper Club Signature Dining Membership (up to 60% off / buy-1-get-1',
          'free dining, unlimited bookings + guest privileges — offer valid until 30 Apr',
          '2026); Bliss Club Beach Discounts (up to 50% off pool/beach access at 50 luxury',
          'beach clubs — offer valid until 30 Apr 2026); complimentary Padel Courts Access (up',
          'to 4 bookings/year, 48hr advance booking required); Harrod\'s Gold Membership',
          '(year-round benefits — offer valid until 30 Apr 2026); Airport Transfers in UAE —',
          'discount of up to AED 100 per ride.',
          `Forex markup: 1.99% (${SRC_FEES}, ${SRC_KFS}) — International Transaction Fee`,
          'applies to all ENBD card products except dnata World.',
          `Sources: ${SRC_PRODUCT}, ${SRC_TC}, ${SRC_LEAFLET}, ${SRC_KFS}, ${SRC_FEES}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { PRIVATE_ID = data.id; console.log(`  OK — PRIVATE_ID: ${PRIVATE_ID}`); }
  }

  if (!PRIVATE_ID) {
    console.error('\nCard insertion failed — aborting');
    process.exit(1);
  }

  // ─── 2. card_rewards (17) ───────────────────────────────────────────────────
  console.log('\n[2/3] Inserting card_rewards (17)...');
  for (const slug of SLUGS_ALL) {
    const catId = cat[slug];
    if (!catId) { console.error(`    ERROR: unknown slug ${slug}`); errors++; continue; }
    const pct = pctFor(slug);
    const { error } = await sb.from('card_rewards').insert({
      card_id: PRIVATE_ID,
      category_id: catId,
      reward_type: 'points',
      earn_rate: pct / 10,          // SHARE Points per AED (1 SHARE Point = AED 0.1)
      earn_unit: 'per_aed',
      effective_return_pct: pct,
      monthly_cap_reward: T.monthlyCapAed,
      source_url: SRC_TC,
      last_verified_date: TODAY,
      is_active: true,
      notes: getNotes(slug),
    });
    if (error) { console.error(`    ERROR (${slug}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ─── 3. card_benefits ───────────────────────────────────────────────────────
  console.log('\n[3/3] Inserting card_benefits...');

  const ECOSYSTEM_DISCOUNTS_DESC = 'ACTIVATE 25% off (excl. public holidays); Ski Dubai free Snow Bullet experience (1x, with Snow Fun package purchase); Snow Abu Dhabi 20% off (excl. public holidays); Magic Planet — package >AED 155 unlocks 20% additional points + 5 free blue swiper rides; 10% off at THAT Concept Store, All Saints, Psycho Bunny, Shiseido, Crate & Barrel, and CB2; 5% off at Poltrona Frau and Eleventy.';

  const private_benefits = [
    {
      card_id: PRIVATE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Offer — 10,000 SHARE Points + Joining Fee Reversal',
      description: 'Earn 10,000 SHARE Points (worth AED 1,000 at 10 SHARE Points = AED 1) AND a reversal of the AED 1,575 Joining Fee, both on spending AED 40,000 within the first 3 months.',
      monetary_value_aed: 1000,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'Requires AED 40,000 spend within first 3 months of card issuance. Joining Fee Reversal value (AED 1,575) is in addition to the AED 1,000 points value. Credited within 6-8 weeks of meeting the criteria.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion App) — Cardholder + 2 Guests',
      description: 'Unlimited complimentary access to over 1,200 premium airport lounges in more than 300 cities worldwide, via the Visa Airport Companion App, for the cardholder plus 2 guests.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Upgrade vs Infinite (cardholder + 1 guest).',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'concierge',
      title: 'Concierge Services (Automatic Enrollment)',
      description: 'Automatic enrollment in dedicated concierge services covering airport drop-offs, car servicing and registration, local courier services, and more.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'No stated minimum spend (upgrade vs Infinite, which requires AED 5,000/month).',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'golf',
      title: 'Golf Privileges',
      description: 'Complimentary golf access in the UAE (up to twice per month) plus up to 40% off premium golf courses worldwide.',
      monetary_value_aed: null,
      usage_limit: 2,
      usage_period: 'monthly',
      conditions: 'Free UAE golf requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking (Select Abu Dhabi Locations)',
      description: 'Complimentary valet parking at select Abu Dhabi locations including Yas Mall, Ferrari World, Warner Bros, and Al Jimi Mall.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
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
      card_id: PRIVATE_ID,
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
      card_id: PRIVATE_ID,
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
      card_id: PRIVATE_ID,
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
      card_id: PRIVATE_ID,
      benefit_type: 'credit_shield',
      title: 'New Credit Shield Pro (Optional)',
      description: 'Optional Credit Shield Pro insurance: AED 300,000 cover in case of death, AED 100/day hospitalization cash benefit, and up to AED 60,000 job-loss cover for 12 months.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Optional add-on, 0.99%/month fee.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
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
      card_id: PRIVATE_ID,
      benefit_type: 'entertainment_discount',
      title: 'Exclusive SHARE Ecosystem Discounts (Incl. Poltrona Frau/Eleventy)',
      description: ECOSYSTEM_DISCOUNTS_DESC,
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to individual partner T&Cs; some exclude public holidays.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Premium Dining Discounts (20-25% at Select Restaurants)',
      description: '20-25% dining discounts at select premium partner restaurants, including Palazzo Versace Dubai (Enigma, Amalfi), W Dubai The Palm (Olivino), AkiraBack Al Tasneem, Shabestan, Atrium Café, and Fenk Sunset Terrace.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Restaurant list and exact discount tiers per product T&Cs — verify with bank.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'DUBZ Home Check-In Discount (15%, Per Annum)',
      description: '15% discount on home check-in service through DUBZ, once per annum.',
      monetary_value_aed: null,
      usage_limit: 1,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'YQ Meet & Assist Discount (25%, 450+ Destinations)',
      description: '25% off YQ (Meet & Assist) airport meet-and-greet service at over 450 destinations worldwide.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Complimentary BookingBash Pro Ultimate Subscription',
      description: 'Complimentary subscription to BookingBash Pro Ultimate.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Travel Booking Discounts (Agoda, booking.com, IHG, gettransfer.com)',
      description: '12% off Agoda (hotels and vacation rentals); up to 8% off booking.com; 15% off IHG; 11% off gettransfer.com at 150 countries.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit. Subject to individual partner T&Cs.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'OneVasco Visa Application Concierge',
      description: 'Two complimentary visa application concierge services per year, plus a 25% discount on subsequent applications, for the cardholder and immediate family.',
      monetary_value_aed: null,
      usage_limit: 2,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Complimentary Supper Club Signature Dining Membership',
      description: 'Access to Supper Club\'s Signature Dining Membership: up to 60% off or buy-1-get-1-free dining offers, discreetly applied to the bill, with unlimited bookings and guest privileges.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit. Offer valid until 30 Apr 2026.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Bliss Club Beach Discounts',
      description: 'Complimentary Bliss Club Membership: up to 50% off pool and beach access at 50 of the region\'s most luxurious beach clubs.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit. Offer valid until 30 Apr 2026.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Complimentary Padel Courts Access',
      description: 'Up to 4 padel court bookings per year.',
      monetary_value_aed: null,
      usage_limit: 4,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit. Subject to availability; bookings must be made at least 48 hours in advance.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Harrod\'s Gold Membership',
      description: 'Harrods Gold Membership with year-round benefits.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit. Offer valid until 30 Apr 2026.',
      is_active: true,
    },
    {
      card_id: PRIVATE_ID,
      benefit_type: 'other',
      title: 'Airport Transfers in UAE (Up to AED 100 Off Per Ride)',
      description: 'Discount of up to AED 100 per ride on airport transfer bookings in the UAE.',
      monetary_value_aed: 100,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa Private-exclusive benefit.',
      is_active: true,
    },
  ];

  for (const b of private_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`    ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`    OK — ${b.title}`);
  }

  // ─── Verify ─────────────────────────────────────────────────────────────────
  console.log('\nVerifying final state...');

  const { data: card } = await sb
    .from('cards')
    .select('id, name, card_tier, min_salary_aed, annual_fee_aed, interest_rate_monthly_pct')
    .eq('id', PRIVATE_ID).single();
  console.log(`  ${card.name}`);
  console.log(`    tier=${card.card_tier}, salary=${card.min_salary_aed}, fee=${card.annual_fee_aed}, interest=${card.interest_rate_monthly_pct}%`);

  const { data: rewards } = await sb
    .from('card_rewards')
    .select('effective_return_pct, monthly_cap_reward')
    .eq('card_id', PRIVATE_ID);
  console.log(`\n  ${T.name}: ${rewards.length} reward rows, cap=AED ${rewards[0]?.monthly_cap_reward}/month, general rate=${T.genPct}%, SHARE ecosystem bonus=${T.ecoPct}%`);

  const { data: benefits } = await sb
    .from('card_benefits')
    .select('benefit_type, title')
    .eq('card_id', PRIVATE_ID);
  console.log(`\n  card_benefits (${benefits.length} total):`);
  for (const b of benefits) console.log(`    ${b.benefit_type} — ${b.title}`);

  // ─── Done ───────────────────────────────────────────────────────────────────
  console.log('\nDone.');
  if (errors === 0) console.log('  All data inserted successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);

  console.log(`\nCard ID: ${PRIVATE_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

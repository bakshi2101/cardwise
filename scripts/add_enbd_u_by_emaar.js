// Add ENBD U by Emaar Family / Signature / Infinite Credit Cards
//
// DISCOVERY: "U by Emaar" is marketed as one co-branded line but the T&Cs reveal
// THREE distinct products (Family, Signature, Infinite) with different annual
// fees, min salaries, base UPoints rates, and benefit packages. Per CLAUDE.md
// "Discovering Card Variants" rules, these are entered as 3 separate cards.
//
// Sources:
//   SRC_FAMILY → tcpdfs/ENBD U by Emaar Visa Family Credit Card _ Emaar Card Benefits _ U by Emaar Family Credit Card _ Emirates NBD.pdf
//     Min salary AED 5,000. Annual fee: Free for life (AED 0). Interest 3.49%/month.
//     UPoints: 1% base, 5x (5%) at Emaar, 25% (0.25%) groceries/supermarkets,
//     10% (0.10%) fuel/government/telecom/education/rent.
//
//   SRC_SIGNATURE → tcpdfs/ENBD U By Emaar Visa Signature Credit Cards _ ubyemaar Credit Card _ Emirates NBD.pdf
//     Min salary AED 12,000. Joining fee AED 525. Annual fee AED 262.50. Interest 3.25%/month.
//     UPoints: 1.25% base, 6.25% (5x) at Emaar. U By Emaar Gold status.
//     Lounge access 1000+ via Visa Airport Companion App (count unspecified).
//
//   SRC_INFINITE → tcpdfs/ENBD U by Emaar infinite Credit Cards _ Emaar Visa Credit Card Benefits in Dubai, UAE _ Emirates NBD.pdf
//     Min salary AED 30,000. Joining fee AED 2,625. Annual fee AED 1,575. Interest 3.25%/month.
//     UPoints: 1.5% base, 7.5% (5x) at Emaar. U By Emaar Platinum status.
//     Welcome bonus up to 25,000 UPoints. Concierge. Valet at Grand Drive, Dubai Mall.
//     Lounge access 1000+ via Visa Airport Companion App (count unspecified).
//
//   SRC_CC_TC → tcpdfs/ENBD u_by_emaar_signature_cc_tc.pdf (the actual ENBD credit card T&C, EN+AR)
//     CONFIRMS annual UPoints caps: Infinite 1,000,000/yr, Signature 200,000/yr, Family 100,000/yr
//     (÷12 → 83,333 / 16,666 / 8,333 per month — combined account-wide cap across ALL categories).
//     CONFIRMS: utility bills paid via the Bank's online banking channels do NOT earn UPoints.
//     CONFIRMS: cash advances, balance transfers, fees, foreign-currency transactions, exchange
//     house transactions, and disputed transactions are excluded from UPoints earning.
//
// REWARD CURRENCY: 1 UPoint = AED 0.1 (10 UPoints = AED 1) → reward_currency_value_aed = 0.1
//   effective_return_pct = (UPoints earned per AED) × 0.1 × 100 = UPoints/AED × 10
//
// CATEGORY-TIERED EARNING (per U by Emaar earning T&Cs, confirmed via SRC_CC_TC):
//   - 5x base rate ("Emaar bonus") at Emaar malls, Emaar Hospitality Group hotels/restaurants
//     (Address, Rove, Vida), and Emaar Entertainment Group venues.
//   - 25% of base rate for groceries/supermarkets and insurance.
//   - 10% of base rate for fuel, government services, utilities (incl. telecom), education, rent.
//   - All other categories earn the base rate.
//
// ASSUMPTIONS / FLAGGED FOR HUMAN REVIEW:
//   - forex_markup_pct: no PDF states this explicitly for U by Emaar. Using 1.99%
//     (ENBD's standard Visa markup, consistent with Go4it cards) — ⚠️ Verify with bank.
//   - "rent" category mapping: T&C lists "real estate" in the 10%-tier group — ⚠️ Verify
//     this covers residential rent payments specifically.
//   - "international" category: stored at base rate; forex markup itself is the
//     assumed 1.99% above — ⚠️ Verify with bank.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-15';

const SRC_FAMILY = 'tcpdfs/ENBD U by Emaar Visa Family Credit Card _ Emaar Card Benefits _ U by Emaar Family Credit Card _ Emirates NBD.pdf';
const SRC_SIGNATURE = 'tcpdfs/ENBD U By Emaar Visa Signature Credit Cards _ ubyemaar Credit Card _ Emirates NBD.pdf';
const SRC_INFINITE = 'tcpdfs/ENBD U by Emaar infinite Credit Cards _ Emaar Visa Credit Card Benefits in Dubai, UAE _ Emirates NBD.pdf';
const SRC_CC_TC = 'tcpdfs/ENBD u_by_emaar_signature_cc_tc.pdf';

const SLUGS_ALL = [
  'dining', 'groceries', 'fuel', 'airlines', 'shopping', 'hotels',
  'travel', 'online_shopping', 'entertainment', 'utilities',
  'education', 'insurance', 'government', 'rent', 'healthcare',
  'international', 'general',
];

const TEN_PCT_CATS = ['fuel', 'government', 'utilities', 'education', 'rent'];
const TWENTYFIVE_PCT_CATS = ['groceries', 'insurance'];

const TIERS = {
  FAMILY: {
    name: 'Emirates NBD U by Emaar Family Credit Card',
    basePct: 1.0, tenPct: 0.10, twentyfivePct: 0.25, emaarPct: 5.0,
    annualCap: 100000, monthlyCap: 8333, src: SRC_FAMILY,
  },
  SIGNATURE: {
    name: 'Emirates NBD U by Emaar Signature Credit Card',
    basePct: 1.25, tenPct: 0.125, twentyfivePct: 0.3125, emaarPct: 6.25,
    annualCap: 200000, monthlyCap: 16666, src: SRC_SIGNATURE,
  },
  INFINITE: {
    name: 'Emirates NBD U by Emaar Infinite Credit Card',
    basePct: 1.5, tenPct: 0.15, twentyfivePct: 0.375, emaarPct: 7.5,
    annualCap: 1000000, monthlyCap: 83333, src: SRC_INFINITE,
  },
};

// Build notes text per category for a given tier config
function getNotes(slug, t) {
  const capNote = `⚠️ Shared account-wide cap: ${t.monthlyCap} UPoints/month (${t.annualCap} UPoints/year ÷ 12), combined across ALL spend categories (confirmed in ${SRC_CC_TC}).`;
  const redemption = `10 UPoints = AED 1.`;

  if (slug === 'groceries') {
    return `${t.twentyfivePct}% UPoints back. ⚠️ Reduced rate — groceries & supermarkets earn 25% of the ${t.basePct}% base rate per U by Emaar earning T&Cs. ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'insurance') {
    return `${t.twentyfivePct}% UPoints back. ⚠️ Reduced rate — insurance premium payments earn 25% of the ${t.basePct}% base rate per U by Emaar earning T&Cs. ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'fuel') {
    return `${t.tenPct}% UPoints back. ⚠️ Reduced rate — fuel station spend earns 10% of the ${t.basePct}% base rate per U by Emaar earning T&Cs. ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'government') {
    return `${t.tenPct}% UPoints back. ⚠️ Reduced rate — government services spend earns 10% of the ${t.basePct}% base rate per U by Emaar earning T&Cs. ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'education') {
    return `${t.tenPct}% UPoints back. ⚠️ Reduced rate — school fees/education spend earns 10% of the ${t.basePct}% base rate per U by Emaar earning T&Cs. ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'rent') {
    return `${t.tenPct}% UPoints back. ⚠️ Reduced rate — mapped from "real estate" in the 10%-tier group of U by Emaar earning T&Cs (10% of the ${t.basePct}% base rate). Verify with bank that this covers residential rent payments specifically. ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'utilities') {
    return `${t.tenPct}% UPoints back. ⚠️ Reduced rate — utilities (incl. telecom: Etisalat/du) earn 10% of the ${t.basePct}% base rate per U by Emaar earning T&Cs. ⚠️ Utility bills paid via the Bank's online banking channels do NOT earn UPoints at all (confirmed in ${SRC_CC_TC}). ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'dining') {
    return `${t.basePct}% UPoints back. 🎁 5x bonus = ${t.emaarPct}% on dining at Emaar Hospitality Group restaurants (e.g. Atmosphere, Thiptara at Address/Rove/Vida). ⚠️ Fast-food/quick-service restaurants earn at the reduced rate of ${t.twentyfivePct}% (25% of base) instead of ${t.basePct}%, per U by Emaar earning T&Cs. ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'hotels') {
    return `${t.basePct}% UPoints back. 🎁 5x bonus = ${t.emaarPct}% on stays at Emaar Hospitality Group hotels (Address, Rove, Vida), which also unlock F&B/spa discounts and room/suite upgrades (see card_benefits). ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'shopping') {
    return `${t.basePct}% UPoints back. 🎁 5x bonus = ${t.emaarPct}% on spend at Emaar malls (The Dubai Mall, Dubai Marina Mall, Dubai Hills Mall). ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'entertainment') {
    return `${t.basePct}% UPoints back. 🎁 5x bonus = ${t.emaarPct}% at Emaar Entertainment Group venues (Dubai Underwater Zoo, KidZania Dubai, Dubai Ice Rink, Reel Cinemas, etc.), which also carry up to 30% discounts (see card_benefits). ${redemption} ${capNote} Source: ${t.src}`;
  }
  if (slug === 'international') {
    return `${t.basePct}% UPoints back on international spend at the base rate. ⚠️ Foreign-currency transaction processing fee (assumed 1.99% — not confirmed in any U by Emaar product PDF, verify with bank) applies separately and does not affect UPoints earning. ${redemption} ${capNote} Source: ${t.src}`;
  }
  // default: base rate, no special notes
  return `${t.basePct}% UPoints back (standard base rate). ${redemption} ${capNote} Source: ${t.src}`;
}

function pctFor(slug, t) {
  if (TEN_PCT_CATS.includes(slug)) return t.tenPct;
  if (TWENTYFIVE_PCT_CATS.includes(slug)) return t.twentyfivePct;
  return t.basePct;
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

  let FAMILY_ID, SIGNATURE_ID, INFINITE_ID;

  // ─── 1. Insert U by Emaar Family ───────────────────────────────────────────
  console.log('\n[1/8] Inserting U by Emaar Family card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: TIERS.FAMILY.name,
        card_network: 'visa',
        card_tier: 'standard',
        annual_fee_aed: 0,
        min_salary_aed: 5000,
        reward_currency_name: 'UPoints',
        reward_currency_value_aed: 0.1,
        base_earn_rate: 0.1,        // 1.0% base = 0.1 UPoints/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,     // ⚠️ assumed (ENBD standard Visa markup), not confirmed in PDF
        interest_rate_monthly_pct: 3.49,
        lounge_access_count: null,
        lounge_access_network: null,
        valet_parking_count: null,
        travel_insurance: false,
        purchase_protection: false,
        concierge: false,
        airport_transfer_count: null,
        source_url: SRC_FAMILY,
        summary: [
          'VERIFIED 2026-06-15. ENBD U by Emaar Family Credit Card — "Free for life" (AED 0 annual fee).',
          'DISCOVERED CARD VARIANT: U by Emaar is marketed as one line but the T&C reveals 3 distinct',
          'products (Family / Signature / Infinite) with different fees, min salaries, and UPoints rates.',
          'Min salary: AED 5,000. Interest: 3.49%/month.',
          'UPOINTS EARNING (10 UPoints = AED 1):',
          '1% base on all spend; 🎁 5x bonus (5%) at Emaar malls, Emaar Hospitality Group hotels/',
          'restaurants (Address/Rove/Vida) & Emaar Entertainment Group;',
          '25% of base (0.25%) on groceries/supermarkets & insurance;',
          '10% of base (0.10%) on fuel, government services, utilities (incl. telecom), education, real estate/rent.',
          '⚠️ Account-wide cap: 8,333 UPoints/month (100,000/year ÷ 12), confirmed in ' + SRC_CC_TC + '.',
          'BENEFITS: Buy 1 Get 1 Free movie tickets at Reel Cinemas; up to 30% off Emaar Entertainment',
          'Group; 10% off F&B & spas at Emaar Hospitality Group hotels (Address/Rove/Vida).',
          'No lounge access, no travel insurance, no concierge on this entry-level tier.',
          'Forex markup: 1.99% assumed (ENBD standard Visa rate) — ⚠️ not explicitly confirmed for this card, verify with bank.',
          'Sources: U by Emaar Family product page PDF + ENBD U by Emaar credit card T&C (EN/AR).',
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { FAMILY_ID = data.id; console.log(`  OK — FAMILY_ID: ${FAMILY_ID}`); }
  }

  // ─── 2. Insert U by Emaar Signature ────────────────────────────────────────
  console.log('\n[2/8] Inserting U by Emaar Signature card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: TIERS.SIGNATURE.name,
        card_network: 'visa',
        card_tier: 'signature',
        annual_fee_aed: 262.50,
        min_salary_aed: 12000,
        reward_currency_name: 'UPoints',
        reward_currency_value_aed: 0.1,
        base_earn_rate: 0.125,      // 1.25% base = 0.125 UPoints/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,     // ⚠️ assumed (ENBD standard Visa markup), not confirmed in PDF
        interest_rate_monthly_pct: 3.25,
        lounge_access_count: null,  // "1000+ lounges" via Visa Airport Companion, visit count unspecified
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,
        travel_insurance: true,     // Visa Medical & Travel Assistance / free insurance <180 days
        purchase_protection: false,
        concierge: false,
        airport_transfer_count: null,
        source_url: SRC_SIGNATURE,
        summary: [
          'VERIFIED 2026-06-15. ENBD U by Emaar Signature Credit Card.',
          'DISCOVERED CARD VARIANT: U by Emaar is marketed as one line but the T&C reveals 3 distinct',
          'products (Family / Signature / Infinite) with different fees, min salaries, and UPoints rates.',
          'Joining fee AED 525. Annual fee AED 262.50. Min salary: AED 12,000. Interest: 3.25%/month.',
          'UPOINTS EARNING (10 UPoints = AED 1):',
          '1.25% base on all spend; 🎁 5x bonus (6.25%) at Emaar malls, Emaar Hospitality Group hotels/',
          'restaurants (Address/Rove/Vida) & Emaar Entertainment Group;',
          '0.3125% (25% of base) on groceries/supermarkets & insurance;',
          '0.125% (10% of base) on fuel, government services, utilities (incl. telecom), education, real estate/rent.',
          '⚠️ Account-wide cap: 16,666 UPoints/month (200,000/year ÷ 12), confirmed in ' + SRC_CC_TC + '.',
          'STATUS: Automatic U By Emaar Gold tier status.',
          'BENEFITS: Airport lounge access (1000+ lounges via Visa Airport Companion App, visit count',
          'unspecified); Buy 1 Get 1 Free movie tickets at Reel Cinemas (min monthly spend AED 5,000);',
          'up to 30% off Emaar Entertainment Group; 15% off F&B & spas + complimentary room upgrade at',
          'Emaar Hospitality Group hotels (Address/Rove/Vida); Visa Medical & Travel Assistance, free travel',
          'insurance for trips <180 days, Agoda discounts, Visa airport dining discount.',
          'New Credit Shield Pro available as optional add-on at 0.99%/month.',
          'Forex markup: 1.99% assumed (ENBD standard Visa rate) — ⚠️ not explicitly confirmed for this card, verify with bank.',
          'Sources: U by Emaar Signature product page PDF + ENBD U by Emaar credit card T&C (EN/AR).',
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { SIGNATURE_ID = data.id; console.log(`  OK — SIGNATURE_ID: ${SIGNATURE_ID}`); }
  }

  // ─── 3. Insert U by Emaar Infinite ─────────────────────────────────────────
  console.log('\n[3/8] Inserting U by Emaar Infinite card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: TIERS.INFINITE.name,
        card_network: 'visa',
        card_tier: 'infinite',
        annual_fee_aed: 1575,
        min_salary_aed: 30000,
        reward_currency_name: 'UPoints',
        reward_currency_value_aed: 0.1,
        base_earn_rate: 0.15,       // 1.5% base = 0.15 UPoints/AED
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,     // ⚠️ assumed (ENBD standard Visa markup), not confirmed in PDF
        interest_rate_monthly_pct: 3.25,
        lounge_access_count: null,  // "1000+ lounges" via Visa Airport Companion, visit count unspecified
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,  // complimentary valet at Grand Drive, Dubai Mall; count unspecified
        travel_insurance: true,     // Visa Medical & Travel Assistance / free insurance <180 days
        purchase_protection: false,
        concierge: true,            // Concierge services + Visa Digital Concierge
        airport_transfer_count: null,
        source_url: SRC_INFINITE,
        summary: [
          'VERIFIED 2026-06-15. ENBD U by Emaar Infinite Credit Card.',
          'DISCOVERED CARD VARIANT: U by Emaar is marketed as one line but the T&C reveals 3 distinct',
          'products (Family / Signature / Infinite) with different fees, min salaries, and UPoints rates.',
          'Joining fee AED 2,625. Annual fee AED 1,575. Min salary: AED 30,000. Interest: 3.25%/month.',
          'UPOINTS EARNING (10 UPoints = AED 1):',
          '1.5% base on all spend; 🎁 5x bonus (7.5%) at Emaar malls, Emaar Hospitality Group hotels/',
          'restaurants (Address/Rove/Vida) & Emaar Entertainment Group;',
          '0.375% (25% of base) on groceries/supermarkets & insurance;',
          '0.15% (10% of base) on fuel, government services, utilities (incl. telecom), education, real estate/rent.',
          '⚠️ Account-wide cap: 83,333 UPoints/month (1,000,000/year ÷ 12), confirmed in ' + SRC_CC_TC + '.',
          'STATUS: Automatic U By Emaar Platinum tier status. Welcome bonus: up to 25,000 UPoints.',
          'BENEFITS: Airport lounge access (1000+ lounges via Visa Airport Companion App, visit count',
          'unspecified); Complimentary valet parking at Grand Drive, The Dubai Mall (Galeries Lafayette &',
          'The Souk; ⚠️ relocated to China Town valet area per 2025 changes, OTP via U By Emaar App);',
          'Buy 1 Get 1 Free movie tickets + free snacks/popcorn at Reel Cinemas (min monthly spend AED',
          '5,000 for free snacks); up to 30% off Emaar Entertainment Group; 20% off F&B & spas +',
          'complimentary suite upgrade at Emaar Hospitality Group hotels (Address/Rove/Vida); Concierge',
          'services + Visa Digital Concierge; Visa Medical & Travel Assistance, free travel insurance for',
          'trips <180 days, golf access, Bicester Village, Avis, BookingBash, airport dining discount.',
          'ENBD perks: Salik top-up, utility bill payment, roadside assistance, airport transfers.',
          'New Credit Shield Pro available as optional add-on at 0.99%/month (AED 300k decease cover,',
          'AED 100/day hospitalization, AED 60k job loss cover).',
          'Forex markup: 1.99% assumed (ENBD standard Visa rate) — ⚠️ not explicitly confirmed for this card, verify with bank.',
          'Sources: U by Emaar Infinite product page PDF + ENBD U by Emaar credit card T&C (EN/AR).',
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { INFINITE_ID = data.id; console.log(`  OK — INFINITE_ID: ${INFINITE_ID}`); }
  }

  if (!FAMILY_ID || !SIGNATURE_ID || !INFINITE_ID) {
    console.error('\nCard insertion failed — aborting');
    process.exit(1);
  }

  // ─── 4. card_rewards (17 per card = 51 total) ──────────────────────────────
  console.log('\n[4/8] Inserting card_rewards (17 per card)...');
  const cardIdByTier = { FAMILY: FAMILY_ID, SIGNATURE: SIGNATURE_ID, INFINITE: INFINITE_ID };

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
        earn_rate: pct / 10,          // UPoints per AED (1 UPoint = AED 0.1)
        earn_unit: 'per_aed',
        effective_return_pct: pct,
        monthly_cap_reward: t.monthlyCap,
        source_url: t.src,
        last_verified_date: TODAY,
        is_active: true,
        notes: getNotes(slug, t),
      });
      if (error) { console.error(`    ERROR (${slug}):`, error.message); errors++; }
      else process.stdout.write('.');
    }
    console.log(' done');
  }

  // ─── 5. card_benefits — Family ─────────────────────────────────────────────
  console.log('\n[5/8] Inserting U by Emaar Family card_benefits...');
  const family_benefits = [
    {
      card_id: FAMILY_ID,
      benefit_type: 'buy_one_get_one',
      title: 'Buy 1 Get 1 Free Movie Tickets at Reel Cinemas',
      description: 'Buy one get one free cinema tickets at Reel Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: FAMILY_ID,
      benefit_type: 'entertainment_discount',
      title: 'Up to 30% Off Emaar Entertainment Group',
      description: 'Up to 30% discount at Emaar Entertainment Group venues (Dubai Underwater Zoo, KidZania Dubai, Dubai Ice Rink, Reel Cinemas, etc.).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: FAMILY_ID,
      benefit_type: 'dining_discount',
      title: '10% Off F&B & Spas at Emaar Hospitality Group Hotels',
      description: '10% off food & beverage and spa treatments at Emaar Hospitality Group properties (Address Hotels + Resorts, Rove Hotels, Vida Hotels), including Atmosphere and Thiptara restaurants.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
  ];
  for (const b of family_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 6. card_benefits — Signature ──────────────────────────────────────────
  console.log('\n[6/8] Inserting U by Emaar Signature card_benefits...');
  const signature_benefits = [
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion App)',
      description: 'Complimentary access to 1000+ airport lounges worldwide via the Visa Airport Companion App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'buy_one_get_one',
      title: 'Buy 1 Get 1 Free Movie Tickets at Reel Cinemas',
      description: 'Buy one get one free cinema tickets at Reel Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Minimum monthly card spend of AED 5,000 required.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'entertainment_discount',
      title: 'Up to 30% Off Emaar Entertainment Group',
      description: 'Up to 30% discount at Emaar Entertainment Group venues (Dubai Underwater Zoo, KidZania Dubai, Dubai Ice Rink, Reel Cinemas, etc.).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'hotel_discount',
      title: '15% Off F&B & Spas + Complimentary Room Upgrade at Emaar Hospitality Group Hotels',
      description: '15% off food & beverage and spa treatments, plus a complimentary room upgrade (subject to availability), at Emaar Hospitality Group properties (Address Hotels + Resorts, Rove Hotels, Vida Hotels).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Room upgrade subject to availability at time of stay.',
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'tier_status',
      title: 'U By Emaar Gold Status (Automatic)',
      description: 'Automatic U By Emaar Gold tier status, unlocking loyalty program benefits across Emaar Hospitality, Entertainment & malls.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: SIGNATURE_ID,
      benefit_type: 'travel_insurance',
      title: 'Visa Medical & Travel Assistance + Free Travel Insurance (<180 days)',
      description: 'Visa Medical & Travel Assistance services, plus complimentary travel insurance for trips shorter than 180 days. Also includes Agoda booking discounts and Visa airport dining discounts.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to Visa benefit T&Cs.',
      is_active: true,
    },
  ];
  for (const b of signature_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 7. card_benefits — Infinite ───────────────────────────────────────────
  console.log('\n[7/8] Inserting U by Emaar Infinite card_benefits...');
  const infinite_benefits = [
    {
      card_id: INFINITE_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion App)',
      description: 'Complimentary access to 1000+ airport lounges worldwide via the Visa Airport Companion App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking at The Dubai Mall (Grand Drive)',
      description: 'Complimentary valet parking at Grand Drive, The Dubai Mall (Galeries Lafayette & The Souk entrances).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: '⚠️ Valet location relocated to the China Town valet area per 2025 changes; OTP verification via the U By Emaar App required.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'buy_one_get_one',
      title: 'Buy 1 Get 1 Free Movie Tickets + Free Snacks at Reel Cinemas',
      description: 'Buy one get one free cinema tickets at Reel Cinemas, plus complimentary snacks/popcorn.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Free snacks/popcorn requires minimum monthly card spend of AED 5,000.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'entertainment_discount',
      title: 'Up to 30% Off Emaar Entertainment Group',
      description: 'Up to 30% discount at Emaar Entertainment Group venues (Dubai Underwater Zoo, KidZania Dubai, Dubai Ice Rink, Reel Cinemas, etc.).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'hotel_discount',
      title: '20% Off F&B & Spas + Complimentary Suite Upgrade at Emaar Hospitality Group Hotels',
      description: '20% off food & beverage and spa treatments, plus a complimentary suite upgrade (subject to availability), at Emaar Hospitality Group properties (Address Hotels + Resorts, Rove Hotels, Vida Hotels).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Suite upgrade subject to availability at time of stay.',
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'concierge',
      title: 'Concierge Services + Visa Digital Concierge',
      description: 'Dedicated concierge services plus Visa Digital Concierge for travel, dining, and lifestyle assistance.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'tier_status',
      title: 'U By Emaar Platinum Status (Automatic)',
      description: 'Automatic U By Emaar Platinum tier status, unlocking the highest loyalty program benefits across Emaar Hospitality, Entertainment & malls.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INFINITE_ID,
      benefit_type: 'welcome_bonus',
      title: 'Welcome Bonus — Up to 25,000 UPoints',
      description: 'New cardholders can earn up to 25,000 UPoints as a welcome bonus (worth up to AED 2,500 at 10 UPoints = AED 1).',
      monetary_value_aed: 2500,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'Subject to spend conditions within an initial period — verify exact terms with bank.',
      is_active: true,
    },
  ];
  for (const b of infinite_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 8. Verify ──────────────────────────────────────────────────────────────
  console.log('\n[8/8] Verifying final state...');

  const ALL_IDS = [FAMILY_ID, SIGNATURE_ID, INFINITE_ID];

  const { data: cards } = await sb
    .from('cards')
    .select('id, name, card_tier, min_salary_aed, annual_fee_aed, lounge_access_count, lounge_access_network')
    .in('id', ALL_IDS);
  for (const c of cards) {
    console.log(`  ${c.name}`);
    console.log(`    tier=${c.card_tier}, salary=${c.min_salary_aed}, fee=${c.annual_fee_aed}`);
    console.log(`    lounge=${c.lounge_access_count === null ? 'unspecified' : c.lounge_access_count}, network=${c.lounge_access_network}`);
  }

  const { data: rewards } = await sb
    .from('card_rewards')
    .select('card_id, effective_return_pct, monthly_cap_reward')
    .in('card_id', ALL_IDS);
  for (const [tierKey, cardId] of Object.entries(cardIdByTier)) {
    const r = rewards.filter(x => x.card_id === cardId);
    console.log(`\n  ${TIERS[tierKey].name}: ${r.length} reward rows, cap=${r[0]?.monthly_cap_reward}, base rate=${TIERS[tierKey].basePct}%`);
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
  console.log(`  FAMILY_ID:    ${FAMILY_ID}`);
  console.log(`  SIGNATURE_ID: ${SIGNATURE_ID}`);
  console.log(`  INFINITE_ID:  ${INFINITE_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

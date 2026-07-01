// Add ENBD Priority Banking Visa Infinite + Duo Credit Card
//
// Priority Banking Visa Infinite sources:
//   tcpdfs/ENBD Priority Banking Visa Infinite Credit Card _ Emirates NBD.pdf
//     → Transaction-size tiered earn: 5% (≥AED 5k), 2% (AED 2.5k–4.9k), 1% (<AED 2.5k)
//     → Restricted categories flat 1% (better than standard Visa Infinite 0.4%/0.2%)
//     → Caps: 1,000 PP restricted / 500 PP EU / 5,000 PP overall per statement; 60k PP/year
//     → Annual fee: AED 1,500 (first year free)
//     → Eligibility: existing Priority Banking customers only (no min salary stated)
//     → Benefits: unlimited lounge (Visa Airport Companion), valet 4/month Abu Dhabi,
//       airport transfers 4/year UAE, courier 12/year UAE, golf free UAE + 40% worldwide,
//       BOGOF Reel, concierge, beach club + gym, quarterly cashback promo
//
// Duo sources:
//   tcpdfs/ENBD Duo Credit Cards - Double the Rewards, Double the Value _ Emirates NBD.pdf
//     → Two physical cards: Diners Club + Mastercard Platinum (one account)
//     → Abu Dhabi residents only. Min salary AED 12,000.
//     → Earn (effective 5 April 2025):
//       5% on groceries/electronics/utilities/education/fuel (min AED 5k monthly spend)
//       If spend < AED 5k/month: 1.5% on those categories instead
//       0.5% on all other categories
//       Cap: 500 PP per statement (reduced from 2,000 effective April 2025)
//     → Airport transfers + valet DISCONTINUED April 2025
//     → Benefits: lounge (Diners Club + MC), BOGOF Cine Royals, golf UAE, concierge,
//       MC Purchase Protection, Costa F&D, Booking.com discount
//
// Plus Points value (from Redeem Plus Points PDF):
//   1 PP = AED 1 (instant/Nol/education); AED 0.75 cashback; 7 Skywards or 10 Etihad Miles

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-14';
const SRC_PRB   = 'tcpdfs/ENBD Priority Banking Visa Infinite Credit Card _ Emirates NBD.pdf';
const SRC_DUO   = 'tcpdfs/ENBD Duo Credit Cards - Double the Rewards, Double the Value _ Emirates NBD.pdf';
const SRC_EARN  = 'tcpdfs/ENBD Earn Plus Points.pdf';

async function run() {
  let errors = 0;

  // ─── 0. Load spending categories ──────────────────────────────────────────
  console.log('[0] Loading spending categories...');
  const { data: catRows, error: catErr } = await sb
    .from('spending_categories').select('id, slug');
  if (catErr) { console.error('FATAL loading categories:', catErr.message); process.exit(1); }
  const cat = {};
  for (const r of catRows) cat[r.slug] = r.id;
  console.log(`  Loaded ${catRows.length} categories`);

  let PRB_ID, DUO_ID;

  // ─── 1. Insert Priority Banking Visa Infinite card ────────────────────────
  console.log('\n[1/8] Inserting Priority Banking Visa Infinite card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: 'Emirates NBD Priority Banking Visa Infinite Credit Card',
        card_network: 'visa',
        card_tier: 'infinite',
        annual_fee_aed: 1500,
        min_salary_aed: null,  // Priority Banking eligibility — no published min salary
        reward_currency_name: 'Plus Points',
        reward_currency_value_aed: 1.0,
        base_earn_rate: 0.01,
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: 3.69,
        lounge_access_count: null,  // unlimited (Visa Infinite tier)
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: 4,
        travel_insurance: true,
        purchase_protection: true,
        concierge: true,
        airport_transfer_count: 4,
        source_url: SRC_PRB,
        summary: [
          'VERIFIED 2026-06-14. ENBD Priority Banking Visa Infinite Credit Card.',
          'EXCLUSIVE: Available to existing Priority Banking customers only.',
          'Earn Plus Points with TRANSACTION-SIZE TIERING (NOT category-based for general spend):',
          '5% on each transaction ≥ AED 5,000; 2% on transactions AED 2,500–4,999; 1% on < AED 2,500.',
          'Restricted categories earn flat 1%: groceries/supermarkets, insurance, car dealerships, fuel,',
          'utility payments, real estate, charity, education, QSR (fast food), transit, govt, telecom, EU countries.',
          'Note: EU spend earns 1% (better than standard Visa Infinite 0.4% for EU).',
          'Caps: restricted group = 1,000 PP/stmt; EU spend = 500 PP/stmt;',
          'overall = 5,000 PP per statement; 60,000 PP per annum.',
          'Annual fee: AED 1,500 (first year free). Plus Points never expire.',
          'Redemption: 1 PP = AED 1 (instant/Nol/education); AED 0.75 cashback; 7 Skywards or 10 Etihad Miles.',
          'Unlimited lounge (Visa Airport Companion App). Valet 4/month Abu Dhabi.',
          'Airport transfers 4/year UAE. Courier 12/year UAE.',
          'Golf: free at UAE courses + up to 40% off worldwide premium courses.',
          'BOGOF cinema at Reel Cinemas. Concierge. Travel insurance. Visa Purchase Protection.',
          'Premium Beach Club + Gym access (exclusive Priority Banking perk).',
          'Quarterly promo: maintain AED 50,000 quarterly spend for chance to win AED 5,000 cashback.',
          'Forex: 1.99% ENBD + ~1.15% Visa = ~3.14% total. Interest: 3.69%/month (KFS).',
          'Sources: Priority Banking product page PDF + Earn Plus Points PDF.',
        ].join(' '),
        is_active: true,
      })
      .select('id')
      .single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { PRB_ID = data.id; console.log(`  OK — PRB_ID: ${PRB_ID}`); }
  }

  // ─── 2. Insert Duo Credit Card ─────────────────────────────────────────────
  console.log('\n[2/8] Inserting Duo Credit Card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: 'Emirates NBD Duo Credit Card',
        card_network: 'mastercard',
        card_tier: 'platinum',
        annual_fee_aed: 0,  // current promotional offer; base fee not published
        min_salary_aed: 12000,
        reward_currency_name: 'Plus Points',
        reward_currency_value_aed: 1.0,
        base_earn_rate: 0.005,  // 0.5% on general/other categories
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: 3.69,
        lounge_access_count: null,  // Diners Club = unlimited; MC = 4/yr (stored as unlimited for Diners primary)
        lounge_access_network: 'diners_club',
        valet_parking_count: null,  // discontinued April 2025
        travel_insurance: false,
        purchase_protection: true,  // Mastercard Purchase Protection
        concierge: true,
        airport_transfer_count: null,  // discontinued April 2025
        source_url: SRC_DUO,
        summary: [
          'VERIFIED 2026-06-14. ENBD Duo Credit Card.',
          'UNIQUE: Two physical cards in one account — Diners Club card + Mastercard Platinum.',
          'EXCLUSIVE: Abu Dhabi residents only. Min salary AED 12,000.',
          'Earn 5% Plus Points on groceries, electronics (shopping), utilities, education, and fuel',
          '(requires min AED 5,000 total monthly spend; if spend < AED 5,000, earns 1.5% instead).',
          'Earn 0.5% Plus Points on all other categories (dining, hotels, airlines, travel, online, entertainment, etc.).',
          'Cap: 500 PP per statement (reduced from 2,000 effective 5 April 2025).',
          'Annual fee: AED 0 (current promotional offer; actual base fee not published).',
          'Lounge: Diners Club (unlimited Diners lounges) + Mastercard Platinum (4/year via MC Travel Pass).',
          'BOGOF cinema at Cine Royals (Royal Cinemas). Complimentary golf at UAE courses.',
          'Concierge service. Mastercard Purchase Protection. Costa F&D (Mastercard). Booking.com discount.',
          'Note: Airport transfers and valet parking DISCONTINUED as of 5 April 2025.',
          'Redemption: 1 PP = AED 1 (instant/Nol/education); AED 0.75 cashback; 7 Skywards or 10 Etihad Miles.',
          'Forex: 1.99% ENBD + ~1.15% MC = ~3.14% total. Interest: 3.69%/month (KFS).',
          'Sources: Duo product page PDF + Earn Plus Points PDF.',
        ].join(' '),
        is_active: true,
      })
      .select('id')
      .single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { DUO_ID = data.id; console.log(`  OK — DUO_ID: ${DUO_ID}`); }
  }

  if (!PRB_ID || !DUO_ID) {
    console.error('\nCard insertion failed — aborting reward/benefit inserts');
    process.exit(1);
  }

  // ─── 3. Priority Banking card_rewards (17 rows) ───────────────────────────
  // Transaction-size tiered for general spend (store 1% floor; notes explain full tiers)
  // Restricted: 1% flat, 1,000 PP sub-cap
  // EU/international: 1% flat, 500 PP sub-cap
  // Overall statement cap: 5,000 PP
  console.log('\n[3/8] Inserting Priority Banking card_rewards (17)...');

  const N_TIER = [
    '⚠️ TRANSACTION-SIZE TIERED: 5% per transaction ≥ AED 5,000 | 2% on AED 2,500–4,999 | 1% on < AED 2,500.',
    'Stored as 1% (floor rate for transactions < AED 2,500).',
    'Overall cap: 5,000 PP per statement; 60,000 PP per year.',
    'Source: tcpdfs/ENBD Priority Banking Visa Infinite Credit Card _ Emirates NBD.pdf',
  ].join(' ');

  const N_RESTR = [
    'Restricted category: earns flat 1% regardless of transaction size',
    '(better than standard Visa Infinite 0.4%/0.2% for these categories).',
    'Sub-cap: 1,000 PP per statement for restricted group',
    '(groceries, supermarkets, QSR, insurance, car dealerships, petroleum, transit, govt, utilities, real estate, education, telecom, charity).',
    'Overall cap: 5,000 PP per statement; 60,000 PP per year.',
    'Source: tcpdfs/ENBD Priority Banking Visa Infinite Credit Card _ Emirates NBD.pdf',
  ].join(' ');

  const N_EU = [
    'EU countries: earns flat 1%',
    '(better than standard Visa Infinite 0.4% for EU/UK).',
    'Sub-cap: 500 PP per statement for EU spend.',
    'Overall cap: 5,000 PP per statement; 60,000 PP per year.',
    'Source: tcpdfs/ENBD Priority Banking Visa Infinite Credit Card _ Emirates NBD.pdf',
  ].join(' ');

  const prbRows = [
    // Non-restricted (tiered by transaction size — store floor 1%)
    { _s: 'dining',          rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'airlines',        rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'hotels',          rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'shopping',        rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'online_shopping', rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'entertainment',   rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'healthcare',      rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'travel',          rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    { _s: 'general',         rate: 0.01, pct: 1.0, cap: null, notes: N_TIER },
    // Restricted (flat 1%, 1,000 PP sub-cap)
    { _s: 'groceries',       rate: 0.01, pct: 1.0, cap: 1000, notes: N_RESTR },
    { _s: 'fuel',            rate: 0.01, pct: 1.0, cap: 1000, notes: N_RESTR },
    { _s: 'utilities',       rate: 0.01, pct: 1.0, cap: 1000, notes: N_RESTR },
    { _s: 'education',       rate: 0.01, pct: 1.0, cap: 1000, notes: N_RESTR },
    { _s: 'government',      rate: 0.01, pct: 1.0, cap: 1000, notes: N_RESTR },
    { _s: 'rent',            rate: 0.01, pct: 1.0, cap: 1000, notes: N_RESTR },
    { _s: 'insurance',       rate: 0.01, pct: 1.0, cap: 1000, notes: N_RESTR },
    // International / EU (flat 1%, 500 PP sub-cap)
    { _s: 'international',   rate: 0.01, pct: 1.0, cap: 500,  notes: N_EU },
  ];

  for (const r of prbRows) {
    const catId = cat[r._s];
    if (!catId) { console.error(`  ERROR: unknown slug ${r._s}`); errors++; continue; }
    const { error } = await sb.from('card_rewards').insert({
      card_id: PRB_ID,
      category_id: catId,
      reward_type: 'points',
      earn_rate: r.rate,
      earn_unit: 'per_aed',
      effective_return_pct: r.pct,
      monthly_cap_reward: r.cap,
      source_url: SRC_PRB,
      last_verified_date: TODAY,
      is_active: true,
      notes: r.notes,
    });
    if (error) { console.error(`  ERROR (${r._s}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ─── 4. Duo card_rewards (17 rows) ─────────────────────────────────────────
  // 5% on groceries/electronics(shopping/online)/utilities/education/fuel
  // 0.5% on all other categories
  // All rows: monthly_cap_reward = 500 (overall statement cap)
  console.log('\n[4/8] Inserting Duo card_rewards (17)...');

  const N_DUO5 = [
    '5% Plus Points (effective 5 April 2025).',
    '⚠️ CONDITIONAL: Requires min AED 5,000 total monthly spend per statement to earn 5%;',
    'if spend < AED 5,000, earns 1.5% on this category instead.',
    'Cap: 500 PP per statement total across all categories.',
    'Source: tcpdfs/ENBD Duo Credit Cards - Double the Rewards, Double the Value _ Emirates NBD.pdf',
  ].join(' ');

  const N_DUO5_SHOP = N_DUO5 + ' Applies to electronics (Sharaf DG, eXtra, etc.) mapped to shopping category.';
  const N_DUO5_ONLSHOP = N_DUO5 + ' Applies to electronics purchased online within online_shopping category.';

  const N_DUO05 = [
    '0.5% Plus Points (standard low-earn tier for Duo on all non-bonus categories).',
    'Cap: 500 PP per statement total across all categories.',
    'Source: tcpdfs/ENBD Duo Credit Cards - Double the Rewards, Double the Value _ Emirates NBD.pdf',
  ].join(' ');

  const duoRows = [
    // 5% bonus categories
    { _s: 'groceries',       rate: 0.05,  pct: 5.0, notes: N_DUO5 },
    { _s: 'fuel',            rate: 0.05,  pct: 5.0, notes: N_DUO5 },
    { _s: 'utilities',       rate: 0.05,  pct: 5.0, notes: N_DUO5 },
    { _s: 'education',       rate: 0.05,  pct: 5.0, notes: N_DUO5 },
    { _s: 'shopping',        rate: 0.05,  pct: 5.0, notes: N_DUO5_SHOP },
    { _s: 'online_shopping', rate: 0.05,  pct: 5.0, notes: N_DUO5_ONLSHOP },
    // 0.5% all other categories
    { _s: 'dining',          rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'airlines',        rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'hotels',          rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'travel',          rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'entertainment',   rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'healthcare',      rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'insurance',       rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'international',   rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'government',      rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'rent',            rate: 0.005, pct: 0.5, notes: N_DUO05 },
    { _s: 'general',         rate: 0.005, pct: 0.5, notes: N_DUO05 },
  ];

  for (const r of duoRows) {
    const catId = cat[r._s];
    if (!catId) { console.error(`  ERROR: unknown slug ${r._s}`); errors++; continue; }
    const { error } = await sb.from('card_rewards').insert({
      card_id: DUO_ID,
      category_id: catId,
      reward_type: 'points',
      earn_rate: r.rate,
      earn_unit: 'per_aed',
      effective_return_pct: r.pct,
      monthly_cap_reward: 500,
      source_url: SRC_DUO,
      last_verified_date: TODAY,
      is_active: true,
      notes: r.notes,
    });
    if (error) { console.error(`  ERROR (${r._s}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ─── 5. Priority Banking card_benefits (8) ────────────────────────────────
  console.log('\n[5/8] Inserting Priority Banking card_benefits...');

  const prb_benefits = [
    {
      card_id: PRB_ID,
      benefit_type: 'lounge_access',
      title: 'Unlimited Airport Lounge Access (Visa Infinite — Visa Airport Companion)',
      description: 'Unlimited complimentary lounge visits for cardholder + 1 guest free via Visa Airport Companion App. Valid at 1,000+ lounges, 300+ cities worldwide.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Standard Visa Infinite conditions apply.',
      is_active: true,
    },
    {
      card_id: PRB_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Cinema Tickets (Reel Cinemas)',
      description: 'Buy 1 Get 1 Free movie tickets at Reel Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: PRB_ID,
      benefit_type: 'valet_parking',
      title: '4 Complimentary Valet Parking per Month (Abu Dhabi)',
      description: '4 complimentary valet parking services per month at selected locations in Abu Dhabi.',
      monetary_value_aed: null,
      usage_limit: 4,
      usage_period: 'monthly',
      conditions: 'Available at select Abu Dhabi locations only.',
      is_active: true,
    },
    {
      card_id: PRB_ID,
      benefit_type: 'travel',
      title: '4 Airport Transfers per Year (UAE)',
      description: 'Up to 4 complimentary airport transfer drops per year within the UAE.',
      monetary_value_aed: null,
      usage_limit: 4,
      usage_period: 'yearly',
      conditions: 'Within UAE only.',
      is_active: true,
    },
    {
      card_id: PRB_ID,
      benefit_type: 'lifestyle',
      title: 'Local Courier Service (12×/Year, UAE)',
      description: 'Complimentary local courier service up to 12 times per year within the UAE.',
      monetary_value_aed: null,
      usage_limit: 12,
      usage_period: 'yearly',
      conditions: 'Within UAE only.',
      is_active: true,
    },
    {
      card_id: PRB_ID,
      benefit_type: 'concierge',
      title: 'Concierge Desk (24/7)',
      description: 'Emirates NBD concierge team available 24/7 to handle time-consuming tasks and requests.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: PRB_ID,
      benefit_type: 'golf',
      title: 'Free Golf in UAE + 40% Off Worldwide',
      description: 'Complimentary golf access at top UAE courses. Up to 40% discount at premium golf courses worldwide.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: '40% discount applies to worldwide courses only; UAE access is complimentary.',
      is_active: true,
    },
    {
      card_id: PRB_ID,
      benefit_type: 'lifestyle',
      title: 'Premium Beach Club & Gym Access (Priority Banking Exclusive)',
      description: 'Complimentary access to 5-star beach clubs and gyms. Exclusive benefit for Priority Banking cardholders.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Exclusive to Priority Banking customers. Book via ENBD app or website.',
      is_active: true,
    },
  ];

  for (const b of prb_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 6. Duo card_benefits (5) ─────────────────────────────────────────────
  console.log('\n[6/8] Inserting Duo card_benefits...');

  const duo_benefits = [
    {
      card_id: DUO_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Diners Club + Mastercard)',
      description: 'Two-card lounge access: Diners Club card provides unlimited lounge access at Diners Club Lounges worldwide; Mastercard Platinum card provides access via Mastercard Travel Pass.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Diners Club: unlimited at Diners Club Lounges. Mastercard: conditions per Mastercard Travel Pass (standard Mastercard Platinum benefit). Premium lounge access worldwide.',
      is_active: true,
    },
    {
      card_id: DUO_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Cinema Tickets (Cine Royals / Royal Cinemas)',
      description: 'Buy 1 Get 1 Free movie tickets at Cine Royals Cinemas (also marketed as Royal Cinemas).',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Purchase tickets via the Cine Royals Cinemas website when paying with your card.',
      is_active: true,
    },
    {
      card_id: DUO_ID,
      benefit_type: 'golf',
      title: 'Complimentary Golf Access (UAE Courses)',
      description: 'Complimentary access to top golf courses across the UAE.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: DUO_ID,
      benefit_type: 'concierge',
      title: 'Concierge Service',
      description: 'Emirates NBD concierge desk to handle time-consuming errands and requests.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: DUO_ID,
      benefit_type: 'dining',
      title: 'Complimentary Food & Drink at Costa Coffee (Mastercard)',
      description: 'Complimentary food and drink from Costa Coffee — exclusive Mastercard benefit included with the Mastercard card of the Duo.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Mastercard benefit. Valid at participating Costa Coffee locations. Pay with Duo Mastercard.',
      is_active: true,
    },
  ];

  for (const b of duo_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 7. Verify final state ────────────────────────────────────────────────
  console.log('\n[7/8] Verifying final state...');

  const { data: cards, error: cErr } = await sb
    .from('cards')
    .select('id, name, card_tier, card_network, min_salary_aed, annual_fee_aed, lounge_access_count, lounge_access_network, concierge, travel_insurance')
    .in('id', [PRB_ID, DUO_ID]);
  if (cErr) { console.error('  ERROR:', cErr.message); errors++; }
  else {
    for (const c of cards) {
      console.log(`  ${c.name}`);
      console.log(`    tier=${c.card_tier}, network=${c.card_network}, fee=${c.annual_fee_aed}, salary=${c.min_salary_aed}`);
      console.log(`    lounge=${c.lounge_access_count === null ? 'unlimited' : c.lounge_access_count}, network=${c.lounge_access_network}`);
      console.log(`    concierge=${c.concierge}, travel_insurance=${c.travel_insurance}`);
    }
  }

  const { data: rewards, error: rErr } = await sb
    .from('card_rewards')
    .select('card_id, earn_rate, effective_return_pct, monthly_cap_reward')
    .in('card_id', [PRB_ID, DUO_ID]);
  if (rErr) { console.error('  ERROR:', rErr.message); errors++; }
  else {
    const pRows = rewards.filter(r => r.card_id === PRB_ID);
    const dRows = rewards.filter(r => r.card_id === DUO_ID);
    console.log(`\n  Priority Banking: ${pRows.length} reward rows`);
    const pCaps = [...new Set(pRows.map(r => r.monthly_cap_reward))];
    console.log(`    monthly_cap_reward values: ${pCaps.join(', ')}`);
    console.log(`  Duo: ${dRows.length} reward rows`);
    const dCaps = [...new Set(dRows.map(r => r.monthly_cap_reward))];
    console.log(`    monthly_cap_reward values: ${dCaps.join(', ')}`);
    const duoRates = [...new Set(dRows.map(r => r.effective_return_pct))].sort((a,b) => b-a);
    console.log(`    effective_return_pct values: ${duoRates.join(', ')}%`);
  }

  const { data: benefits, error: bErr } = await sb
    .from('card_benefits')
    .select('card_id, benefit_type, title')
    .in('card_id', [PRB_ID, DUO_ID])
    .order('card_id');
  if (bErr) { console.error('  ERROR:', bErr.message); errors++; }
  else {
    console.log(`\n  card_benefits (${benefits.length} total):`);
    for (const b of benefits) {
      const tag = b.card_id === PRB_ID ? 'PriorityBanking' : 'Duo';
      console.log(`    [${tag}] ${b.benefit_type} — ${b.title}`);
    }
  }

  // ─── 8. Summary ──────────────────────────────────────────────────────────
  console.log('\n[8/8] Done.');
  if (errors === 0) console.log('  All data inserted successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);

  console.log(`\nCard IDs:`);
  console.log(`  PRB_ID (Priority Banking Visa Infinite): ${PRB_ID}`);
  console.log(`  DUO_ID (Duo Credit Card):                ${DUO_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

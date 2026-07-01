// Add ENBD dnata Platinum Credit Card + dnata World Credit Card
//
// Sources:
//   - tcpdfs/ENBD Dnata Platinum Credit Card...pdf
//       → annual_fee=525, min_salary=5000, interest=3.69%, MC Platinum tier
//       → Earn: 1% general; 0.25% groceries/insurance/QSR/EU+UK; 0.10% fuel/utils/govt/edu/rent
//       → Brand bonuses: Costa/City Sightseeing/Giraffe=15%; dnata Travel/MMI/Arabian Adventures/Le Clos=10%; Duty Free=5%
//       → 0% forex fee; Mastercard Travel Pass lounge (4/yr Platinum tier); valet Abu Dhabi malls; BOGOF movies
//   - tcpdfs/ENBD Dnata World Credit Card...pdf
//       → annual_fee=1048.95, min_salary=20000, interest=3.25%, MC World tier
//       → Earn: 1.5% general; 0.375% groceries/insurance/QSR/EU+UK; 0.15% fuel/utils/govt/edu/rent
//       → Brand bonuses: Costa/City Sightseeing/Giraffe/dnata Travel=15%; MMI/Arabian Adventures/Le Clos/Duty Free=10%
//       → 0% forex fee; Mastercard Travel Pass lounge (World tier count TBD); concierge; valet Abu Dhabi; golf UAE; 1 airport transfer/yr; travel insurance
//   - tcpdfs/ENBD Earn dnata Points...pdf
//       → Official earn table: World 1.5%/Platinum 1% base; restricted 25%/10% of base
//       → Caps: Platinum 2000/stmt general, 15000/yr partner, 100/stmt duty free
//           World 3000/stmt general, 20000/yr partner, 200/stmt duty free
//   - tcpdfs/ENBD Redeem dnata Points...pdf
//       → 1 dnata Point = AED 1 (instant at participating stores or dnata Travel)

const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-14';

const SRC_PLA_PROD = 'tcpdfs/ENBD Dnata Platinum Credit Card _ Redeem Dnata Points _ Emirates NBD.pdf';
const SRC_WLD_PROD = 'tcpdfs/ENBD Dnata World Credit Card - Elevate Travel Experience _ Emirates NBD.pdf';
const SRC_EARN     = 'tcpdfs/ENBD Earn dnata Points _ Help and Support _ Emirates NBD.pdf';
const SRC_REDEEM   = 'tcpdfs/ENBD Redeem dnata Points _ Help and Support _ Emirates NBD.pdf';

// ── reward row builder ──────────────────────────────────────────────────────
// genRate/genPct: general retail rate (0.01/1.0 for Platinum, 0.015/1.5 for World)
// r25/p25:  25% of base (groceries, insurance, QSR, EU+UK)
// r10/p10:  10% of base (fuel, utils, govt, edu, rent, telecom, transit)
function buildRewards(cardId, genRate, genPct, r25, p25, r10, p10, cap, label, src) {
  const row = (slug, rate, pct, notes) => ({
    card_id: cardId,
    category_id: null, // filled after category lookup
    _slug: slug,       // temp for lookup
    reward_type: 'points',
    earn_rate: rate,
    earn_unit: 'per_aed',
    effective_return_pct: pct,
    monthly_cap_reward: cap,
    source_url: src,
    last_verified_date: TODAY,
    is_active: true,
    notes,
  });

  const bonuses = label === 'Platinum'
    ? `🎁 Costa Coffee/City Sightseeing/Giraffe=15%, dnata Travel/MMI/Al Hamra Cellar/Arabian Adventures/Le Clos=10%, Dubai Duty Free=5% (separate 15,000/yr cap for partner spend).`
    : `🎁 Costa Coffee/City Sightseeing/Giraffe/dnata Travel=15%, MMI/Al Hamra Cellar/Arabian Adventures/Le Clos/Dubai Duty Free=10% (separate 20,000/yr cap for partner spend).`;

  return [
    row('dining',          genRate, genPct,  `${genPct}% at restaurants/cafés. ⚠️ QSR/fast food earns ${p25}% (25% of base). ${bonuses} Source: ${SRC_EARN}`),
    row('groceries',       r25,     p25,     `${p25}% on groceries/supermarkets (25% of ${genPct}% base). Source: ${SRC_EARN}`),
    row('fuel',            r10,     p10,     `${p10}% on fuel/petroleum (10% of ${genPct}% base). Source: ${SRC_EARN}`),
    row('airlines',        genRate, genPct,  `${genPct}% on airline tickets. ${label === 'Platinum' ? '🎁 dnata Travel=10%' : '🎁 dnata Travel=15%'} (partner cap applies). Source: ${SRC_EARN}`),
    row('shopping',        genRate, genPct,  `${genPct}% on general shopping. ⚠️ Car dealerships earn ${p25}% (25% of base). 🎁 Dubai Duty Free=${label === 'Platinum' ? '5%' : '10%'} (100/200 pts/stmt duty-free cap). Source: ${SRC_EARN}`),
    row('hotels',          genRate, genPct,  `${genPct}% on hotel bookings. ${label === 'Platinum' ? '🎁 dnata Travel hotel bookings=10%' : '🎁 dnata Travel hotel bookings=15%'} (partner cap applies). Source: ${SRC_EARN}`),
    row('other_travel',    genRate, genPct,  `${genPct}% on travel agencies/booking sites. ${label === 'Platinum' ? '🎁 dnata Travel=10%, Arabian Adventures=10%' : '🎁 dnata Travel=15%, Arabian Adventures=10%'} (partner cap applies). Source: ${SRC_EARN}`),
    row('online_shopping', genRate, genPct,  `${genPct}% on online shopping. Source: ${SRC_EARN}`),
    row('entertainment',   genRate, genPct,  `${genPct}% on entertainment. 🎁 City Sightseeing=15% (partner cap applies). Source: ${SRC_EARN}`),
    row('utilities',       r10,     p10,     `${p10}% on utility payments (10% of ${genPct}% base). ⚠️ Utility payments via ENBD digital channels may earn ZERO — verify TNC. Source: ${SRC_EARN}`),
    row('education',       r10,     p10,     `${p10}% on education/school fees (10% of ${genPct}% base). Source: ${SRC_EARN}`),
    row('insurance',       r25,     p25,     `${p25}% on insurance premiums (25% of ${genPct}% base). Source: ${SRC_EARN}`),
    row('government',      r10,     p10,     `${p10}% on government fees and services (10% of ${genPct}% base). Source: ${SRC_EARN}`),
    row('rent',            r10,     p10,     `${p10}% on rent/real estate (10% of ${genPct}% base). Source: ${SRC_EARN}`),
    row('healthcare',      genRate, genPct,  `${genPct}% on healthcare — not in any restricted category. Source: ${SRC_EARN}`),
    row('international',   genRate, genPct,  `${genPct}% on international spend in most countries. ⚠️ EU and UK spend earns ${p25}% (25% of base — same rule as groceries/insurance). Source: ${SRC_EARN}`),
    row('general',         genRate, genPct,  `${genPct}% on all other eligible spend. Source: ${SRC_EARN}`),
  ];
}

async function run() {
  let errors = 0;

  // ── 0. Load categories ────────────────────────────────────────────────────
  console.log('\n[0] Loading spending categories...');
  const { data: catRows, error: catErr } = await sb.from('spending_categories').select('id, slug');
  if (catErr) { console.error('FATAL:', catErr.message); process.exit(1); }
  const cat = {};
  for (const c of catRows) cat[c.slug] = c.id;
  console.log(`  Loaded ${catRows.length} categories`);

  // ── 1. Insert dnata Platinum card ─────────────────────────────────────────
  console.log('\n[1/8] Inserting dnata Platinum card...');
  let PLA_ID;
  {
    const { data, error } = await sb.from('cards').insert({
      bank_id: ENBD_BANK_ID,
      name: 'Emirates NBD dnata Platinum Credit Card',
      card_network: 'mastercard',
      card_tier: 'platinum',
      annual_fee_aed: 525,
      min_salary_aed: 5000,
      reward_currency_name: 'dnata Points',
      reward_currency_value_aed: 1.0,
      base_earn_rate: 0.01,
      base_earn_unit: 'per_aed',
      forex_markup_pct: 0,
      interest_rate_monthly_pct: 3.69,
      lounge_access_count: 4,
      lounge_access_network: 'mastercard_travel_pass',
      concierge: false,
      travel_insurance: false,
      purchase_protection: true,
      is_active: true,
      source_url: SRC_PLA_PROD,
      summary: [
        'VERIFIED 2026-06-14. Emirates NBD dnata Platinum Credit Card (Mastercard Platinum).',
        'Earn dnata Points: 1% on general retail spend (1 point per AED 100).',
        '0.25% on groceries, supermarkets, insurance, car dealerships, QSR/fast food (25% of base).',
        '0.10% on fuel, utilities, govt, education, rent, real estate, transit, telecom (10% of base).',
        'EU and UK international spend earns 0.25% (25% of base — same as groceries tier).',
        '🎁 Partner bonuses: Costa Coffee/City Sightseeing/Giraffe=15%; dnata Travel/MMI/Al Hamra Cellar/Arabian Adventures/Le Clos=10%; Dubai Duty Free=5%.',
        'Partner bonus cap: 15,000 dnata points per calendar year. Duty Free cap: 100 pts per statement.',
        'General earn cap: 2,000 dnata points per statement cycle.',
        'Annual fee: AED 525 (joining + renewal). Min salary: AED 5,000.',
        '0% ENBD forex markup (standard Mastercard network fee may still apply).',
        'Interest: 3.69%/month (44.28% p.a.) — stated on product page.',
        'Lounge: 4 complimentary visits/year via Mastercard Travel Pass (Mastercard Platinum UAE tier).',
        'Mastercard Purchase Protection. Free valet parking at Abu Dhabi malls.',
        'BOGOF cinema. Buy-1-get-1 offers on select entertainment.',
        'Welcome bonus: up to 1,000 dnata points (500 on joining fee + 500 on AED 10k spend in first 3 statements).',
        'Redemption: 1 dnata Point = AED 1 at participating stores or dnata Travel.',
        'Sources: dnata Platinum product page + Earn dnata Points page + Redeem dnata Points page.',
      ].join(' '),
    }).select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { PLA_ID = data.id; console.log(`  OK — PLA_ID: ${PLA_ID}`); }
  }

  // ── 2. Insert dnata World card ────────────────────────────────────────────
  console.log('\n[2/8] Inserting dnata World card...');
  let WLD_ID;
  {
    const { data, error } = await sb.from('cards').insert({
      bank_id: ENBD_BANK_ID,
      name: 'Emirates NBD dnata World Credit Card',
      card_network: 'mastercard',
      card_tier: 'world',
      annual_fee_aed: 1048.95,
      min_salary_aed: 20000,
      reward_currency_name: 'dnata Points',
      reward_currency_value_aed: 1.0,
      base_earn_rate: 0.015,
      base_earn_unit: 'per_aed',
      forex_markup_pct: 0,
      interest_rate_monthly_pct: 3.25,
      lounge_access_count: null,
      lounge_access_network: 'mastercard_travel_pass',
      concierge: true,
      travel_insurance: true,
      purchase_protection: true,
      is_active: true,
      source_url: SRC_WLD_PROD,
      summary: [
        'VERIFIED 2026-06-14. Emirates NBD dnata World Credit Card (Mastercard World).',
        'Earn dnata Points: 1.5% on general retail spend (1.5 points per AED 100).',
        '0.375% on groceries, supermarkets, insurance, car dealerships, QSR/fast food (25% of base).',
        '0.15% on fuel, utilities, govt, education, rent, real estate, transit, telecom (10% of base).',
        'EU and UK international spend earns 0.375% (25% of base).',
        '🎁 Partner bonuses: Costa Coffee/City Sightseeing/Giraffe/dnata Travel=15%; MMI/Al Hamra Cellar/Arabian Adventures/Le Clos/Dubai Duty Free=10%.',
        'Partner bonus cap: 20,000 dnata points per calendar year. Duty Free cap: 200 pts per statement.',
        'General earn cap: 3,000 dnata points per statement cycle.',
        'Annual fee: AED 1,048.95 (joining + renewal). Min salary: AED 20,000.',
        '0% ENBD forex markup — no foreign transaction fee on ENBD side.',
        'Interest: 3.25%/month (39% p.a.) — product page rate.',
        'Lounge: Complimentary access to 1,000+ lounges in 300+ cities via Mastercard Travel Pass (World tier — visit count not specified ⚠️).',
        'Concierge service. Valet parking at selected Abu Dhabi locations.',
        'Complimentary golf access at UAE courses. 1 complimentary airport transfer per year.',
        'Mastercard travel medical & inconvenience insurance. Mastercard Purchase Protection.',
        'Hertz Gold Plus Rewards Five Star Membership.',
        'Welcome bonus: up to 2,500 dnata points (1,000 on joining + 1,500 on AED 25k spend in first 3 statements).',
        'Redemption: 1 dnata Point = AED 1 at participating stores or dnata Travel.',
        'Sources: dnata World product page + Earn dnata Points page + Redeem dnata Points page.',
      ].join(' '),
    }).select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { WLD_ID = data.id; console.log(`  OK — WLD_ID: ${WLD_ID}`); }
  }

  if (!PLA_ID || !WLD_ID) {
    console.error('\n[ABORT] Card inserts failed — stopping.');
    process.exit(1);
  }

  // ── 3. card_rewards: dnata Platinum ──────────────────────────────────────
  console.log('\n[3/8] Inserting dnata Platinum card_rewards (17)...');
  // Platinum: 1% base; 25% of base = 0.25%; 10% of base = 0.10%
  const plaRows = buildRewards(PLA_ID, 0.01, 1.0, 0.0025, 0.25, 0.001, 0.10, 2000, 'Platinum', SRC_EARN);
  for (const r of plaRows) {
    const catId = cat[r._slug];
    if (!catId) { console.error(`  ERROR: unknown slug ${r._slug}`); errors++; continue; }
    const { _slug, ...row } = r;
    const { error } = await sb.from('card_rewards').insert({ ...row, category_id: catId });
    if (error) { console.error(`  ERROR (${_slug}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ── 4. card_rewards: dnata World ─────────────────────────────────────────
  console.log('\n[4/8] Inserting dnata World card_rewards (17)...');
  // World: 1.5% base; 25% of base = 0.375%; 10% of base = 0.15%
  const wldRows = buildRewards(WLD_ID, 0.015, 1.5, 0.00375, 0.375, 0.0015, 0.15, 3000, 'World', SRC_EARN);
  for (const r of wldRows) {
    const catId = cat[r._slug];
    if (!catId) { console.error(`  ERROR: unknown slug ${r._slug}`); errors++; continue; }
    const { _slug, ...row } = r;
    const { error } = await sb.from('card_rewards').insert({ ...row, category_id: catId });
    if (error) { console.error(`  ERROR (${_slug}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ── 5. card_benefits: dnata Platinum ─────────────────────────────────────
  console.log('\n[5/8] Inserting dnata Platinum card_benefits...');
  for (const b of [
    {
      card_id: PLA_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Mastercard Travel Pass — 4 visits/year)',
      description: '4 complimentary airport lounge visits per year via Mastercard Travel Pass (Mastercard Platinum UAE tier). Access to global lounges worldwide.',
      monetary_value_aed: null, usage_limit: 4, usage_period: 'yearly',
      conditions: '4 complimentary visits per year. Activation: 1 international purchase ≥ USD 1 unlocks access for next 3 calendar months; repeat quarterly. Guest fee applies.',
      is_active: true,
    },
    {
      card_id: PLA_ID,
      benefit_type: 'welcome_bonus',
      title: 'Up to 1,000 dnata Points Welcome Bonus',
      description: 'Up to 1,000 dnata points: 500 points on payment of joining fee + 500 points on retail spend of AED 10,000 within the first 3 billing statements.',
      monetary_value_aed: 1000,
      usage_limit: 1, usage_period: 'one_time',
      conditions: 'New cardholders. 500 points credited on joining fee payment. Additional 500 on AED 10,000 spend within first 3 billing statements.',
      is_active: true,
    },
    {
      card_id: PLA_ID,
      benefit_type: 'valet_parking',
      title: 'Free Valet Parking at Abu Dhabi Malls',
      description: 'Complimentary valet parking at malls in Abu Dhabi for dnata Platinum cardholders.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: '⚠️ Specific malls and visit limits not confirmed from product page — verify with ENBD.',
      is_active: true,
    },
    {
      card_id: PLA_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Movies + Buy-1-Get-1 Offers',
      description: 'Buy 1 Get 1 Free on cinema tickets. Buy-1-get-1 offers on select entertainment and lifestyle categories.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: null, is_active: true,
    },
  ]) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ── 6. card_benefits: dnata World ────────────────────────────────────────
  console.log('\n[6/8] Inserting dnata World card_benefits...');
  for (const b of [
    {
      card_id: WLD_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Mastercard Travel Pass — World Tier)',
      description: 'Complimentary access to 1,000+ airport lounges in 300+ cities worldwide via Mastercard Travel Pass (Mastercard World tier).',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: '⚠️ Specific visit count for Mastercard World UAE tier not confirmed on product page — verify with ENBD or Mastercard Travel Pass UAE terms. World tier generally provides more visits than Platinum (4/year).',
      is_active: true,
    },
    {
      card_id: WLD_ID,
      benefit_type: 'welcome_bonus',
      title: 'Up to 2,500 dnata Points Welcome Bonus',
      description: 'Up to 2,500 dnata points: 1,000 points on payment of joining fee + 1,500 points on retail spend of AED 25,000 within the first 3 billing statements.',
      monetary_value_aed: 2500,
      usage_limit: 1, usage_period: 'one_time',
      conditions: 'New cardholders. 1,000 points on joining fee payment. Additional 1,500 on AED 25,000 spend within first 3 billing statements.',
      is_active: true,
    },
    {
      card_id: WLD_ID,
      benefit_type: 'concierge',
      title: 'Concierge Service',
      description: '24/7 concierge desk to handle travel arrangements, reservations, and time-consuming errands.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: null, is_active: true,
    },
    {
      card_id: WLD_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking (Abu Dhabi)',
      description: 'Complimentary valet parking at selected locations in Abu Dhabi.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: '⚠️ Specific locations and visit frequency not confirmed — verify with ENBD.',
      is_active: true,
    },
    {
      card_id: WLD_ID,
      benefit_type: 'golf',
      title: 'Complimentary Golf Access (UAE Courses)',
      description: 'Complimentary access to top golf courses across the UAE for Mastercard World cardholders.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: '⚠️ Specific courses and visit limit not confirmed — verify with ENBD.',
      is_active: true,
    },
    {
      card_id: WLD_ID,
      benefit_type: 'travel',
      title: '1 Complimentary Airport Transfer per Year',
      description: '1 complimentary airport ride/transfer per year with your dnata World Credit Card.',
      monetary_value_aed: null, usage_limit: 1, usage_period: 'yearly',
      conditions: 'Once per calendar year. Specific provider and terms not confirmed — verify with ENBD.',
      is_active: true,
    },
    {
      card_id: WLD_ID,
      benefit_type: 'travel_insurance',
      title: 'Mastercard Travel Medical & Inconvenience Insurance',
      description: 'Mastercard travel medical and inconvenience insurance coverage. Free insurance cover for trips less than 180 days.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: 'Coverage for trips less than 180 days. Full terms and coverage limits subject to Mastercard World insurance policy.',
      is_active: true,
    },
  ]) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ── 7. Verify ─────────────────────────────────────────────────────────────
  console.log('\n[7/8] Verifying inserted data...');
  const { data: cards } = await sb
    .from('cards')
    .select('id, name, card_tier, min_salary_aed, annual_fee_aed, forex_markup_pct, lounge_access_count, interest_rate_monthly_pct')
    .in('id', [PLA_ID, WLD_ID]);
  for (const c of (cards || [])) {
    console.log(`  ${c.name}`);
    console.log(`    tier=${c.card_tier}, salary=${c.min_salary_aed}, fee=${c.annual_fee_aed}, forex=${c.forex_markup_pct}%, interest=${c.interest_rate_monthly_pct}%, lounge=${c.lounge_access_count ?? 'null'}`);
  }

  const { data: rCount } = await sb.from('card_rewards').select('card_id').in('card_id', [PLA_ID, WLD_ID]);
  const rc = {};
  for (const r of (rCount || [])) rc[r.card_id] = (rc[r.card_id] || 0) + 1;
  console.log(`\n  card_rewards: Platinum=${rc[PLA_ID]||0}, World=${rc[WLD_ID]||0}`);

  const { data: bCount } = await sb.from('card_benefits').select('card_id').in('card_id', [PLA_ID, WLD_ID]);
  const bc = {};
  for (const b of (bCount || [])) bc[b.card_id] = (bc[b.card_id] || 0) + 1;
  console.log(`  card_benefits: Platinum=${bc[PLA_ID]||0}, World=${bc[WLD_ID]||0}`);

  console.log('\n[8/8] Done.');
  if (errors === 0) console.log('  All inserts applied successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);

  console.log(`\nCard IDs:`);
  console.log(`  PLA_ID (dnata Platinum): ${PLA_ID}`);
  console.log(`  WLD_ID (dnata World):    ${WLD_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

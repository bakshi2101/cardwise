// Add ENBD Mastercard Titanium, Mastercard Platinum, Visa Infinite Credit Cards
//
// Sources:
//   - tcpdfs/ENBD Mastercard Titanium Credit Card...pdf → min_salary 5k, 1%, flight delay lounge, golf, BOGOF movies, Bon Appétit
//   - tcpdfs/ENBD Mastercard Platinum Credit Card...pdf → min_salary 12k, 1.5%, MC Travel Pass, golf 40%, Trip.com, Bon Appétit
//   - tcpdfs/ENBD Visa Infinite Credit Card...pdf       → min_salary 30k, 2%, unlimited lounge+1 guest, concierge, valet, BOGOF Reel, golf UAE
//   - tcpdfs/ENBD Earn Plus Points.pdf                  → Titanium cap=1000; MC Platinum cap=2000; Visa Infinite cap=3000
//                                                          EU+UK=0.4%; QSR/grocery/insurance=0.4%; fuel/utils/govt/edu/rent=0.2%
//   - tcpdfs/ENBD Redeem Plus Points.pdf                → 1 PP=AED 1 (instant/Nol/edu); 0.75 AED cashback; 7 Skywards/10 Etihad

const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-14';

const SRC_TIT  = 'tcpdfs/ENBD Mastercard Titanium Credit Card _ Titanium Credit Card Benefits _ Emirates NBD.pdf';
const SRC_PLA  = 'tcpdfs/ENBD Mastercard Platinum Credit Card _ Platinum Mastercard Benefits in the UAE, Dubai _ Emirates NBD.pdf';
const SRC_INF  = 'tcpdfs/ENBD Visa Infinite Credit Card - Get Exclusive Benefits _ Emirates NBD.pdf';
const SRC_EARN = 'tcpdfs/ENBD Earn Plus Points.pdf';

// ── reward builder ──────────────────────────────────────────────────────────
function buildRewards(cardId, genRate, genPct, cap, primarySrc, cat) {
  const r4 = 0.004, p4 = 0.4;
  const r2 = 0.002, p2 = 0.2;
  const base = (slug, rate, pct, notes) => ({
    card_id: cardId,
    category_id: cat[slug],
    reward_type: 'points',
    earn_rate: rate,
    earn_unit: 'per_aed',
    effective_return_pct: pct,
    monthly_cap_reward: cap,
    source_url: primarySrc,
    last_verified_date: TODAY,
    is_active: true,
    notes,
  });
  const gen = (slug, notes) => base(slug, genRate, genPct, notes);
  const r04 = (slug, notes) => base(slug, r4, p4, notes);
  const r02 = (slug, notes) => base(slug, r2, p2, notes);

  return [
    gen('dining',          `${genPct}% at restaurants and cafés. ⚠️ QSR/fast food chains earn 0.4% (lower tier). Source: ${SRC_EARN}`),
    r04('groceries',       `0.4% on supermarkets and groceries (lower tier). Source: ${SRC_EARN}`),
    r02('fuel',            `0.2% on fuel/petroleum (lowest earn tier). Source: ${SRC_EARN}`),
    gen('airlines',        `${genPct}% on airline ticket purchases. Source: ${SRC_EARN}`),
    gen('shopping',        `${genPct}% on shopping. ⚠️ Car dealership spend earns 0.4% (lower tier). Source: ${SRC_EARN}`),
    gen('hotels',          `${genPct}% on hotel bookings. Source: ${SRC_EARN}`),
    gen('other_travel',    `${genPct}% on travel agencies and booking sites. Source: ${SRC_EARN}`),
    gen('online_shopping', `${genPct}% on online shopping. Source: ${SRC_EARN}`),
    gen('entertainment',   `${genPct}% on entertainment. Source: ${SRC_EARN}`),
    r02('utilities',       `0.2% on utility payments (lowest earn tier). ⚠️ Utility payments via ENBD online/mobile/IVR/ATM may earn ZERO — verify TNC. Source: ${SRC_EARN}`),
    r02('education',       `0.2% on education/school fees (lowest earn tier). Source: ${SRC_EARN}`),
    r04('insurance',       `0.4% on insurance premiums (lower tier). Source: ${SRC_EARN}`),
    r02('government',      `0.2% on government fees and services (lowest earn tier). Source: ${SRC_EARN}`),
    r02('rent',            `0.2% on rent/real estate payments (lowest earn tier). Source: ${SRC_EARN}`),
    gen('healthcare',      `${genPct}% on healthcare — not in any restricted category per ENBD earn table. Source: ${SRC_EARN}`),
    gen('international',   `${genPct}% on international spend in most countries. ⚠️ EU and United Kingdom spend earns only 0.4% (same as groceries/insurance tier). Source: ${SRC_EARN}`),
    gen('general',         `${genPct}% on all other eligible spend not in specific categories. Source: ${SRC_EARN}`),
  ];
}

async function run() {
  let errors = 0;

  // ── 0. Load spending categories ────────────────────────────────────────────
  console.log('\n[0] Loading spending categories...');
  const { data: catRows, error: catErr } = await sb.from('spending_categories').select('id, slug');
  if (catErr) { console.error('FATAL:', catErr.message); process.exit(1); }
  const cat = {};
  for (const c of catRows) cat[c.slug] = c.id;
  console.log(`  Loaded ${catRows.length} categories`);

  // ── 1. Insert Titanium ─────────────────────────────────────────────────────
  console.log('\n[1/9] Inserting Mastercard Titanium card...');
  let TIT_ID;
  {
    const { data, error } = await sb.from('cards').insert({
      bank_id: ENBD_BANK_ID,
      name: 'Emirates NBD Mastercard Titanium Credit Card',
      card_network: 'mastercard',
      card_tier: 'titanium',
      annual_fee_aed: 0,
      min_salary_aed: 5000,
      reward_currency_name: 'Plus Points',
      reward_currency_value_aed: 1.0,
      base_earn_rate: 0.01,
      base_earn_unit: 'per_aed',
      forex_markup_pct: 1.99,
      interest_rate_monthly_pct: 3.69,
      lounge_access_count: null,
      lounge_access_network: 'flight_delay_pass',
      concierge: false,
      travel_insurance: false,
      purchase_protection: false,
      is_active: true,
      source_url: SRC_TIT,
      summary: [
        'VERIFIED 2026-06-14. Emirates NBD Mastercard Titanium Credit Card.',
        'Earn Plus Points: 1% (1 PP per AED 100) on general retail spend.',
        '0.4% on supermarkets, groceries, insurance, car dealerships, QSR/fast food.',
        '0.2% on fuel, utilities, real estate/rent, education, government, transit, telecom.',
        'EU and UK international spend earns 0.4% (not 1% general rate).',
        'Cap: 1,000 PP per statement cycle. No annual fee (current offer: waived).',
        'Min salary: AED 5,000. Forex: 1.99% ENBD + ~1.15% Mastercard = ~3.14% total.',
        'Interest: 3.69%/month (44.28% p.a.) per KFS (regulatory).',
        'Lounge: Flight delay only via Flight Delay Pass — NOT regular lounge access.',
        'Golf: up to 40% off at 100+ courses worldwide (Mastercard Platinum+Titanium benefit).',
        'BOGOF movie tickets. Bon Appétit dining discounts (up to 30% at 2,000+ UAE restaurants).',
        'Redemption: 1 PP = AED 1 (instant/Nol/edu); 0.75 AED cashback; 7 Skywards or 10 Etihad Miles.',
        'Sources: Titanium product page PDF + Earn Plus Points PDF + Redeem Plus Points PDF.',
      ].join(' '),
    }).select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { TIT_ID = data.id; console.log(`  OK — TIT_ID: ${TIT_ID}`); }
  }

  // ── 2. Insert Mastercard Platinum ──────────────────────────────────────────
  console.log('\n[2/9] Inserting Mastercard Platinum card...');
  let PLA_ID;
  {
    const { data, error } = await sb.from('cards').insert({
      bank_id: ENBD_BANK_ID,
      name: 'Emirates NBD Mastercard Platinum Credit Card',
      card_network: 'mastercard',
      card_tier: 'platinum',
      annual_fee_aed: 0,
      min_salary_aed: 12000,
      reward_currency_name: 'Plus Points',
      reward_currency_value_aed: 1.0,
      base_earn_rate: 0.015,
      base_earn_unit: 'per_aed',
      forex_markup_pct: 1.99,
      interest_rate_monthly_pct: 3.69,
      lounge_access_count: null,
      lounge_access_network: 'mastercard_travel_pass',
      concierge: false,
      travel_insurance: false,
      purchase_protection: false,
      is_active: true,
      source_url: SRC_PLA,
      summary: [
        'VERIFIED 2026-06-14. Emirates NBD Mastercard Platinum Credit Card.',
        'Earn Plus Points: 1.5% (1.5 PP per AED 100) on general retail spend.',
        '0.4% on supermarkets, groceries, insurance, car dealerships, QSR/fast food.',
        '0.2% on fuel, utilities, real estate/rent, education, government, transit, telecom.',
        'EU and UK international spend earns 0.4% (not 1.5% general rate).',
        'Cap: 2,000 PP per statement cycle. No annual fee (current offer: waived).',
        'Min salary: AED 12,000. Forex: 1.99% ENBD + ~1.15% Mastercard = ~3.14% total.',
        'Interest: 3.69%/month (44.28% p.a.) per KFS (regulatory).',
        'Complimentary lounge access to 900+ airports worldwide via Mastercard Travel Pass.',
        '⚠️ Visit count not stated on product page (Mastercard Platinum UAE tier typically 4/yr — verify).',
        'Golf: up to 40% off at 100+ courses worldwide. Trip.com: up to 10% travel discount.',
        'Bon Appétit: up to 30% off at 2,000+ UAE restaurants.',
        'Redemption: 1 PP = AED 1 (instant/Nol/edu); 0.75 AED cashback; 7 Skywards or 10 Etihad Miles.',
        'Sources: Platinum product page PDF + Earn Plus Points PDF + Redeem Plus Points PDF.',
      ].join(' '),
    }).select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { PLA_ID = data.id; console.log(`  OK — PLA_ID: ${PLA_ID}`); }
  }

  // ── 3. Insert Visa Infinite ────────────────────────────────────────────────
  console.log('\n[3/9] Inserting Visa Infinite card...');
  let INF_ID;
  {
    const { data, error } = await sb.from('cards').insert({
      bank_id: ENBD_BANK_ID,
      name: 'Emirates NBD Visa Infinite Credit Card',
      card_network: 'visa',
      card_tier: 'infinite',
      annual_fee_aed: 1575,
      min_salary_aed: 30000,
      reward_currency_name: 'Plus Points',
      reward_currency_value_aed: 1.0,
      base_earn_rate: 0.02,
      base_earn_unit: 'per_aed',
      forex_markup_pct: 1.99,
      interest_rate_monthly_pct: 3.69,
      lounge_access_count: null,
      lounge_access_network: 'visa_airport_companion',
      concierge: true,
      travel_insurance: true,
      purchase_protection: true,
      is_active: true,
      source_url: SRC_INF,
      summary: [
        'VERIFIED 2026-06-14. Emirates NBD Visa Infinite Credit Card.',
        'Earn Plus Points: 2% (2 PP per AED 100) on general retail spend.',
        '0.4% on supermarkets, groceries, insurance, car dealerships, QSR/fast food.',
        '0.2% on fuel, utilities, real estate/rent, education, government, transit, telecom.',
        'EU and UK international spend earns 0.4% (not 2% general rate).',
        'Cap: 3,000 PP per statement cycle. Annual fee: AED 1,575.',
        'Min salary: AED 30,000. Forex: 1.99% ENBD + ~1.15% Visa = ~3.14% total.',
        'Interest: 3.69%/month (44.28% p.a.) per KFS (regulatory).',
        'Unlimited airport lounge access (self + 1 guest free) via Visa Airport Companion App to 1,000+ lounges in 300+ cities.',
        'Requires AED 5,000 spend in calendar month of lounge visit (standard Visa Infinite condition).',
        'BOGOF cinema at Reel Cinemas. Complimentary golf access at UAE courses.',
        'Concierge services. Valet parking at selected Abu Dhabi locations.',
        'Visa Purchase Protection (free insurance on big-ticket purchases), Visa Medical & travel assistance.',
        'Redemption: 1 PP = AED 1 (instant/Nol/edu); 0.75 AED cashback; 7 Skywards or 10 Etihad Miles.',
        'Sources: Visa Infinite product page PDF + Earn Plus Points PDF + Redeem Plus Points PDF.',
      ].join(' '),
    }).select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { INF_ID = data.id; console.log(`  OK — INF_ID: ${INF_ID}`); }
  }

  if (!TIT_ID || !PLA_ID || !INF_ID) {
    console.error('\n[ABORT] One or more card inserts failed — stopping.');
    process.exit(1);
  }

  // ── 4. card_rewards: Titanium ──────────────────────────────────────────────
  console.log('\n[4/9] Inserting Titanium card_rewards (17)...');
  for (const r of buildRewards(TIT_ID, 0.01, 1.0, 1000, SRC_TIT, cat)) {
    const { error } = await sb.from('card_rewards').insert(r);
    if (error) { console.error(`  ERROR (${r.category_id}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ── 5. card_rewards: Mastercard Platinum ──────────────────────────────────
  console.log('\n[5/9] Inserting Mastercard Platinum card_rewards (17)...');
  for (const r of buildRewards(PLA_ID, 0.015, 1.5, 2000, SRC_PLA, cat)) {
    const { error } = await sb.from('card_rewards').insert(r);
    if (error) { console.error(`  ERROR (${r.category_id}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ── 6. card_rewards: Visa Infinite ────────────────────────────────────────
  console.log('\n[6/9] Inserting Visa Infinite card_rewards (17)...');
  for (const r of buildRewards(INF_ID, 0.02, 2.0, 3000, SRC_INF, cat)) {
    const { error } = await sb.from('card_rewards').insert(r);
    if (error) { console.error(`  ERROR (${r.category_id}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ── 7. card_benefits: Titanium ────────────────────────────────────────────
  console.log('\n[7/9] Inserting Titanium card_benefits...');
  for (const b of [
    {
      card_id: TIT_ID,
      benefit_type: 'lounge_access',
      title: 'Flight Delay Airport Lounge Access (Flight Delay Pass)',
      description: 'Complimentary airport lounge access when your flight is delayed, via Flight Delay Pass. This is a flight-delay-triggered benefit — NOT regular pre-departure lounge access.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: 'Only accessible when a qualifying flight delay occurs. Not valid for regular lounge visits.',
      is_active: true,
    },
    {
      card_id: TIT_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Movie Tickets',
      description: 'Buy 1 Get 1 Free on cinema tickets at participating cinemas.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: null, is_active: true,
    },
    {
      card_id: TIT_ID,
      benefit_type: 'golf',
      title: 'Golf Discount (Up to 40% at 100+ Courses)',
      description: 'Up to 40% discount at over 100 golf courses worldwide. Mastercard Titanium and Platinum shared benefit.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: 'Discount percentage varies by course. Valid at participating courses through Mastercard golf privileges.',
      is_active: true,
    },
    {
      card_id: TIT_ID,
      benefit_type: 'dining',
      title: 'Bon Appétit Dining Discounts',
      description: 'Exclusive dining experience — up to 30% off at over 2,000 restaurants across the UAE through the Bon Appétit programme.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: 'Valid at participating Bon Appétit programme restaurants. Discount varies by outlet.',
      is_active: true,
    },
  ]) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ── 8. card_benefits: Mastercard Platinum ─────────────────────────────────
  console.log('\n[8/9] Inserting Mastercard Platinum card_benefits...');
  for (const b of [
    {
      card_id: PLA_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Mastercard Travel Pass)',
      description: 'Complimentary access to 900+ airport lounges worldwide via Mastercard Travel Pass.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: '⚠️ Visit count not confirmed from product page. Mastercard Platinum UAE tier typically offers 4 complimentary visits/year — verify with ENBD. Guest visits may incur additional fee.',
      is_active: true,
    },
    {
      card_id: PLA_ID,
      benefit_type: 'golf',
      title: 'Golf Discount (Up to 40% at 100+ Courses)',
      description: 'Up to 40% discount at over 100 golf courses worldwide through Mastercard golf privileges.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: 'Valid at participating courses worldwide. Discount varies by course.',
      is_active: true,
    },
    {
      card_id: PLA_ID,
      benefit_type: 'travel',
      title: 'Trip.com Travel Discount (Up to 10%)',
      description: 'Up to 10% discount on bookings made through Trip.com.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: 'Valid for bookings through Trip.com. Discount varies by booking type.',
      is_active: true,
    },
    {
      card_id: PLA_ID,
      benefit_type: 'dining',
      title: 'Bon Appétit Dining Discounts',
      description: 'Up to 30% off at over 2,000 restaurants across the UAE through the Bon Appétit programme.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: 'Valid at participating Bon Appétit programme restaurants. Discount varies by outlet.',
      is_active: true,
    },
  ]) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ── 9. card_benefits: Visa Infinite ───────────────────────────────────────
  console.log('\n[9/9] Inserting Visa Infinite card_benefits...');
  for (const b of [
    {
      card_id: INF_ID,
      benefit_type: 'lounge_access',
      title: 'Unlimited Airport Lounge Access + 1 Guest (Visa Airport Companion)',
      description: 'Unlimited complimentary access to 1,000+ airport lounges in 300+ cities for cardholder + 1 guest per visit, via Visa Airport Companion App.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: 'Requires AED 5,000 spend in the calendar month of the lounge visit (standard Visa Infinite condition). Guest included free (1 per visit). Access via Visa Airport Companion App.',
      is_active: true,
    },
    {
      card_id: INF_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Cinema Tickets (Reel Cinemas)',
      description: 'Buy 1 Get 1 Free cinema tickets at Reel Cinemas.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: 'Valid at Reel Cinemas. Specific terms (min spend, frequency) not stated on product page — verify with ENBD.',
      is_active: true,
    },
    {
      card_id: INF_ID,
      benefit_type: 'golf',
      title: 'Complimentary Golf Access (UAE Courses)',
      description: 'Complimentary access to top golf courses across the UAE for Visa Infinite cardholders.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'yearly',
      conditions: '⚠️ Specific courses and visit frequency not stated on product page — verify with ENBD.',
      is_active: true,
    },
    {
      card_id: INF_ID,
      benefit_type: 'concierge',
      title: 'Visa Infinite Concierge Service',
      description: '24/7 concierge service to handle travel arrangements, reservations, information requests, and other time-consuming errands.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: null, is_active: true,
    },
    {
      card_id: INF_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking (Abu Dhabi)',
      description: 'Complimentary valet parking at selected locations in Abu Dhabi.',
      monetary_value_aed: null, usage_limit: null, usage_period: 'monthly',
      conditions: '⚠️ Specific Abu Dhabi locations and visit limit not stated on product page — verify with ENBD.',
      is_active: true,
    },
  ]) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ── Verify ─────────────────────────────────────────────────────────────────
  console.log('\n[Verify] Checking inserted data...');
  const { data: cards } = await sb
    .from('cards')
    .select('id, name, card_tier, min_salary_aed, annual_fee_aed, lounge_access_network')
    .in('id', [TIT_ID, PLA_ID, INF_ID]);
  for (const c of (cards || [])) {
    console.log(`  ${c.name}`);
    console.log(`    tier=${c.card_tier}, min_salary=${c.min_salary_aed}, fee=${c.annual_fee_aed}, lounge_network=${c.lounge_access_network}`);
  }

  const { data: rewardCounts } = await sb
    .from('card_rewards')
    .select('card_id')
    .in('card_id', [TIT_ID, PLA_ID, INF_ID]);
  const counts = {};
  for (const r of (rewardCounts || [])) counts[r.card_id] = (counts[r.card_id] || 0) + 1;
  console.log(`\n  card_rewards: TIT=${counts[TIT_ID]||0}, PLA=${counts[PLA_ID]||0}, INF=${counts[INF_ID]||0}`);

  const { data: benCounts } = await sb
    .from('card_benefits')
    .select('card_id')
    .in('card_id', [TIT_ID, PLA_ID, INF_ID]);
  const bc = {};
  for (const b of (benCounts || [])) bc[b.card_id] = (bc[b.card_id] || 0) + 1;
  console.log(`  card_benefits: TIT=${bc[TIT_ID]||0}, PLA=${bc[PLA_ID]||0}, INF=${bc[INF_ID]||0}`);

  console.log('\n[Done]');
  if (errors === 0) console.log('  All inserts applied successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);

  // Print IDs for docs update
  console.log(`\nCard IDs for docs:`);
  console.log(`  TIT_ID: ${TIT_ID}`);
  console.log(`  PLA_ID: ${PLA_ID}`);
  console.log(`  INF_ID: ${INF_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

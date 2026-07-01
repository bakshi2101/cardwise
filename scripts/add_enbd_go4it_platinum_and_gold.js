// Add ENBD Go4it Platinum + Go4it Gold Credit Cards
//
// Sources:
//   tcpdfs/ENBD Go4it Platinum Credit Card - Elevate Your Lifestyle _ Emirates NBD.pdf
//     → Earn: 5 PP/AED 200 weekends (2.5%) | 4 PP/AED 200 RTA (2.0%) | 1 PP/AED 200 weekdays (0.5%)
//     → Cap: 3,000 PP/stmt (confirmed Earn Plus Points PDF — same tier as Visa Infinite)
//     → Annual fee: AED 0 (promo). Min salary: AED 12,000.
//     → Built-in RTA Nol chip. Dubai Metro Gold Class access.
//     → Benefits: BOGOF VOX Cinemas, free Dubai Ferry rides, lounge via Visa Airport Companion,
//       life insurance AED 100k, 20% off Activate/Magic Planet/iFly, 15% off Snow Abu Dhabi.
//
//   tcpdfs/ENBD Go4it Gold Credit Card _ Go4it Gold Card Offers in the UAE, Dubai _ Emirates NBD.pdf
//     → Earn: 5 PP/AED 400 weekends (1.25%) | 4 PP/AED 400 RTA (1.0%) | 1 PP/AED 400 weekdays (0.25%)
//     → Cap: 2,000 PP/stmt (grouped with Visa Platinum tier in Earn Plus Points PDF)
//     → Annual fee: AED 0 (promo). Min salary: AED 5,000.
//     → Built-in RTA Nol chip. Dubai Metro Regular Class access.
//     → Benefits: free Dubai Ferry rides, lounge via Visa Airport Companion,
//       life insurance AED 75k, BOGOF with The Entertainer (Visa benefit).
//
//   tcpdfs/ENBD Earn Plus Points.pdf
//     → Confirms Go4it Platinum cap = 3,000 PP/stmt (Visa Infinite tier)
//     → Confirms Go4it Gold cap = 2,000 PP/stmt (Visa Platinum tier)
//
// IMPORTANT — Earn structure is TIME/MERCHANT-based, not category-based:
//   All categories earn either the weekday or weekend rate depending on day of spend.
//   RTA-specific spend earns the dedicated RTA rate via built-in Nol chip.
//   Stored as weekday rate (floor) per category; notes document full tiered structure.
//
// Plus Points value: 1 PP = AED 1 (instant/Nol/education); AED 0.75 cashback;
//                   7 Skywards Miles or 10 Etihad Miles.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY = '2026-06-15';
const SRC_PLT  = 'tcpdfs/ENBD Go4it Platinum Credit Card - Elevate Your Lifestyle _ Emirates NBD.pdf';
const SRC_GLD  = 'tcpdfs/ENBD Go4it Gold Credit Card _ Go4it Gold Card Offers in the UAE, Dubai _ Emirates NBD.pdf';
const SRC_EARN = 'tcpdfs/ENBD Earn Plus Points.pdf';

// Build note strings for a card's earn structure
function buildNotes(weekdayPct, weekendPct, rtaPct, cap, src) {
  return {
    general: [
      `⚠️ TIME-BASED EARN: ${weekdayPct}% on weekdays | ${weekendPct}% on weekends | ${rtaPct}% on RTA spend.`,
      `Stored rate = ${weekdayPct}% (weekday floor). Weekend rate = ${weekendPct}% applies to ALL categories on Sat/Sun.`,
      `Cap: ${cap} PP per statement. 1 PP = AED 1.`,
      `Source: ${src}`,
    ].join(' '),
    utilities: [
      `⚠️ TIME-BASED EARN: ${weekdayPct}% on weekdays | ${weekendPct}% on weekends.`,
      `🎁 RTA-SPECIFIC: RTA transit spend (Dubai Metro, bus, water bus, RTA parking) earns ${rtaPct}% via built-in Nol chip.`,
      `Non-RTA utilities (DEWA, Etisalat, du, SEWA) earn weekday/weekend rate (${weekdayPct}%/${weekendPct}%).`,
      `Cap: ${cap} PP per statement.`,
      `Source: ${src}`,
    ].join(' '),
  };
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

  let PLT_ID, GLD_ID;

  // ─── 1. Insert Go4it Platinum ──────────────────────────────────────────────
  console.log('\n[1/8] Inserting Go4it Platinum card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: 'Emirates NBD Go4it Platinum Credit Card',
        card_network: 'visa',
        card_tier: 'platinum',
        annual_fee_aed: 0,
        min_salary_aed: 12000,
        reward_currency_name: 'Plus Points',
        reward_currency_value_aed: 1.0,
        base_earn_rate: 0.005,   // 0.5% weekday floor
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: 3.69,
        lounge_access_count: null,   // unspecified count; Visa Airport Companion access
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,
        travel_insurance: true,      // Visa Medical & travel assistance
        purchase_protection: true,   // Visa Purchase Protection
        concierge: false,
        airport_transfer_count: null,
        source_url: SRC_PLT,
        summary: [
          'VERIFIED 2026-06-15. ENBD Go4it Platinum Credit Card.',
          'UNIQUE: Built-in RTA Nol chip — use as Nol card on Dubai Metro, RTA parking, buses, water bus; eligible for RTA Monthly Pass.',
          'Dubai Metro: Gold Class access + Gold Class fare payment via Nol Tag ID.',
          'TIME-BASED EARN (not category-based):',
          '5 PP / AED 200 on weekends = 2.5% effective;',
          '4 PP / AED 200 on RTA spend = 2.0% effective;',
          '1 PP / AED 200 on weekdays = 0.5% effective.',
          'ALL categories earn at weekday/weekend rate based on day of spend.',
          'Cap: 3,000 PP per statement (Earn Plus Points PDF — same cap tier as Visa Infinite).',
          'Annual fee: AED 0 (promotional offer). Min salary: AED 12,000.',
          'BOGOF movies at VOX Cinemas. Free rides on Dubai Ferry.',
          'Airport lounge access via Visa Airport Companion App.',
          'Complimentary life insurance up to AED 100,000.',
          '20% off Activate (City Centre Mall), Magic Planet; 20% off iFly Dubai; 15% off Snow Abu Dhabi Snow Park.',
          'Visa Purchase Protection. Visa Extended Warranty. Visa Medical & Travel Assistance.',
          'Bon Appétit dining discounts. 24/7 roadside assistance. DoubleSecure.',
          'Redemption: 1 PP = AED 1 (instant/Nol/education); AED 0.75 cashback; 7 Skywards or 10 Etihad Miles.',
          'Forex: 1.99% ENBD + ~1.15% Visa = ~3.14% total. Interest: 3.69%/month (KFS).',
          'Sources: Go4it Platinum product page PDF + Earn Plus Points PDF.',
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { PLT_ID = data.id; console.log(`  OK — PLT_ID: ${PLT_ID}`); }
  }

  // ─── 2. Insert Go4it Gold ──────────────────────────────────────────────────
  console.log('\n[2/8] Inserting Go4it Gold card...');
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id: ENBD_BANK_ID,
        name: 'Emirates NBD Go4it Gold Credit Card',
        card_network: 'visa',
        card_tier: 'gold',
        annual_fee_aed: 0,
        min_salary_aed: 5000,
        reward_currency_name: 'Plus Points',
        reward_currency_value_aed: 1.0,
        base_earn_rate: 0.0025,  // 0.25% weekday floor
        base_earn_unit: 'per_aed',
        forex_markup_pct: 1.99,
        interest_rate_monthly_pct: 3.69,
        lounge_access_count: null,   // unspecified; Visa Airport Companion
        lounge_access_network: 'visa_airport_companion',
        valet_parking_count: null,
        travel_insurance: true,      // Visa Medical & travel assistance
        purchase_protection: true,   // Visa Purchase Protection
        concierge: false,
        airport_transfer_count: null,
        source_url: SRC_GLD,
        summary: [
          'VERIFIED 2026-06-15. ENBD Go4it Gold Credit Card.',
          'UNIQUE: Built-in RTA Nol chip — use as Nol card on Dubai Metro, RTA parking, buses, water bus; eligible for RTA Monthly Pass.',
          'Dubai Metro: Regular Class access + Regular Class fare payment via Nol Tag ID.',
          'TIME-BASED EARN (not category-based):',
          '5 PP / AED 400 on weekends = 1.25% effective;',
          '4 PP / AED 400 on RTA spend = 1.0% effective;',
          '1 PP / AED 400 on weekdays = 0.25% effective.',
          'ALL categories earn at weekday/weekend rate based on day of spend.',
          'Cap: 2,000 PP per statement (Earn Plus Points PDF — Visa Platinum cap tier).',
          'Annual fee: AED 0 (promotional offer). Min salary: AED 5,000.',
          'Free rides on Dubai Ferry. Airport lounge access via Visa Airport Companion App.',
          'Complimentary life insurance up to AED 75,000.',
          'BOGOF with The Entertainer (Visa benefit). Bon Appétit dining discounts.',
          'Visa Purchase Protection. Visa Extended Warranty. Visa Medical & Travel Assistance.',
          '24/7 roadside assistance. DoubleSecure.',
          'Redemption: 1 PP = AED 1 (instant/Nol/education); AED 0.75 cashback; 7 Skywards or 10 Etihad Miles.',
          'Forex: 1.99% ENBD + ~1.15% Visa = ~3.14% total. Interest: 3.69%/month (KFS).',
          'Sources: Go4it Gold product page PDF + Earn Plus Points PDF.',
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { GLD_ID = data.id; console.log(`  OK — GLD_ID: ${GLD_ID}`); }
  }

  if (!PLT_ID || !GLD_ID) {
    console.error('\nCard insertion failed — aborting');
    process.exit(1);
  }

  // ─── 3. Go4it Platinum card_rewards (17) ──────────────────────────────────
  // Weekday floor rate stored; notes document 2.5% weekend + 2.0% RTA
  console.log('\n[3/8] Inserting Go4it Platinum card_rewards (17)...');
  const pltNotes = buildNotes(0.5, 2.5, 2.0, 3000, SRC_PLT);

  const SLUGS_ALL = [
    'dining','groceries','fuel','airlines','shopping','hotels',
    'travel','online_shopping','entertainment','utilities',
    'education','insurance','government','rent','healthcare',
    'international','general',
  ];

  for (const slug of SLUGS_ALL) {
    const catId = cat[slug];
    if (!catId) { console.error(`  ERROR: unknown slug ${slug}`); errors++; continue; }
    const notes = slug === 'utilities' ? pltNotes.utilities : pltNotes.general;
    const { error } = await sb.from('card_rewards').insert({
      card_id: PLT_ID,
      category_id: catId,
      reward_type: 'points',
      earn_rate: 0.005,            // 0.5% weekday floor = 1 PP per AED 200
      earn_unit: 'per_aed',
      effective_return_pct: 0.5,
      monthly_cap_reward: 3000,
      source_url: SRC_PLT,
      last_verified_date: TODAY,
      is_active: true,
      notes,
    });
    if (error) { console.error(`  ERROR (${slug}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ─── 4. Go4it Gold card_rewards (17) ──────────────────────────────────────
  // Weekday floor rate stored; notes document 1.25% weekend + 1.0% RTA
  console.log('\n[4/8] Inserting Go4it Gold card_rewards (17)...');
  const gldNotes = buildNotes(0.25, 1.25, 1.0, 2000, SRC_GLD);

  for (const slug of SLUGS_ALL) {
    const catId = cat[slug];
    if (!catId) { console.error(`  ERROR: unknown slug ${slug}`); errors++; continue; }
    const notes = slug === 'utilities' ? gldNotes.utilities : gldNotes.general;
    const { error } = await sb.from('card_rewards').insert({
      card_id: GLD_ID,
      category_id: catId,
      reward_type: 'points',
      earn_rate: 0.0025,           // 0.25% weekday floor = 1 PP per AED 400
      earn_unit: 'per_aed',
      effective_return_pct: 0.25,
      monthly_cap_reward: 2000,
      source_url: SRC_GLD,
      last_verified_date: TODAY,
      is_active: true,
      notes,
    });
    if (error) { console.error(`  ERROR (${slug}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ─── 5. Go4it Platinum card_benefits ──────────────────────────────────────
  console.log('\n[5/8] Inserting Go4it Platinum card_benefits...');
  const plt_benefits = [
    {
      card_id: PLT_ID,
      benefit_type: 'lounge_access',
      title: 'Airport Lounge Access (Visa Airport Companion)',
      description: 'Complimentary airport lounge access worldwide via Visa Airport Companion App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: PLT_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Movie Tickets at VOX Cinemas',
      description: 'Buy 1 Get 1 Free movie tickets at VOX Cinemas.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: PLT_ID,
      benefit_type: 'lifestyle',
      title: 'Free Rides on Dubai Ferry',
      description: 'Complimentary rides on the Dubai Ferry to experience scenic sites and landmarks of Dubai.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via built-in RTA Nol chip on Go4it card.',
      is_active: true,
    },
    {
      card_id: PLT_ID,
      benefit_type: 'lifestyle',
      title: 'Dubai Metro Gold Class Access + RTA Nol Functionality',
      description: 'Built-in RTA Nol chip: use Go4it card as Nol card on Dubai Metro (Gold Class), RTA parking meters, buses, water bus stations. Eligible for RTA Monthly Pass.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Gold Class access and fare payment via Nol Tag ID. Use card at RTA tap points.',
      is_active: true,
    },
    {
      card_id: PLT_ID,
      benefit_type: 'insurance',
      title: 'Complimentary Life Insurance (AED 100,000)',
      description: 'Complimentary life insurance cover of up to AED 100,000 for the cardholder.',
      monetary_value_aed: 100000,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to life insurance T&Cs. Credit Shield Pro available separately at 0.99%/month.',
      is_active: true,
    },
    {
      card_id: PLT_ID,
      benefit_type: 'entertainment',
      title: '20% Off Entertainment (Activate, Magic Planet, iFly Dubai; 15% Snow Abu Dhabi)',
      description: '20% off at Activate (City Centre Mall, min 2 players or 2 hours); 20% additional value in points on Magic Planet packages AED 210+; 20% off all iFly Dubai ticket types; 15% off Snow Abu Dhabi Snow Park tickets and Snow Premium package.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Discounts valid exclusively at participating entertainment venues with eligible Emirates NBD card. Specific venue conditions apply.',
      is_active: true,
    },
  ];

  for (const b of plt_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 6. Go4it Gold card_benefits ──────────────────────────────────────────
  console.log('\n[6/8] Inserting Go4it Gold card_benefits...');
  const gld_benefits = [
    {
      card_id: GLD_ID,
      benefit_type: 'lounge_access',
      title: 'Complimentary Airport Lounge Access (Visa Airport Companion)',
      description: 'Complimentary lounge access worldwide via Visa Airport Companion App.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via Visa Airport Companion App. Visit count not specified on product page.',
      is_active: true,
    },
    {
      card_id: GLD_ID,
      benefit_type: 'lifestyle',
      title: 'Free Rides on Dubai Ferry',
      description: 'Complimentary rides on the Dubai Ferry to experience scenic sites and landmarks of Dubai.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Via built-in RTA Nol chip on Go4it card.',
      is_active: true,
    },
    {
      card_id: GLD_ID,
      benefit_type: 'lifestyle',
      title: 'Dubai Metro Regular Class Access + RTA Nol Functionality',
      description: 'Built-in RTA Nol chip: use Go4it card as Nol card on Dubai Metro (Regular Class), RTA parking meters, buses, water bus stations. Eligible for RTA Monthly Pass.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Regular Class access (not Gold Class). Use card at RTA tap points.',
      is_active: true,
    },
    {
      card_id: GLD_ID,
      benefit_type: 'insurance',
      title: 'Complimentary Life Insurance (AED 75,000)',
      description: 'Complimentary life insurance cover of up to AED 75,000 for the cardholder.',
      monetary_value_aed: 75000,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Subject to life insurance T&Cs. Credit Shield Pro available separately at 0.99%/month.',
      is_active: true,
    },
    {
      card_id: GLD_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF with The Entertainer (Visa)',
      description: 'Buy 1 Get 1 Free offers across dining, leisure, and entertainment via The Entertainer — Visa cardholder benefit.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Visa benefit. Valid at participating Entertainer merchants.',
      is_active: true,
    },
  ];

  for (const b of gld_benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 7. Verify ────────────────────────────────────────────────────────────
  console.log('\n[7/8] Verifying final state...');

  const { data: cards } = await sb
    .from('cards')
    .select('id, name, card_tier, min_salary_aed, annual_fee_aed, lounge_access_count, lounge_access_network')
    .in('id', [PLT_ID, GLD_ID]);
  for (const c of cards) {
    console.log(`  ${c.name}`);
    console.log(`    tier=${c.card_tier}, salary=${c.min_salary_aed}, fee=${c.annual_fee_aed}`);
    console.log(`    lounge=${c.lounge_access_count === null ? 'unspecified' : c.lounge_access_count}, network=${c.lounge_access_network}`);
  }

  const { data: rewards } = await sb
    .from('card_rewards')
    .select('card_id, effective_return_pct, monthly_cap_reward')
    .in('card_id', [PLT_ID, GLD_ID]);
  const pltR = rewards.filter(r => r.card_id === PLT_ID);
  const gldR = rewards.filter(r => r.card_id === GLD_ID);
  console.log(`\n  Go4it Platinum: ${pltR.length} reward rows, caps=[${[...new Set(pltR.map(r => r.monthly_cap_reward))]}], base rate=${pltR[0]?.effective_return_pct}%`);
  console.log(`  Go4it Gold:     ${gldR.length} reward rows, caps=[${[...new Set(gldR.map(r => r.monthly_cap_reward))]}], base rate=${gldR[0]?.effective_return_pct}%`);

  const { data: benefits } = await sb
    .from('card_benefits')
    .select('card_id, benefit_type, title')
    .in('card_id', [PLT_ID, GLD_ID])
    .order('card_id');
  console.log(`\n  card_benefits (${benefits.length} total):`);
  for (const b of benefits) {
    const tag = b.card_id === PLT_ID ? 'Platinum' : 'Gold';
    console.log(`    [Go4it ${tag}] ${b.benefit_type} — ${b.title}`);
  }

  // ─── 8. Done ───────────────────────────────────────────────────────────────
  console.log('\n[8/8] Done.');
  if (errors === 0) console.log('  All data inserted successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);

  console.log(`\nCard IDs:`);
  console.log(`  PLT_ID (Go4it Platinum): ${PLT_ID}`);
  console.log(`  GLD_ID (Go4it Gold):     ${GLD_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

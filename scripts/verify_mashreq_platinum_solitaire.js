// Verify Mashreq Platinum Plus + Solitaire
// Sources:
//   - Mashreq-Cards-KFS-new-en-ar.pdf (KFS_Cards_05 2026 = May 2026 — most authoritative)
//   - Mashreq-Cards-KFS-Final-EngArb.pdf (KFS_Cards_180325 = March 2025 — older, for reference)
//   - mashreq-airport-lounge-tnc-en.pdf — lounge network & count
//   - mashreq-welcome-offer-tnc-eng.pdf — welcome bonus structure
//   - https://www.mashreq.com/en/uae/neo/cards/credit-cards/platinum-plus-credit-card/
//   - https://www.mashreq.com/en/uae/neo/cards/credit-cards/solitaire-credit-card/
//
// Key decisions:
//   - Lounge: Platinum Plus = LoungeKey (4/yr, AED 7K/month spend), Solitaire = Visa Airport Companion (12/yr)
//   - Earn rates: May 2026 KFS is authoritative; Solitaire website shows stale March 2025 rates
//   - Forex markup: 2.99% (unconfirmed in docs; assumed consistent with Mashreq Cashback/Noon)
//   - Point value: AED 0.003/pt (unconfirmed in available docs; retained from existing DB)
//
// Solitaire KFS May 2026 vs website discrepancy (flagged):
//   Website shows: Intl=6pts, Airlines/Hotels=4pts, Other local=2pts, Restricted=1pt
//   KFS May 2026:  Intl=5pts, Dining/Groceries=3pts, Other local=1pt, Restricted=0.5pts
//   Using KFS May 2026 as authoritative (official bank document).

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const PP_ID = '25c2e049-d94a-44ef-8bb5-d131eda9e6b5'; // Platinum Plus
const SOL_ID = '9130eaec-f5c5-4b28-907d-8636bf8fb3ec'; // Solitaire
const TODAY = '2026-06-13';
const PP_URL = 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/platinum-plus-credit-card/';
const SOL_URL = 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/solitaire-credit-card/';
const KFS_URL = 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/';

const PT_VAL = 0.003; // AED per Vantage Point (unconfirmed — retained from DB)

// Category IDs
const CAT = {
  dining:        'b7938d64-7ff6-4f84-9b0d-c35010e5fa58',
  groceries:     '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:          'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  airlines:      'c418c3e6-9403-4ce6-8647-ed52782a59eb',
  shopping:      '5212cc11-77de-432c-8340-994f35e03d1b',
  hotels:        'f990d8af-9955-4b22-881c-4cf4de2cbe3e',
  travel:        '592dad17-981b-4af8-8095-596507f0b780',
  online:        '8e3f1bc5-f519-4f2a-82b9-cefa8ebfda86',
  entertainment: 'dd8d714c-1e5a-4db5-91d4-fba3756ed77c',
  utilities:     '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:     '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  insurance:     'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  government:    'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  rent:          'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  healthcare:    'a9aad3fe-9afa-4c12-957f-153994b5e501',
  international: '98c97cac-1b7d-48dc-a661-476c7baeb9af',
  general:       '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f',
};

function eff(pts) { return parseFloat((pts * PT_VAL * 100).toFixed(4)); }

// ============================================================
// PLATINUM PLUS EARN RATES (effective June 13, 2026 per KFS May 2026 + website)
// - 10 pts/AED: fuel, dining, groceries
// - 0.5 pts/AED: govt, utilities, education, charity/insurance, rent/rental, telecom(in utilities)
// - 2 pts/AED: international + all other local
// - No points on online/mobile banking bill payments
// ============================================================
const PP_REWARDS = [
  { cat: CAT.dining,        rate: 10,  notes: '10 pts/AED on dining incl. online food delivery. Per KFS May 2026 + website June 13 2026. No points on bill payments via online/mobile banking.' },
  { cat: CAT.groceries,     rate: 10,  notes: '10 pts/AED on supermarkets/groceries. Per KFS May 2026. LuLu and Carrefour earn at this rate.' },
  { cat: CAT.fuel,          rate: 10,  notes: '10 pts/AED on fuel (ADNOC, ENOC, Emarat). Per KFS May 2026 — fuel moved into bonus tier (was 0.5/AED restricted in older versions).' },
  { cat: CAT.airlines,      rate: 2,   notes: '2 pts/AED on airline tickets. "Other local" tier. Old KFS (March 2025) had airlines separate at same 2pts but travel was 4pts on Platinum Elite; Platinum Plus has no travel tier — all "other local" = 2pts.' },
  { cat: CAT.shopping,      rate: 2,   notes: '2 pts/AED on general shopping. "Other local" tier per KFS May 2026.' },
  { cat: CAT.hotels,        rate: 2,   notes: '2 pts/AED on hotels. "Other local" tier per KFS May 2026.' },
  { cat: CAT.travel,        rate: 2,   notes: '2 pts/AED on travel agencies, booking portals. "Other local" tier per KFS May 2026.' },
  { cat: CAT.online,        rate: 2,   notes: '2 pts/AED on online shopping (Amazon.ae, Noon, etc.). "International and other local" tier per KFS May 2026.' },
  { cat: CAT.entertainment, rate: 2,   notes: '2 pts/AED on entertainment. "Other local" tier per KFS May 2026.' },
  { cat: CAT.utilities,     rate: 0.5, notes: '0.5 pts/AED on utilities + telecom. "Government payments, utilities, fuel, education, charity, rental & telecom" restricted tier. Changed from 1 pt/AED to 0.5 pt/AED effective June 13, 2026 per website notice + KFS May 2026. No points on bill payments via mobile/online banking.' },
  { cat: CAT.education,     rate: 0.5, notes: '0.5 pts/AED on education fees. Restricted tier per KFS May 2026 (changed from 1 pt effective June 13, 2026).' },
  { cat: CAT.insurance,     rate: 2,   notes: '2 pts/AED on insurance premiums. Not listed in the restricted merchant categories in KFS; falls into "other local" 2 pts tier.' },
  { cat: CAT.government,    rate: 0.5, notes: '0.5 pts/AED on government payments/fines. Restricted tier per KFS May 2026 (changed from 1 pt effective June 13, 2026).' },
  { cat: CAT.rent,          rate: 0.5, notes: '0.5 pts/AED on rent/real estate. "Rental" is in restricted tier per KFS May 2026 (changed from 1 pt effective June 13, 2026).' },
  { cat: CAT.healthcare,    rate: 2,   notes: '2 pts/AED on healthcare (hospitals, clinics, pharmacies). Not in restricted list; "other local" tier per KFS May 2026.' },
  { cat: CAT.international, rate: 2,   notes: '2 pts/AED on international (non-AED) spend. Per KFS May 2026. ⚠️ Forex 2.99% assumed (not confirmed from available docs); net return ≈ -1.97% after forex.' },
  { cat: CAT.general,       rate: 2,   notes: '2 pts/AED on all other eligible spend. "Other local" default tier per KFS May 2026.' },
];

// ============================================================
// SOLITAIRE EARN RATES (per KFS May 2026 — updated structure)
// - 5 pts/AED: international
// - 3 pts/AED: dining & supermarkets (incl. online dining/grocery)
// - 0.5 pts/AED: govt, utilities, education, charity, FUEL, rental, telecom
// - 1 pt/AED: all other local
// ⚠️ Website shows old rates (6/4/2/1 per March 2025 KFS); May 2026 KFS is authoritative
// ============================================================
const SOL_REWARDS = [
  { cat: CAT.dining,        rate: 3,   notes: '3 pts/AED on dining incl. online food delivery. Per KFS May 2026 "dining & supermarkets (including online)". ⚠️ Old March 2025 KFS/website shows 2 pts general; new structure explicitly elevates dining to 3 pts.' },
  { cat: CAT.groceries,     rate: 3,   notes: '3 pts/AED on supermarkets/groceries incl. online grocery delivery. Per KFS May 2026 "dining & supermarkets (including online)".' },
  { cat: CAT.fuel,          rate: 0.5, notes: '0.5 pts/AED on fuel. Restricted tier per KFS May 2026. ⚠️ Old KFS (March 2025) had fuel at 1 pt (general) before the restricted tier was halved.' },
  { cat: CAT.airlines,      rate: 1,   notes: '1 pt/AED on airline tickets. "Other local" tier per KFS May 2026. ⚠️ Website shows 4 pts (old March 2025 rate for "travel, airlines & hotels" tier); May 2026 KFS removed this tier — airlines now earn at "other local" 1 pt/AED rate.' },
  { cat: CAT.shopping,      rate: 1,   notes: '1 pt/AED on general shopping. "Other local" tier per KFS May 2026. Old rate was 2 pts.' },
  { cat: CAT.hotels,        rate: 1,   notes: '1 pt/AED on hotels. "Other local" tier per KFS May 2026. ⚠️ Website shows 4 pts (old March 2025 rate); May 2026 KFS removed separate hotels tier.' },
  { cat: CAT.travel,        rate: 1,   notes: '1 pt/AED on travel agencies/portals. "Other local" tier per KFS May 2026.' },
  { cat: CAT.online,        rate: 1,   notes: '1 pt/AED on online shopping (Amazon.ae, Noon general e-commerce). "Other local" tier. Note: online food delivery/online grocery counts toward dining/groceries 3 pts tier.' },
  { cat: CAT.entertainment, rate: 1,   notes: '1 pt/AED on entertainment. "Other local" tier per KFS May 2026.' },
  { cat: CAT.utilities,     rate: 0.5, notes: '0.5 pts/AED on utilities + telecom. Restricted tier per KFS May 2026. No points on bill payments via mobile/online banking.' },
  { cat: CAT.education,     rate: 0.5, notes: '0.5 pts/AED on education fees. Restricted tier per KFS May 2026.' },
  { cat: CAT.insurance,     rate: 1,   notes: '1 pt/AED on insurance premiums. Not in restricted list; "other local" tier per KFS May 2026.' },
  { cat: CAT.government,    rate: 0.5, notes: '0.5 pts/AED on government payments/fines. Restricted tier per KFS May 2026.' },
  { cat: CAT.rent,          rate: 0.5, notes: '0.5 pts/AED on rent/real estate. "Rental" in restricted tier per KFS May 2026.' },
  { cat: CAT.healthcare,    rate: 1,   notes: '1 pt/AED on healthcare. Not in restricted list; "other local" tier per KFS May 2026.' },
  { cat: CAT.international, rate: 5,   notes: '5 pts/AED on international (non-AED) spend. Per KFS May 2026. ⚠️ Website still shows 6 pts (old March 2025 rate); KFS May 2026 is authoritative. ⚠️ Forex 2.99% assumed (unconfirmed); net ≈ -1.49% after forex.' },
  { cat: CAT.general,       rate: 1,   notes: '1 pt/AED on all other eligible domestic spend. "Other local" default tier per KFS May 2026.' },
];

async function insertRewards(cardId, rows, sourceUrl) {
  let ok = 0, err = 0;
  for (const row of rows) {
    const r = await sb.from('card_rewards').insert({
      card_id: cardId,
      category_id: row.cat,
      reward_type: 'points',
      earn_rate: row.rate,
      earn_unit: 'per_aed',
      effective_return_pct: eff(row.rate),
      is_active: true,
      source_url: sourceUrl,
      last_verified_date: TODAY,
      notes: row.notes,
    });
    if (r.error) { console.error('  ❌ insert error:', r.error.message); err++; }
    else ok++;
  }
  console.log(`  Rewards: ${ok} inserted, ${err} errors`);
}

async function run() {
  // ─── 1. Update Platinum Plus cards table ───────────────────────────────────
  console.log('\n=== PLATINUM PLUS — updating cards table ===');
  let r = await sb.from('cards').update({
    lounge_access_network: 'lounge_key',
    lounge_access_count: 4,
    interest_rate_monthly_pct: 3.85,
    base_earn_rate: 2,
    base_earn_unit: 'points_per_aed',
    travel_insurance: false,
    purchase_protection: false,
    concierge: false,
    source_url: PP_URL,
    summary: '• 10 pts/AED (3.0%) on fuel, dining & groceries | 2 pts/AED (0.6%) other local & international | 0.5 pts/AED (0.15%) on govt, utilities, education, rental, telecom\n• 4 complimentary lounge visits/year via LoungeKey (requires AED 7,000/month spend; AED 110 fee if not met)\n• 50% off cinema: 4 tickets/month (VOX/Reel/Novo) + 8/month (Cinepolis)\n• Welcome: AED 750 (new customers, AED 5K spend in 2 months)\n• Annual fee: AED 299 ex-VAT (AED 313.95 incl. VAT)',
  }).eq('id', PP_ID);
  console.log('  cards update:', r.error ? '❌ ' + r.error.message : '✅');

  // ─── 2. Insert Platinum Plus card_rewards ──────────────────────────────────
  console.log('\n=== PLATINUM PLUS — inserting 17 card_rewards ===');
  await insertRewards(PP_ID, PP_REWARDS, PP_URL);

  // ─── 3. Insert Platinum Plus card_benefits ─────────────────────────────────
  console.log('\n=== PLATINUM PLUS — inserting card_benefits ===');
  const ppBenefits = [
    {
      benefit_type: 'welcome_bonus',
      title: 'Welcome cashback bonus',
      description: 'AED 750 cashback for new Mashreq credit card customers; AED 200 for existing customers. Requires AED 5,000 spend within first 2 months of card issuance. Credited by end of 3rd month after issuance.',
      usage_limit: 750,
      usage_period: 'yearly',
      conditions: 'New customers: AED 5,000 spend in first 2 months. Existing customers (held Mashreq card in last 6 months): AED 200, same spend requirement. One-time; credited by end of month 3 after issuance.',
      is_active: true,
    },
    {
      benefit_type: 'lounge_access',
      title: 'Airport lounge access — LoungeKey',
      description: '4 complimentary airport lounge visits per calendar year via LoungeKey (loungekey.com/en/mashreq). Max 2 visits per billing cycle. Must present physical card at participating lounge and ask for access via LoungeKey. Requires AED 7,000 spend in previous billing cycle; AED 110 charged per visit if spend criteria not met.',
      usage_limit: 4,
      usage_period: 'yearly',
      conditions: 'AED 7,000 minimum spend in previous billing cycle required. AED 110 fee per visit if criteria not met. Max 2 lounge visits per billing cycle.',
      is_active: true,
    },
    {
      benefit_type: 'cinema',
      title: '50% off cinema tickets',
      description: '50% discount on movie tickets at VOX, Reel, and Novo cinemas (up to 4 tickets/month) and Cinepolis (up to 8 tickets/month).',
      usage_limit: 12,
      usage_period: 'monthly',
      conditions: 'Max 4 tickets/month at VOX/Reel/Novo; max 8 tickets/month at Cinepolis. Check current MakeMyTrip + cinema booking conditions on Mashreq app.',
      is_active: true,
    },
  ];

  for (const b of ppBenefits) {
    const r = await sb.from('card_benefits').insert({ card_id: PP_ID, ...b });
    console.log(`  ${b.benefit_type}: ${r.error ? '❌ ' + r.error.message : '✅'}`);
  }

  // ─── 4. Update Solitaire cards table ────────────────────────────────────────
  console.log('\n=== SOLITAIRE — updating cards table ===');
  r = await sb.from('cards').update({
    lounge_access_network: 'visa_airport_companion',
    lounge_access_count: 12,
    valet_parking_count: 2,
    airport_transfer_count: 6,
    travel_insurance: true,
    purchase_protection: false,
    concierge: true,
    interest_rate_monthly_pct: 3.85,
    base_earn_rate: 1,
    base_earn_unit: 'points_per_aed',
    source_url: SOL_URL,
    summary: '• 5 pts/AED (1.5%) international | 3 pts/AED (0.9%) dining & groceries | 1 pt/AED (0.3%) other local | 0.5 pts/AED (0.15%) govt/utilities/education/fuel/rental/telecom\n• 12 complimentary lounge visits/year via Visa Airport Companion (+ 1 guest/visit; 2 free before eligibility, then 10 more after 1 intl txn > USD 1)\n• 6 airport transfers, unlimited Fitness First, 2 golf rounds/month, 2 valet/cycle, Marhaba Meet & Greet, travel insurance\n• 50% off 8 cinema tickets/month (no min spend)\n• Annual fee: AED 1,500 ex-VAT | Min salary: AED 25,000',
  }).eq('id', SOL_ID);
  console.log('  cards update:', r.error ? '❌ ' + r.error.message : '✅');

  // ─── 5. Insert Solitaire card_rewards ───────────────────────────────────────
  console.log('\n=== SOLITAIRE — inserting 17 card_rewards ===');
  await insertRewards(SOL_ID, SOL_REWARDS, SOL_URL);

  // ─── 6. Insert Solitaire card_benefits ──────────────────────────────────────
  console.log('\n=== SOLITAIRE — inserting card_benefits ===');
  const solBenefits = [
    {
      benefit_type: 'welcome_bonus',
      title: 'Welcome cashback bonus',
      description: 'AED 2,500 cashback for new Mashreq credit card customers; AED 500 for existing customers. Requires AED 9,000 spend within first 2 months of card issuance.',
      usage_limit: 2500,
      usage_period: 'yearly',
      conditions: 'New customers: AED 9,000 spend in first 2 months = AED 2,500. Existing customers: AED 500, same spend. One-time; credited by end of month 3 after issuance.',
      is_active: true,
    },
    {
      benefit_type: 'lounge_access',
      title: 'Airport lounge access — Visa Airport Companion',
      description: '12 complimentary airport lounge visits per calendar year (cardholder + 1 guest per visit) via Visa Airport Companion (VAC) app at 1,000+ lounges worldwide. First 2 visits available immediately; remaining 10 unlock after completing eligibility criteria (1 international transaction > USD 1 on the card in the calendar year). Download VAC app and register card before use. Ensure GB is not blocked in card settings.',
      usage_limit: 12,
      usage_period: 'yearly',
      conditions: 'Eligibility: 1 international transaction > USD 1 per calendar year. First 2 visits free before eligibility; 10 more visits after. Max 1 complimentary guest per visit. If eligibility not met, standard lounge fee applies.',
      is_active: true,
    },
    {
      benefit_type: 'cinema',
      title: '50% off cinema tickets',
      description: '50% discount on up to 8 movie tickets per month at VOX, Reel, Novo, and Cinepolis cinemas. No minimum spend required.',
      usage_limit: 8,
      usage_period: 'monthly',
      conditions: 'No minimum spend requirement for cinema benefit. 8 discounted tickets/month across VOX, Reel, Novo, Cinepolis.',
      is_active: true,
    },
    {
      benefit_type: 'airport_transfer',
      title: '6 complimentary airport transfers/year',
      description: '6 complimentary airport transfers per year from Dubai International Airport and Abu Dhabi International Airport.',
      usage_limit: 6,
      usage_period: 'yearly',
      conditions: 'Requires AED 10,000 spend in previous monthly billing cycle. AED 50 fee per transfer if spend criteria not met.',
      is_active: true,
    },
    {
      benefit_type: 'gym_membership',
      title: 'Unlimited Fitness First gym membership',
      description: 'Unlimited complimentary Fitness First gym visits for primary and supplementary cardholders.',
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Requires AED 10,000 spend in previous monthly billing cycle. AED 5 charge per visit auto-reversed within 60 days if spend criteria met. AED 50 fee per visit if criteria not met.',
      is_active: true,
    },
    {
      benefit_type: 'golf',
      title: '2 complimentary golf rounds/month',
      description: '2 complimentary weekend golf rounds per month at exclusive golf clubs.',
      usage_limit: 2,
      usage_period: 'monthly',
      conditions: 'Requires AED 10,000 spend in previous monthly billing cycle. Booking required 15–21 days in advance; 4-day cancellation policy. Excludes equipment, food, and beverages.',
      is_active: true,
    },
    {
      benefit_type: 'valet_parking',
      title: '2 complimentary valet parking/billing cycle',
      description: '2 complimentary valet parking sessions per billing cycle at Dubai and Abu Dhabi malls and airports.',
      usage_limit: 2,
      usage_period: 'monthly',
      conditions: 'Requires AED 10,000 spend in previous monthly billing cycle. AED 50 fee per visit if spend criteria not met.',
      is_active: true,
    },
    {
      benefit_type: 'meet_and_greet',
      title: '6 complimentary Marhaba Meet & Greets/year',
      description: '6 complimentary Marhaba airport Meet & Greet services per year.',
      usage_limit: 6,
      usage_period: 'yearly',
      conditions: 'Marhaba Meet & Greet services at Dubai International Airport. Confirm booking in advance.',
      is_active: true,
    },
    {
      benefit_type: 'travel_insurance',
      title: 'Multi-trip travel insurance',
      description: 'Complimentary multi-trip travel insurance coverage for up to 90 days per trip.',
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Multi-trip coverage; up to 90 days per trip. Purchase travel tickets with the Solitaire card to activate.',
      is_active: true,
    },
  ];

  for (const b of solBenefits) {
    const r = await sb.from('card_benefits').insert({ card_id: SOL_ID, ...b });
    console.log(`  ${b.benefit_type}: ${r.error ? '❌ ' + r.error.message : '✅'}`);
  }

  // ─── 7. Verify final state ───────────────────────────────────────────────────
  console.log('\n=== FINAL STATE ===');
  const { data: cats } = await sb.from('spending_categories').select('id,slug');
  const catMap = {};
  cats.forEach(c => catMap[c.id] = c.slug);

  for (const [label, id] of [['PLATINUM PLUS', PP_ID], ['SOLITAIRE', SOL_ID]]) {
    const { data } = await sb.from('card_rewards').select('category_id,earn_rate,effective_return_pct').eq('card_id', id);
    console.log(`\n${label}:`);
    data.sort((a,b) => (catMap[a.category_id]||'').localeCompare(catMap[b.category_id]||''));
    data.forEach(r => console.log(`  ${catMap[r.category_id]}: ${r.earn_rate} pts/AED = ${r.effective_return_pct}%`));
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });

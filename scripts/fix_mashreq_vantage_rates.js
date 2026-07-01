// Fix Mashreq Platinum Plus + Solitaire earn rates and point value
//
// Sources:
//   - mashreq-vantage-earning-redemption-en-new.pdf (effective June 13, 2026 — supersedes all)
//   - Mashreq-Cards-KFS-new-en-ar.pdf (KFS_Cards_05 2026, May 2026)
//
// Key fixes:
// 1. Point value: AED 0.003/pt was incorrect → AED 1/380 = AED 0.002631578/pt
//    Source: Vantage PDF "380 points = 1 AED cashback via Mashreq Mobile App"
//    (More favorable redemptions exist: 303 pts = 1 AED at POS/Amazon, 288 pts = 1 AED noon)
//    (Using cashback = most conservative/standard value)
// 2. Forex markup: 2.99% assumed was wrong → 2.89%
//    Source: KFS May 2026 page 2: "Spread on international transactions in non-AED Currency: 2.89%"
// 3. Solitaire earn rates were WRONG — Platinum Elite rates stored instead of Solitaire rates.
//    Correct Solitaire rates per Vantage PDF (June 13, 2026):
//      - 6 pts/AED international
//      - 4 pts/AED airlines, hotels, travel
//      - 2 pts/AED other local (dining, groceries, shopping, online, entertainment, healthcare, insurance, general)
//      - 1 pt/AED restricted (govt, fuel, education, utilities, telecom, rental, charity)
//    Note: KFS May 2026 showed 0.5 pts for restricted; Vantage PDF June 2026 raised it to 1 pt.
// 4. Platinum Plus earn rates were CORRECT — no earn_rate changes needed, only eff% recalculation.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const PP_ID  = '25c2e049-d94a-44ef-8bb5-d131eda9e6b5';
const SOL_ID = '9130eaec-f5c5-4b28-907d-8636bf8fb3ec';
const TODAY  = '2026-06-13';
const VANTAGE_URL = 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/';

const PT_VAL = 1 / 380; // AED per point (380 pts = 1 AED cashback per Vantage PDF)
function eff(pts) { return parseFloat((pts * PT_VAL * 100).toFixed(4)); }

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

// Corrected Solitaire earn rates per Vantage PDF (June 13, 2026)
const SOL_CORRECTIONS = [
  // international: 5 → 6
  { cat: CAT.international, rate: 6,   notes: '6 pts/AED on international (non-AED) spend. Per Vantage PDF June 13, 2026. ⚠️ Was incorrectly set to 5 pts (Platinum Elite rate). ⚠️ Forex 2.89% per KFS May 2026; gross return 1.5789%.' },
  // airlines/hotels/travel: 1 → 4
  { cat: CAT.airlines,      rate: 4,   notes: '4 pts/AED on airlines. "Airlines, Hotels & Travel" special tier per Vantage PDF June 13, 2026. ⚠️ Was incorrectly set to 1 pt (Platinum Elite "other local" rate).' },
  { cat: CAT.hotels,        rate: 4,   notes: '4 pts/AED on hotels. "Airlines, Hotels & Travel" special tier per Vantage PDF June 13, 2026. ⚠️ Was incorrectly set to 1 pt.' },
  { cat: CAT.travel,        rate: 4,   notes: '4 pts/AED on travel agencies/portals. "Airlines, Hotels & Travel" special tier per Vantage PDF June 13, 2026. ⚠️ Was incorrectly set to 1 pt.' },
  // other local: 1 → 2 (dining, groceries, shopping, online, entertainment, healthcare, insurance, general)
  { cat: CAT.dining,        rate: 2,   notes: '2 pts/AED on dining incl. online food delivery. "Other local" tier per Vantage PDF June 13, 2026. ⚠️ Was incorrectly set to 3 pts (Platinum Elite dining/supermarket tier). Solitaire has no separate dining bonus — dining earns at other-local rate.' },
  { cat: CAT.groceries,     rate: 2,   notes: '2 pts/AED on supermarkets/groceries incl. online grocery. "Other local" tier per Vantage PDF June 13, 2026. ⚠️ Was incorrectly set to 3 pts (Platinum Elite rate).' },
  { cat: CAT.shopping,      rate: 2,   notes: '2 pts/AED on shopping. "Other local" tier per Vantage PDF June 13, 2026. ⚠️ Was 1 pt.' },
  { cat: CAT.online,        rate: 2,   notes: '2 pts/AED on online shopping (Amazon.ae, Noon, etc.). "Other local" tier per Vantage PDF June 13, 2026. ⚠️ Was 1 pt.' },
  { cat: CAT.entertainment, rate: 2,   notes: '2 pts/AED on entertainment. "Other local" tier per Vantage PDF June 13, 2026. ⚠️ Was 1 pt.' },
  { cat: CAT.healthcare,    rate: 2,   notes: '2 pts/AED on healthcare. "Other local" tier per Vantage PDF June 13, 2026. ⚠️ Was 1 pt.' },
  { cat: CAT.insurance,     rate: 2,   notes: '2 pts/AED on insurance. "Other local" tier per Vantage PDF June 13, 2026. ⚠️ Was 1 pt.' },
  { cat: CAT.general,       rate: 2,   notes: '2 pts/AED on all other eligible domestic spend. "Other local" default tier per Vantage PDF June 13, 2026. ⚠️ Was 1 pt.' },
  // restricted: 0.5 → 1 (govt, fuel, utilities, education, rent — note KFS had 0.5, Vantage PDF raised to 1)
  { cat: CAT.fuel,          rate: 1,   notes: '1 pt/AED on fuel. Restricted tier per Vantage PDF June 13, 2026. (KFS May 2026 had 0.5 pts; Vantage PDF June 2026 raised restricted tier to 1 pt for Solitaire). ⚠️ Was 0.5 pt.' },
  { cat: CAT.government,    rate: 1,   notes: '1 pt/AED on government payments/fines. Restricted tier per Vantage PDF June 13, 2026. ⚠️ Was 0.5 pt.' },
  { cat: CAT.utilities,     rate: 1,   notes: '1 pt/AED on utilities + telecom. Restricted tier per Vantage PDF June 13, 2026. ⚠️ Was 0.5 pt. No points on bill payments via Mashreq mobile/online banking.' },
  { cat: CAT.education,     rate: 1,   notes: '1 pt/AED on education fees. Restricted tier per Vantage PDF June 13, 2026. ⚠️ Was 0.5 pt.' },
  { cat: CAT.rent,          rate: 1,   notes: '1 pt/AED on rent/real estate. Restricted tier per Vantage PDF June 13, 2026. ⚠️ Was 0.5 pt.' },
];

// Updated notes for Platinum Plus (earn rates unchanged, only eff% and notes updated)
const PP_NOTES = [
  { cat: CAT.dining,        rate: 10,  notes: '10 pts/AED on dining incl. online food delivery. Per Vantage PDF June 13, 2026. Earn value: 10 × (1/380) × 100 = 2.6316%.' },
  { cat: CAT.groceries,     rate: 10,  notes: '10 pts/AED on supermarkets/groceries. Per Vantage PDF June 13, 2026.' },
  { cat: CAT.fuel,          rate: 10,  notes: '10 pts/AED on fuel (ADNOC, ENOC, Emarat). Per Vantage PDF June 13, 2026. Note: fuel earns 10 pts on PP (bonus tier), NOT restricted.' },
  { cat: CAT.airlines,      rate: 2,   notes: '2 pts/AED on airlines. "International and other local" tier per Vantage PDF June 13, 2026. Airlines not in bonus tier for PP (unlike Solitaire).' },
  { cat: CAT.shopping,      rate: 2,   notes: '2 pts/AED on shopping. "Other local" tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.hotels,        rate: 2,   notes: '2 pts/AED on hotels. "Other local" tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.travel,        rate: 2,   notes: '2 pts/AED on travel agencies/portals. "Other local" tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.online,        rate: 2,   notes: '2 pts/AED on online shopping. "Other local" tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.entertainment, rate: 2,   notes: '2 pts/AED on entertainment. "Other local" tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.utilities,     rate: 0.5, notes: '0.5 pts/AED on utilities + telecom. Restricted tier per Vantage PDF June 13, 2026. No points on bill payments via Mashreq mobile/online banking.' },
  { cat: CAT.education,     rate: 0.5, notes: '0.5 pts/AED on education. Restricted tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.insurance,     rate: 2,   notes: '2 pts/AED on insurance. Not in restricted list; "other local" tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.government,    rate: 0.5, notes: '0.5 pts/AED on government payments. Restricted tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.rent,          rate: 0.5, notes: '0.5 pts/AED on rent/real estate. Restricted tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.healthcare,    rate: 2,   notes: '2 pts/AED on healthcare. "Other local" tier per Vantage PDF June 13, 2026.' },
  { cat: CAT.international, rate: 2,   notes: '2 pts/AED on international (non-AED) spend. Per Vantage PDF June 13, 2026. ⚠️ Forex 2.89% per KFS May 2026; gross return 0.5263%, net ≈ -2.36% after forex.' },
  { cat: CAT.general,       rate: 2,   notes: '2 pts/AED on all other eligible spend. "Other local" default tier per Vantage PDF June 13, 2026.' },
];

async function run() {
  // ─── 1. Update cards table: reward_currency_value_aed + forex for both cards ─
  console.log('=== Updating cards table ===');
  for (const [label, id] of [['PLATINUM PLUS', PP_ID], ['SOLITAIRE', SOL_ID]]) {
    const r = await sb.from('cards').update({
      reward_currency_value_aed: parseFloat((1/380).toFixed(8)), // 0.00263158
      forex_markup_pct: 2.89,
      source_url: VANTAGE_URL,
    }).eq('id', id);
    console.log(`  ${label} cards update: ${r.error ? '❌ ' + r.error.message : '✅ reward_val=1/380=0.002632, forex=2.89%'}`);
  }

  // ─── 2. Fix ALL Solitaire card_rewards (earn_rate + eff% + notes) ─────────────
  console.log('\n=== Updating Solitaire card_rewards ===');
  for (const row of SOL_CORRECTIONS) {
    const r = await sb.from('card_rewards').update({
      earn_rate: row.rate,
      effective_return_pct: eff(row.rate),
      notes: row.notes,
      source_url: VANTAGE_URL,
      last_verified_date: TODAY,
    }).eq('card_id', SOL_ID).eq('category_id', row.cat);
    console.log(`  Solitaire ${row.cat.substring(0,8)}...: ${r.error ? '❌ ' + r.error.message : `✅ ${row.rate} pts → ${eff(row.rate)}%`}`);
  }

  // ─── 3. Fix Platinum Plus card_rewards (eff% recalc + notes refresh) ─────────
  console.log('\n=== Updating Platinum Plus card_rewards (eff% recalc) ===');
  for (const row of PP_NOTES) {
    const r = await sb.from('card_rewards').update({
      effective_return_pct: eff(row.rate),
      notes: row.notes,
      source_url: VANTAGE_URL,
      last_verified_date: TODAY,
    }).eq('card_id', PP_ID).eq('category_id', row.cat);
    console.log(`  PP ${row.cat.substring(0,8)}...: ${r.error ? '❌ ' + r.error.message : `✅ ${row.rate} pts → ${eff(row.rate)}%`}`);
  }

  // ─── 4. Print final state ────────────────────────────────────────────────────
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

  // Also check cards table
  console.log('\n=== cards table — reward_currency_value_aed + forex ===');
  const { data: cards } = await sb.from('cards')
    .select('name,reward_currency_value_aed,forex_markup_pct')
    .in('id', [PP_ID, SOL_ID]);
  cards.forEach(c => console.log(`  ${c.name}: ${c.reward_currency_value_aed} AED/pt, forex ${c.forex_markup_pct}%`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });

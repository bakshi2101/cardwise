const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const CASHBACK_ID = '13377082-51d8-449e-b55f-b918e6c553ed';
const NOON_ID     = '639b7470-a5d0-4a5e-b213-89ba25248afc';
const TODAY = '2026-04-03';

// Source URLs
const CB_SRC  = 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/cashback-credit-card/';
const NN_SRC  = 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/noon-credit-card/';

// Category IDs
const C = {
  dining:       'b7938d64-7ff6-4f84-9b0d-c35010e5fa58',
  groceries:    '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:         'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  airlines:     'c418c3e6-9403-4ce6-8647-ed52782a59eb',
  shopping:     '5212cc11-77de-432c-8340-994f35e03d1b',
  hotels:       'f990d8af-9955-4b22-881c-4cf4de2cbe3e',
  travel:       '592dad17-981b-4af8-8095-596507f0b780',
  online:       '8e3f1bc5-f519-4f2a-82b9-cefa8ebfda86',
  entertain:    'dd8d714c-1e5a-4db5-91d4-fba3756ed77c',
  utilities:    '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:    '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  insurance:    'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  government:   'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  rent:         'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  healthcare:   'a9aad3fe-9afa-4c12-957f-153994b5e501',
  international:'98c97cac-1b7d-48dc-a661-476c7baeb9af',
  general:      '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f',
};

// Existing row IDs on cashback card (to UPDATE in-place)
const CB_EXISTING = {
  dining:       '78bd918c-1fbc-4007-a775-1bcd0d30a361',
  shopping:     '40b83fe5-bdbb-42e5-886a-87987f3fb2c3',
  education:    'a3673364-c782-49d7-a111-a52c7a8df1ef',
  general:      'dee93b02-352d-43ea-810c-1a517268ba8d',
  international:'d193af5a-a63e-4d17-8994-9ed9adb0e2bc',
  utilities:    'bbf35bcb-42dd-4772-a7d0-a5eac7d6de2d',
  fuel:         'f50cdf74-905d-495e-9bac-bb380d977034',
};
// Duplicate dining row to delete
const DUPE_DINING_ROW = '59974238-1923-4e74-9991-4f46632e22ca';

// Existing row IDs on noon card (to UPDATE in-place)
const NN_EXISTING = {
  online:    'aefe4a9a-93cb-4f84-8d90-523d1446b6c1',
  general:   '0138756f-1295-4dc4-854a-dcff5d68a8ae',
  utilities: 'f253544b-bdfc-4dd4-b089-0290c403592c',
};

// ─────────────────────────────────────────────
// NOTES TEMPLATES
// ─────────────────────────────────────────────
const CB_NOTE = (cat_note) =>
  `${cat_note} Source: Mashreq-Cashback-Card-tnc-new-en.pdf (clause 3.3) + Mashreq-Cards-KFS-Final-EngArb.pdf + mashreq.com/cashback-credit-card. Verified 2026-04-03. Forex markup: 2.89% on non-AED transactions (KFS). No documented monthly cap on standard cashback. Exclusion: utility bill payments via Mashreq channels (call center, online banking, ATM, mobile) do NOT earn cashback (T&C clause 3.2).`;

const NN_NOTE = (cat_note) =>
  `${cat_note} Source: Mashreq_noon_Credit_Card_Terms_and_Conditions_en.pdf (clause 3.2) + Mashreq-Cards-KFS-Final-EngArb.pdf + mashreq.com/noon-credit-card. Verified 2026-04-03. Forex markup: 2.89% (KFS). Exclusion: utility bill payments via Mashreq channels do NOT earn cashback (T&C clause 3.1.1). noon cashback credited to noon Account (not card statement) — redeemable only on noon/app platforms; valid 12 months from accrual.`;

// ─────────────────────────────────────────────
// CASHBACK CARD: all 17 categories
// ─────────────────────────────────────────────
// Rates per KFS: 5% dining, 1% intl, 1% other local, 0.33% low-interchange (govt/utilities/education/charity/fuel/rental/telecom)
const CB_ROWS = [
  { cat: C.dining,       rate: 5,    eff: 5,    note: '5% cashback on local AND international dining at restaurants and online food delivery (MCC 5811/5812/5813/5814/7011). No documented monthly cap. Applies to both domestic and foreign currency restaurant spend.' },
  { cat: C.groceries,    rate: 1,    eff: 1,    note: '1% cashback on grocery and supermarket spend (falls under "Other local spends" per KFS). Grocery MCCs are not in the low-interchange list.' },
  { cat: C.fuel,         rate: 0.33, eff: 0.33, note: '0.33% cashback on fuel/petrol stations (low-interchange tier — explicitly listed in KFS and T&C clause 3.2.12). Fuel MCC: 5541, 5542.' },
  { cat: C.airlines,     rate: 1,    eff: 1,    note: '1% cashback on airline ticket purchases (falls under "Other local spends" or "Other international" per KFS).' },
  { cat: C.shopping,     rate: 1,    eff: 1,    note: '1% cashback on general shopping and fashion (falls under "Other local spends" per KFS).' },
  { cat: C.hotels,       rate: 1,    eff: 1,    note: '1% cashback on hotel bookings (falls under "Other local spends" per KFS).' },
  { cat: C.travel,       rate: 1,    eff: 1,    note: '1% cashback on travel agencies, booking sites, car rentals (falls under "Other local spends" per KFS).' },
  { cat: C.online,       rate: 1,    eff: 1,    note: '1% cashback on general online shopping — Amazon.ae, Noon, Carrefour online (falls under "Other local spends" per KFS).' },
  { cat: C.entertain,    rate: 1,    eff: 1,    note: '1% cashback on entertainment — cinemas, theme parks, streaming (falls under "Other local spends" per KFS).' },
  { cat: C.utilities,    rate: 0.33, eff: 0.33, note: '0.33% cashback on utility payments paid directly to merchant (DEWA, Etisalat, du — low-interchange tier per KFS). ⚠️ Utility bills paid via Mashreq Online Banking / ATM / call center / mobile banking earn ZERO cashback (T&C clause 3.1.1).' },
  { cat: C.education,    rate: 0.33, eff: 0.33, note: '0.33% cashback on education fees (low-interchange tier per KFS and T&C clause 3.2.12). MCCs: 8211/8220/8241/8244/8249/8299.' },
  { cat: C.insurance,    rate: 1,    eff: 1,    note: '1% cashback on insurance premiums (not in the low-interchange exclusion list per KFS/T&C clause 3.2.12; falls under "Other local spends").' },
  { cat: C.government,   rate: 0.33, eff: 0.33, note: '0.33% cashback on government fees, fines, visa charges (low-interchange tier per KFS). MCCs: 9211/9222/9223/9311/9399/9402.' },
  { cat: C.rent,         rate: 0.33, eff: 0.33, note: '0.33% cashback on rent/real estate payments (low-interchange tier — "rental" explicitly listed in KFS and T&C clause 3.2.12). MCC: 6513.' },
  { cat: C.healthcare,   rate: 1,    eff: 1,    note: '1% cashback on healthcare — hospitals, clinics, pharmacies (not in low-interchange list; falls under "Other local spends" per KFS).' },
  { cat: C.international,rate: 1,    eff: 1,    note: '1% cashback on other international (non-AED) spend. ⚠️ Exception: dining internationally at restaurants still earns 5% (KFS states "local AND international dining"). Forex markup 2.89% applies (KFS), reducing net effective return to approx -1.89% on non-dining international.' },
  { cat: C.general,      rate: 1,    eff: 1,    note: '1% cashback on all other eligible domestic spend ("Other local spends" default per KFS and T&C).' },
];

// ─────────────────────────────────────────────
// NOON CARD: all 17 categories
// ─────────────────────────────────────────────
// Rates per KFS: 5% noon ecosystem, 1% all other, 0.33% low-interchange
// Conservative floor stored in effective_return_pct; noon 5% bonus in notes
const NN_ROWS = [
  { cat: C.dining,       rate: 1,    eff: 1,    note: '1% cashback on restaurant dining (general "Other spends" rate per KFS). 🎁 noon Food app orders earn 5% (noon ecosystem per KFS and T&C clause 3.2.11). To earn 5% on food delivery, use the noon Food app.' },
  { cat: C.groceries,    rate: 1,    eff: 1,    note: '1% cashback on supermarket and grocery spend (general "Other spends" rate per KFS). 🎁 NowNow (on-demand grocery delivery within noon ecosystem) earns 5% (T&C clause 3.2.11).' },
  { cat: C.fuel,         rate: 0.33, eff: 0.33, note: '0.33% cashback on fuel/petrol (low-interchange tier per KFS and T&C clause 3.2.12). MCC: 5541/5542.' },
  { cat: C.airlines,     rate: 1,    eff: 1,    note: '1% cashback on airline ticket purchases (general "Other spends" rate per KFS).' },
  { cat: C.shopping,     rate: 1,    eff: 1,    note: '1% cashback on general shopping (general "Other spends" rate per KFS). 🎁 SIVVI and Namshi (fashion apps in noon ecosystem) earn 5% (KFS, T&C clause 3.2.11).' },
  { cat: C.hotels,       rate: 1,    eff: 1,    note: '1% cashback on hotel bookings (general "Other spends" rate per KFS).' },
  { cat: C.travel,       rate: 1,    eff: 1,    note: '1% cashback on travel agencies and booking sites (general "Other spends" rate per KFS).' },
  { cat: C.online,       rate: 1,    eff: 1,    note: '1% cashback on general online shopping — Amazon.ae, general e-commerce (general "Other spends" rate per KFS). 🎁 noon.com, noon app, noon supermall earn 5% (noon ecosystem per KFS and T&C clause 3.2.11). Use noon for purchases to earn 5% vs 1% elsewhere.' },
  { cat: C.entertain,    rate: 1,    eff: 1,    note: '1% cashback on entertainment — cinemas, events, streaming (general "Other spends" rate per KFS). 🎁 noon Minutes entertainment content platform earns 5% (T&C clause 3.2.11).' },
  { cat: C.utilities,    rate: 0.33, eff: 0.33, note: '0.33% cashback on utility payments paid directly to merchant (DEWA, Etisalat, du — low-interchange tier per KFS). ⚠️ Utility bills paid via Mashreq Online Banking / ATM / call center / mobile banking earn ZERO cashback (T&C clause 3.1.1).' },
  { cat: C.education,    rate: 0.33, eff: 0.33, note: '0.33% cashback on education fees (low-interchange tier per KFS and T&C clause 3.2.12). MCCs: 8211/8220/8241/8244/8249/8299.' },
  { cat: C.insurance,    rate: 1,    eff: 1,    note: '1% cashback on insurance premiums (not in low-interchange list per T&C clause 3.2.12; falls under "Other spends").' },
  { cat: C.government,   rate: 0.33, eff: 0.33, note: '0.33% cashback on government fees, fines (low-interchange tier per KFS and T&C clause 3.2.12). MCCs: 9211/9222/9223/9311/9399/9402.' },
  { cat: C.rent,         rate: 0.33, eff: 0.33, note: '0.33% cashback on rent/real estate payments (low-interchange tier — "rental" explicitly listed in KFS and T&C clause 3.2.12). MCC: 6513.' },
  { cat: C.healthcare,   rate: 1,    eff: 1,    note: '1% cashback on healthcare — hospitals, clinics, pharmacies (general "Other spends" rate per KFS).' },
  { cat: C.international,rate: 1,    eff: 1,    note: '1% cashback on other international (non-AED) spend (general rate per KFS). noon ecosystem platforms typically bill in AED even internationally. Forex markup 2.89% applies (KFS), net effective approx -1.89%.' },
  { cat: C.general,      rate: 1,    eff: 1,    note: '1% cashback on all other eligible spend (default "Other spends" rate per KFS). 🎁 See individual noon ecosystem merchant bonuses in other category notes.' },
];

async function run() {
  let errors = 0;

  // ── STEP 1: Delete duplicate dining row on cashback card ──
  console.log('Step 1: Deleting duplicate dining row on Cashback card...');
  const { error: delErr } = await sb.from('card_rewards').delete().eq('id', DUPE_DINING_ROW);
  if (delErr) { console.error('Delete dupe error:', delErr.message); errors++; }
  else console.log('  ✓ Deleted duplicate dining row', DUPE_DINING_ROW);

  // ── STEP 2: Update existing cashback card rows ──
  console.log('\nStep 2: Updating existing Cashback card rows...');
  for (const row of CB_ROWS) {
    // Check if row exists
    const existingId = Object.values(CB_EXISTING).find((_, i) => Object.keys(CB_EXISTING)[i] && CB_ROWS.indexOf(row) >= 0);
    // Match by category
    const catKey = Object.entries(C).find(([k,v]) => v === row.cat)?.[0];
    const existingRowId = CB_EXISTING[catKey];

    if (existingRowId) {
      // UPDATE existing row
      const { error } = await sb.from('card_rewards').update({
        earn_rate: row.rate,
        effective_return_pct: row.eff,
        earn_unit: 'pct',
        reward_type: 'cashback',
        monthly_cap_reward: null,
        source_url: CB_SRC,
        last_verified_date: TODAY,
        is_active: true,
        notes: CB_NOTE(row.note),
      }).eq('id', existingRowId);
      if (error) { console.error(`  ✗ CB UPDATE ${catKey}:`, error.message); errors++; }
      else console.log(`  ✓ Updated CB ${catKey}`);
    } else {
      // INSERT new row
      const { error } = await sb.from('card_rewards').insert({
        card_id: CASHBACK_ID,
        category_id: row.cat,
        earn_rate: row.rate,
        effective_return_pct: row.eff,
        earn_unit: 'pct',
        reward_type: 'cashback',
        monthly_cap_reward: null,
        source_url: CB_SRC,
        last_verified_date: TODAY,
        is_active: true,
        notes: CB_NOTE(row.note),
      });
      if (error) { console.error(`  ✗ CB INSERT ${catKey}:`, error.message); errors++; }
      else console.log(`  ✓ Inserted CB ${catKey}`);
    }
  }

  // ── STEP 3: Update noon card rows ──
  console.log('\nStep 3: Updating/inserting Noon card rows...');
  for (const row of NN_ROWS) {
    const catKey = Object.entries(C).find(([k,v]) => v === row.cat)?.[0];
    const existingRowId = NN_EXISTING[catKey];

    if (existingRowId) {
      const { error } = await sb.from('card_rewards').update({
        earn_rate: row.rate,
        effective_return_pct: row.eff,
        earn_unit: 'pct',
        reward_type: 'cashback',
        monthly_cap_reward: null,
        source_url: NN_SRC,
        last_verified_date: TODAY,
        is_active: true,
        notes: NN_NOTE(row.note),
      }).eq('id', existingRowId);
      if (error) { console.error(`  ✗ NN UPDATE ${catKey}:`, error.message); errors++; }
      else console.log(`  ✓ Updated NN ${catKey}`);
    } else {
      const { error } = await sb.from('card_rewards').insert({
        card_id: NOON_ID,
        category_id: row.cat,
        earn_rate: row.rate,
        effective_return_pct: row.eff,
        earn_unit: 'pct',
        reward_type: 'cashback',
        monthly_cap_reward: null,
        source_url: NN_SRC,
        last_verified_date: TODAY,
        is_active: true,
        notes: NN_NOTE(row.note),
      });
      if (error) { console.error(`  ✗ NN INSERT ${catKey}:`, error.message); errors++; }
      else console.log(`  ✓ Inserted NN ${catKey}`);
    }
  }

  // ── STEP 4: Update cards table source_url and summary ──
  console.log('\nStep 4: Updating cards table...');
  const { error: cbCardErr } = await sb.from('cards').update({
    source_url: CB_SRC,
    summary: 'VERIFIED 2026-04-03. Free for life. 5% cashback on dining (local + international). 1% on groceries, shopping, online, airlines, hotels, travel, entertainment, healthcare, insurance. 0.33% on fuel, utilities, government, education, rent. 1% on other international. Forex: 2.89%. No monthly cap on standard cashback. Cashback credited to card statement (redeemable via app). Sources: Mashreq-Cashback-Card-tnc-new-en.pdf + KFS + official website.',
  }).eq('id', CASHBACK_ID);
  if (cbCardErr) { console.error('CB card update error:', cbCardErr.message); errors++; }
  else console.log('  ✓ Updated Cashback card row');

  const { error: nnCardErr } = await sb.from('cards').update({
    source_url: NN_SRC,
    summary: 'VERIFIED 2026-04-03. Free for life. 5% cashback on noon ecosystem (noon.com, noon Food, noon supermall, NowNow, SIVVI, Namshi, noon Minutes). 1% on all other purchases. 0.33% on fuel, utilities, government, education, rent/telecom (low-interchange). Forex: 2.89%. Cashback credited to noon Account — redeemable only on noon platforms, valid 12 months. Sources: Mashreq_noon_Credit_Card_Terms_and_Conditions_en.pdf + KFS + official website.',
  }).eq('id', NOON_ID);
  if (nnCardErr) { console.error('NN card update error:', nnCardErr.message); errors++; }
  else console.log('  ✓ Updated Noon card row');

  // ── STEP 5: Verify row counts ──
  console.log('\nStep 5: Verifying row counts...');
  const { count: cbCount } = await sb.from('card_rewards').select('*', { count: 'exact', head: true }).eq('card_id', CASHBACK_ID);
  const { count: nnCount } = await sb.from('card_rewards').select('*', { count: 'exact', head: true }).eq('card_id', NOON_ID);
  console.log(`  Cashback card rows: ${cbCount} (expected 17)`);
  console.log(`  Noon card rows: ${nnCount} (expected 17)`);
  console.log(`\nDone. Errors: ${errors}`);
}

run();

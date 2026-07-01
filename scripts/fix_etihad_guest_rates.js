// Fix FAB Etihad Guest Signature/Platinum/Infinite earn rates
// Source: Etihad-Guest-Credit-Cards-FAQs.pdf (page 5-6)
//
// Domestic earn rates per AED 10:
//   Platinum: 2.0 miles  | Signature: 2.75 miles | Infinite: 3.5 miles
// Restricted categories (Specific Merchants) per AED 10 — ALL tiers: 1.5 miles
//   Restricted: groceries/supermarkets, fuel, utilities/telecom, education, government, insurance, rent
// International earn rates per AED 10:
//   Platinum: 3.5 miles  | Signature: 4.5 miles  | Infinite: 6.0 miles
// Airlines (Etihad/EAP online only) per AED 10:
//   Platinum: 4.0 miles  | Signature: 5.5 miles  | Infinite: 7.0 miles
//
// Mile value: AED 0.05/mile (confirmed in cards table)

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const CARDS = {
  PLATINUM: '3902a2da-f5ed-4e17-8c7f-fc6a0ef6627e',
  SIGNATURE: 'b3dbe91b-c571-42c8-b34a-6fb094fc72f3',
  INFINITE: 'a6143824-9e57-4d0c-94f9-244e786d245f',
};

const CAT = {
  groceries:     '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:          'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  utilities:     '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:     '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  government:    'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  insurance:     'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  rent:          'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  other_travel:  '592dad17-981b-4af8-8095-596507f0b780',
};

const TODAY = '2026-06-13';
const SRC = 'https://www.bankfab.com/-/media/fabgroup/home/personal/cards/terms-and-conditions-pdfs/card-specific/etihad-guest-credit-card-tcs.pdf';

const RESTRICTED_SLUGS = ['groceries','fuel','utilities','education','government','insurance','rent'];
const RESTRICTED_NOTE_SUFFIX = 'Specific Merchant category (Schedule 1): earns 1.5 miles per AED 10 = 0.15 miles/AED for ALL card tiers. Source: FAB Etihad Guest FAQs & T&C Schedule 1.';

// Standard domestic earn rates per AED (= per AED 10 ÷ 10)
const STANDARD = {
  PLATINUM: 0.20,   // 2.0/10
  SIGNATURE: 0.275, // 2.75/10
  INFINITE: 0.35,   // 3.5/10
};
const RESTRICTED_RATE = 0.15; // 1.5/10, same for all tiers

const MILE_VALUE = 0.05; // AED per mile

function eff(rate) {
  return parseFloat((rate * MILE_VALUE * 100).toFixed(4));
}

async function updateRow(cardId, catId, earnRate, notes) {
  const r = await sb.from('card_rewards')
    .update({
      earn_rate: earnRate,
      earn_unit: 'per_aed',
      effective_return_pct: eff(earnRate),
      source_url: SRC,
      last_verified_date: TODAY,
      notes,
    })
    .eq('card_id', cardId)
    .eq('category_id', catId);
  return r;
}

async function deleteNullGenerals() {
  // Delete duplicate null general rows for all 3 cards
  const { data: cats } = await sb.from('spending_categories').select('id').eq('slug', 'general');
  const genId = cats[0].id;

  for (const [tier, cardId] of Object.entries(CARDS)) {
    const { data: rows } = await sb.from('card_rewards')
      .select('id, earn_rate')
      .eq('card_id', cardId)
      .eq('category_id', genId);

    const nullRows = rows.filter(r => r.earn_rate === null);
    if (nullRows.length > 0) {
      const r = await sb.from('card_rewards').delete().in('id', nullRows.map(r => r.id));
      console.log(`${tier} general null rows deleted: ${nullRows.length} (error: ${r.error ? r.error.message : 'none'})`);
    } else {
      console.log(`${tier}: no null general rows to delete`);
    }
  }
}

async function run() {
  // 1. Fix restricted categories for all 3 tiers
  for (const [tier, cardId] of Object.entries(CARDS)) {
    for (const slug of RESTRICTED_SLUGS) {
      const catId = CAT[slug];
      const r = await updateRow(cardId, catId, RESTRICTED_RATE,
        `${slug} earns 0.15 miles/AED (1.5 miles per AED 10). ${RESTRICTED_NOTE_SUFFIX}`
      );
      console.log(`${tier} ${slug}: ${r.error ? '❌ ' + r.error.message : '✅ 0.15 miles/AED = 0.75%'}`);
    }
  }

  // 2. Fix other_travel for each tier (standard domestic rate, not restricted)
  for (const [tier, cardId] of Object.entries(CARDS)) {
    const rate = STANDARD[tier];
    const r = await updateRow(cardId, CAT.other_travel, rate,
      `Travel agencies, booking portals (Booking.com, Agoda, Expedia), and transport not in Specific Merchants list earn standard domestic rate: ${rate} miles/AED (${(rate * 10).toFixed(2)} miles per AED 10). Note: car rental MCC (3390,3400,3500) IS a Specific Merchant → earns 0.15 miles/AED. Online Etihad/EAP bookings earn double standard rate. Source: FAB Etihad Guest FAQs & T&C Schedule 1.`
    );
    console.log(`${tier} other_travel: ${r.error ? '❌ ' + r.error.message : `✅ ${rate} miles/AED = ${eff(rate)}%`}`);
  }

  // 3. Delete duplicate null general rows
  await deleteNullGenerals();

  // 4. Add last_verified_date + source_url to all existing correct rows
  for (const [tier, cardId] of Object.entries(CARDS)) {
    const r = await sb.from('card_rewards')
      .update({ source_url: SRC, last_verified_date: TODAY })
      .eq('card_id', cardId)
      .is('source_url', null);
    console.log(`${tier} source_url backfill: ${r.error ? '❌ ' + r.error.message : '✅'}`);
  }

  // 5. Print final state for Signature
  console.log('\n=== FINAL STATE: SIGNATURE ===');
  const { data: cats } = await sb.from('spending_categories').select('id,slug');
  const catMap = {};
  cats.forEach(c => catMap[c.id] = c.slug);
  const { data } = await sb.from('card_rewards').select('category_id,earn_rate,effective_return_pct').eq('card_id', CARDS.SIGNATURE);
  data.sort((a,b) => (catMap[a.category_id]||'').localeCompare(catMap[b.category_id]||''));
  data.forEach(r => {
    const slug = catMap[r.category_id] || r.category_id;
    console.log(`  ${slug}: ${r.earn_rate} miles/AED = ${r.effective_return_pct}%`);
  });
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });

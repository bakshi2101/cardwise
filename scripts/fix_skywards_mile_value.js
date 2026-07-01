const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('/Users/abhinavbakshi/CardWise/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

// Mile value: AED 0.044 (The Points Guy monthly valuations — 1.2 US cents/mile)
// earn_rate (miles/USD) × 0.044 / 3.672 × 100 = effective_return_pct (already correct in DB)

const CARDS = [
  { id: '3d65db6f-0554-4b4c-8c45-8c3ed632c03d', name: 'Skywards Infinite' },
  { id: 'c734bcbd-030c-4025-8f6c-5a9cc182856b', name: 'Skywards Signature' },
];

// Category where the valuation source note lives (one per card, general catch-all)
const GENERAL_CAT = '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f';
const TPG_SOURCE = ' Mile value: AED 0.044 (The Points Guy monthly valuations — 1.2 US cents/mile at 1 USD = AED 3.672; thepointsguy.com/loyalty-programs/monthly-valuations/).';

const INF_SUMMARY = 'A premium Skywards miles card earning 2.40% on Emirates and flydubai direct bookings and 1.20% on general domestic spend, for an AED 1,575 annual fee. Verified on April 22, 2026.';
const SIG_SUMMARY = 'A mid-tier Skywards miles card earning 1.80% on Emirates and flydubai direct bookings and 0.90% on general domestic spend, for an AED 735 annual fee. Verified on April 22, 2026.';

async function run() {
  let noteUpdates = 0, errors = 0;

  for (const card of CARDS) {
    const { data, error } = await sb.from('card_rewards')
      .select('category_id, notes')
      .eq('card_id', card.id);

    if (error) { console.error(`Fetch error (${card.name}):`, error.message); continue; }

    for (const row of data) {
      if (!row.notes || !row.notes.includes('AED 0.07')) continue;

      let updated = row.notes.replace(/AED 0\.07/g, 'AED 0.044');

      // Add source attribution once, on the general category row only
      if (row.category_id === GENERAL_CAT && !updated.includes('Points Guy')) {
        // Insert before the Cap sentence
        updated = updated.replace('. Cap:', TPG_SOURCE + ' Cap:');
      }

      const { error: ue } = await sb.from('card_rewards')
        .update({ notes: updated })
        .eq('card_id', card.id)
        .eq('category_id', row.category_id);

      if (ue) { console.error(`  Update error [${row.category_id}]:`, ue.message); errors++; }
      else noteUpdates++;
    }

    console.log(`${card.name}: notes done`);
  }

  // Update card summaries
  const summaries = [
    { id: CARDS[0].id, summary: INF_SUMMARY },
    { id: CARDS[1].id, summary: SIG_SUMMARY },
  ];
  for (const s of summaries) {
    const { error } = await sb.from('cards').update({ summary: s.summary }).eq('id', s.id);
    if (error) { console.error('Summary update error:', error.message); errors++; }
    else console.log(`Summary updated for ${s.id}`);
  }

  console.log(`\nDone. ${noteUpdates} note rows updated, ${errors} errors.`);
}

run();

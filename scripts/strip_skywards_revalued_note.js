const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env from .env.local
const env = Object.fromEntries(
  fs.readFileSync('/Users/abhinavbakshi/CardWise/.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const CARDS = [
  { id: '3d65db6f-0554-4b4c-8c45-8c3ed632c03d', name: 'Skywards Infinite' },
  { id: 'c734bcbd-030c-4025-8f6c-5a9cc182856b', name: 'Skywards Signature' },
];

const SUFFIX = ' [Revalued 2026-04-22: Skywards Miles AED 0.07→0.044/mile per industry consensus (~1.2 US cents/mile).]';

async function run() {
  let total = 0, errors = 0;

  for (const card of CARDS) {
    const { data, error } = await sb.from('card_rewards')
      .select('category_id, notes')
      .eq('card_id', card.id)
      .ilike('notes', '%Revalued 2026-04-22%');

    if (error) { console.error(`Fetch error for ${card.name}:`, error.message); continue; }
    console.log(`${card.name}: ${data.length} rows to clean`);

    for (const row of data) {
      const cleaned = row.notes.replace(SUFFIX, '').trimEnd();
      const { error: ue } = await sb.from('card_rewards')
        .update({ notes: cleaned })
        .eq('card_id', card.id)
        .eq('category_id', row.category_id);

      if (ue) { console.error(`  Update error [${row.category_id}]:`, ue.message); errors++; }
      else { total++; }
    }
  }

  console.log(`Done. ${total} rows cleaned, ${errors} errors.`);
}

run();

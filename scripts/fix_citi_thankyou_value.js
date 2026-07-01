const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('/Users/abhinavbakshi/CardWise/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const CARD_IDS = {
  premier: '758d5d43-c8c4-4ca4-b111-7e41190ba11b',
  prestige: '41e18546-d724-4fb3-a9b8-8835298f6138',
};
const OLD_VALUE = 0.033;
const NEW_VALUE = 0.022;
const USD_TO_AED = 3.672;

// Caveat using Citi's own terminology from citibank.ae
const CAVEAT = ' Tip: points are worth more when redeemed for travel — 15,000 points = AED 500 off any travel purchase via Cash for Points, or 25 pts = AED 1 via Fly with Points.';

// Single-pass regex to replace all old eff% references without cascading
const PCT_PATTERN = /2\.70%|2\.7%|1\.80%|1\.8%|0\.90%|0\.9%|0\.45%|0\.22%/g;
const PCT_MAP = {
  '2.70%': '1.80%', '2.7%': '1.80%',
  '1.80%': '1.20%', '1.8%': '1.20%',
  '0.90%': '0.60%', '0.9%': '0.60%',
  '0.45%': '0.30%',
  '0.22%': '0.15%',
};

function updateNotes(notes) {
  if (!notes) return notes;
  // Replace formula reference
  notes = notes.replace(/× 0\.033 \//g, '× 0.022 /');
  // Replace standalone point value declarations
  notes = notes.replace(/1 TY point = AED 0\.033(?! \()/g, '1 TY point = AED 0.022 (cash rebate)');
  // Single-pass % replacement
  notes = notes.replace(PCT_PATTERN, m => PCT_MAP[m] || m);
  // Append caveat if not already present
  if (!notes.includes('Cash for Points')) {
    notes += CAVEAT;
  }
  return notes;
}

async function run() {
  for (const [label, cardId] of Object.entries(CARD_IDS)) {
    console.log(`\n--- ${label} (${cardId}) ---`);

    // 1. Update card-level value
    const { error: ce } = await sb.from('cards')
      .update({ reward_currency_value_aed: NEW_VALUE })
      .eq('id', cardId);
    if (ce) { console.error('Card update error:', ce.message); continue; }
    console.log(`  cards.reward_currency_value_aed: ${OLD_VALUE} → ${NEW_VALUE}`);

    // 2. Fetch rows
    const { data, error } = await sb.from('card_rewards')
      .select('category_id, earn_rate, earn_unit, effective_return_pct, notes')
      .eq('card_id', cardId);
    if (error) { console.error('Fetch error:', error.message); continue; }

    let updated = 0, skipped = 0, errors = 0;
    for (const row of data) {
      if (row.earn_rate === null || row.earn_unit === null) { skipped++; continue; }

      const newEff = parseFloat((row.earn_rate * NEW_VALUE / USD_TO_AED * 100).toFixed(2));
      const newNotes = updateNotes(row.notes);

      const { error: ue } = await sb.from('card_rewards')
        .update({ effective_return_pct: newEff, notes: newNotes })
        .eq('card_id', cardId)
        .eq('category_id', row.category_id)
        .eq('reward_event_type', 'ongoing');

      if (ue) { console.error(`  Row error [${row.category_id}]:`, ue.message); errors++; }
      else { console.log(`  cat ${row.category_id.slice(0,8)} earn=${row.earn_rate} eff ${row.effective_return_pct}→${newEff}`); updated++; }
    }
    console.log(`  card_rewards: ${updated} updated, ${skipped} skipped (no earn_rate), ${errors} errors.`);
  }
}

run();

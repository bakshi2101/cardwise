const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('/Users/abhinavbakshi/CardWise/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const CARD_IDS = {
  platinum: 'da395862-82d9-4d54-9b91-5f12f10c1206',
  signature: '30f9bcd9-787d-4859-bde1-57ee305608ac',
  infinite: '33ed23d3-0217-4399-b54a-18d560205bc5',
};
const OLD_VALUE = 0.005;
const NEW_VALUE = 0.004;

// Caveat using DIB's own terminology from dib.ae/personal/other-services/walaa-rewards
const CAVEAT = ' Worth more for flights, hotels, or bill payments: 20,000 Wala\'a Rewards = AED 100 (vs AED 80 via Pay with Rewards).';

// Single-pass regex for inline % replacements
// Patterns include the leading "=" to avoid matching unrelated text
const PCT_PATTERN = /=1\.75%|=1\.50%|=1\.25% return|=1\.10%|=1\.00% return|=0\.10%/g;
const PCT_MAP = {
  '=1.75%': '=1.40%',
  '=1.50%': '=1.20%',
  '=1.25% return': '=1.00% return',
  '=1.10%': '=0.88%',
  '=1.00% return': '=0.80% return',
  '=0.10%': '=0.08%',
};

// Summary % replacements (summaries use plain text, no leading "=")
const SUMMARY_MAP = {
  'earning 1.5%': 'earning 1.2%',
  'earning 1.25%': 'earning 1.0%',
  'earning 1%': 'earning 0.8%',
};

function updateNotes(notes) {
  if (!notes) return notes;
  // Replace point value declaration
  notes = notes.replace(/1 Wala'a Reward = AED 0\.005(?! \()/g, "1 Wala'a Reward = AED 0.004 (Pay with Rewards cashback rate)");
  // Single-pass % replacement
  notes = notes.replace(PCT_PATTERN, m => PCT_MAP[m] || m);
  // Append caveat if not already present
  if (!notes.includes("Worth more for flights")) {
    notes += CAVEAT;
  }
  return notes;
}

function updateSummary(summary) {
  if (!summary) return summary;
  let s = summary;
  for (const [old, repl] of Object.entries(SUMMARY_MAP)) {
    s = s.replace(old, repl);
  }
  return s;
}

async function run() {
  for (const [label, cardId] of Object.entries(CARD_IDS)) {
    console.log(`\n--- ${label} (${cardId}) ---`);

    // 1. Fetch current summary
    const { data: cardData, error: fe } = await sb.from('cards')
      .select('summary')
      .eq('id', cardId)
      .single();
    if (fe) { console.error('Card fetch error:', fe.message); continue; }

    const newSummary = updateSummary(cardData.summary);

    // 2. Update card-level value + summary
    const { error: ce } = await sb.from('cards')
      .update({ reward_currency_value_aed: NEW_VALUE, summary: newSummary })
      .eq('id', cardId);
    if (ce) { console.error('Card update error:', ce.message); continue; }
    console.log(`  cards.reward_currency_value_aed: ${OLD_VALUE} → ${NEW_VALUE}`);
    if (newSummary !== cardData.summary) console.log(`  cards.summary updated.`);

    // 3. Fetch card_rewards rows
    const { data, error } = await sb.from('card_rewards')
      .select('category_id, earn_rate, earn_unit, effective_return_pct, notes')
      .eq('card_id', cardId);
    if (error) { console.error('Fetch error:', error.message); continue; }

    let updated = 0, skipped = 0, errors = 0;
    for (const row of data) {
      if (row.earn_rate === null || row.earn_unit === null) { skipped++; continue; }

      const newEff = parseFloat((row.earn_rate * NEW_VALUE * 100).toFixed(2));
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

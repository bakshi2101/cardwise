const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('/Users/abhinavbakshi/CardWise/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const CARD_ID = 'b966d24c-377d-4ac2-b26e-88e42f653539'; // CBD Visa Infinite
const NEW_VALUE = 0.004;
const CAUTION = ' ⚠️ Redemption rate (AED 0.004/pt) sourced from CBD Visa Platinum/Titanium card PDFs; no Infinite-specific redemption rate confirmed in official documents — value assumed consistent across tiers. Marked estimated.';

// effective_return_pct = earn_rate * NEW_VALUE * 100
const EFF = { 2.5: 1.0, 0.5: 0.2, 3: 1.2 };
// Old % strings to replace in notes
const REPLACEMENTS = { '=1.625%': '=1.0%', '=0.325%': '=0.2%', '=1.95%': '=1.2%' };

async function run() {
  // 1. Update card-level value
  const { error: ce } = await sb.from('cards')
    .update({ reward_currency_value_aed: NEW_VALUE })
    .eq('id', CARD_ID);
  if (ce) { console.error('Card update error:', ce.message); return; }
  console.log('cards.reward_currency_value_aed updated to', NEW_VALUE);

  // 2. Fetch all card_rewards rows
  const { data, error } = await sb.from('card_rewards')
    .select('category_id, earn_rate, notes')
    .eq('card_id', CARD_ID);
  if (error) { console.error('Fetch error:', error.message); return; }

  let updated = 0, errors = 0;
  for (const row of data) {
    const newEff = EFF[row.earn_rate];
    if (newEff === undefined) {
      console.warn(`  Unknown earn_rate ${row.earn_rate} for category ${row.category_id} — skipped`);
      continue;
    }

    // Update inline % in notes text, then append caution
    let newNotes = row.notes || '';
    for (const [old, repl] of Object.entries(REPLACEMENTS)) {
      newNotes = newNotes.replace(old, repl);
    }
    if (!newNotes.includes('Redemption rate (AED 0.004')) {
      newNotes += CAUTION;
    }

    const { error: ue } = await sb.from('card_rewards')
      .update({
        effective_return_pct: newEff,
        is_estimated: true,
        notes: newNotes,
      })
      .eq('card_id', CARD_ID)
      .eq('category_id', row.category_id);

    if (ue) { console.error(`  Row error [${row.category_id}]:`, ue.message); errors++; }
    else updated++;
  }

  console.log(`card_rewards: ${updated} rows updated, ${errors} errors.`);
}

run();

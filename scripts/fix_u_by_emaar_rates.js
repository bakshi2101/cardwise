// Fix ENBD U by Emaar Family/Signature/Infinite — close gaps flagged in add_enbd_u_by_emaar.js
//
// Sources used to close gaps:
//   tcpdfs/emiratesnbd_credit_card_fees_charges.pdf (Feb 2026) — explicitly lists
//     "U by Emaar Infinite/Signature/Family": Annual Fee 1,575/262.50/Free,
//     Finance Charges 3.25%/3.69%/3.69%. Also confirms "International Transaction
//     Fee (Purchases in Non-AED/AED Currency): 1.99% of Transaction Amount" applies
//     to all products except dnata World.
//   tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf (March 2026) — APR table
//     cross-confirms UBE Infinite = 39.00% (3.25%/mo), UBE Signature = 44.28%
//     (3.69%/mo), UBE Family = 44.28% (3.69%/mo). Also confirms 1.99% forex fee
//     "charged on all foreign currency transactions on the Credit Card".
//
// FIXES APPLIED:
//   1. interest_rate_monthly_pct corrections (from product-page PDFs, which were stale):
//      - U by Emaar Family:    3.49% → 3.69%
//      - U by Emaar Signature: 3.25% → 3.69%
//      - U by Emaar Infinite:  3.25% (no change — confirmed correct)
//   2. forex_markup_pct (1.99%) was previously flagged "assumed/unconfirmed" —
//      now CONFIRMED for all 3 cards via the official Fees & Charges PDF + KFS.
//      Updated `cards.summary` and the `international` card_rewards row notes
//      on all 3 cards to remove the "verify with bank" caveat.
//
// REMAINING OPEN GAP (not addressed by these sources — they are fee schedules,
// not earning T&Cs):
//   - "rent" category mapping from "real estate" in the U by Emaar earning T&C
//     tier list. Still flagged ⚠️ for human review in card_rewards notes.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const FAMILY_ID = '7bc1be8c-185c-4f83-838e-f2178adb8b92';
const SIGNATURE_ID = '07331080-59db-4dba-8345-28db4127bf36';
const INFINITE_ID = '15d372a6-9af6-4568-8af8-31b65e05bc20';
const SRC_FEES = 'tcpdfs/emiratesnbd_credit_card_fees_charges.pdf';
const SRC_KFS = 'tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf';
const TODAY = '2026-06-15';

const forexConfirmed = `Forex markup: 1.99% CONFIRMED — International Transaction Fee applies to all ENBD card products except dnata World (${SRC_FEES}, Feb 2026; cross-confirmed in ${SRC_KFS}, March 2026).`;

async function run() {
  // 1. Interest rate corrections
  let r = await sb.from('cards').update({ interest_rate_monthly_pct: 3.69 }).eq('id', FAMILY_ID);
  console.log('Family interest fix (3.49 -> 3.69):', r.error ? r.error.message : 'OK');

  r = await sb.from('cards').update({ interest_rate_monthly_pct: 3.69 }).eq('id', SIGNATURE_ID);
  console.log('Signature interest fix (3.25 -> 3.69):', r.error ? r.error.message : 'OK');

  // 2. Confirm forex in cards.summary
  {
    const { data } = await sb.from('cards').select('summary').eq('id', FAMILY_ID).single();
    const s = data.summary
      .replace('Interest: 3.49%/month.', 'Interest: 3.69%/month (CORRECTED from 3.49% — official Feb 2026 Fees & Charges PDF + March 2026 KFS both confirm 44.28% APR = 3.69%/month for U by Emaar Family).')
      .replace(/Forex markup: 1\.99% assumed \(ENBD standard Visa rate\) — ⚠️ not explicitly confirmed for this card, verify with bank\./, forexConfirmed);
    const res = await sb.from('cards').update({ summary: s }).eq('id', FAMILY_ID);
    console.log('Family summary fix:', res.error ? res.error.message : 'OK');
  }
  {
    const { data } = await sb.from('cards').select('summary').eq('id', SIGNATURE_ID).single();
    const s = data.summary
      .replace('Interest: 3.25%/month.', 'Interest: 3.69%/month (CORRECTED from 3.25% — official Feb 2026 Fees & Charges PDF + March 2026 KFS both confirm 44.28% APR = 3.69%/month for U by Emaar Signature).')
      .replace(/Forex markup: 1\.99% assumed \(ENBD standard Visa rate\) — ⚠️ not explicitly confirmed for this card, verify with bank\./, forexConfirmed);
    const res = await sb.from('cards').update({ summary: s }).eq('id', SIGNATURE_ID);
    console.log('Signature summary fix:', res.error ? res.error.message : 'OK');
  }
  {
    const { data } = await sb.from('cards').select('summary').eq('id', INFINITE_ID).single();
    const s = data.summary
      .replace(/Forex markup: 1\.99% assumed \(ENBD standard Visa rate\) — ⚠️ not explicitly confirmed for this card, verify with bank\./, forexConfirmed + ' Interest rate 3.25%/month CONFIRMED (39.00% APR per March 2026 KFS).');
    const res = await sb.from('cards').update({ summary: s }).eq('id', INFINITE_ID);
    console.log('Infinite summary fix:', res.error ? res.error.message : 'OK');
  }

  // 3. Fix card_rewards 'international' notes for all 3 cards
  const { data: catRows } = await sb.from('spending_categories').select('id, slug').eq('slug', 'international');
  const intlCatId = catRows[0].id;

  for (const [label, id] of [['Family', FAMILY_ID], ['Signature', SIGNATURE_ID], ['Infinite', INFINITE_ID]]) {
    const { data: rows } = await sb.from('card_rewards').select('id, notes').eq('card_id', id).eq('category_id', intlCatId);
    for (const row of rows) {
      const newNotes = row.notes.replace(
        /⚠️ Foreign-currency transaction processing fee \(assumed 1\.99% — not confirmed in any U by Emaar product PDF, verify with bank\) applies separately and does not affect UPoints earning\./,
        `Foreign-currency transaction processing fee of 1.99% CONFIRMED (${SRC_FEES}, Feb 2026) applies separately and does not affect UPoints earning.`
      );
      const res = await sb.from('card_rewards').update({ notes: newNotes, last_verified_date: TODAY }).eq('id', row.id);
      console.log(`${label} international notes fix:`, res.error ? res.error.message : 'OK');
    }
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

// REVERT: Restricted categories for FAB Etihad Guest must be 0.25 miles/AED = 1.25%
// Source: Etihad-Guest-Miles-Terms-and-Conditions-En.pdf (Feb 2025, Version 3)
// Section 3, item (vi): "Post 1st 90 days, earn 2.5 Etihad Guest Miles per AED 10 for all
// purchases on Specific Merchants including both domestic (AED) and international (Non-AED)"
//
// The FAQs PDF (Etihad-Guest-Credit-Cards-FAQs.pdf) cited 1.5/AED 10 — but this is an
// OLDER document (references Air Berlin as EAP partner, bankrupt since 2017). The Feb 2025
// T&C supersedes it. Rate: 2.5 miles/AED 10 = 0.25 miles/AED = 1.25% effective.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const CARDS = {
  PLATINUM: '3902a2da-f5ed-4e17-8c7f-fc6a0ef6627e',
  SIGNATURE: 'b3dbe91b-c571-42c8-b34a-6fb094fc72f3',
  INFINITE:  'a6143824-9e57-4d0c-94f9-244e786d245f',
};

const CAT = {
  groceries:  '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:       'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  utilities:  '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:  '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  government: 'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  insurance:  'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  rent:       'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
};

const TODAY = '2026-06-13';
const SRC = 'https://www.bankfab.com/-/media/fabgroup/home/personal/cards/terms-and-conditions-pdfs/card-specific/etihad-guest-credit-card-tcs.pdf';
const RESTRICTED_RATE = 0.25; // 2.5 miles/AED 10 per Feb 2025 T&C
const RESTRICTED_EFF = 1.25;  // 0.25 × 0.05 × 100 = 1.25%

const NOTE_SUFFIX = 'Specific Merchant (Schedule 1) — earns 2.5 miles/AED 10 = 0.25 miles/AED = 1.25% for ALL card tiers. Source: Etihad-Guest-Miles-Terms-and-Conditions-En.pdf (Feb 2025 Version 3, Section 3 item vi). NOTE: Older FAQs PDF says 1.5/AED 10 but that document references Air Berlin (bankrupt 2017) and is superseded by Feb 2025 T&C.';

async function run() {
  const RESTRICTED_SLUGS = ['groceries','fuel','utilities','education','government','insurance','rent'];

  for (const [tier, cardId] of Object.entries(CARDS)) {
    for (const slug of RESTRICTED_SLUGS) {
      const r = await sb.from('card_rewards')
        .update({
          earn_rate: RESTRICTED_RATE,
          earn_unit: 'per_aed',
          effective_return_pct: RESTRICTED_EFF,
          source_url: SRC,
          last_verified_date: TODAY,
          notes: `${slug} earns 0.25 miles/AED (2.5 miles per AED 10). ${NOTE_SUFFIX}`,
        })
        .eq('card_id', cardId)
        .eq('category_id', CAT[slug]);
      console.log(`${tier} ${slug}: ${r.error ? '❌ ' + r.error.message : '✅ 0.25 miles/AED = 1.25%'}`);
    }
  }

  // Verify final state
  console.log('\n=== FINAL STATE: SIGNATURE ===');
  const { data: cats } = await sb.from('spending_categories').select('id,slug');
  const catMap = {};
  cats.forEach(c => catMap[c.id] = c.slug);
  const { data } = await sb.from('card_rewards')
    .select('category_id,earn_rate,effective_return_pct')
    .eq('card_id', CARDS.SIGNATURE);
  data.sort((a,b) => (catMap[a.category_id]||'').localeCompare(catMap[b.category_id]||''));
  data.forEach(r => {
    console.log(`  ${catMap[r.category_id] || r.category_id}: ${r.earn_rate} miles/AED = ${r.effective_return_pct}%`);
  });
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });

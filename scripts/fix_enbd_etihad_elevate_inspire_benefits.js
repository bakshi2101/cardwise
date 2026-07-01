// Fix ENBD Etihad Guest Visa Elevate + Visa Inspire — Benefits Gap Closure
//
// Sources:
//   - tcpdfs/Visa Infinite Airport Lounge Access.pdf
//       → Visa Infinite: unlimited visits (cardholder + 1 guest free), via Visa Airport Companion App
//       → Condition: AED 5,000 spend in calendar month of visit
//       → Elevate confirmed in the Visa Infinite tab listing
//   - tcpdfs/Visa Signature Airport Lounge Access.pdf
//       → Visa Signature: 12 visits/year (individual), via Visa Airport Companion App
//       → Condition: AED 5,000 spend in calendar month of visit
//       → Inspire confirmed in the Visa Signature tab listing
//   - tcpdfs/ENBD-Product-Etihad Guest Visa Elevate Credit Card _ Etihad Card Benefits.pdf
//       → Welcome bonus: 200,000 Etihad Guest Miles (on first spend within 90 days, new cardholders only)
//       → Cinema: Buy 1 Get 1 Free (Reel Cinemas, Vox Cinemas, Novo Cinemas, 4D Experience)
//       → Valet parking: Complimentary at select Abu Dhabi locations
//       → min salary: AED 30,000
//       → Concierge: yes (Visa Infinite concierge)
//       → Travel insurance: yes (comprehensive travel protection)
//   - tcpdfs/ENBD-Product-Etihad Guest Visa Inspire Credit Card _ Earn Etihad Miles .pdf
//       → Welcome bonus: 60,000 Etihad Guest Miles (on first spend within 90 days, new cardholders only)
//       → Cinema: Buy 1 Get 1 Free (same cinema chains)
//       → Valet parking: Complimentary at select Abu Dhabi locations
//       → min salary: AED 12,000
//       → Concierge: yes (Visa Signature concierge)
//       → Travel insurance: yes

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ELV_ID = '87f37bc6-a40d-4246-9bb5-9400f8d1952a'; // ENBD Etihad Guest Visa Elevate
const INS_ID = 'e6099b97-5c18-45e3-918c-13284d50fe3c'; // ENBD Etihad Guest Visa Inspire
const TODAY  = '2026-06-13';

const SRC_VIA = 'tcpdfs/Visa Infinite Airport Lounge Access.pdf';
const SRC_VSA = 'tcpdfs/Visa Signature Airport Lounge Access.pdf';
const SRC_ELV = 'tcpdfs/ENBD-Product-Etihad Guest Visa Elevate Credit Card _ Etihad Card Benefits.pdf';
const SRC_INS = 'tcpdfs/ENBD-Product-Etihad Guest Visa Inspire Credit Card _ Earn Etihad Miles .pdf';

async function run() {
  let errors = 0;

  // ─── 1. Update cards table: Elevate ───────────────────────────────────────
  console.log('\n[1/6] Updating Elevate cards table...');
  {
    const { error } = await sb
      .from('cards')
      .update({
        min_salary_aed: 30000,
        lounge_access_count: null,           // unlimited (Visa Infinite)
        lounge_access_network: 'visa_airport_companion',
        concierge: true,
        travel_insurance: true,
        summary: [
          'VERIFIED 2026-06-13. ENBD Etihad Guest Visa Elevate (Visa Infinite).',
          'Earn 1.0 mile/AED on Etihad Airways, Etihad Holidays, dining, and hotels;',
          '0.6 miles/AED on international and general domestic spend;',
          '0.15 miles/AED on groceries, QSR, and insurance;',
          '0.06 miles/AED on fuel, utilities, government, education, and rent.',
          'Utility payments via ENBD online/mobile/IVR earn ZERO miles (TNC 2.4 viii).',
          'Unlimited airport lounge access (self + 1 guest free) via Visa Airport Companion App.',
          'Requires AED 5,000 spend in calendar month of lounge visit.',
          'Welcome bonus: 200,000 miles on first spend within 90 days (new cardholders).',
          'BOGOF cinema at Reel, Vox, Novo, 4D. Complimentary valet parking (Abu Dhabi).',
          'Visa Infinite concierge. Comprehensive travel insurance.',
          'AED 100,000/billing-cycle spend cap for miles earning.',
          'Sources: TNC booklet + ENBD product page + Visa Infinite lounge PDF.',
        ].join(' '),
      })
      .eq('id', ELV_ID);
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else console.log('  OK — Elevate cards table updated');
  }

  // ─── 2. Update cards table: Inspire ──────────────────────────────────────
  console.log('\n[2/6] Updating Inspire cards table...');
  {
    const { error } = await sb
      .from('cards')
      .update({
        min_salary_aed: 12000,
        lounge_access_count: 12,             // 12 visits/year (Visa Signature)
        lounge_access_network: 'visa_airport_companion',
        concierge: true,
        travel_insurance: true,
        summary: [
          'VERIFIED 2026-06-13. ENBD Etihad Guest Visa Inspire (Visa Signature).',
          'Earn 0.7 miles/AED on Etihad Airways, Etihad Holidays, dining, and hotels;',
          '0.4 miles/AED on international and general domestic spend;',
          '0.15 miles/AED on groceries, QSR, and insurance;',
          '0.04 miles/AED on fuel, utilities, government, education, and rent.',
          'Utility payments via ENBD online/mobile/IVR earn ZERO miles (TNC 2.4 viii).',
          '12 complimentary airport lounge visits/year via Visa Airport Companion App.',
          'Requires AED 5,000 spend in calendar month of lounge visit.',
          'Welcome bonus: 60,000 miles on first spend within 90 days (new cardholders).',
          'BOGOF cinema at Reel, Vox, Novo, 4D. Complimentary valet parking (Abu Dhabi).',
          'Visa Signature concierge. Comprehensive travel insurance.',
          'Note: KFS/fees doc lists 3.69%/month APR; product page shows 3.25% — trust KFS (regulatory).',
          'Sources: TNC booklet + ENBD product page + Visa Signature lounge PDF.',
        ].join(' '),
      })
      .eq('id', INS_ID);
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else console.log('  OK — Inspire cards table updated');
  }

  // ─── 3. Insert card_benefits: Elevate ────────────────────────────────────
  console.log('\n[3/6] Inserting Elevate card_benefits...');

  const elv_benefits = [
    {
      card_id: ELV_ID,
      benefit_type: 'lounge_access',
      title: 'Unlimited Airport Lounge Access (Visa Infinite)',
      description: 'Unlimited complimentary lounge visits for cardholder + 1 guest free via Visa Airport Companion App. Requires AED 5,000 spend in the calendar month of visit. Valid at 1,000+ airports worldwide.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'yearly',
      conditions: 'Must spend AED 5,000 in the calendar month of the visit. Access via Visa Airport Companion App.',
      is_active: true,
    },
    {
      card_id: ELV_ID,
      benefit_type: 'welcome_bonus',
      title: '200,000 Etihad Guest Miles Welcome Bonus',
      description: 'Earn 200,000 Etihad Guest Miles on first card spend within 90 days of card issuance. New cardholders only.',
      monetary_value_aed: 10000,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'New cardholders only. First spend must occur within 90 days of card issuance. Miles credited within 90 days of qualifying spend.',
      is_active: true,
    },
    {
      card_id: ELV_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Cinema Tickets',
      description: 'Buy 1 Get 1 Free cinema tickets at Reel Cinemas, Vox Cinemas, Novo Cinemas, and 4D Experience.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: ELV_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking (Abu Dhabi)',
      description: 'Complimentary valet parking at select Abu Dhabi locations.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Available at select Abu Dhabi locations only.',
      is_active: true,
    },
  ];

  for (const benefit of elv_benefits) {
    const { error } = await sb.from('card_benefits').insert(benefit);
    if (error) { console.error(`  ERROR (${benefit.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${benefit.title}`);
  }

  // ─── 4. Insert card_benefits: Inspire ────────────────────────────────────
  console.log('\n[4/6] Inserting Inspire card_benefits...');

  const ins_benefits = [
    {
      card_id: INS_ID,
      benefit_type: 'lounge_access',
      title: '12 Complimentary Airport Lounge Visits/Year (Visa Signature)',
      description: '12 complimentary lounge visits per year via Visa Airport Companion App (individual visits; no free guest included). Valid at 1,000+ airports worldwide.',
      monetary_value_aed: null,
      usage_limit: 12,
      usage_period: 'yearly',
      conditions: 'Must spend AED 5,000 in the calendar month of the visit. Access via Visa Airport Companion App. No free guest (unlike Visa Infinite).',
      is_active: true,
    },
    {
      card_id: INS_ID,
      benefit_type: 'welcome_bonus',
      title: '60,000 Etihad Guest Miles Welcome Bonus',
      description: 'Earn 60,000 Etihad Guest Miles on first card spend within 90 days of card issuance. New cardholders only.',
      monetary_value_aed: 3000,
      usage_limit: 1,
      usage_period: 'one_time',
      conditions: 'New cardholders only. First spend must occur within 90 days of card issuance. Miles credited within 90 days of qualifying spend.',
      is_active: true,
    },
    {
      card_id: INS_ID,
      benefit_type: 'entertainment',
      title: 'BOGOF Cinema Tickets',
      description: 'Buy 1 Get 1 Free cinema tickets at Reel Cinemas, Vox Cinemas, Novo Cinemas, and 4D Experience.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: null,
      is_active: true,
    },
    {
      card_id: INS_ID,
      benefit_type: 'valet_parking',
      title: 'Complimentary Valet Parking (Abu Dhabi)',
      description: 'Complimentary valet parking at select Abu Dhabi locations.',
      monetary_value_aed: null,
      usage_limit: null,
      usage_period: 'monthly',
      conditions: 'Available at select Abu Dhabi locations only.',
      is_active: true,
    },
  ];

  for (const benefit of ins_benefits) {
    const { error } = await sb.from('card_benefits').insert(benefit);
    if (error) { console.error(`  ERROR (${benefit.benefit_type}):`, error.message); errors++; }
    else console.log(`  OK — ${benefit.title}`);
  }

  // ─── 5. Verify final state ────────────────────────────────────────────────
  console.log('\n[5/6] Verifying final state...');
  const { data: cards, error: cErr } = await sb
    .from('cards')
    .select('id, name, min_salary_aed, lounge_access_count, lounge_access_network, concierge, travel_insurance')
    .in('id', [ELV_ID, INS_ID]);
  if (cErr) { console.error('  ERROR:', cErr.message); errors++; }
  else {
    for (const c of cards) {
      console.log(`  ${c.name}`);
      console.log(`    min_salary=${c.min_salary_aed}, lounge_count=${c.lounge_access_count == null ? 'unlimited' : c.lounge_access_count}, network=${c.lounge_access_network}`);
      console.log(`    concierge=${c.concierge}, travel_insurance=${c.travel_insurance}`);
    }
  }

  const { data: benefits, error: bErr } = await sb
    .from('card_benefits')
    .select('card_id, benefit_type, title, usage_limit, usage_period')
    .in('card_id', [ELV_ID, INS_ID])
    .order('card_id')
    .order('benefit_type');
  if (bErr) { console.error('  ERROR:', bErr.message); errors++; }
  else {
    console.log(`\n  card_benefits rows (${benefits.length} total):`);
    for (const b of benefits) {
      const tag = b.card_id === ELV_ID ? 'Elevate' : 'Inspire';
      console.log(`    [${tag}] ${b.benefit_type} — ${b.title} (limit=${b.usage_limit == null ? 'unlimited' : b.usage_limit}, per=${b.usage_period})`);
    }
  }

  // ─── 6. Summary ──────────────────────────────────────────────────────────
  console.log('\n[6/6] Done.');
  if (errors === 0) console.log('  All updates applied successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

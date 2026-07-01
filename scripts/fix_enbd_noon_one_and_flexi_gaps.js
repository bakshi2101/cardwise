// Fix ENBD noon One + Visa Flexi — gap closure from 4 additional PDFs
//
// Sources confirmed:
//   - tcpdfs/ENBD noon One Visa Credit Card Application.pdf
//       → card_tier: Visa Platinum (card image explicit)
//       → min_salary_aed: AED 5,000
//       → Cinema: VOX until 31 Jul 2026, Reel Cinemas from 1 Aug 2026
//       → noon platforms: noon.ae, noon food, supermall, noon home services all earn 5%
//   - tcpdfs/ENBD-Visa Flexi Credit Card.pdf
//       → min_salary_aed: AED 12,000
//       → Benefits model (current): Choose 3/5 Travel + 2/4 Lifestyle + 1/3 Entertainment
//   - tcpdfs/ENBD Earn Plus Points.pdf
//       → Flexi cap = 2,000 PP/statement (was stored as 500 — WRONG)
//       → EU AND UK = 0.4% (same tier as groceries; not 1.5% general)
//       → Government = 0.2% (confirmed, already stored correctly)
//   - tcpdfs/ENBD Redeem Plus Points.pdf
//       → 1 PP = 1 AED (instant/Nol/education); 0.75 AED for cashback
//       → Transfer: 1 PP = 7 Skywards Miles or 10 Etihad Guest Miles

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const NOON_ID  = 'bb9bb1d8-1d28-44e5-8fb3-ec89d5c72cc5'; // ENBD noon One Visa Credit Card
const FLEXI_ID = '830bb948-d731-4d51-b3de-3e08a0a2a857'; // ENBD Visa Flexi Credit Card
const TODAY    = '2026-06-14';

const SRC_NOON_APP   = 'tcpdfs/ENBD noon One Visa Credit Card Application.pdf';
const SRC_FLEXI_PROD = 'tcpdfs/ENBD-Visa Flexi Credit Card.pdf';
const SRC_EARN       = 'tcpdfs/ENBD Earn Plus Points.pdf';

async function run() {
  let errors = 0;

  // ─── 1. noon One — update cards table ─────────────────────────────────────
  console.log('\n[1/7] Updating noon One cards table...');
  {
    const { error } = await sb
      .from('cards')
      .update({
        card_tier: 'platinum',
        min_salary_aed: 5000,
        summary: [
          'VERIFIED 2026-06-14. ENBD noon One Visa Platinum Credit Card.',
          'Earn 5% noon Credits on noon.ae, noon food, supermall, and noon home services.',
          'Earn 1% noon Credits on all other eligible spend.',
          'No earn on fuel, utilities, government, education, rent, insurance, real estate.',
          'No annual fee. Min salary AED 5,000.',
          'Welcome bonus: AED 500 noon Credits on first spend within 90 days (new cardholders).',
          '1-year complimentary noon One subscription (unlocks priority delivery, exclusive deals).',
          'Cinema: BOGOF at VOX Cinemas (until 31 Jul 2026); transitions to Reel Cinemas from 1 Aug 2026.',
          'noon Credits redeemable on noon.ae only (not AED cashback).',
          'Forex markup: 1.99% (+ ~1.15% Visa network fee = ~3.14% total on foreign spend).',
          'Sources: noon special features PDF + KFS + fees doc + noon One product page PDF.',
        ].join(' '),
      })
      .eq('id', NOON_ID);
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else console.log('  OK — noon One cards table updated (tier=platinum, min_salary=5000)');
  }

  // ─── 2. noon One — update cinema card_benefit ─────────────────────────────
  console.log('\n[2/7] Updating noon One cinema card_benefit...');
  {
    // Find and update the entertainment/cinema benefit row
    const { data: rows, error: fetchErr } = await sb
      .from('card_benefits')
      .select('id, benefit_type, title')
      .eq('card_id', NOON_ID)
      .eq('benefit_type', 'entertainment');

    if (fetchErr) {
      console.error('  ERROR fetching benefit:', fetchErr.message);
      errors++;
    } else if (!rows || rows.length === 0) {
      console.log('  WARNING: no entertainment benefit found for noon One — skipping');
    } else {
      for (const row of rows) {
        const { error } = await sb
          .from('card_benefits')
          .update({
            title: 'BOGOF Cinema Tickets (VOX → Reel from Aug 2026)',
            description: [
              'Buy 1 Get 1 Free cinema tickets.',
              'Valid at VOX Cinemas until 31 July 2026.',
              'Transitions to Reel Cinemas effective 1 August 2026.',
            ].join(' '),
            conditions: 'Cinema partner changes from VOX to Reel on 1 August 2026. Check ENBD product page for latest partner.',
          })
          .eq('id', row.id);
        if (error) { console.error('  ERROR updating benefit:', error.message); errors++; }
        else console.log(`  OK — updated entertainment benefit: ${row.id}`);
      }
    }
  }

  // ─── 3. Flexi — update cards table ────────────────────────────────────────
  console.log('\n[3/7] Updating Flexi cards table...');
  {
    const { error } = await sb
      .from('cards')
      .update({
        card_tier: 'platinum',
        min_salary_aed: 12000,
        summary: [
          'VERIFIED 2026-06-14. ENBD Visa Flexi Credit Card (Visa Platinum tier).',
          'Earn Plus Points: 1.5 PP/AED on dining, hotels, airlines, shopping, entertainment, online shopping, other travel;',
          '0.4 PP/AED on groceries, insurance, and international spend IN EU/UK countries;',
          '0.2 PP/AED on fuel, utilities, government, education, rent, and healthcare.',
          'Note: EU and UK international spend earns only 0.4 PP/AED (not 1.5% general rate).',
          'Cap: 2,000 PP per statement cycle. Annual fee: AED 735 (current offer: waived).',
          'Min salary: AED 12,000. Forex markup: 1.99% + ~1.15% Visa network fee.',
          'Redemption: 1 PP = AED 1 (instant/Nol/education); 1 PP = AED 0.75 cashback; 1 PP = 7 Skywards or 10 Etihad Miles.',
          'Customisable benefits: Choose 3 of 5 Travel (lounge access, Global Blue, airport transfers, flight delay lounge, eSIM);',
          'Select 2 of 4 Lifestyle (Careem, Golf UAE, SupperClub Signature Premium Dining, Concierge);',
          'Pick 1 of 3 Entertainment (Anghami 6mo, STARZPLAY 3mo, VOX Theatre/4DX).',
          'Included standard: Visa Purchase Protection, Visa Medical & travel assistance, 24/7 roadside, DoubleSecure, Bon Appétit, Buy 1 Get 1 with The Entertainer.',
          'APR note: product page shows 3.25%/month; KFS shows 3.69%/month — trust KFS (regulatory).',
          'Sources: Flexi product page PDF + KFS + fees doc + Plus Points earn/redeem PDFs.',
        ].join(' '),
      })
      .eq('id', FLEXI_ID);
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else console.log('  OK — Flexi cards table updated (tier=platinum, min_salary=12000)');
  }

  // ─── 4. Flexi — fix monthly_cap_reward on ALL card_rewards rows ───────────
  console.log('\n[4/7] Fixing Flexi card_rewards monthly_cap_reward (500→2000)...');
  {
    const { error } = await sb
      .from('card_rewards')
      .update({ monthly_cap_reward: 2000 })
      .eq('card_id', FLEXI_ID);
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else console.log('  OK — all Flexi card_rewards rows updated: monthly_cap_reward=2000');
  }

  // ─── 5. Flexi — update international category notes (EU+UK = 0.4%) ────────
  console.log('\n[5/7] Updating Flexi international category notes...');
  {
    // Find the international category row
    const { data: cats, error: catErr } = await sb
      .from('spending_categories')
      .select('id')
      .eq('slug', 'international')
      .single();
    if (catErr) {
      console.error('  ERROR fetching international category:', catErr.message);
      errors++;
    } else {
      const { error } = await sb
        .from('card_rewards')
        .update({
          notes: [
            '0.4 PP/AED on international spend in EU and UK countries specifically.',
            'Other international spend (outside EU/UK) earns 1.5 PP/AED (general rate).',
            '⚠️ EU and UK earn at the lower tier (same as groceries/insurance) per official ENBD earn table.',
            'Source: tcpdfs/ENBD Earn Plus Points.pdf',
          ].join(' '),
          last_verified_date: TODAY,
          source_url: SRC_EARN,
        })
        .eq('card_id', FLEXI_ID)
        .eq('category_id', cats.id);
      if (error) { console.error('  ERROR:', error.message); errors++; }
      else console.log('  OK — Flexi international notes updated (EU+UK=0.4% confirmed)');
    }
  }

  // ─── 6. Flexi — update card_benefit description ───────────────────────────
  console.log('\n[6/7] Updating Flexi card_benefit (customisable model)...');
  {
    const { data: rows, error: fetchErr } = await sb
      .from('card_benefits')
      .select('id, benefit_type')
      .eq('card_id', FLEXI_ID);

    if (fetchErr) {
      console.error('  ERROR fetching Flexi benefits:', fetchErr.message);
      errors++;
    } else if (!rows || rows.length === 0) {
      console.log('  WARNING: no card_benefits found for Flexi — skipping');
    } else {
      // Update the first (and likely only) benefit row
      for (const row of rows) {
        const { error } = await sb
          .from('card_benefits')
          .update({
            title: 'Customisable Flexi Benefits (3+2+1 Model)',
            description: [
              'Choose your own benefits across 3 categories:',
              'TRAVEL — Pick 3 of 5: Airport lounge access (900+ global lounges), Global Blue tax refund, Airport transfers, Flight delay lounge access, eSIM (3GB data).',
              'LIFESTYLE — Select 2 of 4: Careem credits, Golf access (UAE courses), SupperClub Signature Premium Dining (12-month), Concierge service.',
              'ENTERTAINMENT — Pick 1 of 3: Anghami Plus (6 months), STARZPLAY (3 months), VOX Cinemas (Theatre/4DX screening).',
              'Standard included (all cardholders): Visa Purchase Protection (complimentary insurance on big ticket purchases), Visa Medical & travel assistance, 24/7 roadside assistance, DoubleSecure fraud protection, Bon Appétit dining discounts, Buy 1 Get 1 Free with The Entertainer.',
            ].join(' '),
            conditions: 'Benefit selections are made at card activation. Lounge access via Visa Airport Companion or Priority Pass (subject to selected option). Specific partner terms apply per selected benefit. Source: tcpdfs/ENBD-Visa Flexi Credit Card.pdf',
          })
          .eq('id', row.id);
        if (error) { console.error(`  ERROR updating benefit ${row.id}:`, error.message); errors++; }
        else console.log(`  OK — updated Flexi benefit: ${row.id}`);
      }
    }
  }

  // ─── 7. Verify final state ────────────────────────────────────────────────
  console.log('\n[7/7] Verifying final state...');

  const { data: cards, error: cErr } = await sb
    .from('cards')
    .select('id, name, card_tier, min_salary_aed, annual_fee_aed')
    .in('id', [NOON_ID, FLEXI_ID]);
  if (cErr) { console.error('  ERROR:', cErr.message); errors++; }
  else {
    for (const c of cards) {
      console.log(`  ${c.name}`);
      console.log(`    tier=${c.card_tier}, min_salary=${c.min_salary_aed}, annual_fee=${c.annual_fee_aed}`);
    }
  }

  const { data: rewards, error: rErr } = await sb
    .from('card_rewards')
    .select('card_id, category_id, earn_rate, effective_return_pct, monthly_cap_reward, notes')
    .in('card_id', [NOON_ID, FLEXI_ID])
    .order('card_id')
    .order('effective_return_pct', { ascending: false });
  if (rErr) { console.error('  ERROR:', rErr.message); errors++; }
  else {
    const noon = rewards.filter(r => r.card_id === NOON_ID);
    const flexi = rewards.filter(r => r.card_id === FLEXI_ID);
    console.log(`\n  noon One (${noon.length} reward rows):`);
    for (const r of noon) {
      console.log(`    rate=${r.earn_rate}, return=${r.effective_return_pct}%, cap=${r.monthly_cap_reward}`);
    }
    console.log(`\n  Flexi (${flexi.length} reward rows), caps:`);
    const caps = [...new Set(flexi.map(r => r.monthly_cap_reward))];
    console.log(`    monthly_cap_reward values: ${caps.join(', ')}`);
  }

  const { data: benefits, error: bErr } = await sb
    .from('card_benefits')
    .select('card_id, benefit_type, title')
    .in('card_id', [NOON_ID, FLEXI_ID])
    .order('card_id');
  if (bErr) { console.error('  ERROR:', bErr.message); errors++; }
  else {
    console.log(`\n  card_benefits (${benefits.length} total):`);
    for (const b of benefits) {
      const tag = b.card_id === NOON_ID ? 'noon One' : 'Flexi';
      console.log(`    [${tag}] ${b.benefit_type} — ${b.title}`);
    }
  }

  console.log('\n[Done]');
  if (errors === 0) console.log('  All corrections applied successfully. No errors.');
  else console.log(`  Completed with ${errors} error(s) — review output above.`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

// Update FAB ADNOC Rewards card: lounge_access_count = 8 (World Mastercard UAE)
// Source: priceless.com/travel/product/168080/world-mastercard-lounge-program-dp
// UAE-issued Mastercard World cards = 8 complimentary visits/year via Mastercard Travel Pass
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const CARD_ID = '95c8b7ec-b63c-4cc8-9a72-053516038574';
const TODAY = '2026-05-08';

async function run() {
  let r;

  // 1. Update card-level lounge fields
  r = await sb.from('cards').update({
    card_tier: 'world',
    lounge_access_count: 8,
    lounge_access_network: 'mastercard_travel_pass',
  }).eq('id', CARD_ID);
  console.log('Card lounge update:', r.error ? r.error.message : '✅ lounge_access_count=8, network=mastercard_travel_pass');

  // 2. Check for existing lounge benefit row
  const { data: existing } = await sb.from('card_benefits').select('id,title,usage_limit').eq('card_id', CARD_ID).eq('benefit_type', 'lounge_access');
  console.log('Existing lounge benefits:', JSON.stringify(existing));

  if (existing && existing.length > 0) {
    // Update existing row
    r = await sb.from('card_benefits').update({
      title: 'Airport lounge access — World Mastercard Lounge Program',
      description: '8 complimentary lounge visits/year at 1,300+ airport lounges across 135 countries via Mastercard Travel Pass app. To activate: make a minimum USD 1 international (non-AED) purchase — this unlocks complimentary access for the next 3 calendar months. Repeat every 3 months to maintain access. Fallback without an international purchase: 1 complimentary visit/year, then access pauses until reactivated.',
      usage_limit: 8,
      usage_period: 'yearly',
      conditions: 'Min USD 1 international (non-AED) purchase required per quarter to unlock 3 months of complimentary access. Without intl purchase: only 1 complimentary visit/year. Guest fee: USD 32/visit. Register card on Mastercard Travel Pass app before use.',
      is_active: true,
    }).eq('card_id', CARD_ID).eq('benefit_type', 'lounge_access');
    console.log('Lounge benefit updated:', r.error ? r.error.message : '✅');
  } else {
    // Insert new row
    r = await sb.from('card_benefits').insert({
      card_id: CARD_ID,
      benefit_type: 'lounge_access',
      title: 'Airport lounge access — World Mastercard Lounge Program',
      description: '8 complimentary lounge visits/year at 1,300+ airport lounges across 135 countries via Mastercard Travel Pass app. To activate: make a minimum USD 1 international (non-AED) purchase — this unlocks complimentary access for the next 3 calendar months. Repeat every 3 months to maintain access. Fallback without an international purchase: 1 complimentary visit/year, then access pauses until reactivated.',
      usage_limit: 8,
      usage_period: 'yearly',
      conditions: 'Min USD 1 international (non-AED) purchase required per quarter to unlock 3 months of complimentary access. Without intl purchase: only 1 complimentary visit/year. Guest fee: USD 32/visit. Register card on Mastercard Travel Pass app before use.',
      is_active: true,
    });
    console.log('Lounge benefit inserted:', r.error ? r.error.message : '✅');
  }

  // 3. Verify final state
  const { data: card } = await sb.from('cards').select('name,card_tier,lounge_access_count,lounge_access_network').eq('id', CARD_ID).single();
  console.log('\nFinal card state:', JSON.stringify(card));
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });

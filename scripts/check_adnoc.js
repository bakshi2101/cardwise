const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

async function run() {
  const { data: cards } = await sb.from('cards').select('id,name,card_tier,lounge_access_count,lounge_access_network').ilike('name', '%ADNOC%');
  console.log('Cards:', JSON.stringify(cards));
  if (cards && cards[0]) {
    const { data: ben } = await sb.from('card_benefits').select('id,benefit_type,title,usage_limit,conditions').eq('card_id', cards[0].id);
    console.log('Benefits:', JSON.stringify(ben));
  }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

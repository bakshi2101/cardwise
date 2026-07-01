const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);
async function run() {
  const { data, error } = await sb.from('cards').select('id, name, bank_id').ilike('name', '%voyager%');
  console.log('Voyager cards:', JSON.stringify(data, null, 2), error);
  const { data: enbd } = await sb.from('cards').select('id, name').eq('bank_id', '1850c3c7-f97e-4b4f-988b-530d8f39ad8c');
  console.log('All ENBD cards:\n' + enbd.map(c=>c.name).join('\n'));
}
run();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim()))
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  // Update card summaries to include the monthly earning cap (card-level fact)
  const cardUpdates = [
    {
      id: '3902a2da-f5ed-4e17-8c7f-fc6a0ef6627e', // Platinum
      summary: 'An entry-level Etihad Guest miles card earning 2% on direct Etihad bookings and 1% on everyday domestic spend, for an AED 500 annual fee. Monthly earning cap: 10,000 miles across all categories. Verified on June 13, 2026.',
    },
    {
      id: 'b3dbe91b-c571-42c8-b34a-6fb094fc72f3', // Signature
      summary: 'A mid-tier Etihad Guest miles card earning 2.75% on direct Etihad bookings and 1.375% on general domestic spend, with lounge access, for an AED 1,500 annual fee. Monthly earning cap: 30,000 miles across all categories. Verified on June 13, 2026.',
    },
    {
      id: 'a6143824-9e57-4d0c-94f9-244e786d245f', // Infinite
      summary: 'A premium Etihad Guest miles card earning 3.5% on direct Etihad bookings and 1.75% on general domestic spend, with lounge access for cardholder plus a guest, for an AED 2,500 annual fee. Monthly earning cap: 55,000 miles across all categories. Verified on June 13, 2026.',
    },
  ];

  // Clear the misleading cap note from the general ongoing rows
  const rewardNullUpdates = [
    '699db6d0-c399-4995-b67b-fcd4e6c41c9e', // Infinite general ongoing
    '3205ca1b-f9c4-4b00-a341-088021dfe834', // Signature general ongoing
    '3657c81e-ba67-430f-bdbe-0c96ef8c87cb', // Platinum general ongoing
  ];

  let ok = 0, fail = 0;

  for (const { id, summary } of cardUpdates) {
    const { error } = await supabase.from('cards').update({ summary }).eq('id', id);
    if (error) { console.error(`FAIL card ${id}:`, error.message); fail++; }
    else ok++;
  }

  for (const id of rewardNullUpdates) {
    const { error } = await supabase.from('card_rewards').update({ notes: null }).eq('id', id);
    if (error) { console.error(`FAIL reward ${id}:`, error.message); fail++; }
    else ok++;
  }

  console.log(`Done: ${ok} updated, ${fail} failed.`);
})();

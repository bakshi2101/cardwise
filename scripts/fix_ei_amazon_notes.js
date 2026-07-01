const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim()))
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const updates = [
  // Restricted MCCs (0.25%) — no Prime/Non-Prime difference
  { id: 'c5da3e5b-edd4-47e7-af61-fb8ba7e0a5cd', notes: 'Restricted MCC rate — same for Prime and non-Prime.' },             // groceries
  { id: '6a75d3e1-92c8-405c-af42-580a228ad5d0', notes: 'Restricted MCC rate — same for Prime and non-Prime.' },             // education
  { id: 'aeeffa39-20f3-4bb6-9401-d4ad19806e8a', notes: 'Restricted MCC rate — same for Prime and non-Prime.' },             // insurance
  { id: 'b2e160c2-60c2-4de1-95bd-3f916149955f', notes: 'Restricted MCC rate — same for Prime and non-Prime.' },             // fuel
  { id: '11e5eb80-ec69-4dca-8909-6e46f572219e', notes: 'Mapped from "Real Estate" restricted MCC. Same rate Prime and non-Prime.' }, // rent
  { id: '7bca4b8d-ffa9-496b-857f-61277784a60e', notes: 'Restricted MCC rate — same for Prime and non-Prime. ⚠️ Bill payments via EI banking channels (app/online/ATM) earn 0 points; must pay merchant directly.' }, // utilities
  { id: 'f9483e28-f1cb-424c-b56c-7ce79b6c0acf', notes: 'Restricted MCC rate — same for Prime and non-Prime. ⚠️ Government fee payments via EI banking channels (app/online/ATM) earn 0 points; must pay merchant directly.' }, // government

  // Standard 2% domestic — Prime caveat only
  { id: 'c4678b2c-b407-4620-b8ba-1903f3d14785', notes: '⚠️ Non-Prime earns 1%.' }, // shopping
  { id: '8b72bdef-b638-4a99-854f-8bea9e124ca6', notes: '⚠️ Non-Prime earns 1%.' }, // airlines
  { id: '7e0b796d-cbe4-4e99-be0d-cb459350dc62', notes: '⚠️ Non-Prime earns 1%.' }, // travel
  { id: '12690877-161d-4ecb-a3f5-ea41ef7a0782', notes: '⚠️ Non-Prime earns 1%.' }, // general

  // 2% domestic with extra caveats
  { id: 'd028e18c-dc8b-4d8d-98cb-8b5eb74de8e5', notes: '⚠️ QSR/fast-food MCCs earn 0.25% (restricted — same rate Prime and non-Prime). Non-Prime earns 1% on general dining.' }, // dining
  { id: '403cfa69-9336-4417-b9dd-c3abe788cb23', notes: 'Earns general domestic rate (not a restricted MCC). ⚠️ Non-Prime earns 1%.' }, // healthcare
  { id: '6d1069f0-a6ec-4cec-9904-f6a8e4d9b283', notes: '⚠️ Non-Prime earns 1%. 🎁 BOGOF Reel Cinemas up to 2×/month (min AED 3,000/month spend).' }, // entertainment
  { id: '857fa222-b498-4806-8594-f9f9970a187b', notes: '⚠️ Non-Prime earns 1%. 🎁 IHG Hotels: 15% discount.' }, // hotels

  // Unique category rates
  { id: '426cc635-cf1c-48c0-ab26-29b00404415f', notes: '⚠️ Non-Prime earns 3%. Ultra-Fast Grocery and Gift Cards earn 2% (Prime) / 1% (Non-Prime). Off-Amazon online spend (Noon, Namshi, etc.) earns 2% (Prime) / 1% (Non-Prime).' }, // online_shopping
  { id: '46aa68a9-7410-4ab0-9513-e0f1ff1157a1', notes: '⚠️ Non-Prime earns 1%. EEA/UK spend earns 2% (Prime) / 0.25% (Non-Prime). Forex markup 2.34% applies.' }, // international

  // Welcome bonus
  { id: 'ede0af08-1025-4a02-9b5d-0437386096e9', notes: 'AED 250 Amazon Points on AED 10,000 retail spend + AED 250 on AED 2,500 FX spend, both within 60 days of card issuance. Prime membership required.' }, // welcome_bonus
];

(async () => {
  let ok = 0, fail = 0;
  for (const { id, notes } of updates) {
    const { error } = await supabase.from('card_rewards').update({ notes }).eq('id', id);
    if (error) { console.error(`FAIL ${id}:`, error.message); fail++; }
    else { ok++; }
  }
  console.log(`Done: ${ok} updated, ${fail} failed.`);
})();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim()))
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SPECIFIC_MERCHANT_NOTE = 'Specific Merchant rate — same across all three card tiers.';

const updates = [
  // ── Specific Merchant rows (groceries/fuel/utilities/education/government/insurance/rent)
  // Removes Air Berlin PDF-history disclaimer; keeps the user-relevant cross-tier parity fact.
  // Infinite
  { id: '10fa115a-762e-4582-8015-37e93b51a77c', notes: SPECIFIC_MERCHANT_NOTE }, // education
  { id: 'd3cad24b-0c72-4ffe-a4f7-6c6a10f41bf3', notes: SPECIFIC_MERCHANT_NOTE }, // fuel
  { id: 'b0f50be7-d2cb-4887-b8c4-6790282d89aa', notes: SPECIFIC_MERCHANT_NOTE }, // government
  { id: '18e9a0d8-06e5-4491-9562-ecc871007161', notes: SPECIFIC_MERCHANT_NOTE }, // groceries
  { id: '9721adc6-a66d-45d7-ac15-ea0fc4e4ff3f', notes: SPECIFIC_MERCHANT_NOTE }, // insurance
  { id: '73ae7f92-2d3d-4278-8e29-053fdbc72cbe', notes: SPECIFIC_MERCHANT_NOTE }, // rent
  { id: 'de0723c5-1fb4-464c-b0db-62b8104020c7', notes: SPECIFIC_MERCHANT_NOTE }, // utilities
  // Platinum
  { id: '636c334d-9c44-43b2-b514-cfeda23b78ad', notes: SPECIFIC_MERCHANT_NOTE }, // education
  { id: '06d9e140-b79b-45a4-90c2-bbb9b16636d8', notes: SPECIFIC_MERCHANT_NOTE }, // fuel
  { id: '17591b8d-ae14-4980-8772-c1555eb7e286', notes: SPECIFIC_MERCHANT_NOTE }, // government
  { id: 'cdc40262-ed58-4f64-86fd-1c1da604453e', notes: SPECIFIC_MERCHANT_NOTE }, // groceries
  { id: '9efa16c1-d09f-4074-96ef-470e0f26d595', notes: SPECIFIC_MERCHANT_NOTE }, // insurance
  { id: '724aa3ce-a231-4118-9f4b-d20e1cfaad1b', notes: SPECIFIC_MERCHANT_NOTE }, // rent
  { id: '4b4819fc-cb2c-4e48-9980-4b755dcaac7f', notes: SPECIFIC_MERCHANT_NOTE }, // utilities
  // Signature
  { id: '57fe1022-32f4-4800-99ea-ad2a5d9bab6f', notes: SPECIFIC_MERCHANT_NOTE }, // education
  { id: 'b0029da5-991f-4850-9eaa-2b1d0a79aa66', notes: SPECIFIC_MERCHANT_NOTE }, // fuel
  { id: '2cba422a-1990-4346-9af4-fca83e6963d7', notes: SPECIFIC_MERCHANT_NOTE }, // government
  { id: '7c4169e4-d1bd-4d5a-af58-d2a548662cf7', notes: SPECIFIC_MERCHANT_NOTE }, // groceries
  { id: '4f6b6f00-35de-4eca-9418-63a0bde215a3', notes: SPECIFIC_MERCHANT_NOTE }, // insurance
  { id: '98b6d445-77c5-44cb-b9f3-5722f8d6c3ac', notes: SPECIFIC_MERCHANT_NOTE }, // rent
  { id: 'cc9086f5-5042-4c0b-a1cb-013258621451', notes: SPECIFIC_MERCHANT_NOTE }, // utilities

  // ── General domestic — strip miles/AED conversion notation, keep the cap
  { id: '699db6d0-c399-4995-b67b-fcd4e6c41c9e', notes: 'Cap 55,000 miles/month.' }, // Infinite
  { id: '3205ca1b-f9c4-4b00-a341-088021dfe834', notes: 'Cap 30,000 miles/month.' }, // Signature
  { id: '3657c81e-ba67-430f-bdbe-0c96ef8c87cb', notes: 'Cap 10,000 miles/month.' }, // Platinum

  // ── International — strip miles/AED notation, keep forex and Signature caveat
  { id: '3f418103-d754-417f-800d-3387d64c3ea6', notes: 'Forex markup ~2.49% applies.' }, // Infinite
  { id: 'e93b84bb-f7a8-47df-ba09-ed7f95f768bd', notes: 'Forex markup ~2.49% applies.' }, // Platinum
  { id: 'bd047fcc-acdf-44cb-9a9f-e4b08d52f39f', notes: 'Specific Merchant categories still earn the lower Specific Merchant rate even on international spend. Forex markup ~2.49% applies.' }, // Signature

  // ── Airlines — strip miles conversion notation and MCC codes
  { id: '39302087-6a3e-451f-95ef-5fe0c6e95dda', notes: 'Double miles on direct Etihad/EAP online bookings only. Non-Etihad airlines earn the Specific Merchant rate.' }, // Infinite
  { id: 'cb3ead67-b5ba-4cb9-8689-2fdd4c2f55e6', notes: 'Double miles on direct Etihad/EAP online bookings only. Non-Etihad airlines earn the Specific Merchant rate.' }, // Platinum
  { id: '8df99d34-7cb8-42ff-8dfe-13a4ecd464e8', notes: 'Double miles on direct Etihad/EAP online bookings only — not via travel agents or portals. Non-Etihad airlines earn the Specific Merchant rate.' }, // Signature

  // ── Travel — strip MCC codes and miles conversion; keep the car rental caveat
  { id: 'd12e5b96-25ed-482a-9df6-7e775376c3d6', notes: '⚠️ Car rental earns the Specific Merchant rate.' }, // Infinite
  { id: '41315b90-75fa-4aed-a05f-c2209dc3c708', notes: '⚠️ Car rental earns the Specific Merchant rate.' }, // Platinum
  { id: '7ca530ec-21e0-4fbd-9f5a-2811be0933bd', notes: '⚠️ Car rental earns the Specific Merchant rate.' }, // Signature

  // ── "Standard domestic rate" / "Not a Specific Merchant" rows → null (rate speaks for itself)
  { id: 'c1773064-4af8-47a0-8805-83ba1ed80999', notes: null }, // Platinum dining
  { id: 'c6632d25-8443-46b6-8313-741d9f3a0c5d', notes: null }, // Platinum online_shopping
  { id: 'c5dc609f-f91e-4585-a716-fb34b4b61b43', notes: null }, // Platinum shopping
  { id: '3171e1ab-7370-46b1-96a2-97703fc83a86', notes: null }, // Platinum hotels
  { id: '07eced89-71d7-46f2-bd08-d8d71d30388c', notes: null }, // Signature dining
  { id: '6f5211e4-58ca-4ab4-beed-8c38b620e2c3', notes: null }, // Signature entertainment
  { id: '01572a98-15fe-4c73-9dd1-995adf0e9ebf', notes: null }, // Signature healthcare
  { id: '01b7282c-a105-481a-85bd-147c940edb05', notes: null }, // Signature hotels
  { id: '56c3fa0b-6cd3-48bb-9492-c36282304499', notes: null }, // Signature online_shopping
  { id: 'ecf484ba-d236-44a0-b97f-b96b2f39c5c7', notes: null }, // Signature shopping

  // ── Welcome bonus (BAU joining miles) — strip internal "Default/BAU" and "Valued at AED 0.05/mile" language
  { id: '4a45c1d6-b87e-46b1-832e-ab45442360e3', notes: 'Supplementary cardholders each receive 5,000 miles.' }, // Infinite — has unique supplementary benefit
  { id: '7724c640-c465-428c-8033-df8ef07247c2', notes: null }, // Signature BAU — nothing user-facing to add
  { id: '14087c64-80e5-4bd8-b13c-222b887dde05', notes: null }, // Platinum BAU — nothing user-facing to add

  // ── Welcome bonus (campaign) — strip "TIME-LIMITED CAMPAIGN" preamble and "Valued at AED 0.05/mile"
  // Eligibility, spend target, and stacking mechanics are user-relevant.
  { id: '63707a3d-cc50-4495-b290-f1403f2cc161', notes: 'New-to-FAB-credit-card customers only. Apply 1 May–30 Jun 2026; activate within 15 days of issuance. Spend AED 100,000 in retail within 90 days. Stacks with 55,000 joining miles (up to 110,000 total).' }, // Infinite
  { id: 'b4e010ef-efaa-44c1-ae6a-2e560b2440e1', notes: 'New-to-FAB-credit-card customers only. Apply 1 May–30 Jun 2026; activate within 15 days of issuance. Spend AED 50,000 in retail within 90 days. Stacks with 35,000 joining miles (up to 70,000 total).' },   // Signature
  { id: 'c3912cd5-65b1-4539-800f-a9d3efff39bc', notes: 'New-to-FAB-credit-card customers only. Apply 1 May–30 Jun 2026; activate within 15 days of issuance. Spend AED 25,000 in retail within 90 days. Stacks with 10,000 joining miles (up to 20,000 total).' },   // Platinum
];

(async () => {
  let ok = 0, fail = 0;
  for (const { id, notes } of updates) {
    const { error } = await supabase.from('card_rewards').update({ notes }).eq('id', id);
    if (error) { console.error(`FAIL ${id}:`, error.message); fail++; }
    else ok++;
  }
  console.log(`Done: ${ok} updated, ${fail} failed.`);
})();

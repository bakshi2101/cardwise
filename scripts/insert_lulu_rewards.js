const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const LULU_P = '452af159-574a-442a-8d16-00d3602c4551';
const LULU_T = '0aa24804-b189-48dc-8624-0596e1a08072';
const SRC = 'https://www.emiratesnbd.com/en/cards/credit-cards/lulu-247-credit-card';
const TODAY = '2026-04-02';
const NS = 'Source: enbd_lulu_247_cc_rewards_program_tnc.pdf. 1 LuLu Point = 1 AED redeemable at LuLu outlets only (clause 3.1). Cap: Platinum 1,667 pts/month = AED 1,667/month combined. Points non-transferable; cannot be exchanged for cash.';

const C = {
  dining:       'b7938d64-7ff6-4f84-9b0d-c35010e5fa58',
  groceries:    '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:         'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  airlines:     'c418c3e6-9403-4ce6-8647-ed52782a59eb',
  shopping:     '5212cc11-77de-432c-8340-994f35e03d1b',
  hotels:       'f990d8af-9955-4b22-881c-4cf4de2cbe3e',
  travel:       '592dad17-981b-4af8-8095-596507f0b780',
  online:       '8e3f1bc5-f519-4f2a-82b9-cefa8ebfda86',
  entertain:    'dd8d714c-1e5a-4db5-91d4-fba3756ed77c',
  utilities:    '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:    '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  insurance:    'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  government:   'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  rent:         'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  healthcare:   'a9aad3fe-9afa-4c12-957f-153994b5e501',
  international:'98c97cac-1b7d-48dc-a661-476c7baeb9af',
  general:      '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f',
};

const PLAT_ROWS = [
  { category_id: C.dining, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on dining (full-service restaurants - Other Eligible Spend tier). QSR/fast-food earns only 0.175%. Dining at LuLu food courts may qualify for 7% LuLu in-store rate. ' + NS },
  { category_id: C.groceries, earn_rate: 0.175, effective_return_pct: 0.175,
    notes: '0.175% on grocery/supermarkets (excluding LuLu stores). Shopping at LuLu supermarkets earns 7% (LuLu in-store rate). ' + NS },
  { category_id: C.fuel, earn_rate: 4, effective_return_pct: 4,
    notes: '4% on fuel/petrol stations. Specific bonus tier per T&C reward table. Capped at 1,667 pts/month combined all categories. ' + NS },
  { category_id: C.airlines, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on airline ticket purchases (Other Eligible Spend tier). ' + NS },
  { category_id: C.shopping, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on general shopping (Other Eligible Spend tier). LuLu Hypermarket in-store purchases earn 7% (LuLu in-store rate). ' + NS },
  { category_id: C.hotels, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on hotel bookings (Other Eligible Spend tier). ' + NS },
  { category_id: C.travel, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on travel agencies and booking sites (Other Eligible Spend tier). ' + NS },
  { category_id: C.online, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on online shopping (Amazon.ae, Noon - Other Eligible Spend). LuLu webstore purchases earn 7% (LuLu in-store/webstore rate). ' + NS },
  { category_id: C.entertain, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on entertainment (cinema, theme parks - Other Eligible Spend tier). ' + NS },
  { category_id: C.utilities, earn_rate: 2, effective_return_pct: 2,
    notes: '2% on utility bills (DEWA, Etisalat, du, etc.). Specific bonus tier per T&C. Capped at 1,667 pts/month combined. ' + NS },
  { category_id: C.education, earn_rate: 0.07, effective_return_pct: 0.07,
    notes: '0.07% on education fees. Lowest earn tier alongside govt and real estate/rent. ' + NS },
  { category_id: C.insurance, earn_rate: 0.175, effective_return_pct: 0.175,
    notes: '0.175% on insurance premiums. Same reduced tier as grocery/car dealers/QSR/EU spend. ' + NS },
  { category_id: C.government, earn_rate: 0.07, effective_return_pct: 0.07,
    notes: '0.07% on government fees/fines/visa charges. Lowest earn tier. ' + NS },
  { category_id: C.rent, earn_rate: 0.07, effective_return_pct: 0.07,
    notes: '0.07% on rent/real estate payments. Lowest earn tier alongside education and govt. ' + NS },
  { category_id: C.healthcare, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on healthcare (hospitals, clinics, pharmacies - Other Eligible Spend tier). ' + NS },
  { category_id: C.international, earn_rate: 0.175, effective_return_pct: 0.175,
    notes: '0.175% on EU country spend (specific reduced rate per T&C table). Non-EU international spend treated as Other Eligible Spend at 0.7%. Forex fee 1.99% applies - net effective on EU: -1.815%. ' + NS },
  { category_id: C.general, earn_rate: 0.7, effective_return_pct: 0.7,
    notes: '0.7% on all other eligible domestic spend (Other Eligible Spend tier - default rate). Cap: 1,667 pts/month = AED 1,667/month combined all categories. ' + NS },
];

async function run() {
  let r;

  // INSERT all 17 rows for LuLu Platinum
  for (const row of PLAT_ROWS) {
    r = await sb.from('card_rewards').insert({
      card_id: LULU_P, reward_type: 'cashback', earn_unit: 'pct',
      monthly_cap_reward: 1667,
      source_url: SRC, last_verified_date: TODAY, is_active: true,
      ...row,
    });
    if (r.error) console.error('Platinum insert error', row.category_id, r.error.message);
  }
  console.log('Inserted 17 LuLu Platinum card_rewards rows');

  // INSERT all 17 rows for LuLu Titanium (exactly half of Platinum)
  for (const row of PLAT_ROWS) {
    const titaniumRate = parseFloat((row.earn_rate / 2).toFixed(4));
    r = await sb.from('card_rewards').insert({
      card_id: LULU_T, reward_type: 'cashback', earn_unit: 'pct',
      earn_rate: titaniumRate,
      effective_return_pct: titaniumRate,
      category_id: row.category_id,
      monthly_cap_reward: null,
      source_url: SRC, last_verified_date: TODAY, is_active: true,
      notes: row.notes + ' [Titanium earns exactly 50% of Platinum rate per T&C table.]',
    });
    if (r.error) console.error('Titanium insert error', row.category_id, r.error.message);
  }
  console.log('Inserted 17 LuLu Titanium card_rewards rows');
}

run();

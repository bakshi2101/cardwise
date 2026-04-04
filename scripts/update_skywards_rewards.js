const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

// Source: ENBD help page saved as PDF (tcpdfs/ENBD Skywards Miles _ Help and Support _ Emirates NBD.pdf)
// URL: https://www.emiratesnbd.com/en/help-and-support/earning-skywards-miles-on-your-credit-card
// Verified: 2026-04-02
// Conversion: 1 USD = AED 3.672 (confirmed in T&C clause 11)
// Skywards mile value: AED 0.07/mile
// effective_return_pct = earn_rate * 0.07 / 3.672

const SRC = 'https://www.emiratesnbd.com/en/help-and-support/earning-skywards-miles-on-your-credit-card';
const TODAY = '2026-04-02';

// Card IDs
const INF = '3d65db6f-0554-4b4c-8c45-8c3ed632c03d'; // Skywards Infinite
const SIG = 'c734bcbd-030c-4025-8f6c-5a9cc182856b'; // Skywards Signature

// Category IDs
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

// earn_rate in miles/USD; effective_return_pct = earn_rate * 0.07 / 3.672
// INF domestic=1, SIG domestic=0.75
// Reduced: groceries/QSR/insurance/car dealers = 25% domestic
// Low: fuel/transit/govt/utilities/rent/education/telecom = 10% domestic
// Bonus: Emirates+flydubai, online food delivery, duty free = 2 (INF) / 1.5 (SIG) miles/USD

const BASE_NOTE = 'Source: ENBD help page (emiratesnbd.com/en/help-and-support/earning-skywards-miles-on-your-credit-card), verified 2026-04-02. Miles earned per USD spent; 1 USD = AED 3.672. 1 Skywards mile = AED 0.07. Cap: AED 100,000 retail spend/billing cycle.';
const SIG_CAP_NOTE = 'Source: ENBD help page (emiratesnbd.com/en/help-and-support/earning-skywards-miles-on-your-credit-card), verified 2026-04-02. Miles earned per USD spent; 1 USD = AED 3.672. 1 Skywards mile = AED 0.07. Cap: AED 50,000 retail spend/billing cycle.';

// [category_id, inf_earn_rate, inf_eff, sig_earn_rate, sig_eff, notes_inf, notes_sig]
const UPDATES = [
  {
    cat: C.dining,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on full-service dining (standard domestic rate). Warning: QSR/fast-food restaurants earn 0.25 miles/USD (0.48%) per help page. ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on full-service dining (standard domestic rate). Warning: QSR/fast-food restaurants earn 0.1875 miles/USD (0.36%) per help page. ' + SIG_CAP_NOTE,
  },
  {
    cat: C.groceries,
    inf_rate: 0.25, inf_eff: 0.48,
    sig_rate: 0.1875, sig_eff: 0.36,
    inf_notes: '0.25 miles/USD on grocery/supermarkets (25% of domestic rate). Per help page: "Grocery, supermarkets, fast-food restaurants, insurance and car dealerships earn Miles at 25% of the domestic earning rate." ' + BASE_NOTE,
    sig_notes: '0.1875 miles/USD on grocery/supermarkets (25% of domestic 0.75 rate). Per help page: "Grocery, supermarkets, fast-food restaurants, insurance and car dealerships earn Miles at 25% of the domestic earning rate." ' + SIG_CAP_NOTE,
  },
  {
    cat: C.fuel,
    inf_rate: 0.1, inf_eff: 0.19,
    sig_rate: 0.075, sig_eff: 0.14,
    inf_notes: '0.10 miles/USD on fuel/petroleum (10% of domestic rate). Per help page: "Petroleum, transit, government services, utility payments, real estate, education and telecommunication payments earn Miles at 10% of the domestic spend earning rate." ' + BASE_NOTE,
    sig_notes: '0.075 miles/USD on fuel/petroleum (10% of domestic 0.75 rate). Per help page: "Petroleum, transit, government services, utility payments, real estate, education and telecommunication payments earn Miles at 10% of the domestic spend earning rate." ' + SIG_CAP_NOTE,
  },
  {
    cat: C.airlines,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on airline purchases (standard domestic rate for most airlines). Bonus: Emirates and flydubai earn 2 miles/USD (3.81%). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on airline purchases (standard domestic rate for most airlines). Bonus: Emirates and flydubai earn 1.5 miles/USD (2.86%). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.shopping,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on general shopping (standard domestic rate). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on general shopping (standard domestic rate). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.hotels,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on hotel bookings (standard domestic rate). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on hotel bookings (standard domestic rate). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.travel,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on travel agencies, booking sites, car rentals (standard domestic rate). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on travel agencies, booking sites, car rentals (standard domestic rate). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.online,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on general online shopping (Amazon.ae, Noon - standard domestic rate). Bonus: Online food delivery and car booking apps (Talabat, Careem) earn 2 miles/USD (3.81%). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on general online shopping (Amazon.ae, Noon - standard domestic rate). Bonus: Online food delivery and car booking apps (Talabat, Careem) earn 1.5 miles/USD (2.86%). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.entertain,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on entertainment (cinemas, theme parks - standard domestic rate). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on entertainment (cinemas, theme parks - standard domestic rate). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.utilities,
    inf_rate: 0.1, inf_eff: 0.19,
    sig_rate: 0.075, sig_eff: 0.14,
    inf_notes: '0.10 miles/USD on utility payments (DEWA, du, Etisalat - 10% of domestic rate). Note: utility bills paid via ENBD Online Banking/Banknet do NOT earn miles per T&C clause 2. ' + BASE_NOTE,
    sig_notes: '0.075 miles/USD on utility payments (DEWA, du, Etisalat - 10% of domestic 0.75 rate). Note: utility bills paid via ENBD Online Banking/Banknet do NOT earn miles per T&C clause 2. ' + SIG_CAP_NOTE,
  },
  {
    cat: C.education,
    inf_rate: 0.1, inf_eff: 0.19,
    sig_rate: 0.075, sig_eff: 0.14,
    inf_notes: '0.10 miles/USD on education fees (10% of domestic rate). ' + BASE_NOTE,
    sig_notes: '0.075 miles/USD on education fees (10% of domestic 0.75 rate). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.insurance,
    inf_rate: 0.25, inf_eff: 0.48,
    sig_rate: 0.1875, sig_eff: 0.36,
    inf_notes: '0.25 miles/USD on insurance premiums (25% of domestic rate). Per help page: same reduced tier as grocery/supermarkets/QSR/car dealers. ' + BASE_NOTE,
    sig_notes: '0.1875 miles/USD on insurance premiums (25% of domestic 0.75 rate). Per help page: same reduced tier as grocery/supermarkets/QSR/car dealers. ' + SIG_CAP_NOTE,
  },
  {
    cat: C.government,
    inf_rate: 0.1, inf_eff: 0.19,
    sig_rate: 0.075, sig_eff: 0.14,
    inf_notes: '0.10 miles/USD on government services/fees (10% of domestic rate). ' + BASE_NOTE,
    sig_notes: '0.075 miles/USD on government services/fees (10% of domestic 0.75 rate). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.rent,
    inf_rate: 0.1, inf_eff: 0.19,
    sig_rate: 0.075, sig_eff: 0.14,
    inf_notes: '0.10 miles/USD on real estate/rent payments (10% of domestic rate). Per help page: "real estate" explicitly listed in 10% tier. ' + BASE_NOTE,
    sig_notes: '0.075 miles/USD on real estate/rent payments (10% of domestic 0.75 rate). Per help page: "real estate" explicitly listed in 10% tier. ' + SIG_CAP_NOTE,
  },
  {
    cat: C.healthcare,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on healthcare (hospitals, clinics, pharmacies - standard domestic rate). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on healthcare (hospitals, clinics, pharmacies - standard domestic rate). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.international,
    inf_rate: 1.5, inf_eff: 2.86,
    sig_rate: 1.0, sig_eff: 1.91,
    inf_notes: '1.5 miles/USD on international spend (non-EU/UK). Warning: EU and UK spend earns only 0.75 miles/USD (1.43%) per help page. Forex markup 1.99% applies on foreign currency transactions (net effective for non-EU: 2.86% - 1.99% = 0.87%; net for EU: 1.43% - 1.99% = -0.56%). ' + BASE_NOTE,
    sig_notes: '1 mile/USD on international spend (non-EU/UK). Warning: EU and UK spend earns only 0.5 miles/USD (0.95%) per help page. Forex markup 1.99% applies (net effective for non-EU: 1.91% - 1.99% = -0.08%; net for EU: 0.95% - 1.99% = -1.04%). ' + SIG_CAP_NOTE,
  },
  {
    cat: C.general,
    inf_rate: 1.0, inf_eff: 1.91,
    sig_rate: 0.75, sig_eff: 1.43,
    inf_notes: '1 mile/USD on all other eligible domestic spend (standard domestic default rate). ' + BASE_NOTE,
    sig_notes: '0.75 miles/USD on all other eligible domestic spend (standard domestic default rate). ' + SIG_CAP_NOTE,
  },
];

async function run() {
  let errors = 0;

  // First, verify card IDs exist
  const { data: cards, error: ce } = await sb.from('cards').select('id, name').in('id', [INF, SIG]);
  if (ce) { console.error('Card lookup error:', ce.message); return; }
  console.log('Found cards:', cards.map(c => `${c.name} (${c.id})`).join(', '));

  for (const row of UPDATES) {
    // Update Infinite
    const r1 = await sb.from('card_rewards')
      .update({
        earn_rate: row.inf_rate,
        effective_return_pct: row.inf_eff,
        earn_unit: 'per_usd',
        reward_type: 'miles',
        source_url: SRC,
        last_verified_date: TODAY,
        is_active: true,
        notes: row.inf_notes,
      })
      .eq('card_id', INF)
      .eq('category_id', row.cat);
    if (r1.error) {
      console.error('INF update error', row.cat, r1.error.message);
      errors++;
    }

    // Update Signature
    const r2 = await sb.from('card_rewards')
      .update({
        earn_rate: row.sig_rate,
        effective_return_pct: row.sig_eff,
        earn_unit: 'per_usd',
        reward_type: 'miles',
        source_url: SRC,
        last_verified_date: TODAY,
        is_active: true,
        notes: row.sig_notes,
      })
      .eq('card_id', SIG)
      .eq('category_id', row.cat);
    if (r2.error) {
      console.error('SIG update error', row.cat, r2.error.message);
      errors++;
    }
  }

  console.log(`Done. ${UPDATES.length * 2} updates attempted, ${errors} errors.`);

  // Verify counts
  const { count: ic } = await sb.from('card_rewards').select('*', { count: 'exact', head: true }).eq('card_id', INF);
  const { count: sc } = await sb.from('card_rewards').select('*', { count: 'exact', head: true }).eq('card_id', SIG);
  console.log(`Infinite rows: ${ic}, Signature rows: ${sc}`);
}

run();

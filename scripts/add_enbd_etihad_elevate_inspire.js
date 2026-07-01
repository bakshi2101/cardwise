// Insert ENBD Etihad Guest Visa Elevate + Visa Inspire Credit Cards
//
// Sources:
//   - ENBD-etihad_t_and_c_booklet.pdf (earn rates, exclusions, tier benefits, mile discount vouchers)
//   - ENBD-Key Facts_credit_cards_horizontal_em_new.pdf (KFS 03/2026 — annual fees, APR)
//   - emiratesnbd_credit_card_fees_charges.pdf (Feb 2026 — annual fees, interest rates, forex 1.99%)
//
// Earn rate table (TNC page 6, miles per AED 10):
//   | Category                        | Elevate | Inspire |
//   | Etihad Airways/Hotels/Dining/EY.com | 10   |   7   |
//   | International (non-EU) & domestic  |  6   |   4   |
//   | EU/UK retail                        |  3   |   2   |
//   | Cat1: Grocery/QSR/Insurance/CarDealer| 1.5 |  1.5  |
//   | Cat2: Petroleum/Transit/Govt/Util/  |  0.6 |  0.4  |
//   |       RealEstate/Education/Telecom  |       |       |
//   | Tier Miles (all spends, capped)     | 2.5 (cap 50k/yr) | 2.5 (cap 20k/yr) |
//
// Key notes:
//   - Utility payments via ENBD online banking EXCLUDED from miles earning (TNC clause 2.4 viii)
//   - Elevate billing cycle spend cap: AED 100,000 (miles capped; Express Miles exempt)
//   - Inspire billing cycle spend cap: AED 50,000
//   - Elevate Express Miles: optional AED 250/month; 50% more miles; max 4,000 bonus miles/month
//   - Elevate: 50% Etihad miles discount voucher at AED 150k spend (2/year, every 6 months)
//   - Inspire: 25% Etihad miles discount voucher at AED 100k spend (2/year, every 6 months)
//   - Fast track: Elevate → Etihad Gold (1 return Etihad flight within 6 months of card issuance)
//   - Fast track: Inspire → Etihad Silver (same condition)
//   - Tier Miles (2.5/AED 10) have no redemption monetary value; not included in effective_return_pct
//   - Etihad Guest mile value: AED 0.05/mile (consistent with FAB Etihad Guest cards in DB)
//   - Forex: 1.99% ENBD markup + ~1.15% Visa network fee (total ~3.14% for user)
//   - Interest: Elevate 3.25%/month (39% p.a.), Inspire 3.69%/month (44.28% p.a.)
//   - Annual fee: Elevate AED 1,575 renewal (AED 2,625 joining); Inspire AED 735 renewal (AED 1,575 joining)
//   - ⚠️ Benefits (lounge, travel insurance, purchase protection) NOT in provided docs — gap flagged

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const MILE_VAL     = 0.05; // AED per Etihad Guest Mile (consistent with FAB Etihad cards)
const TODAY        = '2026-06-13';
const SRC_ELV      = 'https://www.emiratesnbd.com/en/cards/credit-cards/etihad-guest-visa-elevate';
const SRC_INS      = 'https://www.emiratesnbd.com/en/cards/credit-cards/etihad-guest-visa-inspire';
const SRC_TNC      = 'ENBD-etihad_t_and_c_booklet.pdf';

// Category IDs
const CAT = {
  dining:        'b7938d64-7ff6-4f84-9b0d-c35010e5fa58',
  groceries:     '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:          'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  airlines:      'c418c3e6-9403-4ce6-8647-ed52782a59eb',
  shopping:      '5212cc11-77de-432c-8340-994f35e03d1b',
  hotels:        'f990d8af-9955-4b22-881c-4cf4de2cbe3e',
  travel:        '592dad17-981b-4af8-8095-596507f0b780',
  online:        '8e3f1bc5-f519-4f2a-82b9-cefa8ebfda86',
  entertainment: 'dd8d714c-1e5a-4db5-91d4-fba3756ed77c',
  utilities:     '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:     '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  insurance:     'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  government:    'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  rent:          'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  healthcare:    'a9aad3fe-9afa-4c12-957f-153994b5e501',
  international: '98c97cac-1b7d-48dc-a661-476c7baeb9af',
  general:       '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f',
};

function eff(milesPerAed) { return parseFloat((milesPerAed * MILE_VAL * 100).toFixed(4)); }

// Elevate earn rates (miles per AED, normalized from TNC "X per AED 10")
const ELEVATE_REWARDS = [
  { cat: CAT.dining,        rate: 1.0,  notes: '1.0 Etihad Guest Mile/AED on dining (incl. UAE restaurant MCCs and dining broadly). Part of "Etihad Airways/Hotels/Dining & EY.com" bonus tier = 10 miles per AED 10. Source: TNC table p.6. 1 Etihad mile = AED 0.05.' },
  { cat: CAT.hotels,        rate: 1.0,  notes: '1.0 Etihad Guest Mile/AED on hotels. Part of "Etihad Airways/Hotels/Dining & EY.com" bonus tier = 10 miles per AED 10. Source: TNC p.6.' },
  { cat: CAT.airlines,      rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on airline tickets (general domestic/international rate = 6 per AED 10). 🎁 Brand bonus: Etihad Airways (and EY.com) earns 1.0 miles/AED = 5.0% (10 per AED 10 top-tier). Source: TNC p.6.' },
  { cat: CAT.shopping,      rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on shopping (general domestic rate = 6 per AED 10). Source: TNC p.6.' },
  { cat: CAT.travel,        rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on other travel (travel agencies, car rental — general domestic rate = 6 per AED 10). 🎁 EY.com bookings earn 1.0/AED. Source: TNC p.6.' },
  { cat: CAT.online,        rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on online shopping (general domestic rate = 6 per AED 10). Source: TNC p.6.' },
  { cat: CAT.entertainment, rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on entertainment (general domestic rate = 6 per AED 10). Source: TNC p.6.' },
  { cat: CAT.healthcare,    rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on healthcare (general domestic rate — not in Cat 1 or Cat 2 restricted tiers). Source: TNC p.6.' },
  { cat: CAT.international, rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on international spend (non-EU = 6 per AED 10). ⚠️ EU/UK earns only 0.3 miles/AED (3 per AED 10). Forex: 1.99% ENBD markup + ~1.15% Visa fee. Source: TNC p.6, KFS p.3.' },
  { cat: CAT.general,       rate: 0.6,  notes: '0.6 Etihad Guest Miles/AED on all other domestic spend (general rate = 6 per AED 10). Source: TNC p.6.' },
  { cat: CAT.groceries,     rate: 0.15, notes: '0.15 Etihad Guest Miles/AED on grocery/supermarkets (Cat 1 = 1.5 per AED 10). Cat 1 also includes: QSR/fast food, insurance, car dealerships. Source: TNC p.6.' },
  { cat: CAT.insurance,     rate: 0.15, notes: '0.15 Etihad Guest Miles/AED on insurance (Cat 1 = 1.5 per AED 10). Cat 1 also includes: grocery, QSR, car dealerships. Source: TNC p.6.' },
  { cat: CAT.fuel,          rate: 0.06, notes: '0.06 Etihad Guest Miles/AED on fuel/petroleum (Cat 2 = 0.6 per AED 10 restricted tier). Cat 2 includes: petroleum, transit, govt, utilities, real estate, education, telecom. Source: TNC p.6.' },
  { cat: CAT.utilities,     rate: 0.06, notes: '0.06 Etihad Guest Miles/AED on utilities (Cat 2 = 0.6 per AED 10). ⚠️ CRITICAL EXCLUSION: utility payments made via ENBD online banking/mobile/other ENBD payment channels earn ZERO miles (TNC clause 2.4 viii). Only utility payments direct to merchant earn 0.06/AED. Source: TNC p.7.' },
  { cat: CAT.education,     rate: 0.06, notes: '0.06 Etihad Guest Miles/AED on education (Cat 2 = 0.6 per AED 10). Source: TNC p.6.' },
  { cat: CAT.government,    rate: 0.06, notes: '0.06 Etihad Guest Miles/AED on government services (Cat 2 = 0.6 per AED 10). Source: TNC p.6.' },
  { cat: CAT.rent,          rate: 0.06, notes: '0.06 Etihad Guest Miles/AED on real estate/rent (Cat 2 = 0.6 per AED 10). Source: TNC p.6.' },
];

// Inspire earn rates
const INSPIRE_REWARDS = [
  { cat: CAT.dining,        rate: 0.7,  notes: '0.7 Etihad Guest Miles/AED on dining (bonus tier = 7 per AED 10: Etihad Airways/Hotels/Dining/EY.com). Source: TNC p.6.' },
  { cat: CAT.hotels,        rate: 0.7,  notes: '0.7 Etihad Guest Miles/AED on hotels (bonus tier = 7 per AED 10). Source: TNC p.6.' },
  { cat: CAT.airlines,      rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on airline tickets (general domestic/international rate = 4 per AED 10). 🎁 Brand bonus: Etihad Airways/EY.com earns 0.7/AED = 3.5% (7 per AED 10). Source: TNC p.6.' },
  { cat: CAT.shopping,      rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on shopping (general domestic rate = 4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.travel,        rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on other travel (general domestic/international rate = 4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.online,        rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on online shopping (general rate = 4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.entertainment, rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on entertainment (general rate = 4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.healthcare,    rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on healthcare (general rate — not Cat 1 or Cat 2). Source: TNC p.6.' },
  { cat: CAT.international, rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on international spend non-EU (4 per AED 10). ⚠️ EU/UK earns 0.2/AED (2 per AED 10). Forex: 1.99% ENBD markup + ~1.15% Visa. Source: TNC p.6.' },
  { cat: CAT.general,       rate: 0.4,  notes: '0.4 Etihad Guest Miles/AED on all other domestic spend (general rate = 4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.groceries,     rate: 0.15, notes: '0.15 Etihad Guest Miles/AED on groceries/supermarkets (Cat 1 = 1.5 per AED 10 — same across all 3 Etihad cards). Source: TNC p.6.' },
  { cat: CAT.insurance,     rate: 0.15, notes: '0.15 Etihad Guest Miles/AED on insurance (Cat 1 = 1.5 per AED 10). Source: TNC p.6.' },
  { cat: CAT.fuel,          rate: 0.04, notes: '0.04 Etihad Guest Miles/AED on fuel/petroleum (Cat 2 = 0.4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.utilities,     rate: 0.04, notes: '0.04 Etihad Guest Miles/AED on utilities (Cat 2 = 0.4 per AED 10). ⚠️ CRITICAL EXCLUSION: utility payments via ENBD online banking earn ZERO miles (TNC clause 2.4 viii). Source: TNC p.7.' },
  { cat: CAT.education,     rate: 0.04, notes: '0.04 Etihad Guest Miles/AED on education (Cat 2 = 0.4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.government,    rate: 0.04, notes: '0.04 Etihad Guest Miles/AED on government services (Cat 2 = 0.4 per AED 10). Source: TNC p.6.' },
  { cat: CAT.rent,          rate: 0.04, notes: '0.04 Etihad Guest Miles/AED on real estate/rent (Cat 2 = 0.4 per AED 10). Source: TNC p.6.' },
];

async function run() {
  // === INSERT ELEVATE ===
  console.log('=== Inserting Etihad Guest Visa Elevate ===');
  const elv = await sb.from('cards').insert({
    bank_id: ENBD_BANK_ID,
    name: 'ENBD Etihad Guest Visa Elevate Credit Card',
    card_network: 'visa',
    card_tier: 'infinite',
    annual_fee_aed: 1575,
    reward_currency_name: 'Etihad Guest Miles',
    reward_currency_value_aed: MILE_VAL,
    base_earn_rate: 0.6,
    base_earn_unit: 'per_aed',
    forex_markup_pct: 1.99,
    interest_rate_monthly_pct: 3.25,
    lounge_access_count: null,
    lounge_access_network: null,
    travel_insurance: null,
    purchase_protection: null,
    concierge: null,
    source_url: SRC_ELV,
    summary: 'VERIFIED 2026-06-13. Etihad co-branded Visa. 1.0 mile/AED on dining/hotels (5.0%); 0.6 miles/AED general domestic/intl (3.0%); 0.15 miles/AED groceries/insurance (0.75%); 0.06 miles/AED restricted Cat2 (0.3%). Etihad Airways earns bonus 1.0/AED. AED 1,575 renewal fee (AED 2,625 joining). Express Miles opt-in at AED 250/month. ⚠️ Benefits (lounge etc.) gap — not in provided docs.',
    is_active: true,
  }).select('id').single();

  if (elv.error) { console.error('Elevate INSERT error:', elv.error.message); return; }
  const ELV_ID = elv.data.id;
  console.log('Elevate inserted, ID:', ELV_ID);

  // Insert Elevate card_rewards
  let ok = 0, err = 0;
  for (const r of ELEVATE_REWARDS) {
    const res = await sb.from('card_rewards').insert({
      card_id: ELV_ID,
      category_id: r.cat,
      reward_type: 'miles',
      earn_rate: r.rate,
      earn_unit: 'per_aed',
      effective_return_pct: eff(r.rate),
      notes: r.notes,
      source_url: SRC_ELV,
      last_verified_date: TODAY,
      is_active: true,
    });
    if (res.error) { err++; console.log('  ERR ' + r.cat + ': ' + res.error.message); }
    else { ok++; }
  }
  console.log(`Elevate card_rewards: ${ok} OK, ${err} errors`);

  // Insert Elevate card_benefits (mile discount voucher + Express Miles noted)
  const elvBenefits = [
    {
      benefit_type: 'miles_discount_voucher',
      title: '50% Etihad miles discount voucher',
      description: 'Upon reaching AED 150,000 eligible spend on the Elevate card, receive a voucher for 50% discount on Etihad Guest Miles required for any Etihad flight. Maximum 2 vouchers per year, issued every 6 months from card issuance date. Sent to registered email within 4 weeks of meeting condition. Source: ENBD-etihad_t_and_c_booklet.pdf.',
      conditions: 'Min AED 150,000 eligible spend per 6-month period. Max 2 vouchers/year.',
      usage_limit: 2,
      usage_period: 'yearly',
      is_active: true,
    },
    {
      benefit_type: 'tier_status',
      title: 'Fast track to Etihad Guest Gold Tier',
      description: 'Complete 1 return flight (non-redemption) on Etihad Airways within 6 months of card issuance for fast track to Etihad Guest Gold status. Existing Gold members get Gold extended; Platinum members unaffected. Source: ENBD-etihad_t_and_c_booklet.pdf.',
      conditions: '1 return Etihad flight (non-redemption) within 6 months of card issuance.',
      usage_limit: 1,
      usage_period: 'yearly',
      is_active: true,
    },
    {
      benefit_type: 'points_bonus',
      title: 'Express Miles Programme (optional add-on, AED 250/month)',
      description: 'Optional enrolment: earn 50% more Etihad Guest Miles on all regular miles each statement cycle. Maximum 4,000 additional miles per month. Fee: AED 250/month. Can be enrolled/cancelled at any time (Express Miles won\'t accrue if cancelled before billing date). Source: ENBD-etihad_t_and_c_booklet.pdf clause 7.',
      conditions: 'AED 250/month fee required. Not available to delinquent accounts.',
      usage_limit: null,
      usage_period: 'monthly',
      is_active: true,
    },
  ];

  let bok = 0, berr = 0;
  for (const b of elvBenefits) {
    const res = await sb.from('card_benefits').insert({ card_id: ELV_ID, ...b });
    if (res.error) { berr++; console.log('  benefit ERR:', res.error.message); } else { bok++; }
  }
  console.log(`Elevate card_benefits: ${bok} OK, ${berr} errors`);

  // === INSERT INSPIRE ===
  console.log('\n=== Inserting Etihad Guest Visa Inspire ===');
  const ins = await sb.from('cards').insert({
    bank_id: ENBD_BANK_ID,
    name: 'ENBD Etihad Guest Visa Inspire Credit Card',
    card_network: 'visa',
    card_tier: 'signature',
    annual_fee_aed: 735,
    reward_currency_name: 'Etihad Guest Miles',
    reward_currency_value_aed: MILE_VAL,
    base_earn_rate: 0.4,
    base_earn_unit: 'per_aed',
    forex_markup_pct: 1.99,
    interest_rate_monthly_pct: 3.69,
    lounge_access_count: null,
    lounge_access_network: null,
    travel_insurance: null,
    purchase_protection: null,
    concierge: null,
    source_url: SRC_INS,
    summary: 'VERIFIED 2026-06-13. Etihad co-branded Visa. 0.7 miles/AED on dining/hotels (3.5%); 0.4 miles/AED general domestic/intl (2.0%); 0.15 miles/AED groceries/insurance (0.75%); 0.04 miles/AED restricted Cat2 (0.2%). Etihad Airways earns bonus 0.7/AED. AED 735 renewal (AED 1,575 joining). ⚠️ Benefits (lounge etc.) gap.',
    is_active: true,
  }).select('id').single();

  if (ins.error) { console.error('Inspire INSERT error:', ins.error.message); return; }
  const INS_ID = ins.data.id;
  console.log('Inspire inserted, ID:', INS_ID);

  let iok = 0, ierr = 0;
  for (const r of INSPIRE_REWARDS) {
    const res = await sb.from('card_rewards').insert({
      card_id: INS_ID,
      category_id: r.cat,
      reward_type: 'miles',
      earn_rate: r.rate,
      earn_unit: 'per_aed',
      effective_return_pct: eff(r.rate),
      notes: r.notes,
      source_url: SRC_INS,
      last_verified_date: TODAY,
      is_active: true,
    });
    if (res.error) { ierr++; console.log('  ERR ' + r.cat + ': ' + res.error.message); }
    else { iok++; }
  }
  console.log(`Inspire card_rewards: ${iok} OK, ${ierr} errors`);

  const insBenefits = [
    {
      benefit_type: 'miles_discount_voucher',
      title: '25% Etihad miles discount voucher',
      description: 'Upon reaching AED 100,000 eligible spend on the Inspire card, receive a voucher for 25% discount on Etihad Guest Miles required for any Etihad flight. Maximum 2 vouchers per year, issued every 6 months. Sent within 4 weeks of meeting condition. Source: ENBD-etihad_t_and_c_booklet.pdf.',
      conditions: 'Min AED 100,000 eligible spend per 6-month period. Max 2 vouchers/year.',
      usage_limit: 2,
      usage_period: 'yearly',
      is_active: true,
    },
    {
      benefit_type: 'tier_status',
      title: 'Fast track to Etihad Guest Silver Tier',
      description: 'Complete 1 return flight (non-redemption) on Etihad Airways within 6 months of card issuance for fast track to Etihad Guest Silver status. Existing Silver members get Silver extended; Gold/Platinum members unaffected. Source: ENBD-etihad_t_and_c_booklet.pdf.',
      conditions: '1 return Etihad flight (non-redemption) within 6 months of card issuance.',
      usage_limit: 1,
      usage_period: 'yearly',
      is_active: true,
    },
  ];

  let ibok = 0, iberr = 0;
  for (const b of insBenefits) {
    const res = await sb.from('card_benefits').insert({ card_id: INS_ID, ...b });
    if (res.error) { iberr++; console.log('  benefit ERR:', res.error.message); } else { ibok++; }
  }
  console.log(`Inspire card_benefits: ${ibok} OK, ${iberr} errors`);

  // Final state verification
  console.log('\n=== FINAL STATE ===');
  console.log('Elevate ID:', ELV_ID);
  console.log('Inspire ID:', INS_ID);
  const { data: cats } = await sb.from('spending_categories').select('id,slug');
  const catMap = {}; cats.forEach(c => catMap[c.id] = c.slug);
  for (const [label, id] of [['Elevate', ELV_ID], ['Inspire', INS_ID]]) {
    const { data } = await sb.from('card_rewards').select('category_id,earn_rate,effective_return_pct').eq('card_id', id);
    data.sort((a, b) => b.effective_return_pct - a.effective_return_pct);
    console.log(`\n${label} rewards:`);
    data.forEach(r => console.log(`  ${catMap[r.category_id].padEnd(15)} ${r.earn_rate}/AED = ${r.effective_return_pct}%`));
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });

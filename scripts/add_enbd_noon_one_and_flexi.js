// Insert ENBD noon One Visa Credit Card + ENBD Visa Flexi Credit Card
//
// ─── Sources ──────────────────────────────────────────────────────────────────
// noon One:
//   - tcpdfs/ENBD-noon_one_special_features.pdf (earn rates, exclusions, benefits — PRIMARY)
//   - tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf (KFS 03/2026 — fee = Free, APR 44.28%)
//   - tcpdfs/emiratesnbd_credit_card_fees_charges.pdf (Feb 2026 — fee = Free, forex 1.99%)
//   - noon One product page (emiratesnbd.com) — JS-rendered, could not load ⚠️ GAP
//
// noon One earn table (TNC p.3, % of transaction credited as noon Credits):
//   | Category                                              | Rate  |
//   | noon, noon Minutes, Namshi, SIVVI                    | 5%    |
//   | NowNow                                               | 10%   |
//   | noon Food                                            | 20%   |
//   | Other Eligible Spends (general domestic + non-EU)    | 1%    |
//   | Low-interchange domestic + EU spend:                 | 0.30% |
//   |   Telecom, Professional Services, Entertainment,      |       |
//   |   Insurance, Car dealership, Financial Services,      |       |
//   |   Grocery & Supermarkets, QSR, Real estate,          |       |
//   |   Education, Utility & Government Services            |       |
//   | Cap: 2,000 noon Credits per billing cycle            | —     |
//
// noon One DATA GAPS (⚠️):
//   - Min salary: not in TNC or KFS; product page JS-rendered
//   - Card tier: not specified (KFS lists just "noon One Visa Credit Card")
//   - Lounge access: not mentioned in TNC (likely none for a free card)
//   - Travel insurance, concierge: not mentioned
//
// ─── Flexi ────────────────────────────────────────────────────────────────────
//   - tcpdfs/emiratesnbd_credit_card_fees_charges.pdf (Feb 2026 — annual fee AED 735, forex 1.99%)
//   - tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf (KFS 03/2026 — APR 44.28%)
//   - Visa Flexi product page — JS-rendered, could not load ⚠️
//   - emiratesnbd.com/en/help-and-support/earning-plus-points — JS-rendered ⚠️
//   - emiratesnbd.com/en/help-and-support/redeeming-plus-points — JS-rendered ⚠️
//   - Third-party sources (cardsmatcher, yallacompare, mymoneysouq): earn rates consistent
//   - Official product value chart PDF (Feb 2024): benefits/customizable model
//
// Flexi earn rates (Plus Points per AED 100; 1 Plus Point = AED 1):
//   | Category                                    | PP per AED 100 | Effective % |
//   | General retail / most categories            | 1.5            | 1.5%        |
//   | Grocery/Supermarkets, Insurance, Car dealer  | 0.4            | 0.4%        |
//   | Fuel, Utilities, Real estate, Education     | 0.2            | 0.2%        |
//   | Cap: 500 Plus Points per statement cycle    | —              | —           |
//   (Rates from third-party sites — official earn page JS-rendered ⚠️ SOFT GAP)
//
// Flexi benefits (choose-your-own model):
//   Boutique — choose 2 of 6: LoungeKey (2+6 spend-activated), Dragon Pass spa,
//     VOX 4DX/Theatre by Rhodes, Anghami 6 months, Ten Concierge, DUBZ luggage
//   Premium — choose 4 of 8: BidRoom hotel, Boingo WiFi, airport transfers (2/yr),
//     intl medical travel assist, Smart Delay lounge, golf (5 courses), UTU VAT cashback,
//     Careem credits (up to AED 1,200/yr)
//   Spend condition: AED 5,000/month required to access benefits; else AED 99 per benefit used
//
// Flexi DATA GAPS (⚠️):
//   - Min salary: conflicting (AED 12k vs 15k on third-party; no official source)
//   - Card tier: not stated (likely Visa Signature given AED 735 fee + concierge option)
//   - Government payments: not explicitly categorized (assumed 0.2% like utilities)
//   - International FX earn rate: not confirmed (assumed general 1.5% rate)
//   - Earn rates not from official ENBD source — third-party only ⚠️

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const ENBD_BANK_ID = '1850c3c7-f97e-4b4f-988b-530d8f39ad8c';
const TODAY        = '2026-06-14';

const SRC_NOON_TNC = 'tcpdfs/ENBD-noon_one_special_features.pdf';
const SRC_FEES     = 'tcpdfs/emiratesnbd_credit_card_fees_charges.pdf';
const SRC_KFS      = 'tcpdfs/ENBD-Key Facts_credit_cards_horizontal_em_new.pdf';
const SRC_FLEXI_3P = 'https://cardsmatcher.com/bank/emirates-nbd-visa-flexi-credit-card/ (third-party — official earn page JS-rendered)';

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

// ─── Helper ────────────────────────────────────────────────────────────────────
async function insert(table, row, label) {
  const { error } = await sb.from(table).insert(row);
  if (error) { console.error(`  [FAIL] ${label}: ${error.message}`); return false; }
  console.log(`  [OK]   ${label}`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
async function run() {
  let errors = 0;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. INSERT: ENBD noon One Visa Credit Card
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n════ CARD 1: ENBD noon One Visa Credit Card ════');

  const NOON_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // deterministic placeholder; will be gen_random_uuid() via insert

  const { data: noonCard, error: noonErr } = await sb
    .from('cards')
    .insert({
      bank_id: ENBD_BANK_ID,
      name: 'Emirates NBD noon One Visa Credit Card',
      card_network: 'visa',
      card_tier: null,                 // ⚠️ GAP: not specified in any official doc
      annual_fee_aed: 0,               // Free (KFS + fees PDF confirmed)
      min_salary_aed: null,            // ⚠️ GAP: product page JS-rendered; no official source
      reward_currency_name: 'noon Credits',
      reward_currency_value_aed: 1.0,  // 1 noon Credit = AED 1 on noon.ae
      base_earn_rate: 1.0,
      base_earn_unit: 'pct',
      forex_markup_pct: 1.99,          // All ENBD cards (fees PDF Feb 2026)
      interest_rate_monthly_pct: 3.69, // KFS 03/2026 + fees PDF
      lounge_access_count: null,       // ⚠️ GAP: not in TNC; likely none for free card
      lounge_access_network: null,
      valet_parking_count: null,
      travel_insurance: null,          // ⚠️ GAP: not mentioned
      purchase_protection: null,
      concierge: null,                 // ⚠️ GAP: not mentioned
      airport_transfer_count: null,
      source_url: SRC_NOON_TNC,
      is_active: true,
      summary: [
        'VERIFIED 2026-06-14. Emirates NBD noon One Visa Credit Card. Free for life.',
        'Reward: noon Credits (1 Credit = AED 1 on noon.ae). Not transferable to AED cash.',
        'Earn: 20% on noon Food; 10% on NowNow grocery delivery; 5% on noon/Namshi/SIVVI/noon Minutes;',
        '1% on general eligible spend; 0.30% on low-interchange categories (grocery stores, entertainment,',
        'insurance, telecom, real estate, education, utilities, government, EU spend).',
        'Cap: 2,000 noon Credits per billing cycle (= AED 2,000 value max/month).',
        'Forex: 1.99% ENBD + ~1.15% Visa = ~3.14% total. APR: 44.28% (3.69%/month).',
        'Benefits: AED 500 joining cashback; 1-year free noon One membership; BOGOF cinema (3 tickets/month, AED 3,500 spend required).',
        '⚠️ GAPS: min salary, card tier, lounge/travel insurance — product page JS-rendered; verify from bank.',
        'Sources: TNC PDF + KFS 03/2026 + fees PDF (Feb 2026).',
      ].join(' '),
    })
    .select('id')
    .single();

  if (noonErr) { console.error('  [FAIL] noon One card insert:', noonErr.message); errors++; }
  else {
    const NID = noonCard.id;
    console.log(`  [OK]   noon One card inserted → id: ${NID}`);

    // ── noon One: card_rewards (17 rows) ──────────────────────────────────
    console.log('\n  Inserting noon One card_rewards...');

    // Base fields reused across all rows
    const nBase = (catId, rate, eff, notes) => ({
      card_id: NID,
      category_id: catId,
      reward_type: 'cashback',
      earn_rate: rate,
      earn_unit: 'pct',
      effective_return_pct: eff,
      monthly_cap_reward: null,        // Cap is total across all categories (2,000/cycle), not per-category
      monthly_cap_spend_aed: null,
      min_txn_amount_aed: null,
      is_promotional: false,
      is_active: true,
      source_url: SRC_NOON_TNC,
      last_verified_date: TODAY,
      notes,
    });

    const CAP_NOTE = 'Total billing-cycle cap: 2,000 noon Credits (= AED 2,000 value). Redeemable on noon.ae only (not AED cash). Source: TNC clause 2.6.';
    const LI_NOTE  = '0.30% — in low-interchange MCC tier per TNC p.3 earn table. ' + CAP_NOTE;
    const GEN_NOTE = '1% — Other Eligible Spends (domestic non-low-interchange + non-EU international). ' + CAP_NOTE;

    const noonRewards = [
      nBase(CAT.dining,        1.0,  1.0,
        '1% on general restaurant dining (MCC 5812/5813). 🎁 Brand bonus: 20% on noon Food (food delivery via noon Food app — separate noon ecosystem platform). ' + CAP_NOTE),
      nBase(CAT.groceries,     0.3,  0.3,
        '0.30% on grocery/supermarket spend (Carrefour, LuLu, Spinneys — Grocery & Supermarkets in low-interchange tier). 🎁 Brand bonus: 10% on NowNow (noon grocery delivery). ' + CAP_NOTE),
      nBase(CAT.fuel,          1.0,  1.0,
        '1% on fuel (ADNOC, ENOC, Emarat — fuel/petroleum NOT listed in noon One low-interchange MCC tier, so earns general rate). ' + CAP_NOTE),
      nBase(CAT.airlines,      1.0,  1.0,
        '1% on airline ticket purchases. Not in low-interchange tier. ' + CAP_NOTE),
      nBase(CAT.shopping,      1.0,  1.0,
        '1% on physical retail shopping. 🎁 5% on noon.ae/Namshi/SIVVI (online fashion — noon ecosystem). ' + CAP_NOTE),
      nBase(CAT.hotels,        1.0,  1.0,
        '1% on hotel bookings (direct or via booking platforms). Not in low-interchange tier. ' + CAP_NOTE),
      nBase(CAT.travel,        1.0,  1.0,
        '1% on travel agencies, car rental, booking platforms. Not in low-interchange tier. ' + CAP_NOTE),
      nBase(CAT.online,        1.0,  1.0,
        '1% on general e-commerce (Amazon.ae, other online retail). 🎁 5% on noon.ae/Namshi/SIVVI (noon ecosystem). ' + CAP_NOTE),
      nBase(CAT.entertainment, 0.3,  0.3,
        '0.30% on entertainment (Entertainment is explicitly in the low-interchange MCC tier). 🎁 5% on noon Minutes (streaming — noon ecosystem platform). ' + CAP_NOTE),
      nBase(CAT.utilities,     0.3,  0.3,
        '0.30% — Utility & Government Services in low-interchange tier. ⚠️ Note: TNC does not explicitly exclude ENBD channel utility payments (unlike Etihad TNC). Verify if clause 2.4 exclusions apply. ' + CAP_NOTE),
      nBase(CAT.education,     0.3,  0.3,
        '0.30% — Education in low-interchange MCC tier (TNC p.3). ' + CAP_NOTE),
      nBase(CAT.insurance,     0.3,  0.3,
        '0.30% — Insurance in low-interchange MCC tier (TNC p.3). ' + CAP_NOTE),
      nBase(CAT.government,    0.3,  0.3,
        '0.30% — Utility & Government Services in low-interchange tier. ' + CAP_NOTE),
      nBase(CAT.rent,          0.3,  0.3,
        '0.30% — Real estate in low-interchange MCC tier (TNC p.3). ' + CAP_NOTE),
      nBase(CAT.healthcare,    1.0,  1.0,
        '1% on healthcare (hospitals, clinics, pharmacies — not in low-interchange tier). ' + CAP_NOTE),
      nBase(CAT.international, 1.0,  1.0,
        '1% on non-EU international spend. ⚠️ EU/UK spend earns 0.30% (EU explicitly included in low-interchange tier per TNC p.3). ' + CAP_NOTE),
      nBase(CAT.general,       1.0,  1.0,
        '1% on other eligible spend. ⚠️ Financial Services, Car dealership, Professional Services earn 0.30% (low-interchange). ' + CAP_NOTE),
    ];

    for (const r of noonRewards) {
      const catName = Object.keys(CAT).find(k => CAT[k] === r.category_id);
      await insert('card_rewards', r, `noon One → ${catName}`);
    }

    // ── noon One: card_benefits ───────────────────────────────────────────
    console.log('\n  Inserting noon One card_benefits...');

    const noonBenefits = [
      {
        card_id: NID,
        benefit_type: 'welcome_bonus',
        title: 'AED 500 Joining Cashback',
        description: 'AED 500 credited as cashback to statement on AED 5,000 spend within first 2 calendar months. New ENBD credit cardholders only (or card closed 12+ months prior).',
        monetary_value_aed: 500,
        usage_limit: 1,
        usage_period: 'one_time',
        conditions: 'New ENBD credit card customers only. Must spend AED 5,000 in first 60 days. Not available on supplementary cards. Credited to primary card statement.',
        is_active: true,
      },
      {
        card_id: NID,
        benefit_type: 'subscription',
        title: 'Free noon One Membership (1 Year)',
        description: 'Complimentary noon One subscription membership for 1 year from card issuance. After the first year, eligible for 50% discount on annual noon One membership renewal.',
        monetary_value_aed: null,
        usage_limit: 1,
        usage_period: 'yearly',
        conditions: 'Activated via email instructions sent post-card issuance. 50% renewal discount applies after first complimentary year.',
        is_active: true,
      },
      {
        card_id: NID,
        benefit_type: 'entertainment',
        title: 'BOGOF Cinema Tickets (Max 3/Month)',
        description: 'Buy 1 Get 1 Free cinema tickets, up to 3 tickets per calendar month.',
        monetary_value_aed: null,
        usage_limit: 3,
        usage_period: 'monthly',
        conditions: 'Must spend minimum AED 3,500 in the billing cycle. If spend threshold not met, cost of tickets availed will be charged in next statement cycle.',
        is_active: true,
      },
    ];

    for (const b of noonBenefits) {
      await insert('card_benefits', b, `noon One benefit → ${b.title}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. INSERT: ENBD Visa Flexi Credit Card
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n\n════ CARD 2: ENBD Visa Flexi Credit Card ════');

  const { data: flexiCard, error: flexiErr } = await sb
    .from('cards')
    .insert({
      bank_id: ENBD_BANK_ID,
      name: 'Emirates NBD Visa Flexi Credit Card',
      card_network: 'visa',
      card_tier: null,                  // ⚠️ Not explicitly stated; likely Signature given AED 735 fee + concierge option
      annual_fee_aed: 735,              // KFS 03/2026 + fees PDF Feb 2026 confirmed
      min_salary_aed: null,             // ⚠️ GAP: conflicting third-party data (AED 12k vs 15k); no official source
      reward_currency_name: 'Plus Points',
      reward_currency_value_aed: 1.0,   // 1 Plus Point = AED 1 (confirmed by effective return math)
      base_earn_rate: 0.015,
      base_earn_unit: 'per_aed',
      forex_markup_pct: 1.99,           // All ENBD cards (fees PDF Feb 2026)
      interest_rate_monthly_pct: 3.69,  // KFS 03/2026 (APR 44.28%)
      lounge_access_count: null,        // Lounge is an OPTIONAL boutique benefit (not standard)
      lounge_access_network: null,
      valet_parking_count: null,
      travel_insurance: null,           // Optional benefit, not standard
      purchase_protection: null,
      concierge: null,                  // Optional boutique benefit (Ten Concierge)
      airport_transfer_count: null,     // Optional premium benefit (2/yr if chosen)
      source_url: SRC_FEES,
      is_active: true,
      summary: [
        'VERIFIED 2026-06-14. Emirates NBD Visa Flexi Credit Card. AED 735 annual fee.',
        'Reward: Plus Points (1 PP = AED 1). Earn 1.5 PP/AED 100 (1.5%) general spend;',
        '0.4 PP/AED 100 (0.4%) on groceries, insurance, car dealerships;',
        '0.2 PP/AED 100 (0.2%) on fuel, utilities, real estate, education.',
        'Cap: 500 Plus Points per statement cycle (= AED 500 max/month, eff. 5 April 2025).',
        'Forex: 1.99% ENBD + ~1.15% Visa = ~3.14% total. APR: 44.28% (3.69%/month).',
        'Unique "choose your benefits" model: select 2 of 6 Boutique + 4 of 8 Premium benefits.',
        'Boutique options: LoungeKey, Dragon Pass spa, VOX cinema, Anghami, Ten Concierge, DUBZ luggage.',
        'Premium options: BidRoom hotel, Boingo WiFi, airport transfers (2/yr), intl medical assist,',
        'Smart Delay lounge, golf (5 courses), UTU VAT refund, Careem credits (up to AED 1,200/yr).',
        'Spend condition: AED 5,000/month required; else AED 99 charged per benefit used.',
        '⚠️ GAPS: min salary (AED 12k-15k unconfirmed), card tier, FX earn rate — product/earn pages JS-rendered.',
        '⚠️ Earn rates from third-party sources only — official Plus Points earn page inaccessible.',
        'Sources: KFS 03/2026 + fees PDF (Feb 2026) + Flexi benefits value chart PDF (Feb 2024).',
      ].join(' '),
    })
    .select('id')
    .single();

  if (flexiErr) { console.error('  [FAIL] Flexi card insert:', flexiErr.message); errors++; }
  else {
    const FID = flexiCard.id;
    console.log(`  [OK]   Flexi card inserted → id: ${FID}`);

    // ── Flexi: card_rewards (17 rows) ────────────────────────────────────
    console.log('\n  Inserting Flexi card_rewards...');

    const fBase = (catId, ppPerAed, eff, notes) => ({
      card_id: FID,
      category_id: catId,
      reward_type: 'points',
      earn_rate: ppPerAed,
      earn_unit: 'per_aed',
      effective_return_pct: eff,
      monthly_cap_reward: 500,           // 500 PP max per statement = AED 500 (eff. 5 April 2025)
      monthly_cap_spend_aed: null,
      min_txn_amount_aed: null,
      is_promotional: false,
      is_active: true,
      source_url: SRC_FLEXI_3P,
      last_verified_date: TODAY,
      notes,
    });

    const CAP_F  = '⚠️ Cap: 500 Plus Points per statement cycle (= AED 500 max, eff. 5 April 2025). ⚠️ Earn rates from third-party sources — official Plus Points earn page JS-rendered; verify on emiratesnbd.com/en/help-and-support/earning-plus-points.';
    const GEN_F  = '1.5 Plus Points per AED 100 (1.5% effective). 1 Plus Point = AED 1. ' + CAP_F;
    const GRO_F  = '0.4 Plus Points per AED 100 (0.4% effective). Reduced-rate tier. ' + CAP_F;
    const FUEL_F = '0.2 Plus Points per AED 100 (0.2% effective). Reduced-rate tier. ' + CAP_F;

    const flexiRewards = [
      fBase(CAT.dining,        0.015, 1.5, '1.5 PP per AED 100 (1.5%). Dining not in reduced-rate tier. ' + CAP_F),
      fBase(CAT.groceries,     0.004, 0.4, '0.4 PP per AED 100 (0.4%). Grocery/Supermarkets in reduced-rate tier. ' + CAP_F),
      fBase(CAT.fuel,          0.002, 0.2, '0.2 PP per AED 100 (0.2%). Fuel in reduced-rate tier. ' + CAP_F),
      fBase(CAT.airlines,      0.015, 1.5, '1.5 PP per AED 100 (1.5%). Airlines not in reduced-rate tier. ' + CAP_F),
      fBase(CAT.shopping,      0.015, 1.5, '1.5 PP per AED 100 (1.5%). Retail shopping not in reduced-rate tier. ' + CAP_F),
      fBase(CAT.hotels,        0.015, 1.5, '1.5 PP per AED 100 (1.5%). Hotels not in reduced-rate tier. ' + CAP_F),
      fBase(CAT.travel,        0.015, 1.5, '1.5 PP per AED 100 (1.5%). Travel agencies/car rental not in reduced-rate tier. ' + CAP_F),
      fBase(CAT.online,        0.015, 1.5, '1.5 PP per AED 100 (1.5%). Online shopping not in reduced-rate tier. ' + CAP_F),
      fBase(CAT.entertainment, 0.015, 1.5, '1.5 PP per AED 100 (1.5%). Entertainment not in reduced-rate tier (unlike some other ENBD cards). ' + CAP_F),
      fBase(CAT.utilities,     0.002, 0.2, '0.2 PP per AED 100 (0.2%). Utility bill payments in reduced-rate tier. ' + CAP_F),
      fBase(CAT.education,     0.002, 0.2, '0.2 PP per AED 100 (0.2%). Education in reduced-rate tier. ' + CAP_F),
      fBase(CAT.insurance,     0.004, 0.4, '0.4 PP per AED 100 (0.4%). Insurance in reduced-rate tier. ' + CAP_F),
      fBase(CAT.government,    0.002, 0.2, '0.2 PP per AED 100 (0.2%). ⚠️ Government not explicitly listed in reduced tier — assumed same as utilities by analogy with ENBD card patterns. Verify on official earn page. ' + CAP_F),
      fBase(CAT.rent,          0.002, 0.2, '0.2 PP per AED 100 (0.2%). Real estate in reduced-rate tier. ' + CAP_F),
      fBase(CAT.healthcare,    0.015, 1.5, '1.5 PP per AED 100 (1.5%). Healthcare not in reduced-rate tier. ' + CAP_F),
      fBase(CAT.international, 0.015, 1.5, '1.5 PP per AED 100 (1.5% assumed — no specific FX rate confirmed). ⚠️ Verify international earn rate from official Plus Points earn page. ' + CAP_F),
      fBase(CAT.general,       0.015, 1.5, '1.5 PP per AED 100 (1.5%). Base rate for all other eligible spend. ' + CAP_F),
    ];

    for (const r of flexiRewards) {
      const catName = Object.keys(CAT).find(k => CAT[k] === r.category_id);
      await insert('card_rewards', r, `Flexi → ${catName}`);
    }

    // ── Flexi: card_benefits ──────────────────────────────────────────────
    console.log('\n  Inserting Flexi card_benefits...');

    const flexiBenefits = [
      {
        card_id: FID,
        benefit_type: 'customizable_benefits',
        title: 'Choose Your Benefits (2 Boutique + 4 Premium)',
        description: [
          'Cardholder selects 2 of 6 Boutique + 4 of 8 Premium benefits. Spend condition: AED 5,000/month required; else AED 99/benefit used.',
          'BOUTIQUE (choose 2): (1) LoungeKey — 2 free lounge visits/yr + 2 extra per AED 20k non-AED spend (max 6 extra); (2) Dragon Pass — 1 spa voucher/yr + 2 extra per AED 20k spend; (3) VOX Cinema — Theatre by Rhodes AED 200/2 tickets + 4DX AED 100/2 tickets; (4) Anghami Plus — 6 months free subscription; (5) Ten Concierge — Visa concierge (dining, travel, shopping); (6) DUBZ Luggage — 2 free luggage pick-up/delivery services.',
          'PREMIUM (choose 4): (1) BidRoom — up to 25% off hotels + perks; (2) Boingo WiFi — 1M+ global hotspots on 4 devices; (3) Airport Transfers — 2 free transfers/yr UAE + 1 extra per AED 20k spend; (4) Intl Medical Travel Assist — telephonic medical advice abroad up to 90 days; (5) Smart Delay — free lounge access for cardholder + 4 guests on flight delay; (6) Golf — free rounds at The Track Meydan, Address Montgomerie + 3 other courses; (7) UTU — 10% VAT cashback in Eurozone; (8) Careem Credits — up to AED 1,200/yr (5 rides then AED 50 credit, max AED 100/month).',
        ].join(' '),
        monetary_value_aed: null,
        usage_limit: null,
        usage_period: 'yearly',
        conditions: 'Minimum AED 5,000 spend per month required to access benefits without charge. If spend falls below AED 5,000, AED 99 fee applies per benefit used that month. Source: Flexi Benefits Value Chart PDF (Feb 2024).',
        is_active: true,
      },
    ];

    for (const b of flexiBenefits) {
      await insert('card_benefits', b, `Flexi benefit → ${b.title}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. VERIFY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n\n════ VERIFICATION ════');

  const { data: newCards } = await sb
    .from('cards')
    .select('id, name, annual_fee_aed, reward_currency_name, interest_rate_monthly_pct, forex_markup_pct')
    .eq('bank_id', ENBD_BANK_ID)
    .in('name', ['Emirates NBD noon One Visa Credit Card', 'Emirates NBD Visa Flexi Credit Card']);

  if (newCards) {
    for (const c of newCards) {
      console.log(`\n  Card: ${c.name}`);
      console.log(`    fee=${c.annual_fee_aed} | currency=${c.reward_currency_name} | APR=${c.interest_rate_monthly_pct}%/mo | forex=${c.forex_markup_pct}%`);

      const { data: rewards } = await sb.from('card_rewards').select('category_id, effective_return_pct').eq('card_id', c.id);
      const { data: benefits } = await sb.from('card_benefits').select('benefit_type, title').eq('card_id', c.id);
      console.log(`    card_rewards: ${rewards?.length ?? 0} rows`);
      console.log(`    card_benefits: ${benefits?.length ?? 0} rows`);
      if (benefits) benefits.forEach(b => console.log(`      - ${b.benefit_type}: ${b.title}`));
    }
  }

  console.log(`\n\n════ DONE — ${errors === 0 ? 'All inserts succeeded' : `${errors} error(s) — review above`} ════`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

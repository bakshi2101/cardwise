// Add Emirates Islamic as new bank (#14) + Emirates Islamic Amazon World Credit Card
//
// Emirates Islamic is Shariah-compliant (Murabaha structure).
// "Profit rate" stored in interest_rate_monthly_pct for schema compatibility.
//
// ===========================================================================
// SOURCES
// ===========================================================================
//
//   SRC_PRODUCT → https://www.emiratesislamic.ae/en/Personal-Banking/Cards/credit-cards/amazon-credit-card
//     Free for Life. Min salary: AED 15,000.
//     Earn rates:
//       Amazon.ae: 6% Prime / 3% Non-Prime.
//       International: 2.5% Prime / 1% Non-Prime.
//       Domestic off-Amazon: 2% Prime / 1% Non-Prime.
//       Restricted MCCs: earn points but rate not stated on product page.
//     No earning limits. Points valid 5 years from credit date.
//     Benefits:
//       8 lounge visits/year (Mastercard Travel Pass).
//       BOGOF Reel Cinemas up to 2 times/month (min AED 3,000 spend).
//       Golf: 2 rounds/month at Arabian Ranches / Jebel Ali / Abu Dhabi Golf Club (min AED 5,000/month).
//       Valet: 1/month at select locations (min AED 5,000/month — increased from AED 3,000, effective March 2026).
//       Travel Medical Insurance up to USD 500,000.
//       Welcome bonus: AED 250 on AED 10,000 retail + AED 250 on AED 2,500 FX within 60 days (Prime members).
//       Careem: 1 complimentary airport transfer/year.
//       Costa Dubai Airports: 2 complimentary items.
//       IHG Hotels: 15% off.
//
//   SRC_KFS → https://www.emiratesislamic.ae/en/key-information/kfs-credit-cards
//     Annual Fee: Amazon World & Amazon Platinum: N/A (Free for Life).
//     Forex markup: 2.34% (Amazon-specific rate confirmed).
//     Monthly profit rate: 3.69% / APR 44.28%.
//
//   SRC_SOC → https://www.emiratesislamic.ae/en/soc/cards
//     Forex markup: 2.34% confirmed.
//
//   SRC_TNC → https://www.emiratesislamic.ae/en/terms-and-conditions/amazon-cards
//     AUTHORITATIVE EARN RATE TABLE (Prime / Non-Prime):
//
//       Category                        | Prime  | Non-Prime
//       --------------------------------|--------|----------
//       On-Amazon spend                 | 6%     | 3%
//       Amazon Ultra-Fast Grocery+Gifts | 2%     | 1%
//       International (non-EEA/UK)      | 2.5%   | 1%
//       EEA + UK spend                  | 2%     | 0.25%
//       Domestic off-Amazon             | 2%     | 1%
//       Restricted MCCs (all below)     | 0.25%  | 0.25%
//
//     Restricted MCCs (0.25% — same for both Prime and Non-Prime):
//       Grocery/Supermarkets, Government services/Utilities/Mobile bills, Education,
//       Insurance/Takaful, Real Estate, Automotive/car dealerships, QSR/fast-food, Fuel
//
//     Zero-earn categories:
//       Bill payments via EI banking channels (Online Banking, Mobile App, ATM/CDM, Call Center)
//       Cash withdrawals, balance transfers, cash-on-call, bank fees, cryptocurrency,
//       money orders, stored-value card purchases
//
//     No monthly/annual earning cap.
//     Points expiry: 5 years from date of credit.
//
// ===========================================================================
// CATEGORY MAPPING (17 CardWise slugs → Prime earn rate)
// ===========================================================================
//
//   online_shopping → 6.0%   (Amazon.ae; ⚠️ Non-Prime 3%; Ultra-Fast Grocery/Gift Cards = 2%)
//   international   → 2.5%   (non-EEA/UK Prime; ⚠️ EEA/UK = 2% Prime / 0.25% Non-Prime; Non-Prime general 1%)
//   dining          → 2.0%   (domestic off-Amazon Prime; ⚠️ QSR/fast-food = 0.25% restricted MCC)
//   airlines        → 2.0%   (domestic off-Amazon Prime)
//   hotels          → 2.0%   (domestic off-Amazon Prime)
//   travel          → 2.0%   (domestic off-Amazon Prime)
//   shopping        → 2.0%   (domestic off-Amazon Prime)
//   entertainment   → 2.0%   (domestic off-Amazon Prime)
//   healthcare      → 2.0%   (domestic; not explicitly listed in T&C — assumed general domestic rate; ⚠️ verify with bank)
//   general         → 2.0%   (domestic off-Amazon Prime)
//   groceries       → 0.25%  (restricted MCC; SAME rate Prime and Non-Prime)
//   insurance       → 0.25%  (restricted MCC; SAME rate Prime and Non-Prime)
//   fuel            → 0.25%  (restricted MCC; SAME rate Prime and Non-Prime)
//   utilities       → 0.25%  (restricted MCC; SAME rate Prime and Non-Prime; ⚠️ 0% if paid via EI banking channels)
//   education       → 0.25%  (restricted MCC; SAME rate Prime and Non-Prime)
//   government      → 0.25%  (restricted MCC; SAME rate Prime and Non-Prime; ⚠️ 0% if paid via EI banking channels)
//   rent            → 0.25%  (mapped from "Real Estate" restricted MCC; SAME rate Prime and Non-Prime)
//
// REWARD CURRENCY: Amazon Reward Points
//   1 Amazon Reward Point = AED 1 redeemed on Amazon.ae
//   reward_currency_value_aed = 1.0
//   effective_return_pct = earn_rate × 1.0 × 100  →  earn_rate = pct / 100
//   Examples: 6% → earn_rate 0.06 pts/AED | 2% → 0.02 | 0.25% → 0.0025
//
// FLAGGED FOR HUMAN REVIEW:
//   - Healthcare category (2%) assumed general domestic rate — not explicitly listed in SRC_TNC.
//   - EEA/UK sub-rate (2% Prime / 0.25% Non-Prime) not reflected in "international" row — noted with ⚠️.
//   - Amazon Ultra-Fast Grocery/Gift Cards (2% Prime / 1% Non-Prime) not reflected in "online_shopping" row — noted with ⚠️.
//   - Welcome bonus (AED 250+250) confirmed for Prime from SRC_PRODUCT — Non-Prime eligibility not confirmed from T&C PDF.
//   - Golf (2 rounds/month), Reel Cinemas BOGOF min spend (AED 3k), Careem (1/year) sourced from product page only.
//   - Valet min-spend increase from AED 3k → AED 5k from March 2026 confirmed from product page; verify from current T&C PDF.

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const TODAY = '2026-06-17';

const SRC_PRODUCT = 'https://www.emiratesislamic.ae/en/Personal-Banking/Cards/credit-cards/amazon-credit-card';
const SRC_KFS     = 'https://www.emiratesislamic.ae/en/key-information/kfs-credit-cards';
const SRC_SOC     = 'https://www.emiratesislamic.ae/en/soc/cards';
const SRC_TNC     = 'https://www.emiratesislamic.ae/en/terms-and-conditions/amazon-cards';

const SLUGS_ALL = [
  'groceries', 'dining', 'fuel', 'rent', 'utilities', 'education', 'insurance',
  'online_shopping', 'shopping', 'entertainment', 'healthcare', 'airlines',
  'hotels', 'travel', 'international', 'government', 'general',
];

// Prime member effective_return_pct per category (canonical headline rate per user decision)
// Non-Prime earns half for the main tiers; restricted MCCs earn 0.25% regardless of Prime status
const RATES = {
  online_shopping: 6.0,   // Amazon.ae Prime (Non-Prime 3%; Ultra-Fast Grocery/Gifts 2%/1%)
  international:   2.5,   // non-EEA/UK Prime (Non-Prime 1%; EEA/UK 2% Prime / 0.25% Non-Prime)
  dining:          2.0,   // domestic off-Amazon Prime (Non-Prime 1%; QSR 0.25% restricted)
  airlines:        2.0,   // domestic off-Amazon Prime (Non-Prime 1%)
  hotels:          2.0,   // domestic off-Amazon Prime (Non-Prime 1%)
  travel:          2.0,   // domestic off-Amazon Prime (Non-Prime 1%)
  shopping:        2.0,   // domestic off-Amazon Prime (Non-Prime 1%)
  entertainment:   2.0,   // domestic off-Amazon Prime (Non-Prime 1%)
  healthcare:      2.0,   // assumed general domestic rate — verify with bank
  general:         2.0,   // domestic off-Amazon Prime (Non-Prime 1%)
  groceries:       0.25,  // restricted MCC (same Prime/Non-Prime)
  insurance:       0.25,  // restricted MCC (same Prime/Non-Prime)
  fuel:            0.25,  // restricted MCC (same Prime/Non-Prime)
  utilities:       0.25,  // restricted MCC (same Prime/Non-Prime; 0% via EI banking channels)
  education:       0.25,  // restricted MCC (same Prime/Non-Prime)
  government:      0.25,  // restricted MCC (same Prime/Non-Prime; 0% via EI banking channels)
  rent:            0.25,  // mapped from Real Estate restricted MCC (same Prime/Non-Prime)
};

function getNotes(slug) {
  const base = `Amazon Reward Points — 1 point = AED 1 redeemable on Amazon.ae. No monthly earning cap (${SRC_TNC}). Points expire 5 years from credit date. Rate shown is for Prime members; Non-Prime halves the rate for main tiers (restricted MCCs earn 0.25% regardless of Prime status). Source: ${SRC_TNC}.`;

  switch (slug) {
    case 'online_shopping':
      return `6.0% return on Amazon.ae purchases (Prime) — 6 points per AED 100 (earn_rate 0.06 pts/AED). ⚠️ Non-Prime earns 3.0%. ⚠️ Amazon Ultra-Fast Grocery deliveries and Amazon Gift Card purchases earn only 2% Prime / 1% Non-Prime (sub-rate within Amazon.ae spend per ${SRC_TNC}). Off-Amazon online shopping (Noon, Namshi, etc.) earns the domestic rate of 2.0% Prime / 1.0% Non-Prime — not the Amazon.ae rate. ${base}`;
    case 'international':
      return `2.5% return on international (non-AED) spend — non-EEA/UK (Prime; earn_rate 0.025 pts/AED). ⚠️ Non-Prime earns 1.0% on non-EEA/UK international. ⚠️ EEA + UK-based spend earns 2.0% Prime / 0.25% Non-Prime (separate sub-rate per ${SRC_TNC}) — CardWise "international" category uses the non-EEA/UK rate as headline; EEA/UK caveat noted here. Forex markup 2.34% applies separately (${SRC_KFS}, ${SRC_SOC}). ${base}`;
    case 'dining':
      return `2.0% return on dining/restaurants/cafés (domestic off-Amazon, Prime; earn_rate 0.02 pts/AED). ⚠️ Non-Prime earns 1.0%. ⚠️ Quick Service Restaurants / fast-food (QSR MCC) earn only 0.25% (restricted MCC — same rate Prime and Non-Prime per ${SRC_TNC}); CardWise "dining" category uses the general dining rate as headline with this caveat noted. ${base}`;
    case 'airlines':
      return `2.0% return on airline ticket purchases (domestic off-Amazon rate, Prime; earn_rate 0.02 pts/AED). ⚠️ Non-Prime earns 1.0%. No airline-specific bonus beyond the domestic rate. ${base}`;
    case 'hotels':
      return `2.0% return on hotel bookings (domestic off-Amazon rate, Prime; earn_rate 0.02 pts/AED). ⚠️ Non-Prime earns 1.0%. 🎁 IHG Hotels: 15% discount (benefit, not reflected in earn rate). ${base}`;
    case 'travel':
      return `2.0% return on travel agency / booking platform spend (domestic off-Amazon rate, Prime; earn_rate 0.02 pts/AED). ⚠️ Non-Prime earns 1.0%. ${base}`;
    case 'shopping':
      return `2.0% return on shopping/retail (domestic off-Amazon rate, Prime; earn_rate 0.02 pts/AED). ⚠️ Non-Prime earns 1.0%. ${base}`;
    case 'entertainment':
      return `2.0% return on entertainment/cinema (domestic off-Amazon rate, Prime; earn_rate 0.02 pts/AED). ⚠️ Non-Prime earns 1.0%. 🎁 BOGOF Reel Cinemas up to 2 times/month (min AED 3,000 spend — benefit, not reflected in earn rate). ${base}`;
    case 'healthcare':
      return `2.0% return on healthcare (hospitals/clinics/pharmacies) — assumed general domestic off-Amazon rate (Prime; earn_rate 0.02 pts/AED). ⚠️ Healthcare not explicitly listed in ${SRC_TNC} earn rate table — assumed to fall under domestic general rate. ⚠️ Non-Prime would earn 1.0% on the same assumption. Verify with bank. ${base}`;
    case 'general':
      return `2.0% return on all other domestic spend (off-Amazon, Prime; earn_rate 0.02 pts/AED). ⚠️ Non-Prime earns 1.0%. ${base}`;
    case 'groceries':
      return `0.25% return on groceries/supermarkets — restricted MCC rate (earn_rate 0.0025 pts/AED). SAME rate for both Prime and Non-Prime per ${SRC_TNC}. Grouped with fuel, utilities, education, government, insurance, real estate, automotive, QSR in the restricted MCC bucket. ${base}`;
    case 'insurance':
      return `0.25% return on insurance/Takaful premium payments — restricted MCC rate (earn_rate 0.0025 pts/AED). SAME rate for both Prime and Non-Prime per ${SRC_TNC}. ${base}`;
    case 'fuel':
      return `0.25% return on fuel/petrol station spend — restricted MCC rate (earn_rate 0.0025 pts/AED). SAME rate for both Prime and Non-Prime per ${SRC_TNC}. ${base}`;
    case 'utilities':
      return `0.25% return on utility payments (DEWA/Etisalat/du/SEWA/FEWA/Salik) paid directly at merchant/via card — restricted MCC rate (earn_rate 0.0025 pts/AED). SAME rate for both Prime and Non-Prime per ${SRC_TNC}. ⚠️ Bill payments made via Emirates Islamic banking channels (Online Banking, Mobile App, ATM/CDM, Call Center) earn ZERO Amazon Reward Points (${SRC_TNC}). ${base}`;
    case 'education':
      return `0.25% return on education/school fees/tuition — restricted MCC rate (earn_rate 0.0025 pts/AED). SAME rate for both Prime and Non-Prime per ${SRC_TNC}. ${base}`;
    case 'government':
      return `0.25% return on government services/fees paid directly by card — restricted MCC rate (earn_rate 0.0025 pts/AED). SAME rate for both Prime and Non-Prime per ${SRC_TNC}. ⚠️ Government fee payments made via Emirates Islamic banking channels (Online Banking, Mobile App, ATM/CDM, Call Center) earn ZERO Amazon Reward Points (${SRC_TNC}). ${base}`;
    case 'rent':
      return `0.25% return on rental payments — mapped from "Real Estate" restricted MCC (earn_rate 0.0025 pts/AED). SAME rate for both Prime and Non-Prime per ${SRC_TNC}. ${base}`;
    default:
      throw new Error(`No notes defined for slug: ${slug}`);
  }
}

async function run() {
  let errors = 0;

  // ─── 0. Load spending categories ─────────────────────────────────────────
  console.log('[0] Loading spending categories...');
  const { data: catRows, error: catErr } = await sb
    .from('spending_categories').select('id, slug');
  if (catErr) { console.error('FATAL:', catErr.message); process.exit(1); }
  const cat = {};
  for (const r of catRows) cat[r.slug] = r.id;
  console.log(`  Loaded ${catRows.length} categories`);

  // ─── 1. Insert Emirates Islamic bank ──────────────────────────────────────
  console.log('\n[1/5] Inserting Emirates Islamic bank...');
  let EI_BANK_ID;
  {
    const { data, error } = await sb
      .from('banks')
      .insert({
        name:        'Emirates Islamic',
        short_name:  'EI',
        website_url: 'https://www.emiratesislamic.ae',
        is_active:   true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { EI_BANK_ID = data.id; console.log(`  OK — EI_BANK_ID: ${EI_BANK_ID}`); }
  }
  if (!EI_BANK_ID) { console.error('\nBank insertion failed — aborting'); process.exit(1); }

  // ─── 2. Insert Amazon World card ──────────────────────────────────────────
  console.log('\n[2/5] Inserting Emirates Islamic Amazon World Credit Card...');
  let AMAZON_WORLD_ID;
  {
    const { data, error } = await sb
      .from('cards')
      .insert({
        bank_id:                   EI_BANK_ID,
        name:                      'Emirates Islamic Amazon World Credit Card',
        card_network:              'mastercard',
        card_tier:                 'world',
        annual_fee_aed:            0,
        min_salary_aed:            15000,
        is_islamic:                true,
        reward_currency_name:      'Amazon Reward Points',
        reward_currency_value_aed: 1.0,
        base_earn_rate:            0.02,   // 2.0 pts per AED 100 = 0.02 pts/AED (domestic off-Amazon Prime)
        base_earn_unit:            'per_aed',
        forex_markup_pct:          2.34,
        interest_rate_monthly_pct: 3.69,   // Shariah profit rate stored for schema compatibility
        lounge_access_count:       8,
        lounge_access_network:     'mastercard_travel_pass',
        valet_parking_count:       1,
        travel_insurance:          true,
        purchase_protection:       false,
        concierge:                 false,
        airport_transfer_count:    1,
        source_url:                SRC_PRODUCT,
        summary: [
          `VERIFIED ${TODAY}. Emirates Islamic Amazon World Credit Card.`,
          'Shariah-compliant (Murabaha structure) — Free for Life (AED 0 annual fee).',
          'Min salary: AED 15,000. Profit rate: 3.69%/month (44.28% APR).',
          `Forex markup: 2.34% (Amazon-specific confirmed rate per ${SRC_KFS}, ${SRC_SOC}).`,
          'AMAZON REWARD POINTS (1 point = AED 1 redeemable on Amazon.ae):',
          'Prime members: 6% on Amazon.ae | 2.5% international (non-EEA/UK) | 2% domestic off-Amazon.',
          'Non-Prime: 3% Amazon.ae | 1% international | 1% domestic (halved vs Prime for main tiers).',
          'EEA+UK: 2% Prime / 0.25% Non-Prime. Amazon Ultra-Fast Grocery/Gift Cards: 2% Prime / 1% Non-Prime.',
          'Restricted MCCs (groceries, fuel, utilities, education, govt, insurance, real estate, automotive, QSR): 0.25% — SAME rate Prime and Non-Prime.',
          '⚠️ Bill payments via EI banking channels earn ZERO points.',
          'No monthly/annual earning cap. Points expire 5 years from credit date.',
          'WELCOME OFFER (Prime): AED 250 on AED 10,000 retail + AED 250 on AED 2,500 FX within 60 days.',
          'BENEFITS: 8 lounge visits/year (Mastercard Travel Pass); BOGOF Reel Cinemas ≤2/month (min AED 3,000);',
          'Golf 2 rounds/month at Arabian Ranches/Jebel Ali/Abu Dhabi Golf Club (min AED 5,000/month);',
          'Valet 1/month (min AED 5,000/month — increased from AED 3,000 effective March 2026);',
          'Travel Medical Insurance up to USD 500,000;',
          '1 Careem airport transfer/year; Costa Dubai Airports 2 items; IHG 15% off.',
          `Sources: ${SRC_PRODUCT}, ${SRC_KFS}, ${SRC_SOC}, ${SRC_TNC}.`,
        ].join(' '),
        is_active: true,
      })
      .select('id').single();
    if (error) { console.error('  ERROR:', error.message); errors++; }
    else { AMAZON_WORLD_ID = data.id; console.log(`  OK — AMAZON_WORLD_ID: ${AMAZON_WORLD_ID}`); }
  }
  if (!AMAZON_WORLD_ID) { console.error('\nCard insertion failed — aborting'); process.exit(1); }

  // ─── 3. card_rewards (17 rows) ────────────────────────────────────────────
  // earn_rate = pct / 100  (because reward_currency_value_aed = 1.0 and effective_return_pct = earn_rate × 1.0 × 100)
  console.log('\n[3/5] Inserting 17 card_rewards rows...');
  for (const slug of SLUGS_ALL) {
    const catId = cat[slug];
    if (!catId) { console.error(`  ERROR: unknown slug "${slug}"`); errors++; continue; }
    const pct = RATES[slug];
    const { error } = await sb.from('card_rewards').insert({
      card_id:              AMAZON_WORLD_ID,
      category_id:          catId,
      reward_type:          'points',
      earn_rate:            pct / 100,  // pts/AED (1 pt = AED 1 → earn_rate 0.06 = 6% return)
      earn_unit:            'per_aed',
      effective_return_pct: pct,
      monthly_cap_reward:   null,       // no cap per SRC_TNC "no earning limits"
      source_url:           SRC_TNC,
      last_verified_date:   TODAY,
      is_active:            true,
      notes:                getNotes(slug),
    });
    if (error) { console.error(`  ERROR (${slug}):`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log(' done');

  // ─── 4. card_benefits ─────────────────────────────────────────────────────
  console.log('\n[4/5] Inserting card_benefits...');
  const benefits = [
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'welcome_bonus',
      title:             'Welcome Bonus — AED 500 (Prime Members)',
      description:       'AED 250 Amazon Reward Points on spending AED 10,000 on retail purchases + AED 250 on spending AED 2,500 in foreign currency transactions, both within 60 days of card issuance. Prime members only.',
      monetary_value_aed: 500,
      usage_limit:       1,
      usage_period:      'one_time',
      conditions:        `AED 10,000 retail spend + AED 2,500 FX spend within 60 days. Prime membership required. Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'lounge_access',
      title:             'Airport Lounge Access — 8 Visits/Year (Mastercard Travel Pass)',
      description:       'Up to 8 complimentary airport lounge visits per year via Mastercard Travel Pass.',
      monetary_value_aed: null,
      usage_limit:       8,
      usage_period:      'yearly',
      conditions:        `Via Mastercard Travel Pass. Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'buy_one_get_one',
      title:             'Reel Cinemas — Buy 1 Get 1 Free (Up to 2×/Month)',
      description:       'Buy 1 get 1 free cinema tickets at Reel Cinemas, up to 2 times per month.',
      monetary_value_aed: null,
      usage_limit:       2,
      usage_period:      'monthly',
      conditions:        `Minimum monthly spend of AED 3,000 required. Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'golf',
      title:             'Golf — 2 Complimentary Rounds/Month',
      description:       'Up to 2 complimentary golf rounds per month at Arabian Ranches Golf Club, Jebel Ali Golf Resort, and Abu Dhabi Golf Club.',
      monetary_value_aed: null,
      usage_limit:       2,
      usage_period:      'monthly',
      conditions:        `Minimum monthly spend of AED 5,000 required. Venue availability subject to partner T&Cs. Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'valet_parking',
      title:             'Complimentary Valet Parking — 1×/Month',
      description:       'One complimentary valet parking use per month at select locations.',
      monetary_value_aed: null,
      usage_limit:       1,
      usage_period:      'monthly',
      conditions:        `Minimum monthly spend of AED 5,000 required (increased from AED 3,000 effective March 2026). Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'travel_insurance',
      title:             'Travel Medical Insurance — Up to USD 500,000',
      description:       'Complimentary travel medical insurance coverage up to USD 500,000.',
      monetary_value_aed: null,
      usage_limit:       null,
      usage_period:      'yearly',
      conditions:        `Subject to insurance policy T&Cs. Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'airport_transfer',
      title:             'Careem Airport Transfer — 1×/Year',
      description:       'One complimentary Careem airport transfer per year.',
      monetary_value_aed: null,
      usage_limit:       1,
      usage_period:      'yearly',
      conditions:        `Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'other',
      title:             'Costa Coffee — 2 Complimentary Items at Dubai Airports',
      description:       'Two complimentary food/beverage items at Costa Coffee outlets in Dubai Airports.',
      monetary_value_aed: null,
      usage_limit:       2,
      usage_period:      'yearly',
      conditions:        `Available at Costa Coffee outlets in Dubai International Airport and Dubai World Central. Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
    {
      card_id:           AMAZON_WORLD_ID,
      benefit_type:      'other',
      title:             'IHG Hotels — 15% Discount',
      description:       '15% discount on IHG hotel bookings (InterContinental, Crowne Plaza, Holiday Inn, etc.).',
      monetary_value_aed: null,
      usage_limit:       null,
      usage_period:      'yearly',
      conditions:        `Subject to IHG terms and availability. Source: ${SRC_PRODUCT}`,
      is_active:         true,
    },
  ];

  for (const b of benefits) {
    const { error } = await sb.from('card_benefits').insert(b);
    if (error) { console.error(`  ERROR (${b.benefit_type} — ${b.title}):`, error.message); errors++; }
    else console.log(`  OK — ${b.title}`);
  }

  // ─── 5. Verify ──────────────────────────────────────────────────────────────
  console.log('\n[5/5] Verifying final state...');

  const { data: bankCheck } = await sb
    .from('banks').select('id, name, short_name').eq('id', EI_BANK_ID).single();
  console.log(`  Bank: ${bankCheck?.name} (${bankCheck?.short_name}) — ${bankCheck?.id}`);

  const { data: cardCheck } = await sb
    .from('cards')
    .select('id, name, card_tier, card_network, annual_fee_aed, min_salary_aed, is_islamic, forex_markup_pct, interest_rate_monthly_pct, lounge_access_count, reward_currency_value_aed')
    .eq('id', AMAZON_WORLD_ID).single();
  console.log(`  Card: ${cardCheck?.name}`);
  console.log(`    tier=${cardCheck?.card_tier}, network=${cardCheck?.card_network}, fee=${cardCheck?.annual_fee_aed}, salary=${cardCheck?.min_salary_aed}`);
  console.log(`    is_islamic=${cardCheck?.is_islamic}, forex=${cardCheck?.forex_markup_pct}%, profit_rate=${cardCheck?.interest_rate_monthly_pct}%/month`);
  console.log(`    lounge=${cardCheck?.lounge_access_count}/yr, reward_currency_value_aed=${cardCheck?.reward_currency_value_aed}`);

  const { data: rewards } = await sb
    .from('card_rewards')
    .select('card_id, effective_return_pct, monthly_cap_reward')
    .eq('card_id', AMAZON_WORLD_ID)
    .order('effective_return_pct', { ascending: false });
  console.log(`\n  card_rewards (${rewards?.length} rows):`);
  for (const r of rewards ?? []) {
    console.log(`    ${r.effective_return_pct}% | cap=${r.monthly_cap_reward ?? 'none'}`);
  }

  const { data: bens } = await sb
    .from('card_benefits')
    .select('benefit_type, title')
    .eq('card_id', AMAZON_WORLD_ID)
    .order('benefit_type');
  console.log(`\n  card_benefits (${bens?.length} rows):`);
  for (const b of bens ?? []) console.log(`    ${b.benefit_type} — ${b.title}`);

  // ─── Done ───────────────────────────────────────────────────────────────────
  console.log('\nDone.');
  if (errors === 0) console.log('  All data inserted successfully. No errors.');
  else              console.log(`  Completed with ${errors} error(s) — review output above.`);

  console.log('\nKey IDs:');
  console.log(`  EI_BANK_ID:     ${EI_BANK_ID}`);
  console.log(`  AMAZON_WORLD_ID: ${AMAZON_WORLD_ID}`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

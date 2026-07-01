// One-time migration script: adds FAB du Credit Card and FAB Rewards Active Credit Card
// Run with: node scripts/run_migration_fab_new_cards.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://hlbxxmbwgnaiaorhsqwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const FAB_REWARDS_URL = 'https://www.bankfab.com/-/media/fab-uds/personal/terms-and-conditions-consolidated/fab-reward-programmes/fab-rewards-terms-and-conditions-en.pdf';
const DU_CARD_URL = 'https://www.bankfab.com/en-ae/personal/credit-cards/du-credit-card';
const ACTIVE_CARD_URL = 'https://www.bankfab.com/en-ae/personal/credit-cards/fab-rewards-active-credit-card';
const LAST_VERIFIED = '2026-06-19';

async function run() {
  console.log('=== FAB New Cards Migration ===\n');

  // 1. Fetch bank ID
  const { data: bankData, error: bankErr } = await supabase
    .from('banks')
    .select('id')
    .eq('short_name', 'FAB')
    .single();
  if (bankErr) throw new Error(`Bank lookup failed: ${bankErr.message}`);
  const fabBankId = bankData.id;
  console.log(`FAB bank_id: ${fabBankId}`);

  // 2. Fetch all category IDs
  const { data: cats, error: catErr } = await supabase
    .from('spending_categories')
    .select('id, slug');
  if (catErr) throw new Error(`Category lookup failed: ${catErr.message}`);
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  const slugs = ['dining','groceries','fuel','airlines','shopping','hotels','travel',
    'online_shopping','entertainment','utilities','education','insurance','government',
    'rent','healthcare','international','general'];
  for (const s of slugs) {
    if (!catMap[s]) throw new Error(`Missing category: ${s}`);
  }
  console.log(`Loaded ${cats.length} categories\n`);

  // 3. Check if cards already exist (idempotency guard)
  const { data: existingCards } = await supabase
    .from('cards')
    .select('id, name')
    .eq('bank_id', fabBankId)
    .in('name', ['FAB du Credit Card', 'FAB Rewards Active Credit Card']);
  if (existingCards && existingCards.length > 0) {
    console.log('⚠️  Cards already exist:');
    existingCards.forEach(c => console.log(`   - ${c.name} (${c.id})`));
    console.log('\nAborting to avoid duplicates. Delete existing rows first if you want to re-run.');
    process.exit(1);
  }

  // ================================================================
  // SECTION 1: FAB du Credit Card
  // ================================================================
  console.log('--- Inserting FAB du Credit Card ---');

  const { data: duCard, error: duCardErr } = await supabase
    .from('cards')
    .insert({
      bank_id: fabBankId,
      name: 'FAB du Credit Card',
      card_network: 'mastercard',
      card_tier: 'titanium',
      annual_fee_aed: 0,
      min_salary_aed: 5000,
      reward_currency_name: 'FAB Rewards',
      reward_currency_value_aed: 0.003,
      base_earn_rate: 1,
      base_earn_unit: 'per_aed',
      lounge_access_count: 0,
      lounge_access_network: null,
      travel_insurance: false,
      purchase_protection: false,
      concierge: false,
      source_url: DU_CARD_URL,
      summary: 'VERIFIED. du co-branded card (Mastercard Titanium). 15% back in FAB Rewards at du merchants (51 pts/AED per FAB Rewards T&C; cap 167,000 pts/month = AED 501 max; requires AED 2,500 min spend prev month + active du subscription). 1 pt/AED = 0.30% all other domestic & international. 0.5 pts/AED = 0.15% low-interchange (groceries, telecom non-du, fuel, education, govt, charities, transport, rental, car rental, utilities non-du, florists, bookstores, laundry, lottery, insurance, fast-food). Non-du monthly cap 50,000 pts = AED 150. Free for life (⚠️ not explicitly stated). 0% installment plan on du EPP >= AED 1,000. 20% off Talabat 1x/month. Flight delay lounge access via Mastercard Travel Pass. ⚠️ Forex markup unconfirmed. Source: FAB du Credit Card T&C June 2025 V3; FAB Rewards T&C April 2025 V4.',
      is_active: true
    })
    .select('id')
    .single();
  if (duCardErr) throw new Error(`du card insert failed: ${duCardErr.message}`);
  const duCardId = duCard.id;
  console.log(`✓ FAB du Credit Card inserted: ${duCardId}`);

  // du card_rewards (17 rows)
  const duRewards = [
    {
      category_id: catMap['utilities'], earn_rate: 51, effective_return_pct: 15.00,
      monthly_cap_reward: 167000, min_monthly_spend_aed: 2500,
      notes: 'AT DU MERCHANTS ONLY (du.ae bills, post-paid, pre-paid recharges, home plans, EPP devices). 51 pts/AED per FAB Rewards T&C = 15% per du Card T&C clause 5.1. Cap 167,000 pts/month (= AED 501 value). Min AED 2,500 total card spend in previous month + active du subscription required. Non-du utility/telecom providers (e&/Etisalat, DEWA, SEWA) earn 0.15% low-interchange rate.'
    },
    {
      category_id: catMap['dining'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: 50000, min_monthly_spend_aed: null,
      notes: '1 pt/AED on all domestic & international spend (general rate). Aggregate non-du monthly cap 50,000 pts = AED 150.'
    },
    {
      category_id: catMap['groceries'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Supermarkets (MCC 5411) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['fuel'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Fuel (MCC 5541, 5542) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['airlines'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Airlines (MCC 4511, 3000-3299) fall under low-interchange transport group. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['shopping'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '1 pt/AED general domestic rate. Department stores (MCC 5311) are low interchange = 0.15% per FAB Rewards T&C footnote.'
    },
    {
      category_id: catMap['hotels'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '1 pt/AED general domestic rate.'
    },
    {
      category_id: catMap['travel'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Car rental and travel agencies in low-interchange transport group. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['online_shopping'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '1 pt/AED general domestic rate (no e-commerce bonus on Titanium tier).'
    },
    {
      category_id: catMap['entertainment'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '1 pt/AED general domestic rate. Lottery (MCC) = low interchange = 0.15%.'
    },
    {
      category_id: catMap['education'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Education MCCs = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['insurance'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Insurance (MCC 3429, 5960, 6300) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['government'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Government services (MCC 7800, 9211-9406) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['rent'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Rental/real estate (MCC 6513 etc.) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['healthcare'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '1 pt/AED general domestic rate.'
    },
    {
      category_id: catMap['international'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '1 pt/AED on international (non-AED) spend. Same as domestic general rate per FAB Rewards T&C Table 3.1.'
    },
    {
      category_id: catMap['general'], earn_rate: 1, effective_return_pct: 0.30,
      monthly_cap_reward: 50000, min_monthly_spend_aed: null,
      notes: '1 pt/AED general domestic & international rate. Aggregate non-du monthly cap 50,000 FAB Rewards = AED 150 value.'
    },
  ].map(r => ({
    card_id: duCardId,
    category_id: r.category_id,
    reward_type: 'points',
    earn_rate: r.earn_rate,
    earn_unit: 'per_aed',
    earn_per_x_aed: 1,
    effective_return_pct: r.effective_return_pct,
    monthly_cap_reward: r.monthly_cap_reward,
    min_monthly_spend_aed: r.min_monthly_spend_aed,
    source_url: FAB_REWARDS_URL,
    last_verified_date: LAST_VERIFIED,
    notes: r.notes
  }));

  const { error: duRewardsErr } = await supabase.from('card_rewards').insert(duRewards);
  if (duRewardsErr) throw new Error(`du card_rewards insert failed: ${duRewardsErr.message}`);
  console.log(`✓ FAB du card_rewards: ${duRewards.length} rows inserted`);

  // du card_benefits (4 rows)
  const duBenefits = [
    {
      benefit_type: 'lounge_access',
      title: 'Flight Delay Lounge Access',
      description: 'Complimentary airport lounge access via Mastercard Travel Pass app during confirmed flight delays.',
      usage_limit: null,
      usage_period: null,
      conditions: 'Flight delay must be confirmed. Access via Mastercard Travel Pass app. ⚠️ Exact conditions and eligible lounges to be confirmed from Mastercard Travel Pass T&Cs. Note: older 2022 T&C (when card was Platinum tier) showed 4 LoungeKey visits + unlimited Mastercard lounges — superseded by current Titanium tier.'
    },
    {
      benefit_type: 'dining_discount',
      title: '20% Off Talabat',
      description: '20% discount on Talabat food and grocery orders, valid once per month.',
      usage_limit: 1,
      usage_period: 'monthly',
      conditions: 'One discount per month. Offer details and validity period to be confirmed from FAB product page.'
    },
    {
      benefit_type: 'installment_plan',
      title: '0% Installment Plan on du EPP Purchases',
      description: 'Convert du Easy Payment Plan (EPP) purchases of AED 1,000+ to 0% installment for 3, 6, 9 or 12 months via Easy Buy Scheme.',
      usage_limit: null,
      usage_period: null,
      conditions: 'Subject to FAB Easy Buy T&Cs. Min purchase AED 1,000. du EPP = bundled smartphone and data package.'
    },
    {
      benefit_type: 'other',
      title: '25% Off Fiit.tv Subscription',
      description: '25% discount on Fiit.tv fitness streaming subscription (applicable on first payment).',
      usage_limit: 1,
      usage_period: null,
      conditions: 'Applicable on first payment only per web page. Other T&Cs apply.'
    }
  ].map(b => ({ card_id: duCardId, ...b }));

  const { error: duBenErr } = await supabase.from('card_benefits').insert(duBenefits);
  if (duBenErr) throw new Error(`du card_benefits insert failed: ${duBenErr.message}`);
  console.log(`✓ FAB du card_benefits: ${duBenefits.length} rows inserted\n`);

  // ================================================================
  // SECTION 2: FAB Rewards Active Credit Card
  // ================================================================
  console.log('--- Inserting FAB Rewards Active Credit Card ---');

  const { data: activeCard, error: activeCardErr } = await supabase
    .from('cards')
    .insert({
      bank_id: fabBankId,
      name: 'FAB Rewards Active Credit Card',
      card_network: 'mastercard',
      card_tier: 'platinum',
      annual_fee_aed: 300,
      min_salary_aed: 5000,
      reward_currency_name: 'FAB Rewards',
      reward_currency_value_aed: 0.003,
      base_earn_rate: 2,
      base_earn_unit: 'per_aed',
      lounge_access_count: 4,
      lounge_access_network: 'mastercard_travel_pass',
      travel_insurance: false,
      purchase_protection: true,
      concierge: false,
      source_url: ACTIVE_CARD_URL,
      summary: 'VERIFIED. Sports-focused card (Mastercard Platinum). 5 pts/AED = 1.5% at sports MCCs (sporting goods 5941, gyms/clubs 7997, athletic fields 7941, sports apparel 5655, public golf 7992, sports camps 7032, swimming pools 5996). 2 pts/AED = 0.60% all other domestic & international. 0.5 pts/AED = 0.15% low-interchange (groceries, fuel, utilities, education, govt, insurance, rent, airlines, transport, car rental, fast-food, etc.). Bonus: 25 FAB Rewards per 1,000 steps via STEPPI app (min 6,000 steps/day, max 10,000 steps/day). Total cap 50,000 pts/month = AED 150 max. AED 300 annual fee (1st year free promo June–July 2026). Free fitness payment ring (Tappy Pay, contactless). ADV+ gym membership (25+ gyms; free w/ AED 3K/month spend). 4 lounge visits/yr via Mastercard Travel Pass. Purchase Protection USD 2,000/claim, USD 5,000/year, 180 days. ⚠️ Forex markup unconfirmed. Source: FAB Rewards Active Card Benefits T&C Dec 2025; FAB Rewards T&C April 2025 V4.',
      is_active: true
    })
    .select('id')
    .single();
  if (activeCardErr) throw new Error(`Active card insert failed: ${activeCardErr.message}`);
  const activeCardId = activeCard.id;
  console.log(`✓ FAB Rewards Active Credit Card inserted: ${activeCardId}`);

  // Active card_rewards (17 rows)
  const activeRewards = [
    {
      category_id: catMap['dining'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '2 pts/AED on all domestic & international spend (general rate). Fast food (MCC 5814) = low interchange = 0.15%.'
    },
    {
      category_id: catMap['groceries'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Supermarkets (MCC 5411) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['fuel'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Fuel (MCC 5541, 5542) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['airlines'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Airlines (MCC 4511, 3000-3299) in low-interchange transport/telecom group. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['shopping'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '2 pts/AED general rate. 🎁 1.5% (5 pts/AED) at sporting goods stores (MCC 5941) and sports apparel/riding apparel stores (MCC 5655). 20% off Sun & Sand Sports online (code FAB10 for 10% off (no min, max AED 75); code FAB20 for 20% off on AED 250+ spend, max AED 100 discount; valid to Dec 2026).'
    },
    {
      category_id: catMap['hotels'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '2 pts/AED general domestic rate.'
    },
    {
      category_id: catMap['travel'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Car rental (MCC 3351-3500, 7512, 7513, 7519) and travel agencies (MCC 4722) in low-interchange group. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['online_shopping'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '2 pts/AED on domestic & international e-commerce (general rate).'
    },
    {
      category_id: catMap['entertainment'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '2 pts/AED general entertainment (cinemas, events, streaming). 🎁 1.5% (5 pts/AED) at sports venues: country clubs/athletic clubs (MCC 7997), athletic fields/professional sports (MCC 7941), public golf courses (MCC 7992), sporting/recreational camps (MCC 7032), swimming pools (MCC 5996). 20% off Emaar attractions + 20% off Dubai Holding Entertainment (Wild Wadi, Green Planet, Inside Burj Al Arab, Dubai Parks & Resorts, The View Palm).'
    },
    {
      category_id: catMap['utilities'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Utilities (MCC 4900) = low interchange. 0.5 pts/AED = 0.15%. Telecom (MCC 4111, 4112, 4119, 4121, 4131, 4411, 4468, 4511, 4722, 4784, 4789) also low interchange.'
    },
    {
      category_id: catMap['education'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Education (MCC 8220, 8241, 8244, 8249, 8299) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['insurance'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Insurance (MCC 3429, 5960, 6300) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['government'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Government services (MCC 7800, 9223, 9211, 9222, 9311, 9399, 9402, 9405, 9406) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['rent'], earn_rate: 0.5, effective_return_pct: 0.15,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: 'Rental/real estate (MCC 3351-3500, 4457, 5978, 6513, 7296, 7394, 7512-7519, 7538, 7542, 7549, 7841) = low interchange. 0.5 pts/AED = 0.15%.'
    },
    {
      category_id: catMap['healthcare'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '2 pts/AED general domestic rate. Healthcare not in low-interchange list.'
    },
    {
      category_id: catMap['international'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: null, min_monthly_spend_aed: null,
      notes: '2 pts/AED on international (non-AED) spend. Same rate as domestic per FAB Rewards T&C Table 3.1.'
    },
    {
      category_id: catMap['general'], earn_rate: 2, effective_return_pct: 0.60,
      monthly_cap_reward: 50000, min_monthly_spend_aed: null,
      notes: '2 pts/AED general domestic & international rate. Total monthly cap 50,000 FAB Rewards = AED 150 value (shared across all non-sports categories). Bonus: 25 FAB Rewards per 1,000 steps via STEPPI app (min 6,000 steps/day, max 10,000 steps/day; counts toward 50,000 cap).'
    },
  ].map(r => ({
    card_id: activeCardId,
    category_id: r.category_id,
    reward_type: 'points',
    earn_rate: r.earn_rate,
    earn_unit: 'per_aed',
    earn_per_x_aed: 1,
    effective_return_pct: r.effective_return_pct,
    monthly_cap_reward: r.monthly_cap_reward,
    min_monthly_spend_aed: r.min_monthly_spend_aed,
    source_url: FAB_REWARDS_URL,
    last_verified_date: LAST_VERIFIED,
    notes: r.notes
  }));

  const { error: activeRewardsErr } = await supabase.from('card_rewards').insert(activeRewards);
  if (activeRewardsErr) throw new Error(`Active card_rewards insert failed: ${activeRewardsErr.message}`);
  console.log(`✓ FAB Rewards Active card_rewards: ${activeRewards.length} rows inserted`);

  // Active card_benefits (7 rows)
  const activeBenefits = [
    {
      benefit_type: 'lounge_access',
      title: '4 Complimentary Airport Lounge Visits/Year',
      description: '4 complimentary access to 25+ regional and international airport lounges via Mastercard Travel Pass app.',
      usage_limit: 4,
      usage_period: 'yearly',
      monetary_value_aed: null,
      conditions: 'Access via Mastercard Travel Pass app. Register FAB Mastercard, use app QR code at lounge reception. Source: FAB Rewards Active Card Benefits T&C December 2025. For updated lounge list visit priceless.com.'
    },
    {
      benefit_type: 'fitness',
      title: 'ADV+ Gym Membership (25+ Premium Gyms)',
      description: 'Complimentary ADV+ membership giving access to a network of 25+ premium gyms across the UAE for 12 months.',
      usage_limit: null,
      usage_period: 'yearly',
      monetary_value_aed: null,
      conditions: 'Minimum AED 3,000 monthly spend required for free access. If spend falls below AED 3,000, visits are chargeable at AED 100/visit. Activate via unique code shared by FAB within 1 month of card activation at adv+ website.'
    },
    {
      benefit_type: 'other',
      title: 'Free Fitness Payment Ring (Tappy Pay)',
      description: 'Complimentary contactless payment ring linked to FAB Rewards Active card. Use for contactless payments at NFC terminals.',
      usage_limit: 1,
      usage_period: null,
      monetary_value_aed: null,
      conditions: 'Issued once per primary cardholder, cannot be replaced or exchanged. Requires registration via Tappy Pay in FAB Mobile app. Must register with STEPPI app to earn FAB Rewards from steps.'
    },
    {
      benefit_type: 'purchase_protection',
      title: 'Purchase Protection (Mastercard)',
      description: 'Purchases protected against theft or accidental damage for up to 180 days from purchase date.',
      usage_limit: null,
      usage_period: null,
      monetary_value_aed: 7340,
      conditions: 'Coverage up to USD 2,000 per claim, maximum USD 5,000 over a 12-month period. File claims at mcpeaceofmind.com. Source: FAB Rewards Active Card Benefits T&C December 2025.'
    },
    {
      benefit_type: 'shopping_discount',
      title: '20% Off Sun & Sand Sports Online',
      description: 'Up to 20% discount on online purchases at Sun & Sand Sports. Use code FAB10 for 10% off (no min, max AED 75) or FAB20 for 20% off on AED 250+ spend (max AED 100).',
      usage_limit: null,
      usage_period: null,
      monetary_value_aed: 100,
      conditions: 'Not valid on Apple Pay, Samsung Pay, or wallet payments. Valid until 31 December 2026. Other Sun & Sand Sports T&Cs apply.'
    },
    {
      benefit_type: 'entertainment_discount',
      title: '20% Off Emaar Attractions',
      description: '20% discount at Emaar attractions: KidZania Dubai/Abu Dhabi, Play DXB, E-KART Zabeel, Dubai Aquarium & Underwater Zoo, Dubai Ice Rink, The Storm Coaster, Zabeel Sports District.',
      usage_limit: null,
      usage_period: null,
      monetary_value_aed: null,
      conditions: 'POS purchase only. Cardholder must be present. Not valid on public holidays or with other promotions. Valid until 30 November 2026.'
    },
    {
      benefit_type: 'entertainment_discount',
      title: '20% Off Dubai Holding Entertainment',
      description: '20% discount at Dubai Holding Entertainment: Wild Wadi, The Green Planet, Inside Burj Al Arab, Dubai Parks & Resorts (Motiongate, Legoland, Real Madrid World), The View Palm.',
      usage_limit: null,
      usage_period: null,
      monetary_value_aed: null,
      conditions: 'POS purchase only at attractions (not online, except The View Palm with code THVFAB20%). Wild Wadi includes 15% retail, 30% valet, 20% F&B. Other attraction T&Cs apply.'
    },
  ].map(b => ({ card_id: activeCardId, ...b }));

  const { error: activeBenErr } = await supabase.from('card_benefits').insert(activeBenefits);
  if (activeBenErr) throw new Error(`Active card_benefits insert failed: ${activeBenErr.message}`);
  console.log(`✓ FAB Rewards Active card_benefits: ${activeBenefits.length} rows inserted`);

  console.log('\n=== Migration complete ===');
  console.log(`FAB du Credit Card     ID: ${duCardId}`);
  console.log(`FAB Rewards Active     ID: ${activeCardId}`);
  console.log('\nReminder — data gaps to resolve later:');
  console.log('  - forex_markup_pct for both cards (needs FAB Schedule of Charges)');
  console.log('  - interest_rate_monthly_pct for both cards (needs FAB Schedule of Charges)');
  console.log('  - FAB du: confirm annual fee is truly "for life"');
  console.log('  - FAB du: full Titanium lounge benefit conditions via Mastercard Travel Pass T&Cs');
  console.log('  - FAB du: no welcome/joining bonus found — verify with product page or KFS');
}

run().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});

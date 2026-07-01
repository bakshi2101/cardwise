// Fix ADCB 365 Cashback + Essential Cashback
//
// Sources:
//   - adcb-365-cc-benefits-update-en.pdf  (Ver.01/April2026, effective July 1, 2026)
//   - adcb-365-cashback-card-tnc-en.pdf   (Ver.03/September2023 — MCC list)
//   - adcb-essential-tnc-en.pdf           (Ver.01/November2024)
//   - adcb-tnc-touchpoints-credit-card.pdf (confirms lounge for Infinite/Platinum/Titanium, not Essential)
//   - mastercard platinum lounge benefits.pdf (confirms 4 visits/year for UAE Platinum MC)
//
// 365 Cashback changes (effective July 1, 2026 per benefits-update PDF):
//   fuel:          3% → 5%
//   groceries:     5% → 3%
//   utilities:     3% → 0.5%
//   education:     1% → 0.5% (select categories tier)
//   government:    1% → 0.5% (select categories tier)
//   insurance:     1% → 0.5% (select categories tier)
//   rent:          1% → 0.5% (select categories tier)
//   entertainment: 1% → 5% (streaming + AI subs only; general entertainment still 1%)
//   international: 1% → 1% unchanged; EU = 0.5% (noted but not modelled separately)
//   dining:        6% → 6% unchanged (MCCs confirmed: 5811,5812,5813,5814)
//
// Essential Cashback confirmed:
//   - 1% cashback: min AED 1,000/month retail spend
//   - Movie cashback: AED 70 max on 2 tickets at any UAE theater, requires AED 1,500/month
//   - Lounge: 4 visits/year via Mastercard Platinum Travel Pass (network benefit, not ADCB card-specific)

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

const C365_ID = '503dc10e-8bbf-4727-9312-14bbf68a9900';
const ESS_ID  = '049d2750-c50d-4c1f-a44e-ed83f0af78bc';
const TODAY   = '2026-06-13';
const SRC_365 = 'https://www.adcb.com/en/personal/cards/credit-cards/365-cashback-credit-card/';
const SRC_ESS = 'https://www.adcb.com/en/personal/cards/credit-cards/essential-cashback-credit-card/';

const CAT = {
  dining:        'b7938d64-7ff6-4f84-9b0d-c35010e5fa58',
  groceries:     '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:          'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  airlines:      'c418c3e6-9403-4ce6-8647-ed52782a59eb',
  entertainment: 'dd8d714c-1e5a-4db5-91d4-fba3756ed77c',
  utilities:     '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:     '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  insurance:     'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  government:    'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  rent:          'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  international: '98c97cac-1b7d-48dc-a661-476c7baeb9af',
};

const UPDATES_365 = [
  {
    cat: CAT.fuel, rate: 5,
    notes: '5% cashback on fuel & Salik (MCCs 5541,5542,5983 fuel; 4784 Salik toll). RATE CHANGED July 1, 2026 (was 3%). Source: adcb-365-cc-benefits-update-en.pdf. Min AED 5,000/month total spend; max AED 1,000/month total cashback.',
  },
  {
    cat: CAT.groceries, rate: 3,
    notes: '3% cashback on supermarkets (MCC 5411). RATE CHANGED July 1, 2026 (was 5%). Source: adcb-365-cc-benefits-update-en.pdf. Min AED 5,000/month; max AED 1,000/month total cashback.',
  },
  {
    cat: CAT.utilities, rate: 0.5,
    notes: '0.5% cashback on utilities (MCC 4900) + telecom (MCC 4814). RATE CHANGED July 1, 2026 (was 3%). Source: adcb-365-cc-benefits-update-en.pdf. Eligible: payments direct at DEWA/du/Etisalat websites, ADCB PIB/Mobile/IVR, or Dubai Now app only.',
  },
  {
    cat: CAT.education, rate: 0.5,
    notes: '0.5% cashback on education. Select spend categories restricted tier per adcb-365-cc-benefits-update-en.pdf (effective July 1, 2026; was 1%). Restricted tier includes: Utilities, Charity, Government, Telecom, Transport, Auto dealers, Education, Insurance, Real Estate & Housing Rentals.',
  },
  {
    cat: CAT.government, rate: 0.5,
    notes: '0.5% cashback on government payments. Select spend categories restricted tier per adcb-365-cc-benefits-update-en.pdf (effective July 1, 2026; was 1%).',
  },
  {
    cat: CAT.insurance, rate: 0.5,
    notes: '0.5% cashback on insurance. Select spend categories restricted tier per adcb-365-cc-benefits-update-en.pdf (effective July 1, 2026; was 1%).',
  },
  {
    cat: CAT.rent, rate: 0.5,
    notes: '0.5% cashback on real estate & housing rentals. Select spend categories restricted tier per adcb-365-cc-benefits-update-en.pdf (effective July 1, 2026; was 1%).',
  },
  {
    cat: CAT.entertainment, rate: 5,
    notes: '5% cashback on Home Digital Entertainment & AI App Subscriptions effective July 1, 2026 (was 1%). Eligible: Netflix, Amazon Prime Video, Disney+, Apple TV+, Google Play Movies & TV, Starzplay, OSN+, Shahid, beIN Connect, Istikana, Anghami Video, WATCH iT!, ChatGPT, Microsoft Copilot, Google Gemini, Claude, Perplexity. General entertainment (cinema, theme parks, events) earns at 1% general rate. Source: adcb-365-cc-benefits-update-en.pdf.',
  },
  {
    cat: CAT.international, rate: 1,
    notes: '1% cashback on all international (non-AED / merchant outside UAE) spend. Unchanged. EU spend earns 0.5% effective July 1, 2026 (adcb-365-cc-benefits-update-en.pdf) — non-EU international remains 1%. Source: adcb-365-cashback-card-tnc-en.pdf.',
  },
  {
    cat: CAT.dining, rate: 6,
    notes: '6% cashback on dining & online food orders from UAE restaurants (MCCs 5811, 5812, 5813, 5814). Unchanged effective July 1, 2026. Online food delivery (Talabat, Deliveroo) included if merchant classified under restaurant MCCs. Min AED 5,000/month; max AED 1,000/month total cashback. Source: adcb-365-cashback-card-tnc-en.pdf + adcb-365-cc-benefits-update-en.pdf.',
  },
];

async function run() {
  // 1. Update 365 card_rewards
  console.log('=== ADCB 365 Cashback — updating card_rewards ===');
  for (const u of UPDATES_365) {
    const r = await sb.from('card_rewards').update({
      earn_rate: u.rate,
      effective_return_pct: u.rate,
      notes: u.notes,
      source_url: SRC_365,
      last_verified_date: TODAY,
    }).eq('card_id', C365_ID).eq('category_id', u.cat);
    console.log('  ' + u.cat.substring(0, 8) + '...: ' + (r.error ? 'ERR: ' + r.error.message : 'OK ' + u.rate + '%'));
  }

  // 2. Update Essential cinema benefit
  console.log('\n=== ADCB Essential — updating cinema benefit ===');
  const { data: cinBen } = await sb.from('card_benefits')
    .select('id').eq('card_id', ESS_ID).eq('benefit_type', 'cinema').single();
  if (cinBen) {
    const r = await sb.from('card_benefits').update({
      title: 'Movie ticket cashback — up to AED 70/month',
      description: 'Cashback on purchase of 2 movie tickets at any movie theater in the UAE. Maximum cashback AED 70 per month (actual ticket price only). Requires minimum AED 1,500 total retail spend in the billing month. Credited monthly to card account. Source: adcb-essential-tnc-en.pdf (Ver.01/November2024) clause 3.',
      conditions: 'Min AED 1,500/month retail spend required. Valid at any UAE movie theater. Cashback capped at actual price up to AED 70 total for 2 tickets. Excludes Balance Transfer, Cash Advance, Finance Charges, ADCB charges.',
      usage_limit: 2,
      usage_period: 'monthly',
      is_active: true,
    }).eq('id', cinBen.id);
    console.log('  cinema benefit: ' + (r.error ? 'ERR: ' + r.error.message : 'OK — AED 70 cap + AED 1,500 spend req confirmed'));
  }

  // 3. Update Essential lounge benefit — clarify Mastercard network source
  console.log('\n=== ADCB Essential — updating lounge benefit ===');
  const { data: lngBen } = await sb.from('card_benefits')
    .select('id').eq('card_id', ESS_ID).eq('benefit_type', 'lounge_access').single();
  if (lngBen) {
    const r = await sb.from('card_benefits').update({
      title: 'Airport lounge access — Mastercard Platinum Travel Pass (4/year)',
      description: '4 complimentary airport lounge visits/year via Mastercard Travel Pass app (DragonPass network, 20+ lounges worldwide). This is a Mastercard Platinum network benefit — the Essential TNC does not reference this; it applies because the Essential is a Mastercard Platinum card (same as FAB Z Card). Activation: make 1 international purchase >= USD 1 to unlock access for next 3 calendar months; repeat quarterly to maintain. Without intl purchase: 1 free visit/year then paused. Guest fee: USD 32/visit.',
      conditions: 'Requires 1 international purchase >= USD 1 per quarter to maintain full access. Without: 1 free visit/year only. Register card on Mastercard Travel Pass app. Each cardholder (primary + supplementary) must register separately with own QR code.',
      usage_limit: 4,
      usage_period: 'yearly',
      is_active: true,
    }).eq('id', lngBen.id);
    console.log('  lounge benefit: ' + (r.error ? 'ERR: ' + r.error.message : 'OK — Mastercard Platinum source + activation conditions added'));
  }

  // 4. Verify final 365 rates
  console.log('\n=== FINAL STATE — 365 Cashback ===');
  const { data: cats } = await sb.from('spending_categories').select('id,slug');
  const catMap = {};
  cats.forEach(c => catMap[c.id] = c.slug);
  const { data: r365 } = await sb.from('card_rewards').select('category_id,earn_rate,effective_return_pct').eq('card_id', C365_ID);
  r365.sort((a, b) => (catMap[a.category_id] || '').localeCompare(catMap[b.category_id] || ''));
  r365.forEach(r => console.log('  ' + catMap[r.category_id] + ': ' + r.earn_rate + '%'));
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });

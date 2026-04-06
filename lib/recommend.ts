import { supabase, RewardRanked, Offer } from "./supabase";

// Explicit column list for rewards_ranked queries.
// Using select("*") on a view with cr.* wildcard expansion can silently omit
// columns (monthly_cap_spend_aed, monthly_cap_reward) in some PostgREST versions.
const REWARD_COLS =
  "id, card_id, category_id, reward_type, earn_rate, earn_unit, earn_per_x_aed, " +
  "effective_return_pct, monthly_cap_spend_aed, monthly_cap_reward, " +
  "min_txn_amount_aed, min_monthly_spend_aed, is_promotional, promo_end_date, " +
  "exclusions, source_url, last_verified_date, notes, is_active, " +
  "card_name, card_image, annual_fee_aed, forex_markup_pct, " +
  "bank_id, bank_name, bank_short_name, category_name, category_slug, category_icon";

// ---------------------------------------------------------------------------
// Core fallback engine
// Priority: specific category row → general category row → base_earn_rate
// (base_earn_rate only for cashback_pct cards; points/miles cards skipped if
//  neither a specific nor a general row exists — never guess from cards table)
// ---------------------------------------------------------------------------

async function fetchWithFallback(
  cardIds: string[] | null,
  categorySlug: string
): Promise<RewardRanked[]> {
  function rewardsQuery(slug: string) {
    let q = supabase
      .from("rewards_ranked")
      .select(REWARD_COLS as string)
      .eq("category_slug", slug)
      .eq("is_active", true);
    if (cardIds && cardIds.length > 0) q = q.in("card_id", cardIds);
    return q;
  }

  // Step 1 + 2 in parallel: specific category + general category
  const [specificRes, generalRes] = await Promise.all([
    rewardsQuery(categorySlug),
    categorySlug !== "general"
      ? rewardsQuery("general")
      : Promise.resolve({ data: [] as RewardRanked[] }),
  ]);

  const specific = (specificRes.data ?? []) as unknown as RewardRanked[];
  const general = (generalRes.data ?? []) as unknown as RewardRanked[];

  const coveredIds = new Set(specific.map((r) => r.card_id));
  const results: RewardRanked[] = [...specific];

  // Apply general-row fallback for cards not covered by a specific row
  for (const g of general) {
    if (!coveredIds.has(g.card_id)) {
      results.push({ ...g, is_general_fallback: true });
      coveredIds.add(g.card_id);
    }
  }

  // Step 3: base_earn_rate safety net — ONLY for cashback_pct cards with no
  // specific or general row. Points/miles cards are excluded rather than guessed.
  if (categorySlug !== "general") {
    const uncoveredIds = cardIds
      ? cardIds.filter((id) => !coveredIds.has(id))
      : null; // null = "all cards" — fetch all cashback_pct cards

    let baseQuery = supabase
      .from("cards_with_bank")
      .select(
        "id, name, bank_id, bank_name, bank_short_name, annual_fee_aed, forex_markup_pct, base_earn_rate, source_url"
      )
      .eq("base_earn_unit", "cashback_pct") // only safe to use directly
      .not("base_earn_rate", "is", null);

    if (uncoveredIds && uncoveredIds.length > 0) {
      baseQuery = baseQuery.in("id", uncoveredIds);
    } else if (uncoveredIds && uncoveredIds.length === 0) {
      // Nothing uncovered — skip the query entirely
      return results;
    }

    const { data: baseCards } = await baseQuery;

    for (const card of baseCards ?? []) {
      if (coveredIds.has(card.id)) continue;

      // base_earn_rate IS the cashback percentage — use directly, no arithmetic
      results.push({
        id: `base-${card.id}`,
        card_id: card.id,
        category_id: "",
        reward_type: "cashback",
        earn_rate: card.base_earn_rate,
        earn_unit: "cashback_pct",
        earn_per_x_aed: null,
        effective_return_pct: card.base_earn_rate,
        monthly_cap_spend_aed: null,
        monthly_cap_reward: null,
        min_txn_amount_aed: null,
        min_monthly_spend_aed: null,
        is_promotional: false,
        promo_end_date: null,
        exclusions: null,
        source_url: card.source_url,
        last_verified_date: null,
        notes: null,
        is_active: true,
        card_name: card.name,
        card_image: null,
        annual_fee_aed: card.annual_fee_aed ?? 0,
        forex_markup_pct: card.forex_markup_pct,
        bank_id: card.bank_id,
        bank_name: card.bank_name,
        bank_short_name: card.bank_short_name,
        category_name: "General",
        category_slug: "general",
        category_icon: "💳",
        is_base_rate_fallback: true,
      } as RewardRanked);

      coveredIds.add(card.id);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Shared cap-respecting reward calculator (exported for use in components)
// ---------------------------------------------------------------------------

export function computeMonthlyReward(
  monthlySpend: number,
  effectiveReturnPct: number,
  monthlyCapSpend: number | null,
  monthlyCapReward: number | null
): number {
  if (monthlySpend <= 0 || effectiveReturnPct <= 0) return 0;
  const effectiveSpend =
    monthlyCapSpend != null ? Math.min(monthlySpend, monthlyCapSpend) : monthlySpend;
  const raw = (effectiveSpend * effectiveReturnPct) / 100;
  return monthlyCapReward != null ? Math.min(raw, monthlyCapReward) : raw;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getBestCards(
  userCardIds: string[] | null,
  categorySlug: string,
  merchantName?: string
): Promise<RewardRanked[]> {
  const results = await fetchWithFallback(userCardIds, categorySlug);

  // Sort: international sorts by net return, everything else by effective rate
  if (categorySlug === "international") {
    results.forEach((r) => {
      r.net_return_pct = r.effective_return_pct - (r.forex_markup_pct ?? 0);
    });
    results.sort((a, b) => (b.net_return_pct ?? 0) - (a.net_return_pct ?? 0));
  } else {
    results.sort((a, b) => b.effective_return_pct - a.effective_return_pct);
  }

  // Attach active offers
  const today = new Date().toISOString().split("T")[0];
  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .gte("end_date", today);

  const activeOffers: Offer[] = offers ?? [];
  results.forEach((r) => {
    r.active_offers = activeOffers.filter((o) => {
      const cardMatch = o.card_id === r.card_id || o.bank_id === r.bank_id;
      const merchantMatch =
        !merchantName ||
        o.merchant_name?.toLowerCase().includes(merchantName.toLowerCase());
      return cardMatch && merchantMatch;
    });
  });

  return results;
}

// Best card from a given set of card IDs for a category (wallet summary use)
export async function getBestCardForCategory(
  cardIds: string[],
  categorySlug: string
): Promise<RewardRanked | null> {
  if (cardIds.length === 0) return null;
  const results = await fetchWithFallback(cardIds, categorySlug);
  if (results.length === 0) return null;
  results.sort((a, b) => b.effective_return_pct - a.effective_return_pct);
  return results[0] ?? null;
}

// All wallet cards for a category, sorted best-first (cap-aware overflow use)
export async function getAllCardsForCategory(
  cardIds: string[],
  categorySlug: string
): Promise<RewardRanked[]> {
  if (cardIds.length === 0) return [];
  const results = await fetchWithFallback(cardIds, categorySlug);
  results.sort((a, b) => b.effective_return_pct - a.effective_return_pct);
  return results;
}

// Best card in the whole market for a category (gap analysis market side)
export async function getBestMarketRateForCategory(
  categorySlug: string
): Promise<{
  effective_return_pct: number;
  card_name: string;
  bank_short_name: string;
  monthly_cap_spend_aed: number | null;
  monthly_cap_reward: number | null;
} | null> {
  const results = await fetchWithFallback(null, categorySlug);
  if (results.length === 0) return null;
  results.sort((a, b) => b.effective_return_pct - a.effective_return_pct);
  const top = results[0]!;
  return {
    effective_return_pct: top.effective_return_pct,
    card_name: top.card_name,
    bank_short_name: top.bank_short_name,
    monthly_cap_spend_aed: top.monthly_cap_spend_aed ?? null,
    monthly_cap_reward: top.monthly_cap_reward ?? null,
  };
}

// ---------------------------------------------------------------------------
// Market-optimal portfolio reward (used to compute gap in Path A)
// Runs the same greedy as Path B against the full card market so the
// gap number is exactly what Path B would show with unconstrained card count.
// ---------------------------------------------------------------------------

interface SimpleCardReward {
  rate: number;
  cap_spend: number | null;
  cap_reward: number | null;
}
interface SimpleCard {
  card_id: string;
  rewards: Record<string, SimpleCardReward>;
}

function simpleEffectiveMonthly(
  card: SimpleCard,
  catSlug: string,
  spend: number
): number {
  const r = card.rewards[catSlug] ?? card.rewards["general"];
  if (!r || spend <= 0) return 0;
  return computeMonthlyReward(spend, r.rate, r.cap_spend, r.cap_reward);
}

function simpleRawTotal(
  cards: SimpleCard[],
  profile: Record<string, number>,
  slugs: string[]
): number {
  let total = 0;
  for (const slug of slugs) {
    const spend = profile[slug] ?? 0;
    if (!spend) continue;
    let best = 0;
    for (const card of cards) {
      best = Math.max(best, simpleEffectiveMonthly(card, slug, spend));
    }
    total += best;
  }
  return total;
}

function simpleGreedy(
  pool: SimpleCard[],
  profile: Record<string, number>,
  slugs: string[],
  maxCards: number
): SimpleCard[] {
  const selected: SimpleCard[] = [];
  while (selected.length < maxCards) {
    const current = simpleRawTotal(selected, profile, slugs);
    let bestMarginal = 0;
    let bestCard: SimpleCard | null = null;
    for (const card of pool) {
      if (selected.some((s) => s.card_id === card.card_id)) continue;
      const marginal = simpleRawTotal([...selected, card], profile, slugs) - current;
      if (marginal > bestMarginal) {
        bestMarginal = marginal;
        bestCard = card;
      }
    }
    if (!bestCard) break;
    selected.push(bestCard);
  }
  return selected;
}

/**
 * Returns the total monthly reward achievable by an unconstrained optimal
 * portfolio from the full card market, given a spending profile.
 * Uses the same rewards_ranked data source and greedy logic as Path B so
 * the number is directly comparable to what Path B would show.
 *
 * maxCards: how many cards the portfolio is allowed to hold (default: unlimited
 * — use a large number so we don't under-estimate the market ceiling)
 */
export async function getMarketOptimalMonthlyReward(
  profile: Record<string, number>,
  activeSlugs: string[],
  maxCards = 20
): Promise<number> {
  if (activeSlugs.length === 0) return 0;

  const { data: rows } = await supabase
    .from("rewards_ranked")
    .select("card_id, category_slug, effective_return_pct, monthly_cap_spend_aed, monthly_cap_reward")
    .in("category_slug", [...activeSlugs, "general"])
    .eq("is_active", true);

  if (!rows || rows.length === 0) return 0;

  // Build simple card matrix (same pattern as Path B)
  const cardMap = new Map<string, SimpleCard>();
  for (const r of rows) {
    if (!cardMap.has(r.card_id)) {
      cardMap.set(r.card_id, { card_id: r.card_id, rewards: {} });
    }
    const card = cardMap.get(r.card_id)!;
    if (!card.rewards[r.category_slug]) {
      card.rewards[r.category_slug] = {
        rate: r.effective_return_pct,
        cap_spend: r.monthly_cap_spend_aed ?? null,
        cap_reward: r.monthly_cap_reward ?? null,
      };
    }
  }

  const pool = Array.from(cardMap.values());
  const selected = simpleGreedy(pool, profile, activeSlugs, maxCards);
  return simpleRawTotal(selected, profile, activeSlugs);
}

export async function getPopularMerchants() {
  const { data } = await supabase
    .from("merchants")
    .select("*, category:spending_categories(*)")
    .eq("is_popular", true)
    .order("sort_order", { ascending: true })
    .limit(12);
  return data ?? [];
}

export async function searchMerchants(query: string) {
  if (!query || query.length < 2) return [];
  const trimmed = query.trim();

  // Primary: substring match on merchant name
  const { data: primary } = await supabase
    .from("merchants")
    .select("*, category:spending_categories(*)")
    .ilike("name", `%${trimmed}%`)
    .limit(8);

  const results = [...(primary ?? [])];

  // Fuzzy word-split fallback: if the query has multiple words and we have
  // fewer than 4 results, also match any merchant whose name contains ANY
  // individual word from the query (e.g. "Mall of Emirates" → also matches
  // merchants containing "Mall", "Emirates", etc.)
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 3);
  if (results.length < 4 && words.length > 1) {
    const orFilter = words.map((w) => `name.ilike.%${w}%`).join(",");
    const { data: fuzzy } = await supabase
      .from("merchants")
      .select("*, category:spending_categories(*)")
      .or(orFilter)
      .limit(8);

    const seen = new Set(results.map((r) => r.id));
    for (const m of fuzzy ?? []) {
      if (!seen.has(m.id) && results.length < 8) {
        results.push(m);
        seen.add(m.id);
      }
    }
  }

  return results;
}

// Search spending categories by name or description — used as a fallback
// when no specific merchant is found (Option 3).
export async function searchCategories(query: string) {
  if (!query || query.length < 2) return [];
  const trimmed = query.trim();
  const { data } = await supabase
    .from("spending_categories")
    .select("*")
    .or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
    .order("sort_order")
    .limit(4);
  return data ?? [];
}

export async function getCategories() {
  const { data } = await supabase
    .from("spending_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getBestRateForCategory(categorySlug: string) {
  // Used on homepage category grid — uses fallback for accuracy
  const best = await getBestMarketRateForCategory(categorySlug);
  return best;
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, SpendingCategory } from "@/lib/supabase";
import { computeMonthlyReward } from "@/lib/recommend";
import {
  getSpendingProfile,
  getRecommendPreferences,
  type SpendingProfile,
  type RecommendPreferences,
  SALARY_TIER_CEILING,
  LOYALTY_CURRENCY_MATCH,
  LOYALTY_WEIGHT,
} from "@/lib/wallet";

// ── Types ──────────────────────────────────────────────────────────────────

interface CardData {
  card_id: string;
  card_name: string;
  bank_id: string;
  bank_short_name: string;
  annual_fee_aed: number;
  annual_fee_waiver_spend: number | null;
  min_salary_aed: number | null;
  reward_currency_name: string | null;
  rewards: Record<string, { rate: number; cap_spend: number | null; cap_reward: number | null }>;
}

interface Assignment {
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  cardId: string;
  cardName: string;
  monthlyReward: number;
  rate: number;
}

interface CardBreakdown {
  card: CardData;
  assignments: Assignment[];
  annualReward: number;
  welcomeBonus: number;
  welcomeBonusTitle: string | null;
}

interface Strategy {
  label: string;
  cardBreakdowns: CardBreakdown[];
  totalAnnualRewards: number;
  totalAnnualFees: number;
  totalWelcomeBonus: number;
  netFirstYearValue: number;
  netOngoingValue: number;
}

const WIO_CARD_ID = "eef85749-a7da-4975-82fe-eae4f5bcae53";

// ── Loyalty weighting helpers ──────────────────────────────────────────────

function loyaltyMultiplier(
  card: CardData,
  prefs: RecommendPreferences
): number {
  if (prefs.loyaltyStatus.length === 0 || !card.reward_currency_name) return 1;
  let maxWeight = 1;
  for (const status of prefs.loyaltyStatus) {
    const matchCurrencies = LOYALTY_CURRENCY_MATCH[status];
    if (matchCurrencies.some((c) => card.reward_currency_name!.includes(c))) {
      maxWeight = Math.max(maxWeight, LOYALTY_WEIGHT[status]);
    }
  }
  return maxWeight;
}

// ── Greedy algorithm ───────────────────────────────────────────────────────

function effectiveMonthly(
  card: CardData,
  catSlug: string,
  spend: number
): number {
  const r = card.rewards[catSlug] ?? card.rewards["general"];
  if (!r || spend <= 0) return 0;
  return computeMonthlyReward(spend, r.rate, r.cap_spend, r.cap_reward);
}

/** Loyalty-weighted total used only during greedy card selection */
function weightedMonthlyReward(
  cards: CardData[],
  profile: SpendingProfile,
  categories: SpendingCategory[],
  prefs: RecommendPreferences
): number {
  let total = 0;
  for (const cat of categories) {
    const spend = profile[cat.slug] ?? 0;
    if (!spend) continue;
    let best = 0;
    for (const card of cards) {
      const raw = effectiveMonthly(card, cat.slug, spend);
      const weighted = raw * loyaltyMultiplier(card, prefs);
      best = Math.max(best, weighted);
    }
    total += best;
  }
  return total;
}

/** Unweighted total for display (actual AED value, not boosted) */
function rawMonthlyReward(
  cards: CardData[],
  profile: SpendingProfile,
  categories: SpendingCategory[]
): number {
  let total = 0;
  for (const cat of categories) {
    const spend = profile[cat.slug] ?? 0;
    if (!spend) continue;
    let best = 0;
    for (const card of cards) {
      best = Math.max(best, effectiveMonthly(card, cat.slug, spend));
    }
    total += best;
  }
  return total;
}

function greedy(
  pool: CardData[],
  profile: SpendingProfile,
  categories: SpendingCategory[],
  maxCards: number,
  prefs: RecommendPreferences,
  excludeIds: Set<string> = new Set()
): CardData[] {
  const available = pool.filter((c) => !excludeIds.has(c.card_id));
  const selected: CardData[] = [];

  while (selected.length < maxCards) {
    const currentWeighted = weightedMonthlyReward(selected, profile, categories, prefs);
    let bestMarginal = 0;
    let bestCard: CardData | null = null;

    for (const card of available) {
      if (selected.some((s) => s.card_id === card.card_id)) continue;
      const marginal =
        weightedMonthlyReward([...selected, card], profile, categories, prefs) - currentWeighted;
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

function buildStrategy(
  cards: CardData[],
  profile: SpendingProfile,
  categories: SpendingCategory[],
  totalAnnualSpend: number,
  welcomeMap: Map<string, { value: number; title: string }>,
  label: string
): Strategy {
  // Per-category: best card assignment (raw, unweighted — for display)
  const assignments = new Map<string, { card: CardData; monthly: number; rate: number }>();
  for (const cat of categories) {
    const spend = profile[cat.slug] ?? 0;
    if (!spend) continue;
    let best = 0;
    let bestCard: CardData | null = null;
    let bestRate = 0;
    for (const card of cards) {
      const monthly = effectiveMonthly(card, cat.slug, spend);
      if (monthly > best) {
        best = monthly;
        bestCard = card;
        const r = card.rewards[cat.slug] ?? card.rewards["general"];
        bestRate = r?.rate ?? 0;
      }
    }
    if (bestCard && best > 0) assignments.set(cat.slug, { card: bestCard, monthly: best, rate: bestRate });
  }

  const cardBreakdowns: CardBreakdown[] = cards.map((card) => {
    const cardAssignments: Assignment[] = [];
    let annualReward = 0;
    for (const cat of categories) {
      const a = assignments.get(cat.slug);
      if (a?.card.card_id === card.card_id) {
        annualReward += a.monthly * 12;
        cardAssignments.push({
          categorySlug: cat.slug,
          categoryName: cat.name,
          categoryIcon: cat.icon ?? "💳",
          cardId: card.card_id,
          cardName: card.card_name,
          monthlyReward: a.monthly,
          rate: a.rate,
        });
      }
    }
    const wb = welcomeMap.get(card.card_id);
    return { card, assignments: cardAssignments, annualReward, welcomeBonus: wb?.value ?? 0, welcomeBonusTitle: wb?.title ?? null };
  });

  const totalAnnualRewards = cardBreakdowns.reduce((s, c) => s + c.annualReward, 0);
  const totalAnnualFees = cards.reduce((s, c) => {
    const waived = c.annual_fee_waiver_spend != null && totalAnnualSpend >= c.annual_fee_waiver_spend;
    return s + (waived ? 0 : c.annual_fee_aed);
  }, 0);
  const totalWelcomeBonus = cardBreakdowns.reduce((s, c) => s + c.welcomeBonus, 0);

  return {
    label,
    cardBreakdowns,
    totalAnnualRewards,
    totalAnnualFees,
    totalWelcomeBonus,
    netFirstYearValue: totalAnnualRewards + totalWelcomeBonus - totalAnnualFees,
    netOngoingValue: totalAnnualRewards - totalAnnualFees,
  };
}

/**
 * Generates a short display label from a card_rewards.notes field.
 * Takes everything before the first period; truncates to ≤60 chars at a
 * word boundary. Migration B uses client-side truncation; a future migration
 * will add a dedicated display_label column to card_rewards.
 */
function shortLabelFromNotes(notes: string): string {
  if (!notes) return "Welcome bonus";
  const firstSentence = notes.split(".")[0]?.trim() ?? notes;
  if (firstSentence.length <= 80) return firstSentence;
  const truncated = firstSentence.slice(0, 80);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Joins multiple welcome bonus row titles into a single display string.
 * 1 title → as-is. 2–3 → " + " joined (capped at 120 chars). 4+ → generic.
 */
function combineMultiPartTitle(titles: string[]): string {
  if (titles.length === 0) return "Welcome bonus";
  if (titles.length === 1) return titles[0];
  if (titles.length >= 4) return `Welcome bonus (${titles.length} parts)`;
  const joined = titles.join(" + ");
  if (joined.length <= 120) return joined;
  const truncated = joined.slice(0, 120);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  categories: SpendingCategory[];
}

export default function RecommendResultsClient({ categories }: Props) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<SpendingProfile>({});
  const [prefs, setPrefs] = useState<RecommendPreferences>({
    maxCards: 3, benefits: [], bankIds: [], salaryTier: "mid", loyaltyStatus: [], pinnedCardIds: [],
  });
  const [expanded, setExpanded] = useState<number | null>(0);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const p = getSpendingProfile();
    const r = getRecommendPreferences();
    setProfile(p);
    setPrefs(r);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!Object.values(profile).some((v) => v > 0)) return;
    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  async function compute() {
    setLoading(true);
    setNoResults(false);

    const activeCategories = categories.filter((c) => (profile[c.slug] ?? 0) > 0);
    const totalAnnualSpend = Object.values(profile).reduce((s, v) => s + (v ?? 0), 0) * 12;
    const salaryCeiling = SALARY_TIER_CEILING[prefs.salaryTier];

    // Fetch reward data + card metadata (including min_salary_aed + reward_currency_name)
    const [rewardsRes, cardsRes] = await Promise.all([
      supabase
        .from("rewards_ranked")
        .select(
          "card_id, card_name, bank_id, bank_short_name, annual_fee_aed, category_slug, effective_return_pct, monthly_cap_spend_aed, monthly_cap_reward"
        )
        .eq("is_active", true)
        .eq("reward_event_type", "ongoing"),
      supabase
        .from("cards_with_bank")
        .select("id, bank_id, annual_fee_aed, annual_fee_waiver_spend, min_salary_aed, reward_currency_name")
        .eq("is_active", true),
    ]);

    const allRewards = rewardsRes.data ?? [];
    const cardsMeta = cardsRes.data ?? [];
    const metaMap = new Map(
      cardsMeta.map((c) => [c.id, {
        waiver: c.annual_fee_waiver_spend as number | null,
        bankId: c.bank_id as string,
        minSalary: c.min_salary_aed as number | null,
        rewardCurrency: c.reward_currency_name as string | null,
      }])
    );

    // Build card-rewards matrix
    const cardMap = new Map<string, CardData>();
    for (const r of allRewards) {
      if (!cardMap.has(r.card_id)) {
        const meta = metaMap.get(r.card_id);
        cardMap.set(r.card_id, {
          card_id: r.card_id,
          card_name: r.card_name,
          bank_id: r.bank_id ?? meta?.bankId ?? "",
          bank_short_name: r.bank_short_name,
          annual_fee_aed: r.annual_fee_aed ?? 0,
          annual_fee_waiver_spend: meta?.waiver ?? null,
          min_salary_aed: meta?.minSalary ?? null,
          reward_currency_name: meta?.rewardCurrency ?? null,
          rewards: {},
        });
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

    let allCards = Array.from(cardMap.values());

    // ── Hard filter: salary ceiling ────────────────────────────────────────
    allCards = allCards.filter(
      (c) => c.min_salary_aed == null || c.min_salary_aed <= salaryCeiling
    );

    // ── Hard filter: bank preference ──────────────────────────────────────
    if (prefs.bankIds.length > 0) {
      allCards = allCards.filter((c) => prefs.bankIds.includes(c.bank_id));
    }

    // ── Hard filter: required benefits ────────────────────────────────────
    if (prefs.benefits.length > 0) {
      const { data: benefitsData } = await supabase
        .from("card_benefits")
        .select("card_id, benefit_type")
        .eq("is_active", true);
      const cardBenefitTypes = new Map<string, Set<string>>();
      for (const b of benefitsData ?? []) {
        if (!cardBenefitTypes.has(b.card_id)) cardBenefitTypes.set(b.card_id, new Set());
        cardBenefitTypes.get(b.card_id)!.add(b.benefit_type);
      }
      allCards = allCards.filter((c) => {
        const types = cardBenefitTypes.get(c.card_id) ?? new Set();
        return prefs.benefits.some((b) => types.has(b));
      });
    }

    if (allCards.length === 0) {
      setNoResults(true);
      setLoading(false);
      return;
    }

    // ── Fetch welcome bonuses (Migration B: now sourced from card_rewards) ──
    const cardIds = allCards.map((c) => c.card_id);
    const today = new Date().toISOString().split("T")[0];

    type WelcomeRow = {
      card_id: string;
      absolute_value_aed: number | null;
      notes: string | null;
      display_label: string | null;
      reward_event_type: string;
      promo_end_date: string | null;
      created_at: string | null;
    };

    const { data: welcomeData } = await supabase
      .from("card_rewards")
      .select("card_id, absolute_value_aed, notes, display_label, reward_event_type, promo_end_date, created_at")
      .in("reward_event_type", ["welcome_bonus", "limited_promo"])
      .eq("is_active", true)
      .in("card_id", cardIds);

    // Drop expired limited_promo rows client-side
    const activeWelcomeRows = ((welcomeData ?? []) as WelcomeRow[]).filter((w) =>
      w.reward_event_type === "welcome_bonus" ||
      (w.reward_event_type === "limited_promo" &&
        w.promo_end_date != null &&
        w.promo_end_date > today)
    );

    // Group rows by card, sort deterministically, then sum + concatenate titles
    const rowsByCard = new Map<string, WelcomeRow[]>();
    for (const w of activeWelcomeRows) {
      const arr = rowsByCard.get(w.card_id) ?? [];
      arr.push(w);
      rowsByCard.set(w.card_id, arr);
    }

    const welcomeMap = new Map<string, { value: number; title: string }>();
    for (const [cardId, rows] of rowsByCard.entries()) {
      rows.sort((a, b) => {
        const valDiff = (b.absolute_value_aed ?? 0) - (a.absolute_value_aed ?? 0);
        if (valDiff !== 0) return valDiff;
        const dateA = a.created_at ?? "";
        const dateB = b.created_at ?? "";
        if (dateA !== dateB) return dateA.localeCompare(dateB); // oldest first
        return (a.notes ?? "").localeCompare(b.notes ?? "");
      });
      const totalValue = rows.reduce((sum, r) => sum + (r.absolute_value_aed ?? 0), 0);
      const titles = rows.map((r) => r.display_label ?? shortLabelFromNotes(r.notes ?? ""));
      welcomeMap.set(cardId, { value: totalValue, title: combineMultiPartTitle(titles) });
    }

    const freeCards = allCards.filter((c) => c.annual_fee_aed === 0);

    // ── Pinned cards: always included, reduce remaining greedy slots ───────
    const pinnedIds = new Set(prefs.pinnedCardIds ?? []);
    const pinnedCards = allCards.filter((c) => pinnedIds.has(c.card_id));
    // Cards not in the pinned set, available for greedy to fill remaining slots
    const unpinnedPool = allCards.filter((c) => !pinnedIds.has(c.card_id));
    const remainingSlots = Math.max(0, prefs.maxCards - pinnedCards.length);

    function greedyWithPinned(pool: CardData[], slots: number, excludeIds: Set<string> = new Set()): CardData[] {
      return [...pinnedCards, ...greedy(pool, profile, activeCategories, slots, prefs, new Set([...excludeIds, ...pinnedIds]))];
    }

    // ── Three greedy strategies (loyalty-weighted selection) ───────────────
    const combo1 = greedyWithPinned(unpinnedPool, remainingSlots);
    const combo2 = greedyWithPinned(
      unpinnedPool, remainingSlots,
      new Set(combo1.filter((c) => !pinnedIds.has(c.card_id)).slice(0, 1).map((c) => c.card_id))
    );
    const freeUnpinned = unpinnedPool.filter((c) => c.annual_fee_aed === 0);
    const combo3 =
      freeUnpinned.length >= 1 || pinnedCards.length > 0
        ? greedyWithPinned(freeUnpinned, remainingSlots)
        : greedyWithPinned(unpinnedPool, Math.max(0, remainingSlots - 1));

    const pinnedLabel = pinnedCards.length > 0 ? ` (${pinnedCards.map((c) => c.card_name).join(", ")} locked in)` : "";

    const strats: Strategy[] = [
      buildStrategy(combo1, profile, activeCategories, totalAnnualSpend, welcomeMap, `Optimal portfolio${pinnedLabel}`),
      buildStrategy(combo2, profile, activeCategories, totalAnnualSpend, welcomeMap, `Alternative portfolio${pinnedLabel}`),
      buildStrategy(
        combo3, profile, activeCategories, totalAnnualSpend, welcomeMap,
        freeCards.length >= 1 || pinnedCards.length > 0
          ? `No annual fee portfolio${pinnedLabel}`
          : `${Math.max(1, prefs.maxCards - 1)}-card portfolio${pinnedLabel}`
      ),
    ]
      .filter((s) => s.netOngoingValue > 0 && s.cardBreakdowns.length > 0)
      .filter(
        (s, i, arr) =>
          i === arr.findIndex(
            (t) =>
              t.cardBreakdowns.map((c) => c.card.card_id).sort().join() ===
              s.cardBreakdowns.map((c) => c.card.card_id).sort().join()
          )
      )
      .sort((a, b) => b.netFirstYearValue - a.netFirstYearValue)
      .slice(0, 3);

    setStrategies(strats);
    setExpanded(0);
    setLoading(false);
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!loaded || loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="skeleton rounded-xl h-28" />
        <div className="skeleton rounded-xl h-52" />
        <div className="skeleton rounded-xl h-44" />
      </div>
    );
  }

  if (!Object.values(profile).some((v) => v > 0)) {
    return (
      <div className="bg-[#1A1D27] border border-white/8 rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">📊</div>
        <h2 className="font-semibold text-white/90 mb-1">Spending profile missing</h2>
        <p className="text-sm text-white/40 mb-5 max-w-xs mx-auto">
          We need your monthly spend to compute recommendations.
        </p>
        <Link
          href="/recommend/spending"
          className="inline-flex items-center gap-2 bg-[#6366F1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4F46E5] transition-colors"
        >
          ← Go back and set spending
        </Link>
      </div>
    );
  }

  if (noResults) {
    return (
      <div className="bg-[#1A1D27] border border-white/8 rounded-xl p-8 text-center space-y-4">
        <div className="text-3xl">🔍</div>
        <h2 className="font-semibold text-white/90">No cards match your filters</h2>
        <p className="text-sm text-white/40 max-w-xs mx-auto">
          Your salary tier, bank, or benefit preferences are too restrictive. Try widening them.
        </p>
        <Link
          href="/recommend/preferences"
          className="inline-flex items-center gap-2 bg-[#6366F1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4F46E5] transition-colors"
        >
          ← Adjust preferences
        </Link>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────

  // Loyalty note for results header
  const loyaltyNote = prefs.loyaltyStatus.length > 0
    ? `Loyalty weighting applied for ${prefs.loyaltyStatus.length} programme${prefs.loyaltyStatus.length > 1 ? "s" : ""}.`
    : null;
  const pinnedNote = (prefs.pinnedCardIds ?? []).length > 0
    ? `${(prefs.pinnedCardIds ?? []).length} card${(prefs.pinnedCardIds ?? []).length !== 1 ? "s" : ""} locked in as requested.`
    : null;

  return (
    <div className="space-y-4">

      {/* Header callout */}
      <div className="bg-[#1A1D27] border border-[#22C55E]/20 rounded-xl p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#22C55E]/60 mb-2">
          Best portfolio for your profile
        </div>
        {strategies[0] && (
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <div className="text-[40px] font-bold text-[#22C55E] font-mono tabular-nums leading-none">
                AED {Math.round(strategies[0].netFirstYearValue).toLocaleString()}
              </div>
              <div className="text-sm text-white/40 mt-1">
                net value in year 1
                {strategies[0].totalWelcomeBonus > 0 && (
                  <span className="text-white/25">
                    {" "}(includes AED {Math.round(strategies[0].totalWelcomeBonus).toLocaleString()} welcome bonus)
                  </span>
                )}
              </div>
            </div>
            <div className="pb-1">
              <div className="text-xl font-bold text-white/50 font-mono">
                AED {Math.round(strategies[0].netOngoingValue).toLocaleString()}
              </div>
              <div className="text-xs text-white/30 mt-0.5">ongoing per year</div>
            </div>
          </div>
        )}
        {loyaltyNote && (
          <div className="mt-3 text-xs text-[#F59E0B]/70 flex items-center gap-1.5">
            <span>🏅</span>
            {loyaltyNote} Cards earning in your programme are weighted higher.
          </div>
        )}
        {pinnedNote && (
          <div className="mt-2 text-xs text-[#6366F1]/70 flex items-center gap-1.5">
            <span>📌</span>
            {pinnedNote} The rest of each portfolio is optimised around them.
          </div>
        )}
      </div>

      {/* Strategies */}
      {strategies.map((strategy, idx) => {
        const isOpen = expanded === idx;
        return (
          <div
            key={idx}
            className={[
              "bg-[#1A1D27] rounded-xl border overflow-hidden",
              idx === 0 ? "border-[#22C55E]/30" : "border-white/8",
            ].join(" ")}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : idx)}
              className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 hover:bg-white/3 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {idx === 0 && (
                    <span className="text-[10px] bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                      Best
                    </span>
                  )}
                  <span className="font-semibold text-white/90">{strategy.label}</span>
                </div>
                <div className="text-xs text-white/35">
                  {strategy.cardBreakdowns.map((b) => b.card.card_name).join(" + ")}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-[#22C55E] font-mono">
                  AED {Math.round(strategy.netFirstYearValue).toLocaleString()}
                  <span className="text-xs text-white/30 font-normal"> yr 1</span>
                </div>
                <div className="text-xs text-white/25 mt-0.5 font-mono">
                  AED {Math.round(strategy.netOngoingValue).toLocaleString()} ongoing
                </div>
                <div className="text-xs text-white/20 mt-1">{isOpen ? "▲" : "▼"}</div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-white/5 bg-white/2 divide-y divide-white/5">
                {strategy.cardBreakdowns.map((cb) => {
                  // Check if this card has loyalty alignment
                  const isLoyaltyAligned =
                    prefs.loyaltyStatus.length > 0 &&
                    cb.card.reward_currency_name &&
                    prefs.loyaltyStatus.some((status) =>
                      LOYALTY_CURRENCY_MATCH[status].some((c) =>
                        cb.card.reward_currency_name!.includes(c)
                      )
                    );

                  const isPinned = (prefs.pinnedCardIds ?? []).includes(cb.card.card_id);
                  return (
                    <div key={cb.card.card_id} className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/cards/${cb.card.card_id}`}
                              className="font-semibold text-white/90 text-sm hover:text-[#6366F1] transition-colors"
                            >
                              {cb.card.card_name}
                            </Link>
                            {isPinned && (
                              <span className="text-[10px] bg-[#6366F1]/12 text-[#6366F1]/80 border border-[#6366F1]/25 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                                📌 Locked in
                              </span>
                            )}
                            {isLoyaltyAligned && (
                              <span className="text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                                🏅 Status match
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/35 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{cb.card.bank_short_name}</span>
                            {cb.card.annual_fee_aed > 0 ? (
                              <span className="font-mono">AED {cb.card.annual_fee_aed.toLocaleString()}/yr fee</span>
                            ) : (
                              <span className="text-[#22C55E]/70">No annual fee</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-[#22C55E] font-mono">
                            AED {Math.round(cb.annualReward).toLocaleString()}/yr
                          </div>
                          <div className="text-xs text-white/30">from rewards</div>
                        </div>
                      </div>

                      {cb.assignments.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                            Use for
                          </div>
                          {cb.assignments.map((a) => (
                            <div
                              key={a.categorySlug}
                              className="flex items-center justify-between text-xs bg-white/3 rounded-lg px-3 py-2 border border-white/5"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span>{a.categoryIcon}</span>
                                <span className="text-white/70">{a.categoryName}</span>
                                <span className="text-white/30 font-mono">{a.rate.toFixed(1)}%</span>
                              </div>
                              <span className="font-semibold text-[#22C55E] font-mono shrink-0 ml-2">
                                AED {Math.round(a.monthlyReward)}/mo
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {cb.welcomeBonus > 0 && (
                        <div className="bg-[#F59E0B]/6 border border-[#F59E0B]/20 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                          <span>🎁</span>
                          <div className="flex-1 text-white/60">{cb.welcomeBonusTitle}</div>
                          <div className="font-bold text-[#F59E0B] font-mono shrink-0">
                            ~AED {cb.welcomeBonus.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {cb.card.card_id === WIO_CARD_ID && (
                        <div className="bg-[#6366F1]/6 border border-[#6366F1]/20 rounded-lg px-3 py-2.5 text-xs flex items-start gap-2">
                          <span className="shrink-0 mt-px">💡</span>
                          <div className="text-white/55 leading-relaxed">
                            <span className="text-white/80 font-medium">Bonus: </span>
                            Pay your other UAE credit card bills through Wio Credit to earn an extra{" "}
                            <span className="text-white/75 font-medium">0.5%</span> (Plus plan) or{" "}
                            <span className="text-white/75 font-medium">1%</span> (Salary/Family plan) cashback on top — capped at that % of your Wio credit limit per month. Requires AED 5,000+ spend in the same month.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="px-4 py-3 grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-white/30">Annual rewards</div>
                    <div className="font-bold font-mono text-[#22C55E] mt-0.5">
                      AED {Math.round(strategy.totalAnnualRewards).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/30">Welcome bonus</div>
                    <div className="font-bold font-mono text-[#F59E0B] mt-0.5">
                      {strategy.totalWelcomeBonus > 0
                        ? `AED ${Math.round(strategy.totalWelcomeBonus).toLocaleString()}`
                        : "—"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/30">Annual fees</div>
                    <div className="font-bold font-mono text-white/60 mt-0.5">
                      AED {Math.round(strategy.totalAnnualFees).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#22C55E]/5 flex items-center justify-between text-sm">
                  <div className="text-white/50">
                    Net year 1 value
                    <span className="text-white/25 text-xs ml-2">(rewards + welcome − fees)</span>
                  </div>
                  <div className="font-bold text-[#22C55E] font-mono">
                    AED {Math.round(strategy.netFirstYearValue).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/recommend/preferences"
          className="text-xs text-white/30 hover:text-white/55 transition-colors"
        >
          ← Adjust preferences
        </Link>
        <span className="text-white/10">·</span>
        <Link
          href="/optimize/add-cards"
          className="text-xs text-white/30 hover:text-white/55 transition-colors"
        >
          Already have these cards? Audit your wallet →
        </Link>
      </div>
    </div>
  );
}

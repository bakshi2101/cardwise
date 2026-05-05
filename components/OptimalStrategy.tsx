"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase, SpendingCategory } from "@/lib/supabase";
import { computeMonthlyReward } from "@/lib/recommend";
import { type SpendingProfile } from "@/lib/wallet";

interface CardForOptimizer {
  card_id: string;
  card_name: string;
  bank_short_name: string;
  annual_fee_aed: number;
  annual_fee_waiver_spend: number | null;
  // category_slug → { rate, cap_spend, cap_reward }
  rewards: Record<string, { rate: number; cap_spend: number | null; cap_reward: number | null }>;
}

interface CategoryAssignment {
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  cardId: string;
  cardName: string;
  monthlyReward: number;
  monthlySpend: number;
  rate: number;
  isGeneralFallback: boolean;
}

interface Strategy {
  cards: CardForOptimizer[];
  assignments: CategoryAssignment[];
  monthlyRewards: number;
  annualRewards: number;
  annualFees: number;
  netAnnualValue: number;
  label: string;
}

interface Props {
  profile: SpendingProfile;
  categories: SpendingCategory[];
  walletCardIds: string[];
}

function effectiveMonthly(
  card: CardForOptimizer,
  catSlug: string,
  spend: number
): { reward: number; isGeneral: boolean } {
  const specific = card.rewards[catSlug];
  const general = card.rewards["general"];
  const r = specific ?? general;
  if (!r || spend <= 0) return { reward: 0, isGeneral: false };
  return {
    reward: computeMonthlyReward(spend, r.rate, r.cap_spend, r.cap_reward),
    isGeneral: !specific && !!general,
  };
}

function buildTotalReward(
  cards: CardForOptimizer[],
  profile: SpendingProfile,
  categories: SpendingCategory[]
): { total: number; assignments: Map<string, { card: CardForOptimizer; monthly: number; isGeneral: boolean }> } {
  let total = 0;
  const assignments = new Map<string, { card: CardForOptimizer; monthly: number; isGeneral: boolean }>();

  for (const cat of categories) {
    const spend = profile[cat.slug] ?? 0;
    if (spend === 0) continue;

    let best = 0;
    let bestCard: CardForOptimizer | null = null;
    let bestIsGeneral = false;

    for (const card of cards) {
      const { reward, isGeneral } = effectiveMonthly(card, cat.slug, spend);
      if (reward > best) {
        best = reward;
        bestCard = card;
        bestIsGeneral = isGeneral;
      }
    }

    if (bestCard && best > 0) {
      total += best;
      assignments.set(cat.slug, { card: bestCard, monthly: best, isGeneral: bestIsGeneral });
    }
  }

  return { total, assignments };
}

function greedy(
  candidates: CardForOptimizer[],
  profile: SpendingProfile,
  categories: SpendingCategory[],
  maxCards: number,
  excludeIds: Set<string> = new Set()
): CardForOptimizer[] {
  const pool = candidates.filter((c) => !excludeIds.has(c.card_id));
  const selected: CardForOptimizer[] = [];

  while (selected.length < maxCards) {
    const currentTotal = buildTotalReward(selected, profile, categories).total;
    let bestMarginal = 0;
    let bestCard: CardForOptimizer | null = null;

    for (const card of pool) {
      if (selected.some((s) => s.card_id === card.card_id)) continue;
      const newTotal = buildTotalReward([...selected, card], profile, categories).total;
      const marginal = newTotal - currentTotal;
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
  cards: CardForOptimizer[],
  profile: SpendingProfile,
  categories: SpendingCategory[],
  totalAnnualSpend: number,
  label: string
): Strategy {
  const { total, assignments } = buildTotalReward(cards, profile, categories);

  const annualFees = cards.reduce((sum, card) => {
    const waived =
      card.annual_fee_waiver_spend != null &&
      totalAnnualSpend >= card.annual_fee_waiver_spend;
    return sum + (waived ? 0 : card.annual_fee_aed);
  }, 0);

  const categoryAssignments: CategoryAssignment[] = [];
  for (const cat of categories) {
    const asgn = assignments.get(cat.slug);
    if (!asgn) continue;
    categoryAssignments.push({
      categorySlug: cat.slug,
      categoryName: cat.name,
      categoryIcon: cat.icon ?? "💳",
      cardId: asgn.card.card_id,
      cardName: asgn.card.card_name,
      monthlyReward: asgn.monthly,
      monthlySpend: profile[cat.slug] ?? 0,
      rate: asgn.card.rewards[cat.slug]?.rate ?? asgn.card.rewards["general"]?.rate ?? 0,
      isGeneralFallback: asgn.isGeneral,
    });
  }

  const annualRewards = total * 12;
  return {
    cards,
    assignments: categoryAssignments,
    monthlyRewards: total,
    annualRewards,
    annualFees,
    netAnnualValue: annualRewards - annualFees,
    label,
  };
}

export default function OptimalStrategy({ profile, categories, walletCardIds }: Props) {
  const [maxCards, setMaxCards] = useState(3);
  const [allowFees, setAllowFees] = useState(true);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [currentNetValue, setCurrentNetValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  const hasProfile = Object.values(profile).some((v) => v > 0);

  async function compute() {
    if (!hasProfile) return;
    setLoading(true);

    // Fetch all rewards + all cards (for fee waiver data)
    const [rewardsRes, cardsRes] = await Promise.all([
      // is_general_fallback is computed in JS, not a DB column — omit it
      supabase
        .from("rewards_ranked")
        .select(
          "card_id, card_name, bank_short_name, annual_fee_aed, category_slug, effective_return_pct, monthly_cap_spend_aed, monthly_cap_reward"
        )
        .eq("is_active", true)
        .eq("reward_event_type", "ongoing"),
      supabase
        .from("cards_with_bank")
        .select("id, annual_fee_aed, annual_fee_waiver_spend")
        .eq("is_active", true),
    ]);

    const allRewards = rewardsRes.data ?? [];
    const cardsMeta = cardsRes.data ?? [];
    const feeWaiverMap = new Map(cardsMeta.map((c) => [c.id, c.annual_fee_waiver_spend as number | null]));

    // Build card-rewards matrix
    const cardMap = new Map<string, CardForOptimizer>();

    for (const r of allRewards) {
      if (!cardMap.has(r.card_id)) {
        cardMap.set(r.card_id, {
          card_id: r.card_id,
          card_name: r.card_name,
          bank_short_name: r.bank_short_name,
          annual_fee_aed: r.annual_fee_aed ?? 0,
          annual_fee_waiver_spend: feeWaiverMap.get(r.card_id) ?? null,
          rewards: {},
        });
      }
      const card = cardMap.get(r.card_id)!;
      // Specific rows take priority over general (don't overwrite)
      if (!card.rewards[r.category_slug]) {
        card.rewards[r.category_slug] = {
          rate: r.effective_return_pct,
          cap_spend: r.monthly_cap_spend_aed ?? null,
          cap_reward: r.monthly_cap_reward ?? null,
        };
      }
    }

    const allCards = Array.from(cardMap.values());
    const freeCards = allCards.filter((c) => c.annual_fee_aed === 0);
    const candidates = allowFees ? allCards : freeCards;

    const totalAnnualSpend =
      Object.values(profile).reduce((s, v) => s + (v ?? 0), 0) * 12;

    const activeCategories = categories.filter((c) => (profile[c.slug] ?? 0) > 0);

    // Run greedy strategies
    const combo1 = greedy(candidates, profile, activeCategories, maxCards);
    const combo2 = greedy(
      candidates,
      profile,
      activeCategories,
      maxCards,
      new Set(combo1.slice(0, 1).map((c) => c.card_id))
    );
    const combo3 =
      allowFees && freeCards.length > 0
        ? greedy(freeCards, profile, activeCategories, maxCards)
        : greedy(
            candidates,
            profile,
            activeCategories,
            Math.max(1, maxCards - 1),
          );

    const strats: Strategy[] = [
      buildStrategy(combo1, profile, activeCategories, totalAnnualSpend, "Optimal strategy"),
      buildStrategy(combo2, profile, activeCategories, totalAnnualSpend, "Alternative strategy"),
      buildStrategy(combo3, profile, activeCategories, totalAnnualSpend,
        allowFees ? "No annual fee strategy" : `${Math.max(1, maxCards - 1)}-card strategy`),
    ]
      .filter((s) => s.netAnnualValue > 0 && s.cards.length > 0)
      // Deduplicate by card set fingerprint
      .filter(
        (s, i, arr) =>
          i === arr.findIndex(
            (t) =>
              t.cards
                .map((c) => c.card_id)
                .sort()
                .join() ===
              s.cards
                .map((c) => c.card_id)
                .sort()
                .join()
          )
      )
      .sort((a, b) => b.netAnnualValue - a.netAnnualValue)
      .slice(0, 3);

    // Compute current wallet net value for comparison
    if (walletCardIds.length > 0) {
      const walletCards = allCards.filter((c) => walletCardIds.includes(c.card_id));
      const { total } = buildTotalReward(walletCards, profile, activeCategories);
      const walletFees = walletCards.reduce((sum, c) => {
        const waived = c.annual_fee_waiver_spend != null && totalAnnualSpend >= c.annual_fee_waiver_spend;
        return sum + (waived ? 0 : c.annual_fee_aed);
      }, 0);
      setCurrentNetValue(total * 12 - walletFees);
    } else {
      setCurrentNetValue(0);
    }

    setStrategies(strats);
    setExpanded(0);
    setLoading(false);
  }

  return (
    <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8">
        <h2 className="font-semibold text-white/90">Here's how to close the gap</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Find the best combination of cards for your spending profile.
        </p>
      </div>

      {!hasProfile ? (
        <div className="p-5 text-sm text-white/30 text-center">
          Fill in your spending profile above first.
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Settings */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-xs text-white/40 block mb-1">Max cards to hold</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMaxCards(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors font-mono ${
                      maxCards === n
                        ? "bg-[#6366F1] text-white"
                        : "bg-white/8 text-white/50 hover:bg-white/12"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1">Annual fee cards</label>
              <button
                onClick={() => setAllowFees(!allowFees)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  allowFees
                    ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                    : "bg-white/8 text-white/40"
                }`}
              >
                {allowFees ? "Included" : "Excluded"}
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={compute}
                disabled={loading}
                className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Calculating…" : strategies.length > 0 ? "Recalculate" : "Calculate"}
              </button>
            </div>
          </div>

          {/* Results */}
          {strategies.length > 0 && (
            <div className="space-y-3">
              {strategies.map((strategy, idx) => {
                const improvement =
                  currentNetValue != null
                    ? strategy.netAnnualValue - currentNetValue
                    : null;
                const isOpen = expanded === idx;

                return (
                  <div
                    key={idx}
                    className={`border rounded-xl overflow-hidden ${
                      idx === 0
                        ? "border-[#22C55E]/40"
                        : "border-white/8"
                    }`}
                  >
                    {/* Strategy header */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : idx)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="text-xs bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2 py-0.5 rounded-full font-semibold">
                              Best
                            </span>
                          )}
                          <span className="text-sm font-semibold text-white/90">
                            {strategy.label}
                          </span>
                        </div>
                        <div className="text-xs text-white/35 mt-0.5">
                          {strategy.cards.map((c) => c.card_name).join(" + ")}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-[#22C55E] font-mono">
                          AED {Math.round(strategy.netAnnualValue).toLocaleString()}
                          <span className="text-xs font-normal text-white/30">/yr net</span>
                        </div>
                        {improvement != null && improvement > 0 && (
                          <div className="text-xs text-[#22C55E] font-medium font-mono">
                            +AED {Math.round(improvement).toLocaleString()} vs current
                          </div>
                        )}
                        <div className="text-xs text-white/25 mt-0.5">
                          {isOpen ? "▲" : "▼"}
                        </div>
                      </div>
                    </button>

                    {/* Expanded breakdown */}
                    {isOpen && (
                      <div className="border-t border-white/5 bg-white/5 px-4 py-3 space-y-3">
                        {/* Cards in combo */}
                        <div className="flex flex-wrap gap-2">
                          {strategy.cards.map((card) => (
                            <Link
                              key={card.card_id}
                              href={`/cards/${card.card_id}`}
                              className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 hover:border-[#6366F1]/40 transition-colors text-white/70"
                            >
                              {card.card_name}
                              {card.annual_fee_aed > 0 && (
                                <span className="text-white/30 ml-1 font-mono">
                                  · AED {card.annual_fee_aed.toLocaleString()}/yr
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>

                        {/* Per-category assignments */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                            Use each card for:
                          </div>
                          {strategy.assignments.map((a) => (
                            <div
                              key={a.categorySlug}
                              className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2 border border-white/5"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span>{a.categoryIcon}</span>
                                <div className="min-w-0">
                                  <span className="font-medium text-white/80 text-xs">
                                    {a.categoryName}
                                  </span>
                                  <span className="text-white/25 text-xs mx-1">→</span>
                                  <span className="text-xs text-white/60">{a.cardName}</span>
                                  {a.isGeneralFallback && (
                                    <span className="ml-1 text-xs text-white/25">(general rate)</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-semibold text-[#22C55E] font-mono">
                                  AED {Math.round(a.monthlyReward)}/mo
                                </div>
                                <div className="text-xs text-white/30 font-mono">{a.rate.toFixed(1)}%</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Financials summary */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="bg-white/5 rounded-lg p-2 border border-white/5 text-center">
                            <div className="text-xs text-white/30">Annual rewards</div>
                            <div className="text-sm font-bold text-[#22C55E] font-mono">
                              AED {Math.round(strategy.annualRewards).toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 border border-white/5 text-center">
                            <div className="text-xs text-white/30">Annual fees</div>
                            <div className="text-sm font-bold text-white/70 font-mono">
                              AED {Math.round(strategy.annualFees).toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-[#22C55E]/8 rounded-lg p-2 border border-[#22C55E]/20 text-center">
                            <div className="text-xs text-white/30">Net value</div>
                            <div className="text-sm font-bold text-[#22C55E] font-mono">
                              AED {Math.round(strategy.netAnnualValue).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SpendingCategory, CardBenefit, supabase } from "@/lib/supabase";
import {
  getWalletCardIds,
  getSpendingProfile,
  type SpendingProfile,
} from "@/lib/wallet";
import {
  getAllCardsForCategory,
  getMarketOptimalMonthlyReward,
  computeMonthlyReward,
} from "@/lib/recommend";

// ── Types ─────────────────────────────────────────────────────

interface OverflowSlot {
  cardName: string;
  cardId: string;
  effectiveRate: number;
  spend: number;
  monthlyReward: number;
}

interface Assignment {
  category: SpendingCategory;
  monthlySpend: number;
  // Primary card (earns up to cap)
  cardName: string;
  cardId: string | null;
  effectiveRate: number;
  cappedSpend: number;
  monthlyReward: number;
  brandBonus: string | null;
  // Overflow card (spend beyond cap), null if no cap or no second card
  overflow: OverflowSlot | null;
}

interface BenefitWithCard extends CardBenefit {
  card_name: string;
}

// ── Helpers ───────────────────────────────────────────────────

/** Extract brand-bonus callout (text after 🎁, first sentence only). */
function parseBrandBonus(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const idx = notes.indexOf("🎁");
  if (idx === -1) return null;
  const raw = notes.slice(idx).trim();
  const firstPeriod = raw.indexOf(". ", 5);
  return firstPeriod > 0 ? raw.slice(0, firstPeriod + 1) : raw.split(".")[0] + (raw.includes(".") ? "." : "");
}

/**
 * Derive the spend threshold at which the primary card's cap is exhausted.
 * Returns null if no cap applies.
 */
function deriveCapSpend(
  monthly_cap_spend_aed: number | null,
  monthly_cap_reward: number | null,
  effective_return_pct: number
): number | null {
  if (monthly_cap_spend_aed != null) return monthly_cap_spend_aed;
  if (monthly_cap_reward != null && effective_return_pct > 0) {
    return (monthly_cap_reward / effective_return_pct) * 100;
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  categories: SpendingCategory[];
}

export default function OptimizeClient({ categories }: Props) {
  const [walletIds, setWalletIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<SpendingProfile>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [benefits, setBenefits] = useState<BenefitWithCard[]>([]);
  const [gapAnnual, setGapAnnual] = useState<number | null>(null);
  const [computing, setComputing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [computed, setComputed] = useState(false);

  useEffect(() => {
    setWalletIds(getWalletCardIds());
    setProfile(getSpendingProfile());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (walletIds.length === 0) return;
    if (!Object.values(profile).some((v) => v > 0)) return;
    compute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  async function compute() {
    setComputing(true);
    setComputed(false);

    const activeCategories = categories.filter(
      (c) => (profile[c.slug] ?? 0) > 0
    );

    // Fetch card name lookup for wallet cards (needed for benefits section)
    const [cardsRes, benefitsRes] = await Promise.all([
      supabase
        .from("cards_with_bank")
        .select("id, name")
        .in("id", walletIds),
      supabase
        .from("card_benefits")
        .select("*")
        .in("card_id", walletIds)
        .eq("is_active", true)
        .order("benefit_type"),
    ]);

    const cardNameMap = Object.fromEntries(
      (cardsRes.data ?? []).map((c) => [c.id, c.name as string])
    );
    const rawBenefits: BenefitWithCard[] = (benefitsRes.data ?? []).map(
      (b) => ({ ...b, card_name: cardNameMap[b.card_id] ?? "Unknown Card" })
    );
    setBenefits(rawBenefits);

    // Compute per-category assignments (wallet-only, no market comparison here)
    const activeSlugs = activeCategories.map((c) => c.slug);

    const [assignmentRows, marketMonthlyTotal] = await Promise.all([
      Promise.all(
        activeCategories.map(async (cat) => {
          const spend = profile[cat.slug] ?? 0;
          const allCards = await getAllCardsForCategory(walletIds, cat.slug);
          const primary = allCards[0] ?? null;
          if (!primary) return null;

          const effectiveRate = primary.effective_return_pct;
          const capSpend = deriveCapSpend(
            primary.monthly_cap_spend_aed,
            primary.monthly_cap_reward,
            effectiveRate
          );
          const cappedSpend = capSpend != null ? Math.min(spend, capSpend) : spend;
          const monthlyReward = computeMonthlyReward(
            spend,
            effectiveRate,
            primary.monthly_cap_spend_aed,
            primary.monthly_cap_reward
          );

          // Overflow: spend beyond cap → route to next best distinct card
          const overflowSpend = capSpend != null ? Math.max(0, spend - capSpend) : 0;
          let overflow: OverflowSlot | null = null;
          if (overflowSpend > 0.5) {
            const next = allCards.find((c) => c.card_id !== primary.card_id);
            if (next) {
              overflow = {
                cardName: next.card_name,
                cardId: next.card_id,
                effectiveRate: next.effective_return_pct,
                spend: overflowSpend,
                monthlyReward: computeMonthlyReward(
                  overflowSpend,
                  next.effective_return_pct,
                  next.monthly_cap_spend_aed,
                  next.monthly_cap_reward
                ),
              };
            }
          }

          return {
            category: cat,
            monthlySpend: spend,
            cardName: primary.card_name,
            cardId: primary.card_id,
            effectiveRate,
            cappedSpend,
            monthlyReward,
            brandBonus: parseBrandBonus(primary.notes),
            overflow,
          } satisfies Assignment;
        })
      ),
      // Market gap: same greedy + same data source as Path B, unconstrained card count.
      // This ensures the gap number is exactly what Path B would show with no constraints.
      getMarketOptimalMonthlyReward(profile, activeSlugs),
    ]);

    const validAssignments = assignmentRows.filter(Boolean) as Assignment[];
    setAssignments(validAssignments);

    const walletMonthlyTotal = validAssignments.reduce(
      (s, a) => s + a.monthlyReward + (a.overflow?.monthlyReward ?? 0),
      0
    );
    const rawGapMonthly = Math.max(0, marketMonthlyTotal - walletMonthlyTotal);
    setGapAnnual(rawGapMonthly * 12);
    setComputing(false);
    setComputed(true);
  }

  // ── Derived totals ────────────────────────────────────────────
  const totalMonthly = assignments.reduce(
    (s, a) => s + a.monthlyReward + (a.overflow?.monthlyReward ?? 0),
    0
  );
  const totalAnnual = totalMonthly * 12;
  const hasProfile = Object.values(profile).some((v) => v > 0);

  // ── Loading skeleton ──────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[120, 200, 80].map((h, i) => (
          <div key={i} className="skeleton rounded-xl" style={{ height: h }} />
        ))}
      </div>
    );
  }

  // ── No wallet ─────────────────────────────────────────────────
  if (walletIds.length === 0) {
    return (
      <div className="bg-[#1A1D27] border border-white/8 rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">💳</div>
        <h2 className="font-semibold text-white/90 mb-1">Add cards to your Wallet first</h2>
        <p className="text-sm text-white/40 mb-5 max-w-xs mx-auto">
          We&apos;ll show you exactly how to assign your cards to maximise rewards.
        </p>
        <Link
          href="/optimize/add-cards"
          className="inline-flex items-center gap-2 bg-[#6366F1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4F46E5] transition-colors"
        >
          Add your cards →
        </Link>
      </div>
    );
  }

  // ── No spending profile ───────────────────────────────────────
  if (!hasProfile) {
    return (
      <div className="bg-[#1A1D27] border border-white/8 rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">📊</div>
        <h2 className="font-semibold text-white/90 mb-1">Set up your spending profile</h2>
        <p className="text-sm text-white/40 mb-5 max-w-xs mx-auto">
          Enter your monthly spend per category so we can calculate your rewards.
        </p>
        <Link
          href="/optimize/spending"
          className="inline-flex items-center gap-2 bg-[#6366F1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4F46E5] transition-colors"
        >
          Add spending profile →
        </Link>
      </div>
    );
  }

  // ── Computing ─────────────────────────────────────────────────
  if (computing) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Optimising your wallet">
        <div className="skeleton rounded-xl h-20" />
        <div className="skeleton rounded-xl h-12" />
        <div className="skeleton rounded-xl h-48" />
        <div className="skeleton rounded-xl h-32" />
      </div>
    );
  }

  if (!computed) return null;

  // Benefits grouped by card_id
  const benefitsByCard = benefits.reduce<Record<string, BenefitWithCard[]>>(
    (acc, b) => {
      if (!acc[b.card_id]) acc[b.card_id] = [];
      acc[b.card_id]!.push(b);
      return acc;
    },
    {}
  );

  // ── Main view ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Section 1: Totals summary ────────────────────────── */}
      <div className="bg-[#1A1D27] border border-white/8 rounded-xl p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-3">
          Estimated rewards with your current cards
        </div>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <div className="text-[40px] font-bold text-white font-mono tabular-nums leading-none">
              AED {Math.round(totalAnnual).toLocaleString()}
            </div>
            <div className="text-sm text-white/40 mt-1">per year</div>
          </div>
          <div className="pb-1 text-white/15 text-2xl font-light">/</div>
          <div className="pb-1">
            <div className="text-xl font-bold text-white/50 font-mono tabular-nums">
              AED {Math.round(totalMonthly).toLocaleString()}
            </div>
            <div className="text-xs text-white/30 mt-0.5">per month</div>
          </div>
        </div>
        <p className="text-xs text-white/30 mt-3">
          Based on using the best card in your wallet for each spend category, including overflow routing past caps.
        </p>
      </div>

      {/* ── Section 2: Gap teaser (directly below totals) ────── */}
      {gapAnnual != null && gapAnnual >= 100 && (
        <div className="bg-[#1A1D27] border border-[#F59E0B]/25 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B]/60 mb-1.5">
                Untapped potential
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                The right card portfolio could earn you{" "}
                <span className="font-bold text-[#F59E0B] font-mono text-base">
                  AED {Math.round(gapAnnual).toLocaleString()} more
                </span>{" "}
                per year — based on the best cards available for your spend profile.
              </p>
            </div>
            <Link
              href="/recommend/spending"
              className="shrink-0 inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              Build ideal portfolio →
            </Link>
          </div>
        </div>
      )}

      {/* ── Section 3: Card Assignment Matrix ───────────────── */}
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8">
          <h2 className="font-semibold text-white/90 text-sm">Card Assignment Matrix</h2>
          <p className="text-xs text-white/35 mt-0.5">
            Use this card for each category to maximise your rewards
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {assignments.map(
            ({
              category,
              monthlySpend,
              cardName,
              cardId,
              effectiveRate,
              cappedSpend,
              monthlyReward,
              brandBonus,
              overflow,
            }) => {
              const hasCap = cappedSpend < monthlySpend;
              return (
                <div key={category.id} className="px-4 py-3.5 space-y-2">
                  {/* Category row */}
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white/85 leading-snug">
                          {category.name}
                        </div>
                        <div className="text-[11px] text-white/30 font-mono mt-0.5">
                          AED {monthlySpend.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/recommend/${category.slug}`}
                      className="text-xs text-white/25 hover:text-white/50 transition-colors shrink-0"
                    >
                      Compare →
                    </Link>
                  </div>

                  {/* Primary card slot */}
                  <div className="flex items-start gap-2 ml-6">
                    <div className="text-white/15 text-sm pt-0.5 shrink-0">→</div>
                    <div className="flex-1 min-w-0 bg-white/3 rounded-lg px-3 py-2 border border-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {cardId ? (
                            <Link
                              href={`/cards/${cardId}`}
                              className="text-sm font-medium text-[#6366F1]/90 hover:text-[#6366F1] truncate leading-snug transition-colors block"
                            >
                              {cardName} ↗
                            </Link>
                          ) : (
                            <div className="text-sm font-medium text-[#6366F1]/90 truncate leading-snug">
                              {cardName}
                            </div>
                          )}
                          {hasCap && (
                            <div className="text-[11px] text-white/30 font-mono mt-0.5">
                              on first AED {Math.round(cappedSpend).toLocaleString()}
                            </div>
                          )}
                          {brandBonus && (
                            <div className="text-[11px] text-[#F59E0B]/80 mt-1 leading-snug">
                              {brandBonus}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-bold text-[#22C55E] font-mono tabular-nums">
                            {effectiveRate.toFixed(1)}%
                          </div>
                          <div className="text-[11px] text-white/30 font-mono mt-0.5">
                            AED {monthlyReward.toFixed(0)}/mo
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overflow card slot */}
                  {overflow && (
                    <div className="flex items-start gap-2 ml-6">
                      <div className="text-white/10 text-sm pt-0.5 shrink-0">→</div>
                      <div className="flex-1 min-w-0 bg-[#F59E0B]/4 rounded-lg px-3 py-2 border border-[#F59E0B]/12">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/cards/${overflow.cardId}`}
                              className="text-sm font-medium text-[#6366F1]/80 hover:text-[#6366F1] truncate leading-snug transition-colors block"
                            >
                              {overflow.cardName} ↗
                            </Link>
                            <div className="text-[11px] text-[#F59E0B]/70 font-mono mt-0.5">
                              overflow — next AED {Math.round(overflow.spend).toLocaleString()}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-sm font-bold text-[#22C55E]/80 font-mono tabular-nums">
                              {overflow.effectiveRate.toFixed(1)}%
                            </div>
                            <div className="text-[11px] text-white/25 font-mono mt-0.5">
                              AED {overflow.monthlyReward.toFixed(0)}/mo
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* Footer totals */}
        <div className="border-t border-white/5 px-4 py-3 bg-white/3 flex items-center justify-between text-xs">
          <span className="text-white/35">Total estimated rewards</span>
          <div className="text-right">
            <span className="font-semibold font-mono text-white/70">
              AED {Math.round(totalAnnual).toLocaleString()}/yr
            </span>
            <span className="text-white/25 font-mono ml-2">
              (AED {Math.round(totalMonthly).toLocaleString()}/mo)
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 4: Card Benefits ──────────────────────────── */}
      {Object.keys(benefitsByCard).length > 0 && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <h2 className="font-semibold text-white/90 text-sm">Your Card Benefits</h2>
            <p className="text-xs text-white/35 mt-0.5">
              Perks you&apos;re entitled to across your wallet
            </p>
          </div>

          {Object.entries(benefitsByCard).map(([cardId, cardBenefits]) => {
            const cardName = cardBenefits[0]?.card_name ?? "Card";
            return (
              <div key={cardId} className="border-t border-white/5 first:border-t-0">
                {/* Card name header */}
                <div className="px-4 py-2.5 flex items-center justify-between bg-white/2">
                  <Link
                    href={`/cards/${cardId}`}
                    className="text-xs font-semibold text-[#6366F1]/80 hover:text-[#6366F1] transition-colors"
                  >
                    {cardName} ↗
                  </Link>
                  <span className="text-[11px] text-white/25 font-mono">
                    {cardBenefits.length} benefit{cardBenefits.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Benefits list */}
                <div className="divide-y divide-white/4">
                  {cardBenefits.map((b) => (
                    <div key={b.id} className="px-4 py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-white/80 leading-snug">{b.title}</div>
                        {b.description && (
                          <div className="text-xs text-white/35 mt-0.5">{b.description}</div>
                        )}
                        {b.conditions && (
                          <div className="text-xs text-white/25 mt-0.5 italic">{b.conditions}</div>
                        )}
                        {b.usage_limit != null && b.usage_period && (
                          <div className="text-[11px] text-white/25 font-mono mt-0.5">
                            {b.usage_limit}× per {b.usage_period.replace("_", " ")}
                          </div>
                        )}
                      </div>
                      {b.monetary_value_aed != null && (
                        <div className="text-sm font-semibold text-[#22C55E] shrink-0 font-mono">
                          AED {b.monetary_value_aed.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

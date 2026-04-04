"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SpendingCategory } from "@/lib/supabase";
import {
  getWalletCardIds,
  getSpendingProfile,
  type SpendingProfile,
} from "@/lib/wallet";
import {
  getBestCardForCategory,
  getBestMarketRateForCategory,
  computeMonthlyReward,
} from "@/lib/recommend";
import OptimalStrategy from "@/components/OptimalStrategy";

interface Gap {
  category: SpendingCategory;
  monthlySpend: number;
  walletBest: number;
  walletCardName: string;
  walletCardId: string | null;
  walletMonthly: number;
  marketBest: number;
  marketCardName: string;
  marketMonthly: number;
  gapMonthly: number;
}

interface Props {
  categories: SpendingCategory[];
}

export default function OptimizeClient({ categories }: Props) {
  const [walletIds, setWalletIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<SpendingProfile>({});
  const [gaps, setGaps] = useState<Gap[]>([]);
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
    computeGaps();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  async function computeGaps() {
    setComputing(true);
    setComputed(false);

    const activeCategories = categories.filter(
      (c) => (profile[c.slug] ?? 0) > 0
    );

    const results = await Promise.all(
      activeCategories.map(async (cat) => {
        const spend = profile[cat.slug] ?? 0;

        const [walletTop, marketTop] = await Promise.all([
          getBestCardForCategory(walletIds, cat.slug),
          getBestMarketRateForCategory(cat.slug),
        ]);

        const walletBest = walletTop?.effective_return_pct ?? 0;
        const walletMonthly = walletTop
          ? computeMonthlyReward(
              spend,
              walletBest,
              walletTop.monthly_cap_spend_aed,
              walletTop.monthly_cap_reward
            )
          : 0;

        const marketBest = marketTop?.effective_return_pct ?? 0;
        const marketMonthly = marketTop
          ? computeMonthlyReward(
              spend,
              marketBest,
              marketTop.monthly_cap_spend_aed,
              marketTop.monthly_cap_reward
            )
          : 0;

        const gapMonthly = marketMonthly - walletMonthly;

        if (gapMonthly < 1) return null;

        return {
          category: cat,
          monthlySpend: spend,
          walletBest,
          walletCardName: walletTop?.card_name ?? "—",
          walletCardId: walletTop?.card_id ?? null,
          walletMonthly,
          marketBest,
          marketCardName: marketTop?.card_name ?? "—",
          marketMonthly,
          gapMonthly,
        } satisfies Gap;
      })
    );

    setGaps(results.filter(Boolean) as Gap[]);
    setComputing(false);
    setComputed(true);
  }

  // ── Derived totals ────────────────────────────────────────────
  const leftOnTableMonthly = gaps.reduce((s, g) => s + g.gapMonthly, 0);
  const leftOnTableAnnual = leftOnTableMonthly * 12;

  const currentAnnual = gaps.reduce((s, g) => s + g.walletMonthly, 0) * 12;
  const bestAnnual = gaps.reduce((s, g) => s + g.marketMonthly, 0) * 12;

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
          We compare your cards against the full market to find where you&apos;re losing out.
        </p>
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 bg-[#6366F1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4F46E5] transition-colors"
        >
          Set up Wallet →
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
          Enter your monthly spend per category so we can calculate exactly how much
          you&apos;re leaving on the table.
        </p>
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 bg-[#6366F1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4F46E5] transition-colors"
        >
          Add Spending Profile →
        </Link>
      </div>
    );
  }

  // ── Computing ─────────────────────────────────────────────────
  if (computing) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Analysing your wallet">
        <div className="skeleton rounded-xl h-24" />
        <div className="skeleton rounded-xl h-40" />
        <div className="skeleton rounded-xl h-20" />
      </div>
    );
  }

  // ── No gaps (already optimal) ─────────────────────────────────
  if (computed && gaps.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-[#22C55E]/8 border border-[#22C55E]/20 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="font-semibold text-[#22C55E] text-lg mb-1">
            Your wallet is already optimized
          </h2>
          <p className="text-sm text-white/45 max-w-xs mx-auto">
            For every category in your spending profile, you already hold the
            best available card. Nice work.
          </p>
        </div>

        {/* Still show OptimalStrategy in case they want to explore combinations */}
        <OptimalStrategy
          profile={profile}
          categories={categories}
          walletCardIds={walletIds}
        />
      </div>
    );
  }

  // ── Main view: gaps + strategy ────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Money left on table banner ────────────────────────── */}
      {gaps.length > 0 && (
        <div className="bg-[#1A1D27] border border-[#F59E0B]/20 rounded-xl p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B]/60 mb-2">
            Money left on the table
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <div className="text-[40px] font-bold text-[#F59E0B] font-mono tabular-nums leading-none">
                AED {Math.round(leftOnTableAnnual).toLocaleString()}
              </div>
              <div className="text-sm text-white/40 mt-1">per year with your current cards</div>
            </div>
            <div className="pb-1 text-white/20 text-2xl font-light">/</div>
            <div className="pb-1">
              <div className="text-xl font-bold text-white/50 font-mono tabular-nums">
                AED {Math.round(leftOnTableMonthly).toLocaleString()}
              </div>
              <div className="text-xs text-white/30 mt-0.5">per month</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Portfolio gaps ────────────────────────────────────── */}
      {gaps.length > 0 && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white/90 text-sm">Portfolio Gaps</h2>
              <p className="text-xs text-white/35 mt-0.5">
                Categories where a better card exists
              </p>
            </div>
            <span className="text-xs font-mono text-white/30 shrink-0">
              {gaps.length} gap{gaps.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {gaps
              .sort((a, b) => b.gapMonthly - a.gapMonthly)
              .map(
                ({
                  category,
                  monthlySpend,
                  walletBest,
                  walletCardName,
                  walletMonthly,
                  marketBest,
                  marketCardName,
                  marketMonthly,
                  gapMonthly,
                }) => (
                  <div key={category.id} className="px-4 py-3.5 space-y-2.5">
                    {/* Category header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{category.icon}</span>
                        <span className="text-sm font-medium text-white/90">
                          {category.name}
                        </span>
                        <span className="text-xs text-white/25 font-mono">
                          AED {monthlySpend.toLocaleString()}/mo
                        </span>
                      </div>
                      <Link
                        href={`/recommend/${category.slug}`}
                        className="text-xs text-white/35 hover:text-white/60 transition-colors shrink-0"
                      >
                        Compare →
                      </Link>
                    </div>

                    {/* Gap bar visualisation */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
                        <div className="text-[10px] text-white/35 uppercase tracking-wide mb-1">
                          Your best card
                        </div>
                        <div className="font-medium text-white/75 truncate leading-snug">
                          {walletCardName}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="font-bold text-white/60 font-mono">
                            {walletBest.toFixed(1)}%
                          </span>
                          <span className="text-white/30 font-mono text-[10px]">
                            AED {walletMonthly.toFixed(0)}/mo
                          </span>
                        </div>
                        {/* Current bar */}
                        <div className="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white/20 rounded-full"
                            style={{
                              width: `${marketBest > 0 ? Math.round((walletBest / marketBest) * 100) : 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-[#22C55E]/6 rounded-lg px-3 py-2.5 border border-[#22C55E]/15">
                        <div className="text-[10px] text-[#22C55E]/60 uppercase tracking-wide mb-1">
                          Best available
                        </div>
                        <div className="font-medium text-[#22C55E]/90 truncate leading-snug">
                          {marketCardName}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="font-bold text-[#22C55E] font-mono">
                            {marketBest.toFixed(1)}%
                          </span>
                          <span className="text-[#22C55E]/50 font-mono text-[10px]">
                            AED {marketMonthly.toFixed(0)}/mo
                          </span>
                        </div>
                        {/* Market bar (always 100%) */}
                        <div className="mt-2 h-1 bg-[#22C55E]/15 rounded-full overflow-hidden">
                          <div className="h-full bg-[#22C55E] rounded-full w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Gap callout */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[11px] text-[#F59E0B] font-mono font-semibold shrink-0">
                        ⚡ +AED {gapMonthly.toFixed(0)}/mo if you switch
                      </span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                  </div>
                )
              )}
          </div>

          {/* Summary footer */}
          <div className="border-t border-white/5 px-4 py-3 bg-white/3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-white/35">Current (gap categories)</div>
              <div className="font-semibold font-mono text-white/60 mt-0.5">
                AED {Math.round(currentAnnual).toLocaleString()}/yr
              </div>
            </div>
            <div>
              <div className="text-white/35">Best possible</div>
              <div className="font-semibold font-mono text-[#22C55E] mt-0.5">
                AED {Math.round(bestAnnual).toLocaleString()}/yr
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Optimal strategy ─────────────────────────────────── */}
      <OptimalStrategy
        profile={profile}
        categories={categories}
        walletCardIds={walletIds}
      />
    </div>
  );
}

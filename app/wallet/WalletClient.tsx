"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SpendingCategory } from "@/lib/supabase";
import {
  getWalletCardIds,
  removeCardFromWallet,
  addCardToWallet,
  getSpendingProfile,
  type SpendingProfile,
} from "@/lib/wallet";
import { RewardRanked } from "@/lib/supabase";
import { getBestCardForCategory, computeMonthlyReward } from "@/lib/recommend";
import SpendingProfileComponent from "@/components/SpendingProfile";

interface CardSummary {
  id: string;
  name: string;
  bank_name: string;
  bank_short_name: string;
  annual_fee_aed: number;
  card_network: string | null;
  is_islamic: boolean;
  reward_currency_name: string | null;
}

interface Props {
  categories: SpendingCategory[];
  allCards: CardSummary[];
}

export default function WalletClient({ categories, allCards }: Props) {
  const [walletIds, setWalletIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<SpendingProfile>({});
  const [summaryData, setSummaryData] = useState<
    {
      category: SpendingCategory;
      monthlySpend: number;
      bestReward: RewardRanked | null;
      monthlyReward: number;
    }[]
  >([]);
  const [addSearch, setAddSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setWalletIds(getWalletCardIds());
    setProfile(getSpendingProfile());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    calculateSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletIds, profile, loaded]);

  async function calculateSummary() {
    if (walletIds.length === 0) {
      setSummaryData([]);
      return;
    }
    const results = await Promise.all(
      categories.map(async (cat) => {
        const spend = profile[cat.slug] ?? 0;
        const bestReward =
          spend > 0 ? await getBestCardForCategory(walletIds, cat.slug) : null;
        const monthlyReward = bestReward
          ? computeMonthlyReward(
              spend,
              bestReward.effective_return_pct,
              bestReward.monthly_cap_spend_aed,
              bestReward.monthly_cap_reward
            )
          : 0;
        return { category: cat, monthlySpend: spend, bestReward, monthlyReward };
      })
    );
    setSummaryData(results);
  }

  function removeCard(id: string) {
    removeCardFromWallet(id);
    setWalletIds((prev) => prev.filter((x) => x !== id));
  }

  function handleProfileSave(p: SpendingProfile) {
    setProfile(p);
  }

  const walletCards = allCards.filter((c) => walletIds.includes(c.id));
  const filteredAddCards = allCards
    .filter(
      (c) =>
        !walletIds.includes(c.id) &&
        (addSearch === "" ||
          c.name.toLowerCase().includes(addSearch.toLowerCase()) ||
          c.bank_name.toLowerCase().includes(addSearch.toLowerCase()))
    )
    .slice(0, 8);

  const hasProfile = Object.values(profile).some((v) => v > 0);
  const totalMonthlyReward = summaryData.reduce((s, r) => s + r.monthlyReward, 0);
  const totalAnnualReward = totalMonthlyReward * 12;

  if (!loaded) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[80, 200, 60].map((h, i) => (
          <div key={i} className="skeleton rounded-xl" style={{ height: h }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── 1. MY CARDS ─────────────────────────────────────────── */}
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-semibold text-white/90">My Cards</h2>
          <span className="text-xs text-white/30 font-mono">
            {walletCards.length} card{walletCards.length !== 1 ? "s" : ""}
          </span>
        </div>

        {walletCards.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">💳</div>
            <p className="text-sm text-white/40">No cards saved yet.</p>
            <p className="text-xs text-white/25 mt-1">
              Search below to add your cards.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {walletCards.map((card) => (
              <div
                key={card.id}
                className="px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white/90 leading-snug">
                    {card.name}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{card.bank_name}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/cards/${card.id}`}
                    className="text-xs text-white/30 hover:text-[#22C55E] transition-colors"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => removeCard(card.id)}
                    className="text-xs text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add card search */}
        <div className="p-4 border-t border-white/5 bg-white/3">
          <input
            type="text"
            placeholder="Search to add a card…"
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-white/8 rounded-lg focus:outline-none focus:border-[#6366F1]/50 bg-[#1A1D27] text-white/80 placeholder:text-white/25 transition-colors"
          />
          {addSearch.length > 0 && (
            <div className="mt-2 space-y-1">
              {filteredAddCards.length === 0 ? (
                <div className="text-xs text-white/30 px-1 py-1">
                  No cards found.
                </div>
              ) : (
                filteredAddCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      addCardToWallet(card.id);
                      setWalletIds((prev) => [...prev, card.id]);
                      setAddSearch("");
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm bg-white/5 border border-white/8 rounded-lg hover:border-[#6366F1]/40 hover:bg-white/8 transition-all duration-150 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-white/85">{card.name}</span>
                      <span className="text-white/30 ml-1.5">· {card.bank_short_name}</span>
                    </div>
                    <span className="text-[#6366F1] text-xs font-medium shrink-0 ml-2">
                      + Add
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. SPENDING PROFILE ─────────────────────────────────── */}
      <SpendingProfileComponent
        categories={categories}
        initialProfile={profile}
        onSave={handleProfileSave}
      />

      {/* ── 3. REWARDS SNAPSHOT ─────────────────────────────────── */}
      {walletCards.length > 0 && hasProfile && totalMonthlyReward > 0 && (
        <div className="bg-[#1A1D27] border border-white/8 rounded-xl p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
            Rewards Snapshot
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-white/40">Monthly</div>
              <div className="text-2xl font-bold text-[#22C55E] mt-0.5 font-mono tabular-nums">
                AED {Math.round(totalMonthlyReward).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Annual</div>
              <div className="text-2xl font-bold text-[#22C55E] mt-0.5 font-mono tabular-nums">
                AED {Math.round(totalAnnualReward).toLocaleString()}
              </div>
            </div>
          </div>
          {summaryData.filter((r) => r.monthlyReward > 0).length > 0 && (
            <div className="pt-3 border-t border-white/8 space-y-1.5">
              {summaryData
                .filter((r) => r.monthlyReward > 0)
                .sort((a, b) => b.monthlyReward - a.monthlyReward)
                .map((r) => (
                  <div
                    key={r.category.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-white/45 flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0">{r.category.icon}</span>
                      <span className="truncate">{r.category.name}</span>
                      {r.bestReward && (
                        <span className="text-white/22 truncate hidden sm:inline">
                          · {r.bestReward.card_name}
                        </span>
                      )}
                    </span>
                    <span className="text-[#22C55E] font-medium font-mono shrink-0 ml-2">
                      AED {Math.round(r.monthlyReward)}/mo
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. OPTIMIZE CTA ─────────────────────────────────────── */}
      {walletCards.length > 0 && hasProfile && (
        <Link
          href="/optimize"
          className="group block bg-[#1A1D27] border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 rounded-xl p-4 transition-all duration-150 card-lift"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                Could you be earning more?
              </div>
              <div className="text-xs text-white/40 mt-0.5">
                See which new cards would close the gap on your spend profile.
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[#F59E0B] group-hover:translate-x-0.5 transition-transform">
              Optimize
              <span className="text-base">→</span>
            </div>
          </div>
        </Link>
      )}

      {/* Prompt to complete setup if not ready for optimize */}
      {walletCards.length > 0 && !hasProfile && (
        <p className="text-center text-xs text-white/30 pb-2">
          Add a spending profile above to unlock portfolio optimization.
        </p>
      )}
    </div>
  );
}

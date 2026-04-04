"use client";

import { useState, useEffect } from "react";
import { RewardRanked } from "@/lib/supabase";
import { getWalletCardIds } from "@/lib/wallet";
import CardResult from "@/components/CardResult";
import Link from "next/link";

interface Props {
  allRewards: RewardRanked[];
  categorySlug: string;
  merchantName?: string;
  spendAmount?: number;
}

const DEFAULT_VISIBLE = 3;

export default function RecommendClient({
  allRewards,
  categorySlug,
  merchantName,
  spendAmount,
}: Props) {
  const [walletCardIds, setWalletCardIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAllOther, setShowAllOther] = useState(false);
  const [showAllMarket, setShowAllMarket] = useState(false);

  useEffect(() => {
    setWalletCardIds(getWalletCardIds());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading results">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (allRewards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-white/50 font-medium">No reward data for this category yet.</p>
        <p className="text-sm text-white/30 mt-1 mb-6">
          We&apos;re still verifying cards — check back soon.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6366F1] hover:text-[#818CF8] transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  const hasWallet = walletCardIds.length > 0;
  const walletRewards = allRewards.filter((r) => walletCardIds.includes(r.card_id));
  const otherRewards = allRewards.filter((r) => !walletCardIds.includes(r.card_id));

  // Top rate across all visible cards (for the relative performance bar)
  const globalTopRate = allRewards[0]?.effective_return_pct ?? 0;
  const walletTopRate = walletRewards[0]?.effective_return_pct ?? 0;
  const otherTopRate = otherRewards[0]?.effective_return_pct ?? 0;

  const visibleOther = showAllOther ? otherRewards : otherRewards.slice(0, DEFAULT_VISIBLE);
  const visibleMarket = showAllMarket ? allRewards : allRewards.slice(0, DEFAULT_VISIBLE);

  function SectionLabel({ label, count }: { label: string; count: number }) {
    return (
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
          {label}
        </span>
        <span className="text-xs text-white/20 font-mono">{count}</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasWallet ? (
        <>
          {/* Wallet cards */}
          {walletRewards.length > 0 ? (
            <section>
              <SectionLabel label="Your Wallet" count={walletRewards.length} />
              <div className="space-y-3">
                {walletRewards.map((reward, i) => (
                  <CardResult
                    key={reward.id}
                    reward={reward}
                    rank={i}
                    topRate={walletTopRate}
                    isPersonalized
                    spendAmount={spendAmount}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div className="bg-[#F59E0B]/6 border border-[#F59E0B]/15 rounded-xl p-4 text-sm text-[#F59E0B]">
              None of your saved cards have reward data for this category yet.
            </div>
          )}

          {/* Market comparison */}
          {otherRewards.length > 0 && (
            <section>
              <SectionLabel
                label="All Cards — Market Comparison"
                count={otherRewards.length}
              />
              <div className="space-y-3">
                {visibleOther.map((reward, i) => (
                  <CardResult
                    key={reward.id}
                    reward={reward}
                    rank={i}
                    topRate={otherTopRate}
                    spendAmount={spendAmount}
                  />
                ))}
              </div>
              {otherRewards.length > DEFAULT_VISIBLE && (
                <button
                  onClick={() => setShowAllOther((v) => !v)}
                  className="mt-3 w-full py-2.5 rounded-xl border border-white/8 text-sm text-white/35 hover:text-white/65 hover:border-white/15 transition-all duration-150"
                >
                  {showAllOther
                    ? "Show fewer ▲"
                    : `Show all ${otherRewards.length} cards ▼`}
                </button>
              )}
            </section>
          )}
        </>
      ) : (
        <>
          {/* No wallet — prompt + market ranking */}
          <div className="bg-[#6366F1]/8 border border-[#6366F1]/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white/90">
                Get personalised picks
              </div>
              <div className="text-xs text-white/45 mt-0.5">
                Add your cards to see which one you should actually use.
              </div>
            </div>
            <Link
              href="/wallet"
              className="shrink-0 bg-[#6366F1] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#4F46E5] transition-colors"
            >
              Add Cards
            </Link>
          </div>

          <section>
            <SectionLabel label="Best Cards in UAE" count={allRewards.length} />
            <div className="space-y-3">
              {visibleMarket.map((reward, i) => (
                <CardResult
                  key={reward.id}
                  reward={reward}
                  rank={i}
                  topRate={globalTopRate}
                  spendAmount={spendAmount}
                />
              ))}
            </div>
            {allRewards.length > DEFAULT_VISIBLE && (
              <button
                onClick={() => setShowAllMarket((v) => !v)}
                className="mt-3 w-full py-2.5 rounded-xl border border-white/8 text-sm text-white/35 hover:text-white/65 hover:border-white/15 transition-all duration-150"
              >
                {showAllMarket
                  ? "Show fewer ▲"
                  : `Show all ${allRewards.length} cards ▼`}
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}

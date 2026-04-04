"use client";

import { SpendingProfile } from "@/lib/wallet";
import { RewardRanked, SpendingCategory } from "@/lib/supabase";

interface CategoryResult {
  category: SpendingCategory;
  monthlySpend: number;
  bestReward: RewardRanked | null;
  monthlyReward: number;
}

interface Props {
  categoryResults: CategoryResult[];
}

export default function WalletSummary({ categoryResults }: Props) {
  const activeResults = categoryResults.filter((r) => r.monthlySpend > 0 && r.bestReward);
  const monthlyTotal = activeResults.reduce((sum, r) => sum + r.monthlyReward, 0);
  const annualTotal = monthlyTotal * 12;

  if (activeResults.length === 0) {
    return (
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-5 text-center text-sm text-white/30">
        Fill in your spending profile above to see your estimated rewards.
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <div className="text-xs text-white/40 uppercase tracking-widest">Estimated annual rewards</div>
        <div className="text-3xl font-bold mt-1 text-[#22C55E] font-mono tabular-nums">
          AED {annualTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </div>
        <div className="text-sm text-white/40 font-mono mt-0.5">
          AED {monthlyTotal.toFixed(0)} / month
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {activeResults.map((r) => (
          <div key={r.category.id} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{r.category.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/80">{r.category.name}</div>
                <div className="text-xs text-white/35 truncate font-mono">
                  {r.bestReward?.card_name} · {r.bestReward?.effective_return_pct.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-[#22C55E] font-mono">
                AED {r.monthlyReward.toFixed(0)}/mo
              </div>
              <div className="text-xs text-white/25 font-mono">
                on AED {r.monthlySpend.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

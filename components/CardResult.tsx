"use client";

import { useState } from "react";
import { RewardRanked } from "@/lib/supabase";
import AddToWalletButton from "./AddToWalletButton";

interface Props {
  reward: RewardRanked;
  rank: number;
  topRate?: number;
  isPersonalized?: boolean;
  spendAmount?: number;
}

export default function CardResult({
  reward,
  rank,
  topRate,
  isPersonalized,
  spendAmount,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const displayRate =
    reward.category_slug === "international" && reward.net_return_pct != null
      ? reward.net_return_pct
      : reward.effective_return_pct;

  const estimatedReward =
    spendAmount != null ? (spendAmount * displayRate) / 100 : null;

  const daysAgo = reward.last_verified_date
    ? Math.floor(
        (Date.now() - new Date(reward.last_verified_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isTopRank = rank === 0;
  const isHighlighted = isPersonalized && isTopRank;

  // Relative performance bar width (0–100)
  const barPct =
    topRate && topRate > 0
      ? Math.min(100, Math.round((displayRate / topRate) * 100))
      : null;

  return (
    <div
      className={[
        "rounded-xl border border-l-2 bg-[#1A1D27] animate-fade-in-up overflow-hidden transition-shadow duration-200",
        isTopRank
          ? "border-white/10 border-l-[#22C55E] shadow-[0_0_0_1px_rgba(34,197,94,0.2),0_0_24px_rgba(34,197,94,0.08)]"
          : "border-white/8 border-l-[#6366F1]/40 hover:border-white/15",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(rank, 8) * 50}ms` }}
    >
      {/* Personalized best-card banner */}
      {isHighlighted && (
        <div className="bg-[#22C55E]/10 text-[#22C55E] text-[11px] font-semibold px-4 py-1.5 border-b border-[#22C55E]/15 tracking-widest uppercase">
          Your best card for this category
        </div>
      )}

      <div className="p-4">
        {/* ── Header row ─────────────────────────────── */}
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <div
            className={[
              "shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold font-mono mt-0.5",
              isTopRank
                ? "bg-[#22C55E] text-black"
                : "bg-[#262B3E] text-white/40",
            ].join(" ")}
          >
            {rank + 1}
          </div>

          {/* Card name + bank */}
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-white/90 text-sm leading-snug"
              title={reward.card_name}
            >
              {reward.card_name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs text-white/40">{reward.bank_name}</span>
              {(reward.is_general_fallback || reward.is_base_rate_fallback) && (
                <span className="text-[10px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded-full border border-white/8">
                  general rate
                </span>
              )}
            </div>
          </div>

          {/* Rate block */}
          <div className="shrink-0 text-right min-w-[56px]">
            <div
              className={[
                "text-2xl font-bold leading-none font-mono tabular-nums",
                isTopRank ? "text-[#22C55E]" : "text-[#22C55E]/90",
              ].join(" ")}
            >
              {displayRate.toFixed(1)}%
            </div>
            <div className="text-[11px] text-white/35 capitalize mt-0.5">
              {reward.reward_type ?? "reward"}
            </div>
            {/* Cap inline with rate */}
            {reward.monthly_cap_spend_aed != null && (
              <div className="text-[10px] text-[#F59E0B] font-mono mt-0.5 whitespace-nowrap">
                cap {reward.monthly_cap_spend_aed.toLocaleString()}
              </div>
            )}
            {reward.monthly_cap_reward != null &&
              reward.monthly_cap_spend_aed == null && (
                <div className="text-[10px] text-[#F59E0B] font-mono mt-0.5 whitespace-nowrap">
                  max {reward.monthly_cap_reward.toLocaleString()}
                </div>
              )}
          </div>
        </div>

        {/* ── Relative performance bar ────────────────── */}
        {barPct !== null && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all duration-500",
                  isTopRank ? "bg-[#22C55E]" : "bg-[#22C55E]/50",
                ].join(" ")}
                style={{ width: `${barPct}%` }}
              />
            </div>
            {!isTopRank && (
              <span className="text-[10px] text-white/25 font-mono shrink-0">
                {barPct}% of best
              </span>
            )}
          </div>
        )}

        {/* ── Estimated reward ────────────────────────── */}
        {estimatedReward != null && (
          <div className="mt-3 bg-[#22C55E]/8 border border-[#22C55E]/15 rounded-lg px-3 py-2 text-sm text-[#22C55E] font-medium font-mono">
            ≈ AED {estimatedReward.toFixed(0)} on this purchase
          </div>
        )}

        {/* ── Conditions ──────────────────────────────── */}
        <div className="mt-2.5 space-y-1.5">
          {reward.min_monthly_spend_aed != null && (
            <div className="flex items-start gap-2 text-xs text-[#F59E0B] bg-[#F59E0B]/6 border border-[#F59E0B]/15 rounded-lg px-3 py-2">
              <span className="shrink-0 mt-px">⚠</span>
              <span>
                Requires AED{" "}
                {reward.min_monthly_spend_aed.toLocaleString()} total monthly
                spend
              </span>
            </div>
          )}
          {reward.exclusions && (
            <div className="flex items-start gap-2 text-xs text-[#F59E0B] bg-[#F59E0B]/6 border border-[#F59E0B]/15 rounded-lg px-3 py-2">
              <span className="shrink-0 mt-px">⚠</span>
              <span>{reward.exclusions}</span>
            </div>
          )}
          {reward.category_slug === "international" &&
            reward.forex_markup_pct != null && (
              <div className="flex items-start gap-2 text-xs text-white/45 bg-white/4 border border-white/8 rounded-lg px-3 py-2 font-mono">
                <span className="shrink-0 mt-px">ℹ</span>
                <span>
                  {reward.effective_return_pct.toFixed(1)}% reward −{" "}
                  {reward.forex_markup_pct.toFixed(1)}% forex ={" "}
                  {displayRate.toFixed(1)}% net
                </span>
              </div>
            )}
        </div>

        {/* ── Notes ───────────────────────────────────── */}
        {reward.notes && (() => {
          const giftIdx = reward.notes.indexOf("🎁");
          const baseNote = giftIdx > 0 ? reward.notes.slice(0, giftIdx).trim().replace(/\.$/, "") : null;
          // Truncate bonus to first sentence only — avoids leaking inline math like "2.45%" into the callout
          const bonusNote = (() => {
            if (giftIdx === -1) return null;
            const raw = reward.notes.slice(giftIdx).trim();
            const firstPeriod = raw.indexOf(". ", 5); // skip emoji itself
            return firstPeriod > 0 ? raw.slice(0, firstPeriod + 1) : raw;
          })();
          const plainNote = giftIdx === -1 ? reward.notes : null;
          return (
            <div className="mt-2 space-y-1.5">
              {/* Plain note (no brand bonus) */}
              {plainNote && (
                <div className="text-xs text-white/45 bg-white/4 border border-white/8 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="shrink-0 mt-px">ℹ</span>
                  <span>{plainNote}</span>
                </div>
              )}
              {/* Base rate context (text before 🎁) */}
              {baseNote && (
                <div className="text-xs text-white/40 bg-white/3 border border-white/6 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="shrink-0 mt-px">ℹ</span>
                  <span>{baseNote}</span>
                </div>
              )}
              {/* Brand bonus callout */}
              {bonusNote && (
                <div className="text-xs text-[#22C55E] bg-[#22C55E]/6 border border-[#22C55E]/15 rounded-lg px-3 py-2">
                  {bonusNote}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Active offers ────────────────────────────── */}
        {reward.active_offers && reward.active_offers.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {reward.active_offers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-start gap-2 text-xs text-[#22C55E] bg-[#22C55E]/6 border border-[#22C55E]/15 rounded-lg px-3 py-2"
              >
                <span className="shrink-0">🎁</span>
                <span className="font-medium">{offer.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer row ──────────────────────────────── */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
          {/* Left: meta */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {daysAgo != null && (
              <span className="text-[10px] text-white/20 font-mono shrink-0">
                verified {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
              </span>
            )}
            {reward.is_promotional && reward.promo_end_date && (
              <span className="text-[10px] bg-[#F59E0B]/8 text-[#F59E0B] border border-[#F59E0B]/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                promo until{" "}
                {new Date(reward.promo_end_date).toLocaleDateString("en-AE", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <AddToWalletButton cardId={reward.card_id} />
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
            >
              {expanded ? "Less ▲" : "More ▼"}
            </button>
          </div>
        </div>

        {/* ── Expanded details ─────────────────────────── */}
        {expanded && (() => {
          // Derive point value for points/miles cards
          // per_aed: point_value = effective_return_pct / (earn_rate × 100)
          // per_usd: point_value = effective_return_pct × 3.673 / (earn_rate × 100)
          const isPoints = reward.earn_rate != null && reward.earn_unit != null &&
            (reward.earn_unit === "per_aed" || reward.earn_unit === "per_usd");
          let pointValue: number | null = null;
          if (isPoints && reward.earn_rate && reward.earn_rate > 0) {
            const usdFactor = reward.earn_unit === "per_usd" ? 3.673 : 1;
            pointValue = (reward.effective_return_pct * usdFactor) / (reward.earn_rate * 100);
          }

          // Human-readable earn rate label
          let earnLabel = `${displayRate.toFixed(2)}% back`;
          if (reward.earn_rate != null) {
            const unitLabel = reward.earn_unit === "per_aed" ? "pts per AED"
              : reward.earn_unit === "per_usd" ? "pts per USD"
              : reward.earn_unit ?? "";
            earnLabel = `${reward.earn_rate} ${unitLabel}`;
          }

          return (
            <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <div className="text-white/35">Annual fee</div>
                  <div className="font-medium text-white/75 font-mono mt-0.5">
                    {(reward.annual_fee_aed ?? 0) === 0
                      ? "Free"
                      : `AED ${(reward.annual_fee_aed ?? 0).toLocaleString()}`}
                  </div>
                </div>
                <div>
                  <div className="text-white/35">Earn rate</div>
                  <div className="font-medium text-white/75 font-mono mt-0.5">{earnLabel}</div>
                </div>
                {/* Point value row — only for points/miles with derivable value */}
                {pointValue != null && (
                  <div className="col-span-2">
                    <div className="text-white/35 mb-0.5">How {displayRate.toFixed(1)}% is calculated</div>
                    <div className="font-mono text-white/60 bg-white/4 border border-white/6 rounded-lg px-3 py-2 leading-relaxed">
                      {reward.earn_unit === "per_usd" ? (
                        <>
                          {reward.earn_rate} pts/USD × AED {pointValue.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")} per pt ÷ 3.673 (USD→AED) = {displayRate.toFixed(2)}%
                        </>
                      ) : (
                        <>
                          {reward.earn_rate} pts/AED × AED {pointValue.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")} per pt = {displayRate.toFixed(2)}%
                        </>
                      )}
                      <div className="mt-1 text-white/40">
                        1 point = AED {pointValue.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}
                      </div>
                    </div>
                  </div>
                )}
                {reward.min_txn_amount_aed != null && (
                  <div>
                    <div className="text-white/35">Min transaction</div>
                    <div className="font-medium text-white/75 font-mono mt-0.5">
                      AED {reward.min_txn_amount_aed.toLocaleString()}
                    </div>
                  </div>
                )}
                {reward.source_url && (
                  <div>
                    <div className="text-white/35">Source</div>
                    <a
                      href={reward.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/30 hover:text-white/55 underline underline-offset-2 transition-colors mt-0.5 block truncate"
                    >
                      Bank T&amp;C ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

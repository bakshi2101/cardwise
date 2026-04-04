import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToWalletButton from "@/components/AddToWalletButton";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;

  const [
    { data: card },
    { data: rewards },
    { data: benefits },
    { data: offers },
    { data: transferPartners },
  ] = await Promise.all([
    supabase
      .from("cards_with_bank")
      .select("*")
      .eq("id", id)
      .single(),
    // Query card_rewards directly to guarantee cap columns are returned
    supabase
      .from("card_rewards")
      .select("*, category:spending_categories(name, slug, icon)")
      .eq("card_id", id)
      .eq("is_active", true)
      .order("effective_return_pct", { ascending: false }),
    supabase
      .from("card_benefits")
      .select("*")
      .eq("card_id", id)
      .eq("is_active", true),
    supabase
      .from("offers")
      .select("*")
      .eq("card_id", id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString().split("T")[0]),
    supabase
      .from("transfer_partners")
      .select("*, program:loyalty_programs(*)")
      .eq("card_id", id)
      .eq("is_active", true),
  ]);

  if (!card) notFound();

  const networkBadgeColor: Record<string, string> = {
    visa: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    mastercard: "bg-red-500/10 text-red-400 border border-red-500/20",
    amex: "bg-green-500/10 text-green-400 border border-green-500/20",
  };

  // Group benefits by type
  const benefitsByType: Record<string, typeof benefits> = {};
  for (const b of benefits ?? []) {
    const type = b.benefit_type ?? "Other";
    if (!benefitsByType[type]) benefitsByType[type] = [];
    benefitsByType[type]!.push(b);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Link href="/cards" className="text-sm text-white/30 hover:text-white/60 transition-colors">
        ← All Cards
      </Link>

      {/* Hero */}
      <div className="bg-[#1A1D27] border border-white/8 text-white rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold leading-tight">{card.name}</h1>
            <div className="text-white/70 mt-1">{card.bank_name}</div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {card.card_network && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${networkBadgeColor[card.card_network] ?? "bg-white/10 text-white"}`}>
                  {card.card_network}
                </span>
              )}
              {card.is_islamic && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  Islamic
                </span>
              )}
              {card.card_tier && (
                <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                  {card.card_tier}
                </span>
              )}
            </div>
          </div>
          <AddToWalletButton cardId={card.id} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/8">
          <div>
            <div className="text-xs text-white/40">Annual Fee</div>
            <div className="font-semibold mt-0.5 font-mono text-white/90">
              {(card.annual_fee_aed ?? 0) === 0 ? "Free" : `AED ${(card.annual_fee_aed ?? 0).toLocaleString()}`}
            </div>
          </div>
          {card.min_salary_aed && (
            <div>
              <div className="text-xs text-white/40">Min. Salary</div>
              <div className="font-semibold mt-0.5 font-mono text-white/90">AED {card.min_salary_aed.toLocaleString()}</div>
            </div>
          )}
          {card.forex_markup_pct != null && (
            <div>
              <div className="text-xs text-white/40">Forex Fee</div>
              <div className="font-semibold mt-0.5 font-mono text-white/90">{card.forex_markup_pct}%</div>
            </div>
          )}
          {(card.lounge_access_count ?? 0) > 0 && (
            <div>
              <div className="text-xs text-white/40">Lounge Access</div>
              <div className="font-semibold mt-0.5 font-mono text-white/90">{card.lounge_access_count}x/year</div>
            </div>
          )}
          {card.annual_fee_waiver_spend && (
            <div>
              <div className="text-xs text-white/40">Fee Waiver at</div>
              <div className="font-semibold mt-0.5 font-mono text-white/90">AED {card.annual_fee_waiver_spend.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {card.summary && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-4">
          <p className="text-sm text-white/60 leading-relaxed">{card.summary}</p>
        </div>
      )}

      {/* Rewards by category */}
      {rewards && rewards.length > 0 && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <h2 className="font-semibold text-white/90">Rewards by Category</h2>
          </div>
          <div className="divide-y divide-white/5">
            {rewards.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{r.category?.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/80">{r.category?.name}</div>
                    {r.exclusions && (
                      <div className="text-xs text-[#F59E0B] mt-0.5">⚠ {r.exclusions}</div>
                    )}
                    {r.notes && (
                      r.notes.includes("🎁") ? (
                        <div className="text-xs text-[#22C55E] font-medium mt-0.5">{r.notes}</div>
                      ) : (
                        <div className="text-xs text-white/40 mt-0.5">ℹ {r.notes}</div>
                      )
                    )}
                    {r.monthly_cap_spend_aed != null && (
                      <div className="text-xs text-[#F59E0B] font-medium mt-0.5 font-mono">
                        ⚠ Capped at AED {r.monthly_cap_spend_aed.toLocaleString()} spend/mo
                        {r.monthly_cap_reward != null && ` (max AED ${r.monthly_cap_reward.toLocaleString()})`}
                      </div>
                    )}
                    {r.monthly_cap_reward != null && r.monthly_cap_spend_aed == null && (
                      <div className="text-xs text-[#F59E0B] font-medium mt-0.5 font-mono">
                        ⚠ Max AED {r.monthly_cap_reward.toLocaleString()} reward/mo
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#22C55E] font-mono">{r.effective_return_pct.toFixed(1)}%</div>
                  <div className="text-xs text-white/30 capitalize">{r.reward_type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      {Object.keys(benefitsByType).length > 0 && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <h2 className="font-semibold text-white/90">Card Benefits</h2>
          </div>
          {Object.entries(benefitsByType).map(([type, bens]) => (
            <div key={type}>
              <div className="px-4 py-2 bg-white/3 text-xs font-semibold text-white/30 uppercase tracking-widest">
                {type}
              </div>
              {bens?.map((b) => (
                <div key={b.id} className="px-4 py-3 border-t border-white/5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/80">{b.title}</div>
                    {b.description && (
                      <div className="text-xs text-white/40 mt-0.5">{b.description}</div>
                    )}
                    {b.conditions && (
                      <div className="text-xs text-white/25 mt-0.5 italic">{b.conditions}</div>
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
          ))}
        </div>
      )}

      {/* Active offers */}
      {offers && offers.length > 0 && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <h2 className="font-semibold text-white/90">Current Offers</h2>
          </div>
          <div className="divide-y divide-white/5">
            {offers.map((offer) => (
              <div key={offer.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-white/80">🎁 {offer.title}</div>
                    {offer.description && (
                      <div className="text-xs text-white/40 mt-0.5">{offer.description}</div>
                    )}
                    {offer.end_date && (
                      <div className="text-xs text-[#F59E0B] mt-1">
                        Ends {new Date(offer.end_date).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>
                  {offer.discount_value != null && (
                    <span className="text-sm font-bold text-[#22C55E] shrink-0 font-mono">
                      {offer.discount_type === "percentage" ? `${offer.discount_value}%` : `AED ${offer.discount_value}`} off
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer partners */}
      {transferPartners && transferPartners.length > 0 && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <h2 className="font-semibold text-white/90">Transfer Partners</h2>
          </div>
          <div className="divide-y divide-white/5">
            {transferPartners.map((tp) => (
              <div key={tp.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white/80">{tp.program?.name}</div>
                  <div className="text-xs text-white/40 capitalize">{tp.program?.program_type}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold text-white/80 font-mono">
                    {tp.ratio_from}:{tp.ratio_to}
                  </div>
                  {tp.transfer_time_days != null && (
                    <div className="text-xs text-white/30 font-mono">{tp.transfer_time_days}d transfer</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      {card.source_url && (
        <div className="text-center">
          <a
            href={card.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/20 hover:text-white/40 underline transition-colors"
          >
            Data sourced from {card.bank_name} ↗
          </a>
        </div>
      )}
    </div>
  );
}

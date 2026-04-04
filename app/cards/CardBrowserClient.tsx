"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/lib/supabase";

interface Bank {
  id: string;
  name: string;
  short_name: string;
}

interface Props {
  cards: (Card & { bank_name: string; bank_short_name: string })[];
  banks: Bank[];
}

const NETWORKS = ["visa", "mastercard", "amex"] as const;

const networkLabels: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
};

export default function CardBrowserClient({ cards, banks }: Props) {
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [islamicOnly, setIslamicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"annual_fee" | "name">("annual_fee");
  const [showFilters, setShowFilters] = useState(false);

  function toggleBank(id: string) {
    setSelectedBanks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function toggleNetwork(n: string) {
    setSelectedNetworks((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  }

  function clearFilters() {
    setSelectedBanks([]);
    setSelectedNetworks([]);
    setIslamicOnly(false);
  }

  let filtered = cards.filter((c) => {
    if (selectedBanks.length > 0 && !selectedBanks.includes(c.bank_id)) return false;
    if (selectedNetworks.length > 0 && !selectedNetworks.includes(c.card_network ?? "")) return false;
    if (islamicOnly && !c.is_islamic) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "annual_fee") return (a.annual_fee_aed ?? 0) - (b.annual_fee_aed ?? 0);
    return a.name.localeCompare(b.name);
  });

  const hasActiveFilters =
    selectedBanks.length > 0 || selectedNetworks.length > 0 || islamicOnly;

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">
          Sort by
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="w-full text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]/50 bg-[#0F1117] text-white/80 transition-colors"
        >
          <option value="annual_fee">Annual Fee (low to high)</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {/* Network */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">
          Network
        </div>
        <div className="space-y-2">
          {NETWORKS.map((n) => (
            <label
              key={n}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedNetworks.includes(n)}
                onChange={() => toggleNetwork(n)}
                className="rounded border-white/20 bg-white/5 accent-[#6366F1] w-4 h-4"
              />
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                {networkLabels[n]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bank */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">
          Bank
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {banks.map((bank) => (
            <label
              key={bank.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBanks.includes(bank.id)}
                onChange={() => toggleBank(bank.id)}
                className="rounded border-white/20 bg-white/5 accent-[#6366F1] w-4 h-4"
              />
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                {bank.short_name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Islamic */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={islamicOnly}
            onChange={(e) => setIslamicOnly(e.target.checked)}
            className="rounded border-white/20 bg-white/5 accent-[#6366F1] w-4 h-4"
          />
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
            Islamic cards only
          </span>
        </label>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-xs text-red-400/70 hover:text-red-400 transition-colors py-1"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Mobile filter toggle bar */}
      <div className="lg:hidden flex items-center justify-between mb-4 gap-3">
        <div className="text-sm text-white/30 font-mono">{filtered.length} cards</div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={[
            "flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg border transition-all duration-150",
            hasActiveFilters
              ? "border-[#6366F1]/40 text-[#6366F1] bg-[#6366F1]/8"
              : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70",
          ].join(" ")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M1 3h12M3 7h8M5 11h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-[#6366F1] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {selectedBanks.length + selectedNetworks.length + (islamicOnly ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden mb-4 bg-[#1A1D27] border border-white/8 rounded-xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white/90">Filters</span>
            <button
              onClick={() => setShowFilters(false)}
              className="text-white/30 hover:text-white/60 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          <FilterPanel />
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-4 sticky top-20">
            <FilterPanel />
          </div>
        </aside>

        {/* Card grid */}
        <div className="flex-1 min-w-0">
          <div className="hidden lg:block text-sm text-white/30 font-mono mb-4">
            {filtered.length} cards
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">🔍</div>
              <div className="text-white/40 font-medium">No cards match your filters.</div>
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-[#6366F1] hover:text-[#818CF8] transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="group bg-[#1A1D27] border border-white/8 border-l-2 border-l-[#6366F1]/40 rounded-xl p-4 hover:border-white/15 hover:border-l-[#22C55E]/50 card-lift transition-all duration-200 block"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <div className="font-semibold text-white/90 text-sm leading-snug group-hover:text-white transition-colors">
                        {card.name}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{card.bank_name}</div>
                    </div>
                    {card.card_network && (
                      <span className="text-[10px] bg-white/5 text-white/35 px-2 py-0.5 rounded-full shrink-0 capitalize border border-white/8">
                        {card.card_network}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">
                      Annual fee:{" "}
                      <span className="font-semibold text-white/70 font-mono">
                        {(card.annual_fee_aed ?? 0) === 0
                          ? "Free"
                          : `AED ${(card.annual_fee_aed ?? 0).toLocaleString()}`}
                      </span>
                    </span>
                    {card.is_islamic && (
                      <span className="bg-[#22C55E]/8 text-[#22C55E] border border-[#22C55E]/15 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                        Islamic
                      </span>
                    )}
                  </div>
                  {card.summary && (
                    <p className="text-xs text-white/30 mt-2 line-clamp-2 leading-relaxed">
                      {card.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

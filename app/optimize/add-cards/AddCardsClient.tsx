"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getWalletCardIds,
  addCardToWallet,
  removeCardFromWallet,
} from "@/lib/wallet";

interface CardSummary {
  id: string;
  name: string;
  bank_name: string;
  bank_short_name: string;
  annual_fee_aed: number;
}

interface Props {
  allCards: CardSummary[];
}

export default function AddCardsClient({ allCards }: Props) {
  const router = useRouter();
  const [walletIds, setWalletIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWalletIds(getWalletCardIds());
    setMounted(true);
  }, []);

  function add(id: string) {
    addCardToWallet(id);
    setWalletIds((prev) => [...prev, id]);
    setSearch("");
  }

  function remove(id: string) {
    removeCardFromWallet(id);
    setWalletIds((prev) => prev.filter((x) => x !== id));
  }

  const walletCards = allCards.filter((c) => walletIds.includes(c.id));
  const filteredSearch = allCards
    .filter(
      (c) =>
        !walletIds.includes(c.id) &&
        search.length > 0 &&
        (c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.bank_name.toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, 8);

  if (!mounted) {
    return <div className="skeleton rounded-xl h-48" />;
  }

  return (
    <div className="space-y-4">
      {/* Saved cards */}
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
            <p className="text-sm text-white/40">No cards added yet.</p>
            <p className="text-xs text-white/25 mt-1">Search below to add your cards.</p>
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
                  <div className="text-xs text-white/35 mt-0.5 flex items-center gap-2">
                    <span>{card.bank_name}</span>
                    {card.annual_fee_aed > 0 && (
                      <span className="font-mono">
                        AED {card.annual_fee_aed.toLocaleString()}/yr
                      </span>
                    )}
                    {card.annual_fee_aed === 0 && (
                      <span className="text-[#22C55E]/70">Free</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/cards/${card.id}`}
                    className="text-xs text-white/25 hover:text-white/55 transition-colors"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => remove(card.id)}
                    className="text-xs text-white/25 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search to add */}
        <div className="p-4 border-t border-white/5 bg-white/2">
          <input
            type="text"
            placeholder="Search cards to add…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-white/8 rounded-lg focus:outline-none focus:border-[#6366F1]/50 bg-[#1A1D27] text-white/80 placeholder:text-white/25 transition-colors"
          />
          {search.length > 0 && (
            <div className="mt-2 space-y-1">
              {filteredSearch.length === 0 ? (
                <p className="text-xs text-white/25 px-1 py-1">No cards found.</p>
              ) : (
                filteredSearch.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => add(card.id)}
                    className="w-full text-left px-3 py-2.5 text-sm bg-white/5 border border-white/8 rounded-lg hover:border-[#6366F1]/40 hover:bg-white/8 transition-all duration-150 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-white/85">{card.name}</span>
                      <span className="text-white/30 ml-1.5 text-xs">· {card.bank_short_name}</span>
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

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/"
          className="text-sm text-white/35 hover:text-white/60 transition-colors"
        >
          ← Back
        </Link>
        <button
          onClick={() => router.push("/optimize/spending")}
          disabled={walletCards.length === 0}
          className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
      {walletCards.length === 0 && (
        <p className="text-xs text-white/25 text-center">
          Add at least one card to continue.
        </p>
      )}
    </div>
  );
}

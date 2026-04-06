"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getRecommendPreferences,
  saveRecommendPreferences,
  type RecommendPreferences,
  type LoyaltyStatus,
} from "@/lib/wallet";

interface Bank {
  id: string;
  short_name: string;
  name: string;
}

interface CardOption {
  id: string;
  name: string;
  bank_short_name: string;
}

interface Props {
  banks: Bank[];
}

const BENEFIT_OPTIONS = [
  { value: "lounge_access",    label: "Airport lounge access",  emoji: "🛋️" },
  { value: "valet_parking",    label: "Valet parking",          emoji: "🚗" },
  { value: "travel_insurance", label: "Travel insurance",       emoji: "🛡️" },
  { value: "airport_transfer", label: "Airport transfers",      emoji: "✈️" },
  { value: "cinema",           label: "Cinema / entertainment", emoji: "🎬" },
  { value: "golf",             label: "Golf benefits",          emoji: "⛳" },
  { value: "gym_membership",   label: "Gym membership",         emoji: "💪" },
  { value: "dining_discount",  label: "Dining discounts",       emoji: "🍽️" },
  { value: "hotel_discount",   label: "Hotel discounts",        emoji: "🏨" },
  { value: "concierge",        label: "Concierge service",      emoji: "🎩" },
];

const LOYALTY_OPTIONS: { value: LoyaltyStatus; label: string; program: string; emoji: string }[] = [
  { value: "etihad_silver",        label: "Etihad Guest Silver",          program: "Etihad",   emoji: "🇦🇪" },
  { value: "etihad_gold",          label: "Etihad Guest Gold",            program: "Etihad",   emoji: "🇦🇪" },
  { value: "skywards_silver",      label: "Emirates Skywards Silver",     program: "Emirates", emoji: "✈️" },
  { value: "skywards_gold",        label: "Emirates Skywards Gold",       program: "Emirates", emoji: "✈️" },
  { value: "marriott_silver_gold", label: "Marriott Bonvoy Silver / Gold Elite", program: "Marriott", emoji: "🏨" },
  { value: "marriott_platinum",    label: "Marriott Bonvoy Platinum Elite",      program: "Marriott", emoji: "🏨" },
  { value: "ihg_silver_gold",      label: "IHG Silver / Gold Elite",     program: "IHG",      emoji: "🏨" },
];

export default function PreferencesClient({ banks }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<RecommendPreferences>({
    maxCards: 3,
    benefits: [],
    bankIds: [],
    salaryTier: "mid",
    loyaltyStatus: [],
    pinnedCardIds: [],
  });
  const [mounted, setMounted] = useState(false);

  // Pinned card search state
  const [cardQuery, setCardQuery] = useState("");
  const [cardResults, setCardResults] = useState<CardOption[]>([]);
  const [pinnedCards, setPinnedCards] = useState<CardOption[]>([]); // full objects for display
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = getRecommendPreferences();
    setPrefs(saved);
    // Re-hydrate pinned card names for display
    if (saved.pinnedCardIds.length > 0) {
      supabase
        .from("cards_with_bank")
        .select("id, name, bank_short_name")
        .in("id", saved.pinnedCardIds)
        .then(({ data }) => {
          if (data) setPinnedCards(data.map((c) => ({ id: c.id, name: c.name, bank_short_name: c.bank_short_name })));
        });
    }
    setMounted(true);
  }, []);

  function handleCardQueryChange(q: string) {
    setCardQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.trim().length < 2) {
      setCardResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const { data } = await supabase
        .from("cards_with_bank")
        .select("id, name, bank_short_name")
        .ilike("name", `%${q.trim()}%`)
        .eq("is_active", true)
        .order("name")
        .limit(8);
      setCardResults((data ?? []).map((c) => ({ id: c.id, name: c.name, bank_short_name: c.bank_short_name })));
      setSearching(false);
    }, 300);
  }

  function pinCard(card: CardOption) {
    if (pinnedCards.some((c) => c.id === card.id)) return;
    const next = [...pinnedCards, card];
    setPinnedCards(next);
    setPrefs((p) => ({ ...p, pinnedCardIds: next.map((c) => c.id) }));
    setCardQuery("");
    setCardResults([]);
  }

  function unpinCard(cardId: string) {
    const next = pinnedCards.filter((c) => c.id !== cardId);
    setPinnedCards(next);
    setPrefs((p) => ({ ...p, pinnedCardIds: next.map((c) => c.id) }));
  }

  function toggleBenefit(value: string) {
    setPrefs((p) => ({
      ...p,
      benefits: p.benefits.includes(value)
        ? p.benefits.filter((b) => b !== value)
        : [...p.benefits, value],
    }));
  }

  function toggleBank(id: string) {
    setPrefs((p) => ({
      ...p,
      bankIds: p.bankIds.includes(id)
        ? p.bankIds.filter((b) => b !== id)
        : [...p.bankIds, id],
    }));
  }

  function toggleLoyalty(value: LoyaltyStatus) {
    setPrefs((p) => {
      if (value === ("none" as LoyaltyStatus)) {
        return { ...p, loyaltyStatus: [] };
      }
      const next = p.loyaltyStatus.includes(value)
        ? p.loyaltyStatus.filter((s) => s !== value)
        : [...p.loyaltyStatus, value];
      return { ...p, loyaltyStatus: next };
    });
  }

  function handleContinue() {
    saveRecommendPreferences(prefs);
    router.push("/recommend/results");
  }

  if (!mounted) {
    return <div className="skeleton rounded-xl h-96" />;
  }

  return (
    <div className="space-y-6">

      {/* ── How many cards? ──────────────────────────────────── */}
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-5">
        <h2 className="font-semibold text-white/90 mb-1">
          How many cards are you comfortable holding?
        </h2>
        <p className="text-xs text-white/35 mb-4">
          More cards can unlock higher rewards, but require more management.
        </p>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 1, label: "1", sub: "Keep it simple" },
            { value: 2, label: "2", sub: "Good balance" },
            { value: 3, label: "3", sub: "Optimised" },
            { value: 4, label: "4+", sub: "Power user" },
          ].map(({ value, label, sub }) => (
            <button
              key={value}
              onClick={() => setPrefs((p) => ({ ...p, maxCards: value }))}
              className={[
                "flex flex-col items-center px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 min-w-[72px]",
                prefs.maxCards === value
                  ? "bg-[#6366F1]/15 border-[#6366F1]/50 text-white"
                  : "bg-white/4 border-white/8 text-white/50 hover:border-white/20 hover:text-white/70",
              ].join(" ")}
            >
              <span className="text-lg font-bold">{label}</span>
              <span className="text-[10px] font-normal text-current opacity-60 mt-0.5 whitespace-nowrap">
                {sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Benefits ─────────────────────────────────────────── */}
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-5">
        <h2 className="font-semibold text-white/90 mb-1">
          What benefits matter to you?
        </h2>
        <p className="text-xs text-white/35 mb-4">
          We&apos;ll prioritise cards with these perks. Leave blank to optimise purely on rewards.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BENEFIT_OPTIONS.map(({ value, label, emoji }) => {
            const active = prefs.benefits.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleBenefit(value)}
                className={[
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm text-left transition-all duration-150",
                  active
                    ? "bg-[#22C55E]/8 border-[#22C55E]/30 text-white/90"
                    : "bg-white/3 border-white/8 text-white/50 hover:border-white/15 hover:text-white/70",
                ].join(" ")}
              >
                <span className="text-base shrink-0">{emoji}</span>
                <span className="flex-1">{label}</span>
                <span
                  className={[
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors",
                    active
                      ? "bg-[#22C55E] border-[#22C55E] text-black"
                      : "border-white/20 text-transparent",
                  ].join(" ")}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loyalty status ───────────────────────────────────── */}
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-5">
        <h2 className="font-semibold text-white/90 mb-1">
          Do you have any loyalty status you want to protect?
        </h2>
        <p className="text-xs text-white/35 mb-4">
          We&apos;ll weight cards that earn in your programme higher — because switching away
          carries a real cost when you have status to protect.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {LOYALTY_OPTIONS.map(({ value, label, emoji }) => {
            const active = prefs.loyaltyStatus.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleLoyalty(value)}
                className={[
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm text-left transition-all duration-150",
                  active
                    ? "bg-[#F59E0B]/8 border-[#F59E0B]/30 text-white/90"
                    : "bg-white/3 border-white/8 text-white/50 hover:border-white/15 hover:text-white/70",
                ].join(" ")}
              >
                <span className="text-base shrink-0">{emoji}</span>
                <span className="flex-1 leading-snug">{label}</span>
                <span
                  className={[
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors",
                    active
                      ? "bg-[#F59E0B] border-[#F59E0B] text-black"
                      : "border-white/20 text-transparent",
                  ].join(" ")}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        {prefs.loyaltyStatus.length > 0 && (
          <button
            onClick={() => setPrefs((p) => ({ ...p, loyaltyStatus: [] }))}
            className="text-xs text-white/30 hover:text-white/55 transition-colors"
          >
            None / Not sure — clear selection
          </button>
        )}
      </div>

      {/* ── Pinned cards ─────────────────────────────────────── */}
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-5">
        <h2 className="font-semibold text-white/90 mb-1">
          Any cards you want to keep?
        </h2>
        <p className="text-xs text-white/35 mb-4">
          Optional. If there&apos;s a card you don&apos;t want to give up, we&apos;ll lock it in
          and build the rest of your portfolio around it.
        </p>

        {/* Pinned chips */}
        {pinnedCards.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {pinnedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-1.5 bg-[#6366F1]/12 border border-[#6366F1]/30 rounded-full px-3 py-1 text-sm text-white/80"
              >
                <span className="font-medium leading-snug">{card.name}</span>
                <span className="text-white/30 text-xs">{card.bank_short_name}</span>
                <button
                  onClick={() => unpinCard(card.id)}
                  className="text-white/30 hover:text-white/70 transition-colors ml-1 leading-none"
                  aria-label={`Remove ${card.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={cardQuery}
            onChange={(e) => handleCardQueryChange(e.target.value)}
            placeholder="Search cards to keep…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6366F1]/50 transition-colors"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 text-xs">
              …
            </div>
          )}

          {cardResults.length > 0 && (
            <div className="absolute z-20 top-full mt-1.5 left-0 right-0 bg-[#1E2133] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {cardResults
                .filter((r) => !pinnedCards.some((p) => p.id === r.id))
                .map((card) => (
                  <button
                    key={card.id}
                    onClick={() => pinCard(card)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/85">{card.name}</span>
                    <span className="text-white/30 text-xs shrink-0 ml-3">{card.bank_short_name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {pinnedCards.length > 0 && (
          <p className="text-[11px] text-white/25 mt-2.5 leading-relaxed">
            {pinnedCards.length === prefs.maxCards
              ? "All slots are taken by pinned cards — the remaining recommendations will only fill leftover slots."
              : `${prefs.maxCards - pinnedCards.length} slot${prefs.maxCards - pinnedCards.length !== 1 ? "s" : ""} left for recommended cards.`}
          </p>
        )}
      </div>

      {/* ── Bank preferences ─────────────────────────────────── */}
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-5">
        <h2 className="font-semibold text-white/90 mb-1">
          Any bank preferences?
        </h2>
        <p className="text-xs text-white/35 mb-4">
          Optional. Select banks you already bank with or prefer. Leave blank to see the whole market.
        </p>
        <div className="flex flex-wrap gap-2">
          {banks.map((bank) => {
            const active = prefs.bankIds.includes(bank.id);
            return (
              <button
                key={bank.id}
                onClick={() => toggleBank(bank.id)}
                className={[
                  "px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[#6366F1]/15 border-[#6366F1]/40 text-white"
                    : "bg-white/4 border-white/10 text-white/45 hover:border-white/20 hover:text-white/65",
                ].join(" ")}
              >
                {bank.short_name}
              </button>
            );
          })}
        </div>
        {prefs.bankIds.length > 0 && (
          <button
            onClick={() => setPrefs((p) => ({ ...p, bankIds: [] }))}
            className="mt-3 text-xs text-white/30 hover:text-white/55 transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push("/recommend/spending")}
          className="text-sm text-white/35 hover:text-white/60 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black text-sm font-bold rounded-xl transition-colors"
        >
          Find my portfolio →
        </button>
      </div>
    </div>
  );
}

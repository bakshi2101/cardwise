"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchMerchants, searchCategories } from "@/lib/recommend";
import { Merchant, SpendingCategory } from "@/lib/supabase";

interface AISuggestion {
  slug: string;
  name: string;
  icon: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

interface Props {
  popularMerchants: Merchant[];
  categories?: SpendingCategory[];
}

export default function MerchantSearch({ popularMerchants, categories = [] }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Merchant[]>([]);
  const [catResults, setCatResults] = useState<SpendingCategory[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const aiControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        setAiSuggestion(null);
        setActiveIdx(-1);

        const [merchants, cats] = await Promise.all([
          searchMerchants(query),
          searchCategories(query),
        ]);

        setResults(merchants);
        setCatResults(cats);
        setOpen(true);
        setLoading(false);

        // AI fallback: only kick off if DB returned nothing
        if (merchants.length === 0 && cats.length === 0) {
          // Cancel any in-flight AI request
          if (aiControllerRef.current) aiControllerRef.current.abort();
          const controller = new AbortController();
          aiControllerRef.current = controller;

          setAiLoading(true);
          try {
            const res = await fetch(
              `/api/categorize?merchant=${encodeURIComponent(query)}`,
              { signal: controller.signal }
            );
            if (res.ok) {
              const data = await res.json();
              setAiSuggestion(data);
            }
          } catch (e) {
            if ((e as Error).name !== "AbortError") {
              console.error("AI categorize error:", e);
            }
          } finally {
            setAiLoading(false);
          }
        }
      } else {
        setResults([]);
        setCatResults([]);
        setAiSuggestion(null);
        setAiLoading(false);
        setOpen(false);
        setActiveIdx(-1);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateMerchant = useCallback(
    (merchant: Merchant) => {
      setQuery("");
      setOpen(false);
      setActiveIdx(-1);
      if (merchant.category?.slug) {
        router.push(
          `/recommend/${merchant.category.slug}?merchant=${encodeURIComponent(merchant.name)}`
        );
      }
    },
    [router]
  );

  const navigateCategory = useCallback(
    (slug: string, merchantName?: string) => {
      setQuery("");
      setOpen(false);
      setActiveIdx(-1);
      const url = merchantName
        ? `/recommend/${slug}?merchant=${encodeURIComponent(merchantName)}`
        : `/recommend/${slug}`;
      router.push(url);
    },
    [router]
  );

  // Combined items for keyboard navigation: merchants first, then category results
  const allItems: (
    | { type: "merchant"; data: Merchant }
    | { type: "category"; data: SpendingCategory }
    | { type: "ai"; data: AISuggestion }
  )[] = [
    ...results.map((m) => ({ type: "merchant" as const, data: m })),
    ...catResults.map((c) => ({ type: "category" as const, data: c })),
    ...(aiSuggestion ? [{ type: "ai" as const, data: aiSuggestion }] : []),
  ];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const item = allItems[activeIdx];
      if (item.type === "merchant") navigateMerchant(item.data);
      else if (item.type === "category") navigateCategory(item.data.slug);
      else if (item.type === "ai") navigateCategory(item.data.slug, query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const hasDbResults = results.length > 0 || catResults.length > 0;
  const noResults = open && query.length >= 2 && !hasDbResults && !loading;
  const showAiBanner = noResults && (aiLoading || aiSuggestion);

  return (
    <div className="w-full">
      <div ref={containerRef} className="relative">
        {/* Search input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none text-base">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Where are you spending? e.g. Carrefour, Talabat, Emirates…"
            className="w-full pl-11 pr-4 py-4 text-base rounded-xl border border-white/10 focus:border-[#22C55E]/50 focus:outline-none bg-[#1A1D27] text-white/90 placeholder:text-white/25 shadow-lg transition-colors"
            autoComplete="off"
            autoFocus
            aria-autocomplete="list"
            aria-expanded={open}
            role="combobox"
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 text-xs animate-pulse">
              Searching…
            </span>
          )}
        </div>

        {/* Dropdown — DB results */}
        {open && hasDbResults && (
          <div
            className="absolute z-50 w-full mt-1.5 bg-[#1A1D27] rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            role="listbox"
          >
            {results.map((merchant, idx) => (
              <button
                key={merchant.id}
                role="option"
                aria-selected={idx === activeIdx}
                onClick={() => navigateMerchant(merchant)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={[
                  "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0",
                  idx === activeIdx ? "bg-white/8" : "hover:bg-white/5",
                ].join(" ")}
              >
                <span className="text-lg shrink-0">{merchant.category?.icon ?? "💳"}</span>
                <div className="min-w-0">
                  <div className="font-medium text-white/90 text-sm">{merchant.name}</div>
                  <div className="text-xs text-white/35">{merchant.category?.name}</div>
                </div>
              </button>
            ))}

            {/* Category separator */}
            {catResults.length > 0 && (
              <>
                {results.length > 0 && (
                  <div className="px-4 py-1.5 border-t border-white/8 bg-white/2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
                      Browse category
                    </span>
                  </div>
                )}
                {catResults.map((cat, idx) => {
                  const itemIdx = results.length + idx;
                  return (
                    <button
                      key={cat.id}
                      role="option"
                      aria-selected={itemIdx === activeIdx}
                      onClick={() => navigateCategory(cat.slug)}
                      onMouseEnter={() => setActiveIdx(itemIdx)}
                      className={[
                        "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0",
                        itemIdx === activeIdx ? "bg-white/8" : "hover:bg-white/5",
                      ].join(" ")}
                    >
                      <span className="text-lg shrink-0">{cat.icon ?? "💳"}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-white/75 text-sm">{cat.name}</div>
                        <div className="text-xs text-white/30">Browse all {cat.name.toLowerCase()} cards</div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* No DB results — show AI fallback + category chips */}
        {noResults && (
          <div className="absolute z-50 w-full mt-1.5 bg-[#1A1D27] rounded-xl border border-white/10 shadow-2xl overflow-hidden">

            {/* AI suggestion panel */}
            {showAiBanner && (
              <div className="border-b border-white/8">
                {aiLoading ? (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <span className="text-base animate-pulse">✨</span>
                    <div className="space-y-1.5 flex-1">
                      <div className="skeleton h-3 w-2/3 rounded" />
                      <div className="skeleton h-2.5 w-1/2 rounded" />
                    </div>
                  </div>
                ) : aiSuggestion ? (
                  <button
                    onClick={() => navigateCategory(aiSuggestion.slug, query)}
                    onMouseEnter={() => setActiveIdx(allItems.length - 1)}
                    className={[
                      "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors",
                      activeIdx === allItems.length - 1 ? "bg-white/8" : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{aiSuggestion.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white/90 text-sm">
                          {aiSuggestion.name}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#6366F1]/20 text-[#6366F1] uppercase tracking-wide">
                          AI
                        </span>
                        {aiSuggestion.confidence === "low" && (
                          <span className="text-[10px] text-[#F59E0B]">low confidence</span>
                        )}
                      </div>
                      <div className="text-xs text-white/35 mt-0.5 leading-snug">
                        {aiSuggestion.reason}
                      </div>
                    </div>
                  </button>
                ) : null}
              </div>
            )}

            {/* Category fallback chips */}
            <div className="p-4">
              <p className="text-xs text-white/30 mb-3">
                {showAiBanner ? "Or browse by category:" : `No results for "${query}". Browse by category:`}
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigateCategory(cat.slug)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/55 hover:border-[#6366F1]/40 hover:text-white/80 hover:bg-white/8 transition-all duration-150"
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popular chips */}
      {popularMerchants.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] text-white/25 mb-2.5 font-medium uppercase tracking-widest">
            Popular
          </p>
          <div className="flex flex-wrap gap-2">
            {popularMerchants.map((merchant) => (
              <button
                key={merchant.id}
                onClick={() => navigateMerchant(merchant)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1D27] border border-white/10 rounded-full text-sm text-white/55 hover:border-[#22C55E]/40 hover:text-[#22C55E] transition-all duration-150"
              >
                <span className="text-sm">{merchant.category?.icon ?? "💳"}</span>
                {merchant.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { SpendingCategory } from "@/lib/supabase";

interface CategoryWithBest extends SpendingCategory {
  bestRate?: number | null;
  bestCard?: string | null;
}

interface Props {
  categories: CategoryWithBest[];
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/recommend/${cat.slug}`}
          className="group bg-[#1A1D27] rounded-xl border border-white/8 p-3.5 sm:p-4 hover:border-[#22C55E]/30 hover:bg-[#1E2233] card-lift transition-all duration-150 flex flex-col gap-2 min-w-0"
        >
          <span className="text-2xl sm:text-3xl">{cat.icon}</span>
          <div className="min-w-0">
            <div className="font-semibold text-white/85 text-xs sm:text-sm group-hover:text-white transition-colors leading-snug">
              {cat.name}
            </div>
            {cat.bestRate != null && cat.bestCard ? (
              <div className="text-[11px] sm:text-xs text-[#22C55E] font-mono mt-0.5 truncate">
                {cat.bestRate.toFixed(1)}% · {cat.bestCard}
              </div>
            ) : (
              <div className="text-[11px] sm:text-xs text-white/25 mt-0.5">
                Compare →
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

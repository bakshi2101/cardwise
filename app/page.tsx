import { getCategories, getPopularMerchants, getBestRateForCategory } from "@/lib/recommend";
import MerchantSearch from "@/components/MerchantSearch";
import CategoryGrid from "@/components/CategoryGrid";
import Logo from "@/components/Logo";
import Link from "next/link";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, popularMerchants] = await Promise.all([
    getCategories(),
    getPopularMerchants(),
  ]);

  const categoriesWithBest = await Promise.all(
    categories.map(async (cat) => {
      const best = await getBestRateForCategory(cat.slug);
      return {
        ...cat,
        bestRate: best?.effective_return_pct ?? null,
        bestCard: best?.bank_short_name ?? null,
      };
    })
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex justify-center mb-5 sm:mb-6">
          <Logo variant="white" height={56} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white/90 leading-tight tracking-tight">
          Stop leaving money on the table.
        </h1>
        <p className="text-white/40 mt-3 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Know which card to use, every time.<br />Built for the UAE.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10 sm:mb-12">
        <MerchantSearch popularMerchants={popularMerchants} categories={categoriesWithBest} />
      </div>

      {/* Category grid */}
      <div className="mb-10 sm:mb-12">
        <h2 className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-3">
          Browse by Category
        </h2>
        <CategoryGrid categories={categoriesWithBest} />
      </div>

      {/* Wallet CTA */}
      <div className="bg-[#1A1D27] border border-[#6366F1]/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-base text-white/90">
            Get personalised recommendations
          </div>
          <div className="text-white/40 text-sm mt-1 leading-relaxed">
            Add your cards once. We show which card to use at every merchant.
          </div>
        </div>
        <Link
          href="/wallet"
          className="shrink-0 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
        >
          Set up My Wallet →
        </Link>
      </div>
    </div>
  );
}

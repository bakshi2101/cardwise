import { getCategories, getPopularMerchants } from "@/lib/recommend";
import MerchantSearch from "@/components/MerchantSearch";
import CategoryGrid from "@/components/CategoryGrid";

export const revalidate = 3600;

export default async function SearchPage() {
  const [categories, popularMerchants] = await Promise.all([
    getCategories(),
    getPopularMerchants(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white/90 mb-1">
          Which card should I use?
        </h1>
        <p className="text-sm text-white/40">
          Search a merchant or browse by category to see the best card for that spend.
        </p>
      </div>

      <div className="mb-10">
        <MerchantSearch
          popularMerchants={popularMerchants}
          categories={categories}
        />
      </div>

      <div>
        <h2 className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-3">
          Browse by category
        </h2>
        <CategoryGrid
          categories={categories.map((cat) => ({
            ...cat,
            bestRate: null,
            bestCard: null,
          }))}
        />
      </div>
    </div>
  );
}

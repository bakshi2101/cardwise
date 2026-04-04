import { getBestCards, getCategories } from "@/lib/recommend";
import Link from "next/link";
import RecommendClient from "./RecommendClient";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ merchant?: string; spend?: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export const revalidate = 3600;

export default async function RecommendPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { merchant, spend } = await searchParams;

  const [categories, allRewards] = await Promise.all([
    getCategories(),
    getBestCards(null, slug, merchant),
  ]);

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🤔</div>
        <h1 className="text-xl font-bold text-white/90">Category not found</h1>
        <Link href="/" className="mt-4 inline-block text-[#22C55E] hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const spendAmount = spend ? parseFloat(spend) : undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-white/30 hover:text-white/60 mb-3 inline-block transition-colors">
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white/90">
              {merchant ? merchant : category.name}
            </h1>
            {merchant && (
              <p className="text-sm text-white/40">{category.name}</p>
            )}
          </div>
        </div>
        {category.description && !merchant && (
          <p className="text-sm text-white/40 mt-2">{category.description}</p>
        )}
      </div>

      {/* Client component handles wallet-aware rendering */}
      <RecommendClient
        allRewards={allRewards}
        categorySlug={slug}
        merchantName={merchant}
        spendAmount={spendAmount}
      />
    </div>
  );
}

import { supabase } from "@/lib/supabase";
import PathSteps from "@/components/PathSteps";
import SpendingStepClient from "@/components/SpendingStepClient";

export const revalidate = 3600;

const PATH_B_STEPS = ["Set spending", "Preferences", "Your portfolio"];

export default async function RecommendSpendingPage() {
  const { data: categories } = await supabase
    .from("spending_categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PathSteps steps={PATH_B_STEPS} currentStep={1} pathLabel="Build ideal portfolio" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white/90">How do you spend?</h1>
        <p className="text-sm text-white/40 mt-1">
          Enter your typical monthly spend per category. This drives the entire
          recommendation — the more accurate, the better the result.
        </p>
      </div>

      <SpendingStepClient
        categories={categories ?? []}
        nextHref="/recommend/preferences"
        backHref="/"
        showSalaryTier
      />
    </div>
  );
}

import { supabase } from "@/lib/supabase";
import PathSteps from "@/components/PathSteps";
import RecommendResultsClient from "./RecommendResultsClient";

export const revalidate = 3600;

const PATH_B_STEPS = ["Set spending", "Preferences", "Your portfolio"];

export default async function RecommendResultsPage() {
  const { data: categories } = await supabase
    .from("spending_categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PathSteps steps={PATH_B_STEPS} currentStep={3} pathLabel="Build ideal portfolio" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white/90">Your recommended portfolio</h1>
        <p className="text-sm text-white/40 mt-1">
          The best card combinations for your spending and lifestyle — ranked by
          net first-year value.
        </p>
      </div>

      <RecommendResultsClient categories={categories ?? []} />
    </div>
  );
}

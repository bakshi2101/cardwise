import { supabase } from "@/lib/supabase";
import PathSteps from "@/components/PathSteps";
import SpendingStepClient from "@/components/SpendingStepClient";

export const revalidate = 3600;

const PATH_A_STEPS = ["Add cards", "Set spending", "View audit"];

export default async function OptimizeSpendingPage() {
  const { data: categories } = await supabase
    .from("spending_categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PathSteps steps={PATH_A_STEPS} currentStep={2} pathLabel="Optimize existing cards" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white/90">Your monthly spending</h1>
        <p className="text-sm text-white/40 mt-1">
          Enter your typical monthly spend per category so we can calculate exactly
          what you&apos;re earning — and what you&apos;re missing.
        </p>
      </div>

      <SpendingStepClient
        categories={categories ?? []}
        nextHref="/optimize/results"
        backHref="/optimize/add-cards"
      />
    </div>
  );
}

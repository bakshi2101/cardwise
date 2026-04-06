import { supabase } from "@/lib/supabase";
import Link from "next/link";
import PathSteps from "@/components/PathSteps";
import OptimizeClient from "@/app/optimize/OptimizeClient";

export const revalidate = 3600;

const PATH_A_STEPS = ["Add cards", "Set spending", "Your rewards"];

export default async function OptimizeResultsPage() {
  const { data: categories } = await supabase
    .from("spending_categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PathSteps steps={PATH_A_STEPS} currentStep={3} pathLabel="Optimize existing cards" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white/90">Your rewards snapshot</h1>
        <p className="text-sm text-white/40 mt-1">
          How to get the most out of the cards you already hold.
        </p>
      </div>

      <OptimizeClient categories={categories ?? []} />
    </div>
  );
}

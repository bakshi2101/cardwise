import { supabase } from "@/lib/supabase";
import PathSteps from "@/components/PathSteps";
import AddCardsClient from "./AddCardsClient";

export const revalidate = 3600;

const PATH_A_STEPS = ["Add cards", "Set spending", "View audit"];

export default async function AddCardsPage() {
  const { data: allCards } = await supabase
    .from("cards_with_bank")
    .select("id, name, bank_name, bank_short_name, annual_fee_aed")
    .eq("is_active", true)
    .order("bank_name")
    .order("name");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PathSteps steps={PATH_A_STEPS} currentStep={1} pathLabel="Optimize existing cards" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white/90">Add your cards</h1>
        <p className="text-sm text-white/40 mt-1">
          Add every card you currently hold — we&apos;ll compare them against the full market.
        </p>
      </div>

      <AddCardsClient allCards={allCards ?? []} />
    </div>
  );
}

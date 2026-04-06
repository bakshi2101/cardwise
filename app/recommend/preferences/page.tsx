import { supabase } from "@/lib/supabase";
import PathSteps from "@/components/PathSteps";
import PreferencesClient from "./PreferencesClient";

export const revalidate = 3600;

const PATH_B_STEPS = ["Set spending", "Preferences", "Your portfolio"];

export default async function RecommendPreferencesPage() {
  const { data: banks } = await supabase
    .from("banks")
    .select("id, short_name, name")
    .order("name");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PathSteps steps={PATH_B_STEPS} currentStep={2} pathLabel="Build ideal portfolio" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white/90">Your preferences</h1>
        <p className="text-sm text-white/40 mt-1">
          Tell us what matters beyond the numbers. We&apos;ll factor in perks and
          bank preferences when recommending your portfolio.
        </p>
      </div>

      <PreferencesClient banks={banks ?? []} />
    </div>
  );
}

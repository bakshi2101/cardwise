import { supabase } from "@/lib/supabase";
import OptimizeClient from "./OptimizeClient";

export const revalidate = 3600;

export default async function OptimizePage() {
  const { data: categories } = await supabase
    .from("spending_categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white/90">Optimize</h1>
        <p className="text-sm text-white/40 mt-1">
          Find out what you&apos;re leaving on the table — and which cards would fix it.
        </p>
      </div>

      <OptimizeClient categories={categories ?? []} />
    </div>
  );
}

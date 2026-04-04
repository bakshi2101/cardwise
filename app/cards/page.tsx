import { supabase } from "@/lib/supabase";
import CardBrowserClient from "./CardBrowserClient";

export const revalidate = 3600;

export default async function CardsPage() {
  const { data: cards } = await supabase
    .from("cards_with_bank")
    .select("*")
    .order("annual_fee_aed", { ascending: true });

  const { data: banks } = await supabase
    .from("banks")
    .select("id, name, short_name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white/90 mb-6">Credit Cards</h1>
      <CardBrowserClient cards={cards ?? []} banks={banks ?? []} />
    </div>
  );
}

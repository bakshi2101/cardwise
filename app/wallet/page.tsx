import { supabase } from "@/lib/supabase";
import WalletClient from "./WalletClient";

export const revalidate = 3600;

export default async function WalletPage() {
  const [{ data: categories }, { data: allCards }] = await Promise.all([
    supabase
      .from("spending_categories")
      .select("*")
      .order("sort_order"),
    supabase
      .from("cards_with_bank")
      .select("id, name, bank_name, bank_short_name, annual_fee_aed, card_network, is_islamic, reward_currency_name"),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white/90 mb-2">My Wallet</h1>
      <p className="text-sm text-white/40 mb-6">
        Save your cards and track your monthly rewards potential.
      </p>
      <WalletClient
        categories={categories ?? []}
        allCards={allCards ?? []}
      />
    </div>
  );
}

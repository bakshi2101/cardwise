import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching the DB schema
export interface Bank {
  id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
}

export interface Card {
  id: string;
  bank_id: string;
  name: string;
  card_network: "visa" | "mastercard" | "amex" | null;
  card_tier: string | null;
  annual_fee_aed: number;
  annual_fee_waiver_spend: number | null;
  supplementary_fee_aed: number | null;
  min_salary_aed: number | null;
  is_islamic: boolean;
  reward_currency_name: string | null;
  reward_currency_value_aed: number | null;
  base_earn_rate: number | null;
  base_earn_unit: string | null;
  forex_markup_pct: number | null;
  interest_rate_monthly_pct: number | null;
  lounge_access_count: number;
  lounge_access_network: string | null;
  valet_parking_count: number;
  travel_insurance: boolean;
  purchase_protection: boolean;
  concierge: boolean;
  airport_transfer_count: number;
  min_age: number;
  image_url: string | null;
  apply_url: string | null;
  source_url: string | null;
  summary: string | null;
  is_active: boolean;
  // joined
  bank_name?: string;
  bank_short_name?: string;
  bank_logo_url?: string | null;
}

export interface SpendingCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
}

export interface CardReward {
  id: string;
  card_id: string;
  category_id: string;
  reward_type: "points" | "cashback" | "miles" | null;
  earn_rate: number | null;
  earn_unit: string | null;
  earn_per_x_aed: number | null;
  effective_return_pct: number;
  monthly_cap_spend_aed: number | null;
  monthly_cap_reward: number | null;
  min_txn_amount_aed: number | null;
  min_monthly_spend_aed: number | null;
  is_promotional: boolean;
  promo_end_date: string | null;
  exclusions: string | null;
  source_url: string | null;
  last_verified_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface RewardRanked extends CardReward {
  card_name: string;
  card_image: string | null;
  annual_fee_aed: number;
  forex_markup_pct: number | null;
  bank_id: string;
  bank_name: string;
  bank_short_name: string;
  category_name: string;
  category_slug: string;
  category_icon: string | null;
  // computed
  net_return_pct?: number;
  active_offers?: Offer[];
  // fallback flags
  is_general_fallback?: boolean;
  is_base_rate_fallback?: boolean;
}

export interface CardBenefit {
  id: string;
  card_id: string;
  benefit_type: string | null;
  title: string;
  description: string | null;
  usage_limit: number | null;
  usage_period: "monthly" | "quarterly" | "yearly" | "one_time" | null;
  monetary_value_aed: number | null;
  conditions: string | null;
  is_active: boolean;
}

export interface Offer {
  id: string;
  card_id: string | null;
  bank_id: string | null;
  title: string;
  description: string | null;
  merchant_name: string | null;
  merchant_category: string | null;
  discount_type: string | null;
  discount_value: number | null;
  min_spend_aed: number | null;
  max_discount_aed: number | null;
  start_date: string | null;
  end_date: string | null;
  terms: string | null;
  offer_url: string | null;
  is_active: boolean;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  program_type: "airline" | "hotel";
  alliance: string | null;
  estimated_point_value_aed: number | null;
  logo_url: string | null;
  website_url: string | null;
}

export interface TransferPartner {
  id: string;
  card_id: string;
  program_id: string;
  ratio_from: number;
  ratio_to: number;
  min_transfer: number | null;
  transfer_fee_aed: number;
  transfer_time_days: number | null;
  notes: string | null;
  // joined
  program?: LoyaltyProgram;
}

export interface Merchant {
  id: string;
  name: string;
  aliases: string[] | null;
  category_id: string | null;
  is_online: boolean;
  logo_url: string | null;
  is_popular: boolean;
  sort_order: number;
  // joined
  category?: SpendingCategory;
}

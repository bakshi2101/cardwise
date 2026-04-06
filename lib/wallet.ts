"use client";

const WALLET_KEY = "cardwise_wallet_card_ids";
const PROFILE_KEY = "cardwise_spending_profile";

export function getWalletCardIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCardToWallet(cardId: string): void {
  const ids = getWalletCardIds();
  if (!ids.includes(cardId)) {
    localStorage.setItem(WALLET_KEY, JSON.stringify([...ids, cardId]));
  }
}

export function removeCardFromWallet(cardId: string): void {
  const ids = getWalletCardIds().filter((id) => id !== cardId);
  localStorage.setItem(WALLET_KEY, JSON.stringify(ids));
}

export function isCardInWallet(cardId: string): boolean {
  return getWalletCardIds().includes(cardId);
}

// Spending profile: { [categorySlug]: monthlySpendAed }
export type SpendingProfile = Record<string, number>;

export function getSpendingProfile(): SpendingProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSpendingProfile(profile: SpendingProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function updateCategorySpend(slug: string, amountAed: number): void {
  const profile = getSpendingProfile();
  profile[slug] = amountAed;
  saveSpendingProfile(profile);
}

// ── Path B: portfolio recommendation preferences ──────────────────────────────

const PREFS_KEY = "cardwise_recommend_prefs";

export type SalaryTier = "entry" | "mid" | "premium" | "high";

// Ceiling salary used to hard-exclude cards above the user's tier
export const SALARY_TIER_CEILING: Record<SalaryTier, number> = {
  entry:   7999,   // free-for-life / AED 5K+
  mid:     14999,  // AED 8–15K
  premium: 29999,  // AED 15–30K
  high:    999999, // AED 30K+ (no ceiling)
};

export type LoyaltyStatus =
  | "etihad_silver"
  | "etihad_gold"
  | "skywards_silver"
  | "skywards_gold"
  | "marriott_silver_gold"
  | "marriott_platinum"
  | "ihg_silver_gold";

// reward_currency_name patterns that match each loyalty program
export const LOYALTY_CURRENCY_MATCH: Record<LoyaltyStatus, string[]> = {
  etihad_silver:       ["Etihad Guest Miles"],
  etihad_gold:         ["Etihad Guest Miles"],
  skywards_silver:     ["Skywards Miles", "Cashback AED / Skywards Miles"],
  skywards_gold:       ["Skywards Miles", "Cashback AED / Skywards Miles"],
  marriott_silver_gold:["Marriott Bonvoy Points"],
  marriott_platinum:   ["Marriott Bonvoy Points"],
  ihg_silver_gold:     [], // no IHG card in DB yet
};

// Weighting multiplier applied to effective_return_pct during greedy scoring
// Platinum status = stronger switching cost → higher multiplier
export const LOYALTY_WEIGHT: Record<LoyaltyStatus, number> = {
  etihad_silver:        1.20,
  etihad_gold:          1.35,
  skywards_silver:      1.20,
  skywards_gold:        1.35,
  marriott_silver_gold: 1.20,
  marriott_platinum:    1.45,
  ihg_silver_gold:      1.20,
};

export interface RecommendPreferences {
  maxCards: number;
  benefits: string[];
  bankIds: string[];
  salaryTier: SalaryTier;
  loyaltyStatus: LoyaltyStatus[];
  pinnedCardIds: string[]; // cards the user wants to keep regardless of score
}

const DEFAULT_PREFS: RecommendPreferences = {
  maxCards: 3,
  benefits: [],
  bankIds: [],
  salaryTier: "mid",
  loyaltyStatus: [],
  pinnedCardIds: [],
};

export function getRecommendPreferences(): RecommendPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveRecommendPreferences(prefs: RecommendPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

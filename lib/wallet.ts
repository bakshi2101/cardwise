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

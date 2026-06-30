// Shared welcome-bonus logic for Path B recommendations and the card detail page.
// Both read card_rewards rows with reward_event_type in ('welcome_bonus', 'limited_promo').

export interface WelcomeBonusRow {
  absolute_value_aed: number | null;
  notes: string | null;
  display_label: string | null;
  reward_event_type: string;
  promo_end_date: string | null;
  created_at: string | null;
}

export interface WelcomeBonusSummary {
  value: number;
  title: string;
}

/**
 * Drops expired limited_promo rows. welcome_bonus rows have no expiry.
 */
export function filterActiveWelcomeRows<T extends Pick<WelcomeBonusRow, "reward_event_type" | "promo_end_date">>(
  rows: T[],
  today: string
): T[] {
  return rows.filter(
    (w) =>
      w.reward_event_type === "welcome_bonus" ||
      (w.reward_event_type === "limited_promo" && w.promo_end_date != null && w.promo_end_date > today)
  );
}

/**
 * Generates a short display label from a card_rewards.notes field, used as a
 * fallback when display_label isn't set.
 */
export function shortLabelFromNotes(notes: string): string {
  if (!notes) return "Welcome bonus";
  const firstSentence = notes.split(".")[0]?.trim() ?? notes;
  if (firstSentence.length <= 80) return firstSentence;
  const truncated = firstSentence.slice(0, 80);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Joins multiple welcome bonus row titles into a single display string.
 * 1 title → as-is. 2–3 → " + " joined (capped at 120 chars). 4+ → generic.
 */
export function combineMultiPartTitle(titles: string[]): string {
  if (titles.length === 0) return "Welcome bonus";
  if (titles.length === 1) return titles[0];
  if (titles.length >= 4) return `Welcome bonus (${titles.length} parts)`;
  const joined = titles.join(" + ");
  if (joined.length <= 120) return joined;
  const truncated = joined.slice(0, 120);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Deterministic display order: highest value first, then oldest first, then
 * alphabetically by notes.
 */
export function sortWelcomeBonusRows<T extends WelcomeBonusRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const valDiff = (b.absolute_value_aed ?? 0) - (a.absolute_value_aed ?? 0);
    if (valDiff !== 0) return valDiff;
    const dateA = a.created_at ?? "";
    const dateB = b.created_at ?? "";
    if (dateA !== dateB) return dateA.localeCompare(dateB); // oldest first
    return (a.notes ?? "").localeCompare(b.notes ?? "");
  });
}

/**
 * Sums absolute_value_aed and combines titles across a single card's active
 * welcome-bonus rows. Used for compact contexts (e.g. Path B's per-card
 * summary) where there isn't room to list each row separately.
 */
export function summarizeWelcomeBonusRows(rows: WelcomeBonusRow[]): WelcomeBonusSummary | null {
  if (rows.length === 0) return null;
  const sorted = sortWelcomeBonusRows(rows);
  const value = sorted.reduce((sum, r) => sum + (r.absolute_value_aed ?? 0), 0);
  const titles = sorted.map((r) => r.display_label ?? shortLabelFromNotes(r.notes ?? ""));
  return { value, title: combineMultiPartTitle(titles) };
}

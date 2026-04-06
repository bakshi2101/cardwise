"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SpendingCategory } from "@/lib/supabase";
import {
  getSpendingProfile,
  getRecommendPreferences,
  saveRecommendPreferences,
  type SpendingProfile,
  type SalaryTier,
} from "@/lib/wallet";
import SpendingProfileForm from "@/components/SpendingProfile";

interface Props {
  categories: SpendingCategory[];
  nextHref: string;
  backHref: string;
  showSalaryTier?: boolean; // Path B only
}

const SALARY_TIERS: { value: SalaryTier; label: string; sub: string }[] = [
  { value: "entry",   label: "Entry",       sub: "Free-for-life · AED 5K+ salary" },
  { value: "mid",     label: "Mid-range",   sub: "AED 8–15K salary" },
  { value: "premium", label: "Premium",     sub: "AED 15–30K salary" },
  { value: "high",    label: "High earner", sub: "AED 30K+ salary" },
];

export default function SpendingStepClient({
  categories,
  nextHref,
  backHref,
  showSalaryTier = false,
}: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<SpendingProfile>({});
  const [salaryTier, setSalaryTier] = useState<SalaryTier>("mid");
  const [profileSaved, setProfileSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = getSpendingProfile();
    setProfile(p);
    setProfileSaved(Object.values(p).some((v) => v > 0));
    if (showSalaryTier) {
      setSalaryTier(getRecommendPreferences().salaryTier);
    }
    setMounted(true);
  }, [showSalaryTier]);

  function handleProfileSave(p: SpendingProfile) {
    setProfile(p);
    setProfileSaved(Object.values(p).some((v) => v > 0));
  }

  function handleContinue() {
    if (showSalaryTier) {
      const prefs = getRecommendPreferences();
      saveRecommendPreferences({ ...prefs, salaryTier });
    }
    router.push(nextHref);
  }

  const canContinue = profileSaved;

  if (!mounted) {
    return <div className="skeleton rounded-xl h-64" />;
  }

  return (
    <div className="space-y-4">
      <SpendingProfileForm
        categories={categories}
        initialProfile={profile}
        onSave={handleProfileSave}
      />

      {/* ── Salary tier — Path B only ──────────────────────────── */}
      {showSalaryTier && (
        <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-5">
          <h2 className="font-semibold text-white/90 mb-1">
            Which cards are you typically eligible for?
          </h2>
          <p className="text-xs text-white/35 mb-4">
            We&apos;ll only recommend cards you can actually apply for.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SALARY_TIERS.map(({ value, label, sub }) => (
              <button
                key={value}
                onClick={() => setSalaryTier(value)}
                className={[
                  "flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all duration-150",
                  salaryTier === value
                    ? "bg-[#6366F1]/15 border-[#6366F1]/50 text-white"
                    : "bg-white/3 border-white/8 text-white/50 hover:border-white/20 hover:text-white/70",
                ].join(" ")}
              >
                <span className="text-sm font-semibold leading-snug">{label}</span>
                <span className="text-[10px] mt-0.5 leading-snug opacity-60 whitespace-normal">
                  {sub}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push(backHref)}
          className="text-sm text-white/35 hover:text-white/60 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>

      {!canContinue && (
        <p className="text-xs text-white/25 text-center">
          Save your spending profile above to continue.
        </p>
      )}
    </div>
  );
}

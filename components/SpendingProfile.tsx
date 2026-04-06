"use client";

import { useState } from "react";
import { SpendingCategory } from "@/lib/supabase";
import { type SpendingProfile, saveSpendingProfile } from "@/lib/wallet";

interface Props {
  categories: SpendingCategory[];
  initialProfile: SpendingProfile;
  onSave: (profile: SpendingProfile) => void;
}

export default function SpendingProfileComponent({
  categories,
  initialProfile,
  onSave,
}: Props) {
  const [profile, setProfile] = useState<SpendingProfile>(initialProfile);
  const [saved, setSaved] = useState(false);

  const hasData = Object.values(initialProfile).some((v) => v > 0);
  const [collapsed, setCollapsed] = useState(hasData);

  // Exclude categories that don't make sense for monthly profiling
  const profileCategories = categories.filter(
    (c) => !["government", "rent", "insurance"].includes(c.slug)
  );

  const totalMonthly = Object.values(profile).reduce(
    (s, v) => s + (v ?? 0),
    0
  );
  const filledCount = Object.values(profile).filter((v) => (v ?? 0) > 0).length;

  function handleChange(slug: string, value: string) {
    const num = Math.max(0, parseFloat(value) || 0);
    setProfile((prev) => ({ ...prev, [slug]: num }));
    setSaved(false);
  }

  function handleSave() {
    saveSpendingProfile(profile);
    onSave(profile);
    setSaved(true);
    setCollapsed(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Collapsed summary
  if (collapsed && filledCount > 0) {
    return (
      <div className="bg-[#1A1D27] rounded-xl border border-white/8 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-white/30 uppercase tracking-widest font-semibold mb-0.5">
            Spending Profile
          </div>
          <div className="text-sm text-white/70">
            <span className="font-semibold font-mono text-white/90">
              AED {totalMonthly.toLocaleString()}
            </span>{" "}
            /month across{" "}
            <span className="font-semibold text-white/90">{filledCount}</span>{" "}
            {filledCount === 1 ? "category" : "categories"}
          </div>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs text-white/40 font-medium border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 hover:text-white/65 transition-all shrink-0"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D27] rounded-xl border border-white/8 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-white/90">Monthly Spending</h2>
        {filledCount > 0 && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-xs text-white/30 hover:text-white/55 transition-colors"
          >
            Collapse ▲
          </button>
        )}
      </div>
      <p className="text-sm text-white/35 mb-4 leading-relaxed">
        Enter your typical monthly spend per category to calculate personalised rewards.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {profileCategories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-start gap-3 bg-white/3 rounded-lg px-3 py-2.5 border border-white/5"
          >
            <span className="text-base w-5 text-center shrink-0 mt-0.5">
              {cat.icon}
            </span>
            <div className="flex-1 min-w-0">
              <label
                className="text-xs font-medium text-white/70 leading-tight block mb-0.5"
                htmlFor={`spend-${cat.slug}`}
              >
                {cat.name}
              </label>
              {cat.description && (
                <div className="text-[10px] text-white/25 leading-snug mb-1.5">
                  {cat.description}
                </div>
              )}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs font-mono pointer-events-none">
                  AED
                </span>
                <input
                  id={`spend-${cat.slug}`}
                  type="number"
                  min="0"
                  step="100"
                  value={profile[cat.slug] || ""}
                  onChange={(e) => handleChange(cat.slug, e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-2 py-1.5 rounded-md border border-white/10 bg-[#1A1D27] text-white/90 text-xs font-mono placeholder:text-white/20 focus:border-[#6366F1]/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total + save */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-white/35">
          Total:{" "}
          <span className="font-mono text-white/65 font-medium">
            AED {totalMonthly.toLocaleString()}
          </span>{" "}
          / month
        </div>
        <button
          onClick={handleSave}
          disabled={filledCount === 0}
          className={[
            "px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
            saved
              ? "bg-[#22C55E] text-black"
              : "bg-[#6366F1] text-white hover:bg-[#4F46E5]",
          ].join(" ")}
        >
          {saved ? "✓ Saved!" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

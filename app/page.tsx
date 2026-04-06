import Link from "next/link";
import Logo from "@/components/Logo";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="text-center mb-12 sm:mb-14">
        <div className="flex justify-center mb-6">
          <Logo variant="white" height={56} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white/90 leading-tight tracking-tight">
          Stop leaving money on the table.
        </h1>
        <p className="text-white/40 mt-3 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          The UAE credit card rewards engine.<br />
          Optimize what you have, or build the perfect portfolio.
        </p>
      </div>

      {/* ── Path selection ────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">

        {/* Path A */}
        <Link
          href="/optimize/add-cards"
          className="group relative bg-[#1A1D27] border border-[#6366F1]/25 hover:border-[#6366F1]/60 rounded-2xl p-6 sm:p-7 flex flex-col gap-3 transition-all duration-200 card-lift"
        >
          <div className="text-3xl">💳</div>
          <div>
            <div className="font-bold text-white/90 text-lg group-hover:text-white transition-colors leading-tight">
              Optimize my existing cards
            </div>
            <div className="text-white/40 text-sm mt-1.5 leading-relaxed">
              Add the cards you already hold. Get a card-by-card assignment guide that maximises what you earn across every category.
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#6366F1] text-sm font-semibold mt-auto pt-2">
            Get started
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="absolute top-4 right-4 text-[10px] font-semibold bg-[#6366F1]/15 text-[#6366F1] px-2 py-0.5 rounded-full uppercase tracking-wide border border-[#6366F1]/20">
            3 steps
          </div>
        </Link>

        {/* Path B */}
        <Link
          href="/recommend/spending"
          className="group relative bg-[#1A1D27] border border-[#F59E0B]/20 hover:border-[#F59E0B]/50 rounded-2xl p-6 sm:p-7 flex flex-col gap-3 transition-all duration-200 card-lift"
        >
          <div className="text-3xl">✨</div>
          <div>
            <div className="font-bold text-white/90 text-lg group-hover:text-white transition-colors leading-tight">
              Build my ideal card portfolio
            </div>
            <div className="text-white/40 text-sm mt-1.5 leading-relaxed">
              Tell us how you spend and what perks matter to you. We&apos;ll recommend the best combination of cards from scratch.
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#F59E0B] text-sm font-semibold mt-auto pt-2">
            Start fresh
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="absolute top-4 right-4 text-[10px] font-semibold bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-0.5 rounded-full uppercase tracking-wide border border-[#F59E0B]/20">
            3 steps
          </div>
        </Link>
      </div>

      {/* ── Quick search nudge ─────────────────────────────────── */}
      <div className="mt-10 text-center">
        <p className="text-sm text-white/25">
          Already know what you want to spend on?{" "}
          <Link href="/search" className="text-white/45 hover:text-white/70 underline underline-offset-2 transition-colors">
            Search a merchant →
          </Link>
        </p>
      </div>
    </div>
  );
}

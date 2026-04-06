import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#0F1117] text-white/35 mt-16 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <Logo variant="white" height={24} />
          <p className="text-xs text-center sm:text-left leading-relaxed text-white/30">
            Maximize your credit card rewards in the UAE.
          </p>
        </div>

        <nav className="flex items-center gap-1 text-sm" aria-label="Footer navigation">
          {[
            { href: "/", label: "Home" },
            { href: "/optimize/add-cards", label: "Optimize" },
            { href: "/recommend/spending", label: "Recommend" },
            { href: "/wallet", label: "My Wallet" },
            { href: "/cards", label: "All Cards" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-white/35 hover:text-white/65 hover:bg-white/4 transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/5 text-center py-4 text-[11px] text-white/28">
        © {new Date().getFullYear()} CardWise. Reward rates shown are for reference only — always verify with your bank.
      </div>
    </footer>
  );
}

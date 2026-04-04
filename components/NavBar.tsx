"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/cards", label: "Cards" },
    { href: "/wallet", label: "Wallet" },
    { href: "/optimize", label: "Optimize" },
  ];

  return (
    <nav className="bg-[#0F1117] text-white sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14 gap-4">
        <Link
          href="/"
          className="flex items-center shrink-0"
          aria-label="CardWise home"
        >
          <Logo variant="white" height={26} />
        </Link>

        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap",
                  isActive
                    ? "bg-[#6366F1]/15 text-white border border-[#6366F1]/25"
                    : "text-white/50 hover:text-white/85 hover:bg-white/5",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

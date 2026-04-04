"use client";

import { useState, useEffect } from "react";
import { addCardToWallet, removeCardFromWallet, isCardInWallet } from "@/lib/wallet";

interface Props {
  cardId: string;
}

export default function AddToWalletButton({ cardId }: Props) {
  const [inWallet, setInWallet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setInWallet(isCardInWallet(cardId));
    setMounted(true);
  }, [cardId]);

  function toggle() {
    if (inWallet) {
      removeCardFromWallet(cardId);
      setInWallet(false);
    } else {
      addCardToWallet(cardId);
      setInWallet(true);
    }
  }

  if (!mounted) {
    return (
      <div className="h-7 w-20 rounded-lg skeleton shrink-0" />
    );
  }

  return (
    <button
      onClick={toggle}
      className={[
        "text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-150 shrink-0 border",
        inWallet
          ? "bg-white/5 text-white/45 border-white/10 hover:bg-red-500/8 hover:text-red-400 hover:border-red-500/20"
          : "bg-[#6366F1] text-white border-[#6366F1] hover:bg-[#4F46E5] hover:border-[#4F46E5]",
      ].join(" ")}
    >
      {inWallet ? "✓ In Wallet" : "+ Wallet"}
    </button>
  );
}

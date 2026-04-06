"use client";

import { useRouter } from "next/navigation";

interface Props {
  fallbackHref?: string;
  label?: string;
}

export default function BackButton({ fallbackHref = "/", label = "← Back" }: Props) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-white/30 hover:text-white/60 mb-3 inline-block transition-colors"
    >
      {label}
    </button>
  );
}

interface Props {
  steps: string[];
  currentStep: number; // 1-indexed
  pathLabel: string;
}

export default function PathSteps({ steps, currentStep, pathLabel }: Props) {
  return (
    <div className="mb-7">
      <div className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-3">
        {pathLabel}
      </div>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors",
                    isDone
                      ? "bg-[#22C55E] text-black"
                      : isCurrent
                      ? "bg-[#6366F1] text-white"
                      : "bg-white/8 text-white/25",
                  ].join(" ")}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span
                  className={[
                    "text-sm whitespace-nowrap",
                    isCurrent
                      ? "text-white/90 font-medium"
                      : isDone
                      ? "text-white/45"
                      : "text-white/20",
                  ].join(" ")}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={[
                    "flex-1 h-px mx-3",
                    isDone ? "bg-[#22C55E]/25" : "bg-white/8",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

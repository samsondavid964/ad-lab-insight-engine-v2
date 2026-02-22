import { useEffect, useState } from "react";
import adLabLogo from "@/assets/ad-lab-logo.png";

interface LoadingStateProps {
  businessName: string;
  elapsedSeconds: number;
}

const stages = [
  { label: "Analyzing traffic patterns", icon: "📊" },
  { label: "Mapping channel distribution", icon: "🗺️" },
  { label: "Evaluating competitor landscape", icon: "🔍" },
  { label: "Generating keyword insights", icon: "🔑" },
  { label: "Building executive summary", icon: "📝" },
  { label: "Compiling geographic data", icon: "🌍" },
  { label: "Crafting action plan", icon: "🚀" },
];

const LoadingState = ({ businessName, elapsedSeconds }: LoadingStateProps) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => (i + 1) % stages.length);
      setFadeKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min((elapsedSeconds / 300) * 100, 95);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md mx-auto px-6 animate-fade-in">
        {/* Logo with concentric rings */}
        <div className="relative mb-10 flex items-center justify-center">
          <div className="loading-ring loading-ring-1 absolute" />
          <div className="loading-ring loading-ring-2 absolute" />
          <div className="loading-ring loading-ring-3 absolute" />
          <img
            src={adLabLogo}
            alt="Ad-Lab"
            className="h-16 relative z-10 rounded-xl shadow-lg shadow-blue-500/20"
          />
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Generating Your Report
        </h2>
        <p className="text-muted-foreground text-sm">
          for <span className="font-semibold text-foreground">{businessName}</span>
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(213 94% 55%), hsl(213 94% 65%))"
            }}
          >
            <div className="absolute inset-0 animate-[progress-shimmer_2s_ease-in-out_infinite]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", width: "50%" }}
            />
          </div>
        </div>

        {/* Current stage */}
        <div className="mt-6 h-7" key={fadeKey}>
          <p
            className="text-sm font-medium text-accent animate-[crossfade-in_0.4s_ease-out_both] flex items-center justify-center gap-2"
          >
            <span>{stages[stageIndex].icon}</span>
            {stages[stageIndex].label}…
          </p>
        </div>

        {/* Stage dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {stages.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === stageIndex ? "hsl(213 94% 55%)" : i < stageIndex ? "hsl(213 94% 55% / 0.3)" : "hsl(220 14% 85%)"
              }}
            />
          ))}
        </div>

        {/* Info box */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-muted-foreground">
            This typically takes about 5 minutes. You can close this page — your report will be saved automatically.
          </p>
          <p className="text-xs text-slate-400 mt-2 font-mono tabular-nums">
            {minutes}:{seconds} elapsed
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;

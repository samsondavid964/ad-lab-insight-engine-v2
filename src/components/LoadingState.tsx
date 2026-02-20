import { useEffect, useState } from "react";
import adLabLogo from "@/assets/ad-lab-logo.png";

interface LoadingStateProps {
  businessName: string;
  elapsedSeconds: number;
}

const tips = [
  "Analyzing traffic patterns…",
  "Mapping channel distribution…",
  "Evaluating competitor landscape…",
  "Generating keyword insights…",
  "Building executive summary…",
  "Compiling geographic data…",
  "Crafting action plan…",
];

const LoadingState = ({ businessName, elapsedSeconds }: LoadingStateProps) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min((elapsedSeconds / 300) * 100, 95);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <img src={adLabLogo} alt="Ad-Lab" className="h-16 mx-auto mb-6 animate-pulse-glow rounded-xl" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Generating Your Report
          </h2>
          <p className="text-muted-foreground">
            for <span className="font-semibold text-foreground">{businessName}</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-accent font-medium mb-6 h-5 transition-all duration-500">
          {tips[tipIndex]}
        </p>

        <div className="animate-shimmer rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            This typically takes about 5 minutes. Please don't close this page.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Elapsed: {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;

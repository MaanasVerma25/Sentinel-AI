import React, { useEffect, useState } from "react";
import { Radar } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<"initial" | "zoom" | "complete">("initial");

  useEffect(() => {
    // Stage 1: Initial display (3.5 seconds)
    const timer1 = setTimeout(() => {
      setStage("zoom");
    }, 3500);

    // Stage 2: Animation completes (1 second after zoom starts)
    const timer2 = setTimeout(() => {
      setStage("complete");
      // Allow fade-out animation to finish before calling onComplete
      setTimeout(onComplete, 500);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  // Generate particles for the burst effect
  const particles = Array.from({ length: 50 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.2;
    const distance = 150 + Math.random() * 300;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const size = Math.random() * 3 + 1;
    const delay = Math.random() * 0.2;
    return { x, y, id: i, size, delay };
  });

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black ${
        stage === "complete" ? "animate-splash-fade-out pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Particle Burst (positioned behind the logo initially) */}
          {stage === "zoom" &&
            particles.map((p) => (
              <div
                key={p.id}
                className="absolute bg-[#298DFF] rounded-full shadow-[0_0_10px_#298DFF]"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  "--tw-translate-x": `${p.x}px`,
                  "--tw-translate-y": `${p.y}px`,
                  animation: `splash-particle-burst 0.8s cubic-bezier(0.12, 0, 0.39, 0) forwards`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties}
              />
            ))}

          {/* Logo */}
          <div
            className={`relative flex h-24 w-24 items-center justify-center rounded-none bg-[#298DFF]/10 border border-[#298DFF]/30 transition-all duration-300 ${
              stage === "zoom" ? "animate-splash-logo-zoom" : "scale-100 opacity-100"
            }`}
          >
            <Radar className="h-12 w-12 text-[#298DFF]" />
          </div>
        </div>

        {/* Text content */}
        <div
          className={`mt-12 flex flex-col items-center transition-all duration-700 ${
            stage === "zoom" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase text-white font-mono">
            Sentinel AI
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-px w-8 bg-[#343940]" />
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#298DFF] font-bold">
              STAY AHEAD OF EVERY CRISIS
            </p>
            <div className="h-px w-8 bg-[#343940]" />
          </div>
        </div>
      </div>

      {/* Decorative corner lines for tech feel */}
      <div className={`absolute top-10 left-10 w-20 h-20 border-t border-l border-[#343940] transition-opacity duration-1000 ${stage === 'zoom' ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`absolute top-10 right-10 w-20 h-20 border-t border-r border-[#343940] transition-opacity duration-1000 ${stage === 'zoom' ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`absolute bottom-10 left-10 w-20 h-20 border-b border-l border-[#343940] transition-opacity duration-1000 ${stage === 'zoom' ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`absolute bottom-10 right-10 w-20 h-20 border-b border-r border-[#343940] transition-opacity duration-1000 ${stage === 'zoom' ? 'opacity-0' : 'opacity-100'}`} />
    </div>
  );
};

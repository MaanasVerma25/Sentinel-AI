"use client";

import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

export function SplineSceneBasic() {
  return (
    <div className="w-full h-[500px] relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#298DFF" />

      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">

          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-[#298DFF] uppercase tracking-tight">
            Sentinel AI
          </h1>
          <p className="mt-4 text-[#6C7584] max-w-lg text-xs md:text-sm leading-relaxed font-mono">
            Autonomous threat detection & live incident streaming. Ingesting signals across all
            support channels, reviews, social media, and mail in real time.
          </p>

        </div>

        {/* Right content */}
        <div className="flex-1 relative h-1/2 md:h-full min-h-[250px]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

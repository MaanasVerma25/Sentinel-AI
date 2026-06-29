'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-[#131518]/90 backdrop-blur-md relative overflow-hidden rounded-none border-[#343940] shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#298DFF"
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
          <div className="text-[10px] font-mono text-[#298DFF] mb-3 uppercase tracking-widest flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2ED573] animate-pulse" />
            [ SYSTEM COMMAND CENTER ]
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-[#298DFF] uppercase tracking-tight">
            Sentinel AI
          </h1>
          <p className="mt-4 text-[#6C7584] max-w-lg text-xs md:text-sm leading-relaxed font-mono">
            Autonomous threat detection & live incident streaming. Ingesting signals across all support channels, reviews, social media, and mail in real time.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#343940]/60 pt-4 text-[10px] font-mono text-[#6C7584]">
            <div>SYS.LOC: <span className="text-white">//HQ-MONITOR</span></div>
            <div>STATUS: <span className="text-[#2ED573]">ACTIVE // SECURE</span></div>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative h-1/2 md:h-full min-h-[250px]">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}

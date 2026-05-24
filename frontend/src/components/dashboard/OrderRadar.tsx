'use client';

export default function OrderRadar() {
  return (
    <div className="w-full bg-luxe-800 rounded-3xl p-8 border border-white/5 shadow-glass relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Title */}
      <div className="absolute top-6 left-6 z-20">
        <h2 className="text-xl font-display font-black text-white tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          Live Order Radar
        </h2>
        <p className="text-gray-400 text-sm mt-1">Locating your delivery...</p>
      </div>

      {/* Radar Rings (Sonar Effect) */}
      <div className="relative w-64 h-64 flex items-center justify-center z-10">
        
        {/* Center Base (Customer Location) */}
        <div className="absolute w-12 h-12 bg-luxe-900 border-2 border-brand-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(247,211,0,0.3)] z-30">
          <span className="text-xl">🏠</span>
        </div>

        {/* Expanding Rings */}
        <div className="absolute w-full h-full border border-brand-500/20 rounded-full animate-sonar-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute w-full h-full border border-brand-500/20 rounded-full animate-sonar-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-full h-full border border-brand-500/20 rounded-full animate-sonar-ping" style={{ animationDelay: '2s' }}></div>

        {/* Static Grid Lines */}
        <div className="absolute w-full h-[1px] bg-white/5"></div>
        <div className="absolute h-full w-[1px] bg-white/5"></div>

        {/* Part 2: Delivery Agent Pulsing Dot Placeholder */}
        <div className="absolute top-4 right-8 opacity-50">Part 2: Driver Dot</div>
      </div>

      {/* Part 3: Floating Status Cards Placeholder */}
      <div className="absolute bottom-6 w-full px-6 opacity-50 text-center">Part 3: Floating Status Card</div>
      
    </div>
  );
}

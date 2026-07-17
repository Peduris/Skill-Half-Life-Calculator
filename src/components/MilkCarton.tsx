"use client";

interface MilkCartonProps {
  halfLife: number;
  expiryYear: number;
}

export function MilkCarton({ halfLife, expiryYear }: MilkCartonProps) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-lg border-4 border-amber-900/20 bg-gradient-to-b from-[#f5f0e8] to-[#e8dfd0] shadow-xl">
        {/* Carton top fold */}
        <div className="h-6 bg-amber-900/10" style={{ clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)" }} />

        <div className="px-8 py-10 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-amber-900/70">
            Skill Half-Life
          </p>
          <p className="mb-1 text-xs uppercase tracking-widest text-stone-500">
            Your skill set expires in
          </p>
          <p className="text-6xl font-black text-red-700 md:text-7xl">
            {halfLife.toFixed(1)}
            <span className="ml-2 text-3xl font-bold text-red-600/80">years</span>
          </p>

          {/* Expiry stamp */}
          <div className="mx-auto mt-6 inline-block rotate-[-3deg] rounded border-4 border-dashed border-red-700 bg-red-50 px-6 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-red-800">
              Best Before
            </p>
            <p className="text-4xl font-black text-red-700">{expiryYear}</p>
          </div>

          <p className="mt-6 text-sm text-stone-600">
            Equal-weighted average across your skills. Durable human skills pull this up — earned, not hand-wavy.
          </p>
        </div>

        {/* Carton bottom */}
        <div className="h-4 bg-amber-900/5" />
      </div>
    </div>
  );
}

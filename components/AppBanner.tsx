"use client";
import { Apple, Play } from "lucide-react";

export function AppBanner() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/40 bg-gradient-to-r from-rose-600/30 via-purple-600/20 to-pink-500/30 p-4 sm:p-5">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-pink-500/30 blur-3xl" />
        <div className="relative flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <img
              src="/mascot.png"
              alt="Mascotte 1111.tn"
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain drop-shadow-[0_4px_10px_rgba(225,29,45,0.45)]"
            />
            <div>
              <div className="text-base sm:text-lg md:text-xl font-black text-white">
                Emportez le marché dans votre poche !
              </div>
              <div className="text-[11px] sm:text-xs text-white/70">
                Comparez, surveillez et économisez où que vous soyez.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-white hover:bg-black/60 sm:px-4 sm:py-2">
              <Apple className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="text-left leading-tight">
                <div className="text-[10px] text-white/60">Télécharger sur</div>
                <div className="text-xs sm:text-sm font-semibold">App Store</div>
              </div>
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-white hover:bg-black/60 sm:px-4 sm:py-2">
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="text-left leading-tight">
                <div className="text-[10px] text-white/60">DISPONIBLE SUR</div>
                <div className="text-xs sm:text-sm font-semibold">Google Play</div>
              </div>
            </button>
            <div className="hidden lg:block h-14 w-14 rounded-lg bg-white p-1">
              <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      [0, 2, 4, 6, 8, 10, 11, 14, 16, 18, 20, 22, 24].includes(i) ? "bg-black" : "bg-white"
                    } rounded-[1px]`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-3">
            <div className="text-right text-sm text-white/85">
              1111 connaît le marché
              <br />
              mieux que le marché 😎
            </div>
            <img
              src="/mascot.png"
              alt="Mascotte 1111.tn"
              className="h-14 w-14 object-contain drop-shadow-[0_4px_10px_rgba(225,29,45,0.45)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

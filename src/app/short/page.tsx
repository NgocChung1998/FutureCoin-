import Link from "next/link";
import { ArrowLeft, TrendingDown, Radio } from "lucide-react";

import { getReportData } from "@/lib/data";
import { CoinCard } from "@/components/CoinCard";
import { Navigation } from "@/components/Navigation";

export default async function ShortPage() {
  const { coins } = await getReportData();
  const shortCoins = coins.filter((coin) => coin.preferredAction?.includes("SHORT"));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-[#020617] to-[#020617] text-slate-100 p-4 sm:p-8">
      
      <div className="w-full max-w-[1400px] rounded-3xl border border-white/10 bg-[#0b1221] shadow-[0_0_100px_-20px_rgba(239,68,68,0.2)] backdrop-blur-2xl overflow-hidden flex flex-col min-h-[85vh]">
        
        {/* Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-white/[0.02] px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 border border-rose-500/20">
              <Radio className="h-3 w-3 text-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">SHORT Recommendations</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Navigation />
            <Link
              href="/"
              className="group flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">BACK</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Hero Section */}
          <section className="mb-10 rounded-2xl bg-gradient-to-r from-rose-500/5 via-transparent to-transparent p-8 border border-white/5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                   <TrendingDown className="w-12 h-12 text-rose-500" />
                   <h1 className="text-5xl font-black tracking-tighter text-white">SHORT</h1>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  Tổng số coin: <span className="text-white text-2xl">{shortCoins.length}</span> khuyến nghị
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {shortCoins.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                Không có coin nào được khuyến nghị SHORT tại thời điểm này.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shortCoins.map((coin) => (
                  <CoinCard key={coin.symbol} coin={coin} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}


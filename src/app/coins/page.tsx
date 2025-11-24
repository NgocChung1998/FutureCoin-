import Link from "next/link";
import { ArrowLeft, Coins, Radio } from "lucide-react";

import { getReportData } from "@/lib/data";
import { Navigation } from "@/components/Navigation";
import { CoinCard } from "@/components/CoinCard";

export default async function CoinsPage() {
  const { coins } = await getReportData();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-[#020617] to-[#020617] text-slate-100 p-4 sm:p-8">
      
      <div className="w-full max-w-[1400px] rounded-3xl border border-white/10 bg-[#0b1221] shadow-[0_0_100px_-20px_rgba(6,182,212,0.15)] backdrop-blur-2xl overflow-hidden flex flex-col min-h-[85vh]">
        
        {/* Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-white/[0.02] px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live Data Stream</span>
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
          <section className="mb-10 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent p-8 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Coins className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-white">Tổng hợp theo Coin</h1>
                <p className="mt-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  Tổng số: <span className="text-white text-2xl">{coins.length}</span> coin
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {coins.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                Không có coin nào được tìm thấy.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {coins.map((coin) => (
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


import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Radio } from "lucide-react";

import { getCoinDetail } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CoinAnalysis } from "@/components/CoinAnalysis";
import { CoinDetailCard } from "@/components/CoinDetailCard";
import { Navigation } from "@/components/Navigation";
import { formatDate } from "@/lib/utils";

type CoinPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function CoinPage({ params }: CoinPageProps) {
  const { symbol } = await params;
  const coin = await getCoinDetail(symbol);
  if (!coin) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-[#020617] to-[#020617] text-slate-100 p-4 sm:p-8">
      
      <div className="w-full max-w-[1400px] rounded-3xl border border-white/10 bg-[#0b1221] shadow-[0_0_100px_-20px_rgba(16,185,129,0.15)] backdrop-blur-2xl overflow-hidden flex flex-col min-h-[85vh]">
        
        {/* Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-white/[0.02] px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live Data Stream Received</span>
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-5xl font-black tracking-tighter text-white">{coin.symbol}</h1>
                   {coin.preferredAction && (
                      <Badge variant={coin.preferredAction.includes("SHORT") ? "danger" : coin.preferredAction.includes("LONG") ? "success" : "secondary"} className="text-base px-3 py-1">
                        {coin.preferredAction}
                      </Badge>
                   )}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  Analysis Frequency: <span className="text-white">{coin.totalMentions}</span> reports
                </p>
              </div>
              <div className="flex items-center gap-4">
                {coin.latestMailDate && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Last Updated</p>
                    <p className="text-lg font-semibold text-emerald-400">{formatDate(coin.latestMailDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* AI Analysis Section */}
          <section className="mb-10">
            <CoinAnalysis symbol={coin.symbol} />
          </section>

          {/* Detailed Cards - CHỈ HIỂN THỊ CARD CỦA ĐỒNG COIN NÀY THÔI */}
          <section className="space-y-6">
            {coin.entries.length === 0 ? (
              <Card className="border-dashed border-white/10 bg-transparent">
                <CardContent className="py-20 text-center">
                  <p className="text-slate-500">Không có dữ liệu phân tích chi tiết cho coin này.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 px-2">
                  <span className="text-indigo-500">📊</span> Tín hiệu giao dịch
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {coin.entries.flatMap((entry) =>
                    entry.highlights.map((highlight, index) => (
                      <CoinDetailCard
                        key={`${entry.sectionId}-${highlight.index}-${index}`}
                        highlight={highlight}
                        headers={entry.table.headers}
                        sectionTitle={`${entry.sectionTitle} - ${formatDate(entry.mailDate)}`}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

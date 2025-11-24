import { OverviewDashboard } from "@/components/OverviewDashboard";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Navigation } from "@/components/Navigation";
import { getReportData } from "@/lib/data";
import { Bot, Radio } from "lucide-react";
import { Suspense } from "react";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <Bot className="h-8 w-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-400 text-sm">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}

export default async function Home() {
  const { generatedAt, coins, reports } = await getReportData();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-[#020617] to-[#020617] text-slate-100 p-4 sm:p-8">
      
      <div className="w-full max-w-[1400px] rounded-3xl border border-white/10 bg-[#0b1221] shadow-[0_0_100px_-20px_rgba(6,182,212,0.15)] backdrop-blur-2xl overflow-hidden flex flex-col min-h-[85vh]">
        
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
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
               Source: FutureSignal API • Gemini
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="mb-8 flex items-center gap-3">
             <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Bot className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">FutureCoin AI Analysis</h1>
                <p className="text-slate-400">Real-time crypto market signals & trend detection</p>
             </div>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <OverviewDashboard generatedAt={generatedAt} coins={coins} reports={reports} />
          </Suspense>
        </div>

      </div>

      {/* AI Chat Assistant */}
      <ChatAssistant />
    </main>
  );
}

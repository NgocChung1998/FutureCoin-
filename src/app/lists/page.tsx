import Link from "next/link";
import { ArrowLeft, List, Radio } from "lucide-react";

import { getAllLists } from "@/lib/lists";
import { getReportData } from "@/lib/data";
import { Navigation } from "@/components/Navigation";
import { TableRenderer } from "@/components/TableRenderer";
import { formatDate } from "@/lib/utils";

export default async function ListsPage() {
  const lists = await getAllLists();
  const { reports } = await getReportData();
  const reportMap = new Map(reports.map((report) => [report.id, report]));

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
          <section className="mb-10 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent p-8 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <List className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-white">Tất cả các List</h1>
                <p className="mt-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  Tổng số: <span className="text-white text-2xl">{lists.length}</span> phân tích
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            {lists.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                Không có List nào được tìm thấy.
              </div>
            ) : (
              lists.map((list) => {
                const report = reportMap.get(list.reportId);
                const section = report?.sections.find((s) => s.id === list.sectionId);
                
                if (!section) return null;

                return (
                  <div key={list.id} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-indigo-500">#</span> {list.title}
                      </h2>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        {report?.title} • {report?.createdAt ? formatDate(report.createdAt) : ""}
                      </div>
                    </div>
                    {list.description && (
                      <p className="text-slate-400 px-2">{list.description}</p>
                    )}
                    <TableRenderer headers={section.headers} rows={section.rows} />
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}


"use client";

import { Mail, Calendar, FileText, ChevronDown, ChevronUp, List, Hash } from "lucide-react";
import { useState } from "react";

import { ParsedReport } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableRenderer } from "@/components/TableRenderer";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MailExplorerProps = {
  reports: ParsedReport[];
};

export const MailExplorer = ({ reports }: MailExplorerProps) => {
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set([reports[0]?.id].filter(Boolean)));

  const toggleReport = (reportId: string) => {
    setExpandedReports((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };

  if (!reports.length) {
    return (
      <Card className="border-dashed border-white/20 bg-white/5">
        <CardContent className="py-16 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-600 opacity-50" />
          <p className="text-slate-500 font-medium">Chưa có báo cáo nào.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const isExpanded = expandedReports.has(report.id);
        const hasSections = report.sections.length > 0;
        const totalSections = report.sections.length;
        const totalSymbols = report.symbols.length;

        return (
          <Card
            key={report.id}
            className={cn(
              "border transition-all duration-300 overflow-hidden",
              isExpanded
                ? "border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-transparent shadow-lg shadow-indigo-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            )}
          >
            <CardHeader className="cursor-pointer select-none" onClick={() => toggleReport(report.id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-lg font-bold text-white line-clamp-2">
                      {report.title}
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{totalSections} bảng dữ liệu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      <span>{totalSymbols} symbol</span>
                    </div>
                    {report.metadata?.mail_title && (
                      <div className="flex items-center gap-1.5">
                        <List className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{report.metadata.mail_title}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-6 pt-0">
                {!hasSections ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Báo cáo này không chứa bảng dữ liệu.</p>
                  </div>
                ) : (
                  report.sections.map((section, sectionIndex) => (
                    <div
                      key={section.id}
                      className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6"
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm">
                          {sectionIndex + 1}
                        </div>
                        <h3 className="text-lg font-bold text-white">{section.title}</h3>
                      </div>
                      {section.description && (
                        <p className="text-sm text-slate-400 leading-relaxed pl-10">
                          {section.description}
                        </p>
                      )}
                      <div className="pl-10">
                        <TableRenderer headers={section.headers} rows={section.rows} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};


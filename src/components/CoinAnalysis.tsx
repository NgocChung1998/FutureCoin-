"use client";

import { useEffect, useState } from "react";
import { Bot, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

type CoinAnalysisProps = {
  symbol: string;
};

export const CoinAnalysis = ({ symbol }: CoinAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/coin-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const serverMessage =
          (payload && (payload.error || payload.details)) ||
          (response.status === 429
            ? "Gemini đang quá tải, vui lòng thử lại sau ít phút."
            : "Failed to fetch analysis");
        throw new Error(serverMessage);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border-indigo-500/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <div className="relative">
            <Bot className="h-6 w-6 text-indigo-400" />
            <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          Phân tích AI
        </CardTitle>
        <button
          onClick={fetchAnalysis}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh analysis"
        >
          <RefreshCw className={`h-4 w-4 text-white ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">Đang phân tích bằng AI...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-rose-400 mb-4">⚠️ {error}</p>
            <button
              onClick={fetchAnalysis}
              className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition"
            >
              Thử lại
            </button>
          </div>
        )}

        {analysis && !isLoading && (
          <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-white mb-4 mt-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-white mb-3 mt-5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-3 text-slate-300">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-slate-300">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-300">{children}</ol>
                ),
                li: ({ children }) => <li className="ml-4">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                code: ({ children }) => (
                  <code className="bg-white/10 px-2 py-1 rounded text-sm text-indigo-300">{children}</code>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


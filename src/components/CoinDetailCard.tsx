import { TrendingDown, TrendingUp, Clock, DollarSign, AlertTriangle, Target, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CoinTableRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type CoinDetailCardProps = {
  highlight: CoinTableRow;
  headers: string[];
  sectionTitle: string;
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const findColumnIndex = (headers: string[], keywords: string[]) => {
  const normalizedHeaders = headers.map(normalizeText);
  const normalizedKeywords = keywords.map(normalizeText);

  return normalizedHeaders.findIndex((header) =>
    normalizedKeywords.some((keyword) => keyword && header.includes(keyword)),
  );
};

const formatPrice = (value: string): string => {
  if (!value || value === "–" || value === "-" || value.trim() === "") return "N/A";
  // Remove spaces and format number
  const cleaned = value.replace(/\s+/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 }).format(num);
};

export const CoinDetailCard = ({ highlight, headers, sectionTitle }: CoinDetailCardProps) => {
  const entryIdx = findColumnIndex(headers, ["entry", "trigger", "trigger (price)", "giá vào"]);
  const slIdx = findColumnIndex(headers, ["sl", "stop loss", "stop-loss"]);
  const tp1Idx = findColumnIndex(headers, ["tp-1", "tp1", "take profit 1"]);
  const tp2Idx = findColumnIndex(headers, ["tp-2", "tp2", "take profit 2"]);
  const tp3Idx = findColumnIndex(headers, ["tp-3", "tp3", "take profit 3"]);
  const rrIdx = findColumnIndex(headers, ["rr", "risk/reward", "risk reward", "r-r"]);
  const trendIdx = findColumnIndex(headers, ["trend", "trend / momentum"]);
  const volatilityIdx = findColumnIndex(headers, ["volatility"]);
  const edgeScoreIdx = findColumnIndex(headers, ["edge score", "edge", "score"]);

  const entry = entryIdx >= 0 ? highlight.values[entryIdx] : undefined;
  const sl = slIdx >= 0 ? highlight.values[slIdx] : undefined;
  const tp1 = tp1Idx >= 0 ? highlight.values[tp1Idx] : undefined;
  const tp2 = tp2Idx >= 0 ? highlight.values[tp2Idx] : undefined;
  const tp3 = tp3Idx >= 0 ? highlight.values[tp3Idx] : undefined;
  const rr = rrIdx >= 0 ? highlight.values[rrIdx] : undefined;
  const trend = trendIdx >= 0 ? highlight.values[trendIdx] : undefined;
  const volatility = volatilityIdx >= 0 ? highlight.values[volatilityIdx] : undefined;
  const edgeScore = edgeScoreIdx >= 0 ? highlight.values[edgeScoreIdx] : undefined;

  const isShort = highlight.action?.includes("SHORT");
  const isLong = highlight.action?.includes("LONG");

  return (
    <Card className={cn(
      "border transition-all hover:border-white/20 hover:shadow-lg",
      isShort ? "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30" : 
      isLong ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30" : 
      "bg-slate-900/50 border-white/10"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          {highlight.action && (
            <Badge
              variant={isShort ? "danger" : isLong ? "success" : "warning"}
              className="uppercase text-sm font-bold px-3 py-1.5"
            >
              {isShort ? (
                <><TrendingDown className="h-4 w-4 mr-1.5" />SHORT</>
              ) : isLong ? (
                <><TrendingUp className="h-4 w-4 mr-1.5" />LONG</>
              ) : (
                <><AlertTriangle className="h-4 w-4 mr-1.5" />{highlight.action}</>
              )}
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-medium text-slate-400">
          {sectionTitle}
        </CardTitle>
        {highlight.timeframe && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Clock className="h-3 w-3" />
            <span>TF: {highlight.timeframe}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Entry, SL, TP Section */}
        {(entry || sl || tp1) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {entry && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                  <DollarSign className="h-3 w-3" />
                  Entry
                </div>
                <p className="text-sm font-bold text-white">{formatPrice(entry)}</p>
              </div>
            )}
            {sl && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                  <AlertTriangle className="h-3 w-3" />
                  Stop Loss
                </div>
                <p className="text-sm font-bold text-rose-400">{formatPrice(sl)}</p>
              </div>
            )}
            {tp1 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                  <Target className="h-3 w-3" />
                  TP-1
                </div>
                <p className="text-sm font-bold text-emerald-400">{formatPrice(tp1)}</p>
              </div>
            )}
            {tp2 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                  <Target className="h-3 w-3" />
                  TP-2
                </div>
                <p className="text-sm font-bold text-emerald-400">{formatPrice(tp2)}</p>
              </div>
            )}
          </div>
        )}

        {/* TP-3 and RR */}
        {(tp3 || rr) && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
            {tp3 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                  <Target className="h-3 w-3" />
                  TP-3
                </div>
                <p className="text-sm font-bold text-emerald-400">{formatPrice(tp3)}</p>
              </div>
            )}
            {rr && (
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Risk/Reward</div>
                <p className="text-sm font-bold text-indigo-400">{rr}</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {trend && (
            <div className="text-xs">
              <span className="text-slate-500">Trend:</span>{" "}
              <span className={cn(
                "font-medium",
                trend.toLowerCase().includes("bullish") || trend.toLowerCase().includes("uptrend") ? "text-emerald-400" :
                trend.toLowerCase().includes("bearish") || trend.toLowerCase().includes("downtrend") ? "text-rose-400" :
                "text-slate-300"
              )}>
                {trend}
              </span>
            </div>
          )}
          {volatility && (
            <div className="text-xs">
              <span className="text-slate-500">Volatility:</span>{" "}
              <span className="font-medium text-slate-300">{volatility}</span>
            </div>
          )}
          {edgeScore && (
            <div className="text-xs">
              <span className="text-slate-500">Edge Score:</span>{" "}
              <span className="font-bold text-indigo-400">{edgeScore}</span>
            </div>
          )}
        </div>

        {/* Note */}
        {highlight.note && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300 leading-relaxed">{highlight.note}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


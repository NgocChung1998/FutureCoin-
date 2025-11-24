import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { CoinDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const actionVariant = (action?: string) => {
  if (!action) return "secondary";
  if (action.includes("SHORT")) return "danger";
  if (action.includes("LONG")) return "success";
  if (action.includes("STAY")) return "warning";
  return "secondary";
};

type CoinCardProps = {
  coin: CoinDetail;
};

export const CoinCard = ({ coin }: CoinCardProps) => {
  const latest = coin.latestMailDate ? formatDate(coin.latestMailDate) : "Không rõ";
  const actionLabel = coin.preferredAction ?? "N/A";

  return (
    <Card className="group relative h-full border border-border/50 bg-card/60 backdrop-blur transition hover:border-primary/40">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">{coin.symbol}</CardTitle>
          <p className="text-sm text-muted-foreground">Lần cập nhật: {latest}</p>
        </div>
        <Badge variant={actionVariant(actionLabel)} className="uppercase">
          {actionLabel}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2">
          <span className="text-sm text-muted-foreground">Số lần xuất hiện</span>
          <span className="text-xl font-semibold">{coin.totalMentions}</span>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          {Object.entries(coin.actions).length === 0 ? (
            <p>Chưa có hành động cụ thể.</p>
          ) : (
            Object.entries(coin.actions).map(([label, count]) => (
              <div key={label} className="flex items-center justify-between">
                <span>{label}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))
          )}
        </div>
        <Link
          href={`/coins/${coin.symbol.toLowerCase()}`}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition",
            "bg-primary/10 text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          )}
        >
          Xem chi tiết
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};


import Link from "next/link";
import { CoinDetail, ParsedReport } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CoinCard } from "@/components/CoinCard";
import { MailExplorer } from "@/components/MailExplorer";
import { Activity, Database, Layers, Timer, ArrowRight } from "lucide-react";

type OverviewDashboardProps = {
  generatedAt: string;
  coins: CoinDetail[];
  reports: ParsedReport[];
};

const computeStat = (coins: CoinDetail[], keyword: string) =>
  coins.filter((coin) => coin.preferredAction?.includes(keyword)).length;

export const OverviewDashboard = ({ generatedAt, coins, reports }: OverviewDashboardProps) => {
  const shortCount = computeStat(coins, "SHORT");
  const longCount = computeStat(coins, "LONG");
  const stayOutCount = computeStat(coins, "STAY");

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Tổng số coin</CardTitle>
            <Database className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{coins.length}</div>
            <p className="text-xs text-slate-500">Dữ liệu cập nhật {formatDate(generatedAt)}</p>
          </CardContent>
        </Card>
        <Link href="/short" className="block group">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm transition hover:border-rose-500/40 hover:bg-rose-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-rose-400 transition flex items-center gap-2">
                Khuyến nghị SHORT
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
              </CardTitle>
              <Activity className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-500">{shortCount}</div>
              <p className="text-xs text-slate-500">Nhấn để xem chi tiết</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/long" className="block group">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm transition hover:border-emerald-500/40 hover:bg-emerald-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-emerald-400 transition flex items-center gap-2">
                Khuyến nghị LONG
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
              </CardTitle>
              <Layers className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">{longCount}</div>
              <p className="text-xs text-slate-500">Nhấn để xem chi tiết</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Tạm đứng ngoài</CardTitle>
            <Timer className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stayOutCount}</div>
            <p className="text-xs text-slate-500">Theo cảnh báo stay-out</p>
          </CardContent>
        </Card>
      </section>

      {/* CHI TIẾT EMAIL - ĐƯA LÊN ĐẦU */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📋 Tất cả các bảng phân tích (Lists)</h2>
          <p className="text-sm text-slate-400">Toàn bộ bảng dữ liệu được đồng bộ từ FutureSignal API.</p>
        </div>
        <MailExplorer reports={reports} />
      </section>

      {/* DANH SÁCH COIN - SAU ĐÓ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">💰 Tổng hợp theo Coin</h2>
            <p className="text-sm text-slate-400">Nhấn vào từng coin để xem chi tiết dữ liệu.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coins.map((coin) => (
            <CoinCard key={coin.symbol} coin={coin} />
          ))}
        </div>
      </section>
    </div>
  );
};


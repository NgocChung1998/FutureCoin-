import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

type TableRendererProps = {
  headers: string[];
  rows: string[][];
  highlightRows?: number[];
  className?: string;
};

const renderCellContent = (header: string, value: string) => {
  const lowerValue = value.toLowerCase();
  const lowerHeader = header.toLowerCase();

  // 1. Trend / Momentum Coloring
  if (lowerHeader.includes("trend") || lowerHeader.includes("momentum")) {
    if (lowerValue.includes("bullish") || lowerValue.includes("uptrend")) {
      return <span className="font-bold text-emerald-400">{value}</span>;
    }
    if (lowerValue.includes("bearish") || lowerValue.includes("downtrend")) {
      return <span className="font-bold text-rose-400">{value}</span>;
    }
  }

  // 2. Action / Decision Badges
  if (
    lowerHeader.includes("action") ||
    lowerHeader.includes("decision") ||
    lowerHeader.includes("lệnh") ||
    lowerHeader.includes("kịch bản") ||
    lowerHeader.includes("quyết định")
  ) {
    if (lowerValue.includes("short")) {
      return <Badge variant="danger" className="uppercase px-3 py-1">SHORT</Badge>;
    }
    if (lowerValue.includes("long")) {
      return <Badge variant="success" className="uppercase px-3 py-1">LONG</Badge>;
    }
    if (lowerValue.includes("stay") || lowerValue.includes("none")) {
      return <Badge variant="secondary" className="uppercase px-3 py-1 text-muted-foreground">NONE</Badge>;
    }
  }

  // 3. Filter / Conditions (Check/X)
  if (lowerHeader.includes("filter") || lowerHeader.includes("điều kiện")) {
    if (lowerValue.includes("có") || lowerValue.includes("yes") || lowerValue.includes("✔")) {
      return (
        <span className="flex items-center gap-2 text-emerald-400">
          <Check className="h-4 w-4" /> {value}
        </span>
      );
    }
    if (lowerValue.includes("không") || lowerValue.includes("no") || lowerValue.includes("✘")) {
      return (
        <span className="flex items-center gap-2 text-slate-500">
          <X className="h-4 w-4" /> {value}
        </span>
      );
    }
  }

  return value;
};

export const TableRenderer = ({ headers, rows, highlightRows = [], className }: TableRendererProps) => {
  if (!headers.length || !rows.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-white/10 bg-[#0f172a] shadow-2xl",
        className,
      )}
    >
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="bg-[#1e293b]">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="border-b border-white/10 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 first:rounded-tl-xl last:rounded-tr-xl"
              >
                {header || `Cột ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, rowIndex) => {
            const isHighlight = highlightRows.includes(rowIndex);
            return (
              <tr
                key={`row-${rowIndex}`}
                className={cn("transition-colors hover:bg-white/[0.02]", {
                  "bg-emerald-500/5 hover:bg-emerald-500/10": isHighlight,
                })}
              >
                {row.map((value, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 align-middle font-medium text-slate-200"
                  >
                    {value ? renderCellContent(headers[cellIndex], value) : <span className="text-slate-600">—</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

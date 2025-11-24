import { promises as fs } from "fs";
import path from "path";
import { load as loadHtml } from "cheerio";
import { cache } from "react";
import { marked } from "marked";

import type {
  CoinDetail,
  CoinTableReference,
  CoinTableRow,
  ParsedReport,
  RawReport,
  ReportData,
  TableSection,
} from "./types";

const API_URL = "https://first.fsignal.xyz/api/reports";
const FALLBACK_DATA_PATH = path.resolve(process.cwd(), "data.json");
const FETCH_TIMEOUT = 8000;

marked.setOptions({ mangle: false, headerIds: false });

const SYMBOL_HEADERS = ["symbol", "mã", "coin", "ticker"];
const ACTION_HEADERS = ["decision", "quyết", "action", "direction", "lệnh", "quyet", "quyết định", "lệnh chính"];
const TIMEFRAME_HEADERS = ["tf", "timeframe", "khung", "frame"];
const NOTE_HEADERS = ["note", "ghi chú", "ghi chu", "lý do", "ly do", "reason", "ghi chú / lý do"];

const cleanText = (value?: string): string => {
  if (!value) return "";
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
};

const normalizeSymbol = (text: string) => {
  const cleaned = cleanText(text).toUpperCase();
  const match = cleaned.match(/[A-Z0-9]+/g);
  return match ? match.join("") : "";
};

const normalizeAction = (text?: string) => {
  const cleaned = cleanText(text);
  if (!cleaned) return undefined;
  return cleaned.replace(/\s+/g, " ").toUpperCase();
};

const normalizeHeaderText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const findColumnIndex = (headers: string[], keywords: string[]) => {
  const normalizedHeaders = headers.map(normalizeHeaderText);
  const normalizedKeywords = keywords.map(normalizeHeaderText);

  return normalizedHeaders.findIndex((header) =>
    normalizedKeywords.some((keyword) => keyword && header.includes(keyword)),
  );
};

const parseApiResponse = (payload: unknown): RawReport[] => {
  if (typeof payload !== "object" || payload === null) return [];
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data as RawReport[];
};

const fetchRemoteReports = async (): Promise<RawReport[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const response = await fetch(API_URL, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reports (${response.status})`);
    }

    const json = await response.json();
    return parseApiResponse(json);
  } finally {
    clearTimeout(timeout);
  }
};

const readFallbackReports = async (): Promise<RawReport[]> => {
  try {
    const file = await fs.readFile(FALLBACK_DATA_PATH, "utf-8");
    const json = JSON.parse(file);
    return parseApiResponse(json);
  } catch (error) {
    console.error("[data] Không thể đọc fallback data.json", error);
    return [];
  }
};

const loadRawReports = async (): Promise<RawReport[]> => {
  try {
    const remote = await fetchRemoteReports();
    if (remote.length) {
      return remote;
    }
  } catch (error) {
    console.warn("[data] Không thể lấy dữ liệu từ API, dùng fallback", error);
  }

  return readFallbackReports();
};

const parseMarkdownSections = (reportId: string, markdown: string, sectionIndex: number): TableSection[] => {
  const html = marked.parse(markdown);
  const $ = loadHtml(html, { decodeEntities: true });
  const sections: TableSection[] = [];

  $("table").each((index, table) => {
    const tableElement = $(table);
    const rawHtml = $.html(tableElement) ?? "";

    const theadRow = tableElement.find("thead tr").first();
    const hasThead = theadRow.length > 0;
    const headerCells = hasThead ? theadRow.find("th,td") : tableElement.find("tr").first().find("th,td");
    const headers = headerCells
      .map((_, cell) => cleanText($(cell).text()))
      .get()
      .filter(Boolean);

    let dataRows = tableElement.find("tbody tr").toArray();
    if (!dataRows.length) {
      const allRows = tableElement.find("tr").toArray();
      const shouldSkipFirstRow = !hasThead && headerCells.length > 0;
      dataRows = allRows.slice(shouldSkipFirstRow ? 1 : 0);
    }

    const rows = dataRows
      .map((row) => {
        const cells = $(row).find("th,td");
        const values = cells
          .map((_, cell) => cleanText($(cell).text()))
          .get()
          .map((value) => value || "");
        return values;
      })
      .filter((values) => values.some((value) => value.trim().length > 0));

    if (!headers.length || !rows.length) {
      return;
    }

    const title =
      cleanText(tableElement.prevAll("h1,h2,h3,h4").first().text()) ||
      `List ${sectionIndex + 1} - Table ${index + 1}`;
    const description = cleanText(tableElement.prevAll("p").first().text());

    sections.push({
      id: `${reportId}-section-${sectionIndex}-table-${index}`,
      title,
      description: description || undefined,
      headers,
      rows,
      rawHtml,
    });
  });

  return sections;
};

type CoinAccumulator = {
  symbol: string;
  entries: CoinTableReference[];
  actions: Record<string, number>;
  totalMentions: number;
  latestMailDate?: string;
};

const ensureLatestDate = (current?: string, incoming?: string) => {
  if (!incoming) return current;
  if (!current) return incoming;
  return new Date(incoming).getTime() > new Date(current).getTime() ? incoming : current;
};

const buildCoinInsights = (reports: ParsedReport[]): CoinDetail[] => {
  const map = new Map<string, CoinAccumulator>();

  reports.forEach((report) => {
    report.sections.forEach((section) => {
      if (!section.headers.length || !section.rows.length) return;

      const symbolIdx = findColumnIndex(section.headers, SYMBOL_HEADERS);
      if (symbolIdx === -1) return;

      const actionIdx = findColumnIndex(section.headers, ACTION_HEADERS);
      const timeframeIdx = findColumnIndex(section.headers, TIMEFRAME_HEADERS);
      const noteIdx = findColumnIndex(section.headers, NOTE_HEADERS);

      let lastSymbol = "";

      section.rows.forEach((row, rowIndex) => {
        const symbolCell = row[symbolIdx]?.trim();
        const symbol = symbolCell || lastSymbol;
        const normalizedSymbol = normalizeSymbol(symbol);

        if (!normalizedSymbol || normalizedSymbol.length < 3) {
          if (symbolCell && normalizeSymbol(symbolCell)) {
            lastSymbol = symbolCell;
          }
          return;
        }

        if (symbolCell) {
          lastSymbol = symbolCell;
        }

        const action = actionIdx >= 0 ? normalizeAction(row[actionIdx]) : undefined;
        const timeframe = timeframeIdx >= 0 ? cleanText(row[timeframeIdx]) : undefined;
        const note = noteIdx >= 0 ? cleanText(row[noteIdx]) : undefined;
        const hasImportantData = action || timeframe || note;

        const highlight: CoinTableRow = {
          index: rowIndex,
          values: row,
          action,
          timeframe,
          note,
        };

        const accumulator = map.get(normalizedSymbol);
        const mailSubject = `${report.title}${section.title ? ` • ${section.title}` : ""}`;

        if (accumulator) {
          const existing = accumulator.entries.find(
            (entry) => entry.mailId === report.id && entry.sectionId === section.id,
          );

          if (existing) {
            existing.highlights.push(highlight);
          } else {
            const reference: CoinTableReference = {
              mailId: report.id,
              mailSubject,
              mailDate: report.createdAt,
              sectionId: section.id,
              sectionTitle: section.title,
              table: section,
              highlights: [highlight],
            };
            accumulator.entries.push(reference);
          }

          if (hasImportantData) {
            accumulator.totalMentions += 1;
          }

          if (action) {
            accumulator.actions[action] = (accumulator.actions[action] || 0) + 1;
          }
          accumulator.latestMailDate = ensureLatestDate(accumulator.latestMailDate, report.createdAt);
        } else {
          const reference: CoinTableReference = {
            mailId: report.id,
            mailSubject,
            mailDate: report.createdAt,
            sectionId: section.id,
            sectionTitle: section.title,
            table: section,
            highlights: [highlight],
          };

          map.set(normalizedSymbol, {
            symbol: normalizedSymbol,
            entries: [reference],
            actions: action ? { [action]: 1 } : {},
            totalMentions: hasImportantData ? 1 : 0,
            latestMailDate: report.createdAt,
          });
        }
      });
    });
  });

  const coins: CoinDetail[] = Array.from(map.values()).map((item) => {
    const preferredAction = Object.entries(item.actions).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      symbol: item.symbol,
      totalMentions: item.totalMentions,
      preferredAction,
      actions: item.actions,
      latestMailDate: item.latestMailDate,
      entries: item.entries,
    };
  });

  return coins.sort((a, b) => a.symbol.localeCompare(b.symbol));
};

const parseReport = (raw: RawReport): ParsedReport => {
  const sections = raw.sections_markdown.flatMap((markdown, index) =>
    parseMarkdownSections(raw._id, markdown, index),
  );

  return {
    id: raw._id,
    createdAt: raw.created_at,
    title: raw.metadata?.mail_title ?? "FutureSignal Report",
    metadata: raw.metadata,
    symbols: raw.symbols ?? [],
    reportType: raw.report_type,
    sections,
    rawMarkdown: raw.sections_markdown,
  };
};

const loadReportData = cache(async (): Promise<ReportData> => {
  const rawReports = await loadRawReports();
  const parsedReports = rawReports.map(parseReport).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const coins = buildCoinInsights(parsedReports);

  return {
    generatedAt: new Date().toISOString(),
    reports: parsedReports,
    coins,
  };
});

export const getReportData = async () => loadReportData();
export const getParsedMailLog = getReportData;

export const getAllCoins = async () => {
  const data = await loadReportData();
  return data.coins;
};

export const getCoinDetail = async (symbol: string) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return undefined;
  const data = await loadReportData();
  return data.coins.find((coin) => coin.symbol === normalized);
};

export const getReports = async () => {
  const data = await loadReportData();
  return data.reports;
};

export const getReportById = async (reportId: string) => {
  const data = await loadReportData();
  return data.reports.find((report) => report.id === reportId);
};


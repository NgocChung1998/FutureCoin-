export type ReportMetadata = {
  mail_title?: string;
  start_time?: string;
  num_symbol_lists?: number;
  [key: string]: unknown;
};

export type RawReport = {
  _id: string;
  created_at: string;
  sections_markdown: string[];
  symbols?: string[];
  report_type?: string;
  metadata?: ReportMetadata;
  content_length?: number;
};

export type TableSection = {
  id: string;
  title: string;
  description?: string;
  headers: string[];
  rows: string[][];
  rawHtml: string;
};

export type CoinTableRow = {
  index: number;
  values: string[];
  action?: string;
  timeframe?: string;
  note?: string;
};

export type CoinTableReference = {
  mailId: string;
  mailSubject: string;
  mailDate: string;
  sectionId: string;
  sectionTitle: string;
  table: TableSection;
  highlights: CoinTableRow[];
};

export type CoinDetail = {
  symbol: string;
  totalMentions: number;
  preferredAction?: string;
  actions: Record<string, number>;
  latestMailDate?: string;
  entries: CoinTableReference[];
};

export type ParsedReport = {
  id: string;
  createdAt: string;
  title: string;
  metadata?: ReportMetadata;
  symbols: string[];
  reportType?: string;
  sections: TableSection[];
  rawMarkdown: string[];
};

export type ReportData = {
  generatedAt: string;
  reports: ParsedReport[];
  coins: CoinDetail[];
};


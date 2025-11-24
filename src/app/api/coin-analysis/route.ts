import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCoinDetail } from "@/lib/data";
import { ENTRY_SCORE_RULES } from "@/lib/scoringRules";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim() ||
  "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const symbol: string = body.symbol;

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const coin = await getCoinDetail(symbol);
    if (!coin) {
      return NextResponse.json({ error: "Coin not found" }, { status: 404 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API not configured" }, { status: 500 });
    }

    // Build context from coin data
    const context = `
Coin: ${coin.symbol}
Total Mentions: ${coin.totalMentions}
Preferred Action: ${coin.preferredAction || "N/A"}
Actions Breakdown: ${JSON.stringify(coin.actions, null, 2)}
Latest Update: ${coin.latestMailDate || "N/A"}

Recent Analysis Data:
${coin.entries.slice(0, 5).map((entry) => `
━━━━━━━━━━━━━━━━━━━━━━
Section: ${entry.sectionTitle}
Mail: ${entry.mailSubject}
Date: ${entry.mailDate}
Highlights:
${entry.highlights.map((h) => {
  const getValue = (keywords: string[]) => {
    const idx = findColumnIndex(entry.table.headers, keywords);
    return idx >= 0 ? h.values[idx] : "N/A";
  };

  return `• Row ${h.index + 1} — Action: ${h.action || "N/A"}${h.timeframe ? ` (${h.timeframe})` : ""}, Entry: ${getValue([
    "entry",
    "trigger",
  ])}, SL: ${getValue(["sl", "stop loss"])}, TP-1: ${getValue(["tp-1", "tp1"])}, RR: ${getValue(["rr"])}, Note: ${h.note || "N/A"}`;
}).join("\n")}
`).join("\n")}
`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: `Bạn là chuyên gia phân tích tín hiệu Crypto của FutureCoin.

NGUYÊN TẮC:
━━━━━━━━━━━━━━━━━━━━━━
- CHỈ sử dụng dữ liệu được cung cấp (Entry, SL, TP, RR, Edge Score, Trend, Note...)
- Khi thiếu thông tin phải nói rõ "Không có trong dữ liệu báo cáo"
- Luôn giải thích các thuật ngữ trading ngay sau khi nhắc tới
- Áp dụng chuẩn chấm điểm sau:
${ENTRY_SCORE_RULES}

FORMAT:
━━━━━━━━━━━━━━━━━━━━━━
1. Tổng quan (trend, sentiment, độ tin cậy)
2. Bảng tóm tắt tín hiệu (Entry, SL, TP, RR, Edge Score)
3. Risk/Reward + lý do
4. Khuyến nghị hành động + lưu ý quản lý rủi ro
5. Bullet rõ ràng, dùng emoji phù hợp, Markdown sạch.`,
    });

    const prompt = `Phân tích chuyên sâu cho ${coin.symbol} dựa 100% trên dữ liệu sau. Đừng bịa thêm:\n\n${context}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Coin analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("429") ? 429 : 500;

    return NextResponse.json(
      {
        error: status === 429 ? "Gemini API đang quá tải tạm thời. Vui lòng thử lại sau ít phút." : "Failed to generate analysis",
        details: message,
      },
      { status }
    );
  }
}

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


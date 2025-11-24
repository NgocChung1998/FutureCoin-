import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getReportData } from "@/lib/data";
import { ENTRY_SCORE_RULES } from "@/lib/scoringRules";

const resolveChatHistoryPath = () => {
  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel) {
    const tmpRoot = process.env.TMPDIR || "/tmp";
    return path.join(tmpRoot, "futurecoin", "chat-history.json");
  }

  return path.resolve(process.cwd(), "..", "logs", "chat-history.json");
};

const ensureDirectoryExists = async (filePath: string) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim() ||
  "gemini-2.5-flash";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mailDate?: string;
};

type ChatHistory = {
  messages: ChatMessage[];
};

// ═══════════════════════════════════════════════════════════
// CONVERSATION HISTORY - Lưu 5 câu hỏi/trả lời gần nhất
// ═══════════════════════════════════════════════════════════
const MAX_HISTORY = 5;

const readChatHistory = async (): Promise<ChatHistory> => {
  const historyPath = resolveChatHistoryPath();
  try {
    const file = await fs.readFile(historyPath, "utf-8");
    return JSON.parse(file) as ChatHistory;
  } catch {
    return { messages: [] };
  }
};

const writeChatHistory = async (history: ChatHistory): Promise<void> => {
  const historyPath = resolveChatHistoryPath();
  await ensureDirectoryExists(historyPath);
  await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
};

export async function GET() {
  const history = await readChatHistory();
  return NextResponse.json(history);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userMessage: string = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const history = await readChatHistory();

    // Lấy data từ báo cáo mới nhất
    const { reports } = await getReportData();
    const latestReport = reports.length > 0 ? reports[0] : null;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    history.messages.push(userMsg);

    // Generate AI response using Gemini (với context từ báo cáo)
    const aiResponse = await answerQuestion(
      userMessage,
      history.messages.slice(-MAX_HISTORY * 2),
      latestReport
        ? {
            subject: latestReport.title,
            date: latestReport.createdAt,
            content: latestReport.rawMarkdown.join("\n\n"),
          }
        : null,
    );

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
      mailDate: latestReport?.createdAt,
    };

    history.messages.push(assistantMsg);

    // Chỉ giữ 5 cặp hỏi-đáp gần nhất (10 messages)
    if (history.messages.length > MAX_HISTORY * 2) {
      history.messages = history.messages.slice(-MAX_HISTORY * 2);
    }

    await writeChatHistory(history);

    return NextResponse.json({ message: assistantMsg });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

type LatestReportContext = {
  subject: string;
  date: string;
  content: string;
};

// Hàm trả lời câu hỏi dựa trên data báo cáo (từ chatbotService.ts)
async function answerQuestion(
  question: string,
  recentHistory: ChatMessage[],
  latestReport: LatestReportContext | null,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return `❌ Xin lỗi, Gemini API chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env`;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
  });

  try {
    // Build context data từ báo cáo
    let contextData = "KHÔNG CÓ DỮ LIỆU BÁO CÁO NÀO.";
    
    if (latestReport) {
      contextData = `
DỮ LIỆU BÁO CÁO MỚI NHẤT:
- Tiêu đề: ${latestReport.subject}
- Ngày: ${latestReport.date}
- Nội dung chính: 
${latestReport.content}
`;
    }

    const systemPrompt = `Bạn là trợ lý phân tích tín hiệu Crypto chuyên nghiệp, có khả năng giải thích thuật ngữ một cách dễ hiểu.

NGUYÊN TẮC QUAN TRỌNG NHẤT:
━━━━━━━━━━━━━━━━━━━━━━
1. ⚠️ TUYỆT ĐỐI KHÔNG BỊA/ĐOÁN/GIẢ ĐỊNH dữ liệu không có trong báo cáo
2. ⚠️ CHỈ TRẢ LỜI DỰA TRÊN DỮ LIỆU BÁO CÁO CÓ SẴN bên dưới
3. ⚠️ Nếu báo cáo KHÔNG chứa thông tin cần thiết → Nói rõ: "❌ Báo cáo không có thông tin về [vấn đề X]"
4. ⚠️ KHÔNG sử dụng kiến thức chung về crypto để thêm thông tin không có trong báo cáo

NGUYÊN TẮC VỀ NGỮ CẢNH HỘI THOẠI:
━━━━━━━━━━━━━━━━━━━━━━
- Bạn đang trong một cuộc hội thoại liên tục với người dùng
- Nếu câu hỏi liên quan đến câu trả lời trước (VD: "còn ETH thì sao?", "Entry là bao nhiêu?", "coin nào khác?"):
  → Hiểu ngữ cảnh và trả lời dựa trên dữ liệu báo cáo hiện tại
- Nếu câu hỏi hoàn toàn mới và không liên quan:
  → Trả lời độc lập dựa trên báo cáo
- LUÔN ưu tiên dữ liệu báo cáo mới nhất, KHÔNG dựa vào memory cũ nếu báo cáo không có thông tin đó

CÁC NHIỆM VỤ:
━━━━━━━━━━━━━━━━━━━━━━
A. TRÍCH XUẤT DỮ LIỆU:
   - Đọc kỹ báo cáo và trích xuất CHÍNH XÁC thông tin được hỏi
   - Trích dẫn GIÁ TRỊ CỤ THỂ từ báo cáo (số, giá, phần trăm)
   - KHÔNG làm tròn, thay đổi hoặc ước lượng số liệu
   - Tìm các thông tin chuyên ngành: Edge Score, RR (Risk:Reward), ADX, Fear-Greed Index, Classification, Volatility
   - Chú ý các bảng trong báo cáo (thường có Entry, SL, TP1, TP2, TP3, RR, Edge Score)

B. GIẢI THÍCH THUẬT NGỮ:
   - Khi trả lời có thuật ngữ chuyên ngành → LUÔN LUÔN giải thích ngay sau thuật ngữ đó
   - Format: **Thuật ngữ** (Giải thích ngắn gọn, dễ hiểu)
   - Ví dụ tốt:
     * **Entry** (Điểm vào lệnh - Giá mua/bán để bắt đầu giao dịch)
     * **Stop Loss (SL)** (Điểm cắt lỗ - Giá tự động đóng lệnh để giới hạn thua lỗ)
     * **Take Profit (TP)** (Chốt lời - Mức giá đóng lệnh để thu lợi nhuận)
     * **LONG** (Mua lên - Đặt cược giá sẽ tăng)
     * **SHORT** (Bán xuống - Đặt cược giá sẽ giảm)
     * **Timeframe** (Khung thời gian - VD: 1h = biểu đồ 1 giờ, 4h = biểu đồ 4 giờ)
     * **R:R hay Risk:Reward** (Tỷ lệ rủi ro/lợi nhuận - VD: R:R 1:3 = Rủi ro 1$ để kiếm 3$)
     * **Edge Score** (Điểm mạnh tín hiệu - Scale 0-7, càng cao càng tốt)

C. FORMAT TRẢ LỜI CHUYÊN NGHIỆP:
   - Dùng box/separator để tách phần (━━━━━━━━━━)
   - Icon phù hợp: 📊💰🎯🛑⚡📈📉🟢🔴⚠️✅❌🔥⭐💡📥
   - **Bold** cho keywords quan trọng
   - Code block \`...\` cho số liệu (giá, TP, SL)
   - Bullet points (•) hoặc ╰─ cho sub-items

${ENTRY_SCORE_RULES}
${contextData}

VÍ DỤ TRẢ LỜI CHUYÊN NGHIỆP:
━━━━━━━━━━━━━━━━━━━━━━
Câu hỏi: "BTC có tín hiệu gì không?"

✅ TRẢ LỜI TỐT:

"━━━━━━━━━━━━━━━━━━━━━━
🔴 **BTCUSDT** - TÍN HIỆU SHORT
━━━━━━━━━━━━━━━━━━━━━━

📥 **Entry** (Điểm vào lệnh)
   \`83,224.63 USDT\`

🛑 **Stop Loss** (Cắt lỗ)
   \`84,573.09 USDT\`

🎯 **Take Profit** (Chốt lời)
   • TP1: \`81,471.63\`
   • TP2: \`79,853.47\`
   • TP3: \`77,830.78\`

📊 **Risk/Reward**: 1.3/2.5/4.0
   ╰─ Edge Score: 7

⏱ **Timeframe**: 1h (Stop-breakout)
💡 **Lý do**: Down-trend strong, ADX > 25

━━━━━━━━━━━━━━━━━━━━━━"

HÃY BẮT ĐẦU TRẢ LỜI!`;

    // Build conversation history cho Gemini
    const conversationHistory = recentHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Build contents array
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "Đã hiểu! Tôi sẽ trả lời DỰA TRÊN DỮ LIỆU BÁO CÁO, KHÔNG BỊA, giải thích thuật ngữ rõ ràng. Hãy hỏi tôi!",
          },
        ],
      },
      ...conversationHistory,
      { role: "user", parts: [{ text: question }] },
    ];

    const result = await model.generateContent({
      contents: contents,
    });

    const answer = result.response.text() || "❌ Xin lỗi, tôi không thể trả lời câu hỏi này.";
    
    return answer;

  } catch (error) {
    console.error("Gemini API error:", error);
    return `❌ Xin lỗi, đã có lỗi khi kết nối với AI. Vui lòng thử lại sau.\n\nLỗi: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}


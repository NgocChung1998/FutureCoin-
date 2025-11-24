"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, Loader2, X, Minimize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export const ChatAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history on mount
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/chat");
        const data = await response.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white shadow-2xl transition hover:scale-110 hover:shadow-indigo-500/50"
        aria-label="Open AI Chat"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-50 flex flex-col transition-all duration-300",
      isMinimized ? "w-[320px]" : "w-[420px]"
    )}>
      <Card className={cn(
        "bg-[#0b1221]/98 border-indigo-500/30 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl flex flex-col transition-all",
        isMinimized ? "h-auto" : "h-[600px] max-h-[85vh]"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <div className="relative">
              <Bot className="h-5 w-5 text-indigo-400" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <span>AI Assistant</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-white/10"
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 py-12">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-indigo-400 opacity-50 animate-pulse" />
                  <p className="text-sm font-medium mb-2">Xin chào! 👋</p>
                  <p className="text-xs text-slate-600">Tôi có thể giúp bạn phân tích coin, giải thích tín hiệu giao dịch và tư vấn về risk management.</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full shadow-lg",
                      message.role === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                        : "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
                    )}
                  >
                    {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[75%] shadow-md",
                      message.role === "user"
                        ? "bg-gradient-to-br from-indigo-500/30 to-indigo-600/30 text-white border border-indigo-500/40"
                        : "bg-white/10 text-slate-100 border border-white/20 backdrop-blur-sm",
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
                    <p className="text-[10px] text-slate-400 mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-start animate-in fade-in">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-white/10 text-slate-200 border border-white/20 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>
          </>
        )}

        {!isMinimized && (
          <div className="p-4 border-t border-white/10 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-3 text-white transition hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};


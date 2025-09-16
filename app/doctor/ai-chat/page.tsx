"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Brain,
  Send,
  RotateCcw,
  Trash2,
  Copy,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "doctor" | "ai";
  content: string;
  ts: string;
}

// Basic safe formatter (bold, italic, code, headings, lists, blockquotes)
function renderMessageContent(raw: string) {
  const elements: React.ReactNode[] = [];
  const lines = raw.replace(/\r/g, "").split("\n");
  let i = 0;
  const listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      elements.push(
        <ul
          key={elements.length}
          className="list-disc ml-5 space-y-1 text-[13px]"
        >
          {listBuffer.map((li, idx) => (
            <li key={idx}>{parseInline(li)}</li>
          ))}
        </ul>
      );
      listBuffer.length = 0;
    }
  };
  const parseInline = (text: string): React.ReactNode => {
    // escape < >
    let parts: (string | React.ReactNode)[] = [
      text.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    ];
    const apply = (
      regex: RegExp,
      wrap: (s: string, k: number) => React.ReactNode
    ) => {
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach((p) => {
        if (typeof p !== "string") {
          newParts.push(p);
          return;
        }
        let last = 0;
        let m;
        let key = 0;
        while ((m = regex.exec(p))) {
          if (m.index > last) newParts.push(p.slice(last, m.index));
          newParts.push(wrap(m[1], key++));
          last = m.index + m[0].length;
        }
        if (last < p.length) newParts.push(p.slice(last));
      });
      parts = newParts;
    };
    // inline code
    apply(/`([^`]+)`/g, (s, k) => (
      <code
        key={k}
        className="px-1 py-0.5 rounded bg-slate-900/10 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-300 text-[12px] font-mono"
      >
        {s}
      </code>
    ));
    // bold ** **
    apply(/\*\*([^*]+)\*\*/g, (s, k) => (
      <strong
        key={k}
        className="font-semibold text-slate-900 dark:text-slate-100"
      >
        {s}
      </strong>
    ));
    // italic * * (avoid already bold)
    apply(/(?<!\*)\*([^*]+)\*(?!\*)/g, (s, k) => (
      <em key={k} className="italic">
        {s}
      </em>
    ));
    return parts.map((p, idx) => (
      <React.Fragment key={idx}>{p}</React.Fragment>
    ));
  };
  while (i < lines.length) {
    // Code block
    if (/^```/.test(lines[i])) {
      flushList();
      const lang = lines[i].replace(/^```+/, "").trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && /^```/.test(lines[i])) i++; // consume closing
      elements.push(
        <pre
          key={elements.length}
          className="text-[12px] leading-relaxed font-mono bg-slate-900/90 text-slate-100 p-3 rounded-lg overflow-x-auto border border-slate-700 shadow-inner"
        >
          {lang && (
            <div className="text-[10px] uppercase tracking-wider text-indigo-300 mb-1 opacity-70">
              {lang}
            </div>
          )}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }
    // List item
    if (/^[-*+]\s+/.test(lines[i])) {
      listBuffer.push(lines[i].replace(/^[-*+]\s+/, ""));
      i++;
      continue;
    } else {
      flushList();
    }
    const line = lines[i].trimEnd();
    // Headings
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizeClass = {
        1: "text-lg",
        2: "text-base",
        3: "text-sm",
        4: "text-sm",
        5: "text-[13px]",
        6: "text-[12px]",
      }[level as 1 | 2 | 3 | 4 | 5 | 6];
      elements.push(
        <div
          key={elements.length}
          className={`${sizeClass} font-semibold mt-2 first:mt-0 text-indigo-600 dark:text-indigo-300`}
        >
          {parseInline(headingMatch[2])}
        </div>
      );
      i++;
      continue;
    }
    // Blockquote
    if (/^>\s?/.test(line)) {
      elements.push(
        <blockquote
          key={elements.length}
          className="border-l-2 pl-3 border-indigo-400/60 dark:border-indigo-300/40 italic text-[13px] text-slate-600 dark:text-slate-300"
        >
          {parseInline(line.replace(/^>\s?/, ""))}
        </blockquote>
      );
      i++;
      continue;
    }
    // Empty line -> spacer
    if (line.trim() === "") {
      elements.push(<div key={elements.length} className="h-2" />);
      i++;
      continue;
    }
    // Paragraph
    elements.push(
      <p
        key={elements.length}
        className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-200"
      >
        {parseInline(line)}
      </p>
    );
    i++;
  }
  flushList();
  return <>{elements}</>;
}

export default function DoctorAIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("doctor_ai_chat");
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("doctor_ai_chat", JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (override?: string) => {
      const text = (override ?? input).trim();
      if (!text || loading) return;
      setError(null);
      setInput("");
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "doctor",
        content: text,
        ts: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg]);
      setLoading(true);
      try {
        const res = await api.post("/doctors/ai-chat", { message: text });
        const ai: ChatMessage = {
          id: crypto.randomUUID(),
          role: "ai",
          content: res.data.response || "No response",
          ts: res.data.timestamp || new Date().toISOString(),
        };
        setMessages((m) => [...m, ai]);
      } catch (e: any) {
        setError(e.response?.data?.message || "Failed to get AI response");
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const regenerateLast = () => {
    for (let i = messages.length - 1; i >= 0; i--)
      if (messages[i].role === "doctor") {
        sendMessage(messages[i].content);
        return;
      }
  };
  const clearConversation = () => {
    if (!loading) setMessages([]);
  };
  const copyLast = async () => {
    const lastAi = [...messages].reverse().find((m) => m.role === "ai");
    if (lastAi) {
      try {
        await navigator.clipboard.writeText(lastAi.content);
      } catch {}
    }
  };

  const quickPrompts = [
    "Differential for acute abdominal pain in adult",
    "Drug interaction: amlodipine with simvastatin",
    "Summarize latest hypertension management guidelines",
    "Red flag symptoms for pediatric fever",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />{" "}
            Doctor AI Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Clinical decision support. Verify critical information.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={regenerateLast}
            disabled={loading}
            className="px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Regenerate
          </button>
          <button
            onClick={copyLast}
            disabled={messages.filter((m) => m.role === "ai").length === 0}
            className="px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
          <button
            onClick={clearConversation}
            disabled={loading || messages.length === 0}
            className="px-3 py-2 text-xs rounded-md border border-rose-300 dark:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50 text-rose-600 dark:text-rose-300 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>
      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3 flex flex-col h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400 gap-3">
                <Brain className="w-10 h-10 text-indigo-500/70" />
                <p>Start a clinical query or pick a quick prompt.</p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  "group flex gap-3 max-w-full " +
                  (m.role === "doctor" ? "justify-end" : "justify-start")
                }
              >
                {m.role === "ai" && (
                  <div className="w-7 h-7 rounded-md bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                  </div>
                )}
                <div
                  className={
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words max-w-[75%] " +
                    (m.role === "doctor"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white/80 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm")
                  }
                >
                  {m.role === "ai"
                    ? renderMessageContent(m.content)
                    : m.content}
                  <div className="mt-2 text-[10px] opacity-60">
                    {new Date(m.ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-md bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-300 animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
                  Thinking…
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-end gap-3"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Ask a clinical question..."
                className="flex-1 resize-none px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 max-h-40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 mt-0.5" /> AI may be inaccurate.
              Verify with guidelines.
            </div>
          </div>
        </div>
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm">
            <p className="text-xs font-medium mb-3 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Quick Prompts
            </p>
            <div className="space-y-2">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800/50 backdrop-blur-xl shadow-sm space-y-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Capabilities
            </p>
            <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>Differential considerations</li>
              <li>Medication interactions</li>
              <li>Guideline summaries</li>
              <li>Red flag identification</li>
              <li>Documentation help</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

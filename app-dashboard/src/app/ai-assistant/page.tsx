"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Bot } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAIResponse, suggestedPrompts } from "@/lib/ai-responses";
import { runCalendarCommand } from "@/lib/calendar/ai";
import { buildLifeOSContext } from "@/ai/context/LifeOSContext";
import { getInitials, useProfileStore } from "@/store/profile-store";
import { useAISettingsStore, assertAIEnabled } from "@/store/ai-settings-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types/ai";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

/** POSTs to the one endpoint the frontend is allowed to talk to for AI chat, and streams the
 *  reply back token-by-token via onDelta. Throws "unconfigured" specifically so callers can
 *  fall back to the local mock responder when no provider has credentials yet. */
async function streamKimiReply(
  messages: ChatMessage[],
  onDelta: (delta: string) => void
): Promise<void> {
  assertAIEnabled();
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      context: buildLifeOSContext(),
      taskType: "chat",
      stream: true,
    }),
  });

  if (res.status === 503) throw new Error("unconfigured");
  if (!res.ok || !res.body) throw new Error("request-failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value, { stream: true }));
  }
}

export default function AIAssistantPage() {
  const name = useProfileStore((s) => s.name);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "ai",
      content: `Hi ${useProfileStore.getState().name.split(" ")[0] || "there"}. I'm your Life OS assistant — ask me to plan your week, summarize your goals, or tell you what you're forgetting.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function respond(prompt: string, history: Message[]) {
    const aiMsgId = crypto.randomUUID();
    let streamed = "";
    let started = false;

    const chatHistory: ChatMessage[] = history.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    try {
      await streamKimiReply(chatHistory, (delta) => {
        if (!started) {
          started = true;
          setThinking(false);
          setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "" }]);
        }
        streamed += delta;
        setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: streamed } : m)));
      });
      if (!started) {
        setThinking(false);
        setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "(No response.)" }]);
      }
    } catch (err) {
      setThinking(false);
      const message = err instanceof Error ? err.message : "";
      const note =
        message === "unconfigured"
          ? " (Kimi isn't connected yet — add a Kimi API key in AI Settings. Showing a local estimate for now.)"
          : message === "ai-disabled"
            ? " (AI is turned off — flip it back on in AI Settings. Showing a local estimate for now.)"
            : "";
      setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: getAIResponse(prompt) + note }]);
    }
  }

  function send(text?: string) {
    const prompt = (text ?? input).trim();
    if (!prompt) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");

    // Direct calendar mutations ("schedule a workout tomorrow") stay deterministic and local --
    // no need to round-trip an LLM call for something the app can already do precisely.
    const calendarResult = runCalendarCommand(prompt);
    if (calendarResult.handled) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", content: calendarResult.message }]);
      return;
    }

    setThinking(true);
    void respond(prompt, history);
  }

  const aiEnabled = useAISettingsStore((s) => s.enabled);

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <SectionHeader
        eyebrow="AI Assistant"
        title="Ask Life OS"
        description="Natural language over everything you track."
        actions={
          !aiEnabled ? (
            <Link
              href="/settings/ai"
              className="rounded-full border border-[var(--life-warning)]/30 bg-[var(--life-warning)]/10 px-3 py-1 text-xs text-[var(--life-warning)] transition hover:border-[var(--life-warning)]/50"
            >
              AI is off — running on local estimates
            </Link>
          ) : undefined
        }
      />

      <GlassCard interactive={false} className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {m.role === "ai" ? (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--life-accent)]/15 text-[var(--life-accent)]">
                      <Bot className="h-4 w-4" />
                    </div>
                  ) : (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-white/10 text-[10px]">{getInitials(name) || "?"}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "ai"
                        ? "border border-white/[0.07] bg-white/[0.03] text-foreground/90"
                        : "bg-gradient-to-br from-[var(--life-primary)] to-[var(--life-accent)] text-[#04141a]"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--life-accent)]/15 text-[var(--life-accent)]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-white/[0.06] p-4">
          <div className="mx-auto flex max-w-2xl flex-wrap gap-2 pb-3">
            {suggestedPrompts.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition hover:border-[var(--life-accent)]/30 hover:text-foreground"
              >
                <Sparkles className="h-3 w-3 text-[var(--life-accent)]" />
                {p}
              </button>
            ))}
          </div>
          <div className="mx-auto flex max-w-2xl gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about your life…"
              className="border-white/[0.08] bg-white/[0.03]"
            />
            <Button onClick={() => send()} className="shrink-0 bg-[var(--life-accent)] text-white hover:bg-[var(--life-accent)]/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

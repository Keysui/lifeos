"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Bot } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAIResponse, suggestedPrompts } from "@/lib/ai-responses";
import { getInitials, useProfileStore } from "@/store/profile-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
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

  function send(text?: string) {
    const prompt = (text ?? input).trim();
    if (!prompt) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", content: getAIResponse(prompt) }]);
    }, 700);
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <SectionHeader
        eyebrow="AI Assistant"
        title="Ask Life OS"
        description="Natural language over everything you track."
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

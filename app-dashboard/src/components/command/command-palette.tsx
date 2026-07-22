"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/store/ui-store";
import { navItems } from "@/components/layout/nav-config";
import { getAIResponse, suggestedPrompts } from "@/lib/ai-responses";

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setQuery("");
        setResponse(null);
        setThinking(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  function runPrompt(prompt: string) {
    setQuery(prompt);
    setResponse(null);
    setThinking(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setThinking(false);
      setResponse(getAIResponse(prompt));
    }, 650);
  }

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Life OS Command Bar"
      description="Ask a question or jump anywhere"
      className="glass-panel-strong border-white/[0.08] sm:max-w-xl"
    >
      <Command shouldFilter={!thinking && !response} className="bg-transparent">
        <CommandInput
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            setResponse(null);
          }}
          placeholder="Ask Life OS anything, or jump to a page…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) runPrompt(query);
          }}
        />
        <AnimatePresence initial={false} mode="wait">
          {(thinking || response) && (
            <motion.div
              key="ai-response"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="overflow-hidden px-3"
            >
              <div className="mb-1 flex items-start gap-2.5 rounded-lg border border-[var(--life-accent)]/20 bg-[var(--life-accent)]/[0.07] px-3 py-2.5 text-sm">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--life-accent)]" />
                {thinking ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </span>
                ) : (
                  <span className="leading-relaxed text-foreground/90">{response}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <CommandList>
          <CommandEmpty>No results. Press Enter to ask the AI directly.</CommandEmpty>

          <CommandGroup heading="Suggested">
            {suggestedPrompts.map((p) => (
              <CommandItem key={p} onSelect={() => runPrompt(p)}>
                <Sparkles className="text-[var(--life-accent)]" />
                {p}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigate">
            {navItems.map((item) => (
              <CommandItem key={item.href} onSelect={() => goTo(item.href)}>
                <item.icon />
                {item.label}
                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-40" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

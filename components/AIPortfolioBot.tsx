"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const starter: ChatMessage = {
  role: "assistant",
  content: "Hi! I’m Vivek’s portfolio assistant. How can I help you? You can ask me in English or Hinglish.",
};

const quickPrompts = [
  "Tell me about Vivek",
  "What are his skills?",
  "Show me his projects",
  "How can I book an interview?",
];

export default function AIPortfolioBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text = input) {
    const value = text.trim();
    if (!value || sending) return;
    const next = [...messages, { role: "user" as const, content: value }];
    setMessages(next);
    setInput("");
    setError("");
    setSending(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: value, history: next.slice(-10) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "I couldn’t respond right now. Please try again.");
      setMessages((current) => [...current, { role: "assistant", content: String(payload.answer || "I’m sorry, I couldn’t answer that right now.") }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((current) => [...current, { role: "assistant", content: "Sorry, I’m having trouble connecting right now. Please use the Contact section if you need help." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`portfolio-ai-bot ${open ? "is-open" : ""}`}>
      {open && (
        <section className="portfolio-ai-window" aria-label="AI portfolio assistant">
          <div className="portfolio-ai-head">
            <div className="portfolio-ai-title">
              <span className="portfolio-ai-icon"><Bot size={17} /></span>
              <div><strong>Portfolio Assistant</strong><small><span /> Online</small></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close AI assistant"><X size={17} /></button>
          </div>

          <div className="portfolio-ai-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`portfolio-ai-message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {sending && <div className="portfolio-ai-message assistant portfolio-ai-typing"><i /><i /><i /></div>}
            <div ref={endRef} />
          </div>

          {messages.length === 1 && (
            <div className="portfolio-ai-quick">
              {quickPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}
            </div>
          )}

          {error && <div className="portfolio-ai-error">{error}</div>}

          <form className="portfolio-ai-input" onSubmit={(event) => { event.preventDefault(); void send(); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask in English or Hinglish…" aria-label="Ask the portfolio assistant" maxLength={2500} />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send message"><Send size={15} /></button>
          </form>
          <div className="portfolio-ai-foot"><Sparkles size={11} /> AI assistant • answers are based on this portfolio</div>
        </section>
      )}

      <button className="portfolio-ai-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close portfolio assistant" : "Open portfolio assistant"}>
        <span className="portfolio-ai-pulse" />
        {open ? <X size={19} /> : <MessageCircle size={19} />}
      </button>
    </div>
  );
}

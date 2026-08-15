'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Lightbulb, Bot, ExternalLink, CheckCircle2, Hash, User, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SourceItem {
  id: string;
  content: string;
  channel: string;
  sentiment: string | null;
  sentimentScore?: number | null;
  createdAt?: string;
  cited: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceItem[];
  retrievedCount?: number;
  error?: boolean;
  timestamp?: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const sentimentStyles: Record<string, string> = {
  POSITIVE: 'bg-[#905690]/30 text-[#905690] border-[#905690]/40 dark:text-[#b573b5]',
  NEGATIVE: 'bg-[#445a79]/30 text-[#445a79] border-[#445a79]/40 dark:text-[#6c8ab2]',
  NEUTRAL: 'bg-[#6a5a87]/30 text-[#6a5a87] border-[#6a5a87]/40 dark:text-[#8f7dba]',
};

const channelLabel: Record<string, string> = {
  WEBSITE: 'Website',
  MOBILE_APP: 'Mobile App',
  EMAIL: 'Email',
  API: 'API',
  CSV: 'CSV',
};

const DEFAULT_QUESTIONS = [
  'What are customers saying about onboarding & signup?',
  'Which features are most requested by users?',
  'How has customer sentiment changed recently?',
  'What are the top complaint areas this week?',
  'What do customers love most about the product?',
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AskPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (questionText?: string) => {
    const query = (questionText ?? message).trim();
    if (!query || isLoading) return;

    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: timestampStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to get AI answer');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: [
          ...(data.sources || []),
          ...(data.related || []),
        ],
        retrievedCount: data.retrievedCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.message || 'Something went wrong. Please try again.',
        error: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ask LOOP</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMessages([])} className="h-8 gap-1.5 text-xs" disabled={messages.length === 0}>
            <Trash2 className="h-3.5 w-3.5" /> Clear chat
          </Button>
          <Button size="sm" onClick={() => setMessages([])} className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="h-3.5 w-3.5" /> New chat
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-14rem)] w-full">
        {/* ── Chat panel ── */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card mb-3 relative overflow-hidden shadow-sm flex flex-col">
            <div className="absolute inset-0 bg-primary-gradient opacity-[0.05] dark:opacity-[0.08] pointer-events-none" />
            <div className="relative z-10 flex-1 flex flex-col p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center select-none flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 dark:bg-card border border-primary/20 dark:border-border text-primary dark:text-foreground mb-3 shadow-xl shadow-primary/20 dark:shadow-sm relative overflow-hidden">
                  <div className="hidden dark:block absolute inset-0 bg-primary-gradient opacity-[0.22] pointer-events-none" />
                  <Bot className="h-5 w-5 relative z-10" />
                </div>
                <h3 className="font-bold text-foreground text-3xl">Ask anything about your feedback</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1.5 leading-relaxed mb-8">
                  LOOP AI searches your workspace's actual customer feedback and answers only from what it finds — no hallucinations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl px-4">
                  {DEFAULT_QUESTIONS.slice(0, 4).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      disabled={isLoading}
                      className="group relative text-left rounded-xl border border-border/70 bg-card/50 p-4 text-sm font-medium transition-all disabled:opacity-50 overflow-hidden hover:shadow-md hover:bg-card hover:border-primary/40 leading-relaxed"
                    >
                      <div className="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity pointer-events-none" />
                      <span className="relative z-10 group-hover:text-primary transition-colors block">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Avatar & Timestamp Header */}
                  <div className={`flex items-center gap-2 mb-0.5 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-card border border-border/60 shadow-sm relative overflow-hidden">
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4 text-muted-foreground/80 relative z-10" />
                      ) : (
                        <>
                          <div className="hidden dark:block absolute inset-0 bg-primary-gradient opacity-[0.22] pointer-events-none" />
                          <Bot className="h-4 w-4 text-primary dark:text-foreground relative z-10" />
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-row">
                      <span className="font-semibold text-sm text-foreground/90 tracking-tight">
                        {msg.role === 'user' ? 'You' : 'LOOP AI'}
                      </span>
                      {msg.timestamp && (
                        <span className="text-[11px] text-muted-foreground/60 font-medium">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-primary/95 to-primary/55 dark:from-primary dark:to-indigo-500 text-primary-foreground font-medium shadow-md shadow-primary/20'
                        : msg.error
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-card border border-border text-foreground shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Source citations (assistant messages only) */}
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="max-w-[90%] w-full space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        Grounded in {msg.retrievedCount} feedback item{msg.retrievedCount !== 1 ? 's' : ''} — {msg.sources.filter(s => s.cited).length} cited
                      </p>
                      <div className="space-y-1.5">
                        {msg.sources.slice(0, 6).map((src) => (
                          <div
                            key={src.id}
                            className={`rounded-xl border p-3 text-xs ${
                              src.cited
                                ? 'border-primary/30 bg-primary/5'
                                : 'border-border/50 bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {src.cited && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  Cited
                                </span>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${src.sentiment ? sentimentStyles[src.sentiment] : 'bg-muted'}`}
                              >
                                {src.sentiment ?? '—'}
                              </Badge>
                              <span className="text-muted-foreground text-[10px]">
                                {channelLabel[src.channel] ?? src.channel}
                              </span>
                              <span className="text-muted-foreground/60 text-[10px] ml-auto font-mono">
                                <Hash className="inline h-2.5 w-2.5" />{src.id.slice(-6)}
                              </span>
                            </div>
                            <p className="text-foreground/80 line-clamp-2 leading-relaxed">
                              &ldquo;{src.content}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-2.5 text-xs text-muted-foreground shadow-sm">
                  <Loader className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Searching feedback & generating grounded answer…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything about your customer feedback…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!message.trim() || isLoading}
              className="h-[42px] w-[42px] p-0 shrink-0 flex items-center justify-center rounded-xl bg-primary/90 dark:bg-card dark:border dark:border-border text-primary-foreground dark:text-foreground hover:bg-primary transition-all shadow-md shadow-primary/30 dark:shadow-sm relative overflow-hidden group"
            >
              <div className="hidden dark:block absolute inset-0 bg-primary-gradient opacity-[0.22] group-hover:opacity-[0.3] pointer-events-none transition-opacity" />
              {isLoading ? <Loader className="h-4 w-4 animate-spin relative z-10" /> : <Send className="h-4 w-4 relative z-10" />}
            </Button>
          </div>
        </div>
      </div>
  );
}

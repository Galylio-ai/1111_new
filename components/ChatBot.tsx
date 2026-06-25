"use client";
import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, ChevronDown, Mic, MicOff } from "lucide-react";
import Image from "next/image";

// Web Speech API type shim
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: ((e: any) => void) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "🍅 Tomate la moins chère",
  "📱 iPhone le moins cher",
  "🥛 Où trouver du lait ?",
  "👶 Couches bébé pas chères",
];

// ── Structured chat payload (sent inside <<CHATDATA:...>> sentinel) ───────────
type ProductOffer = { store: string; price: number; oldPrice: number };
type ProductCard = {
  name: string;
  brand: string;
  img: string;
  href: string;
  source: "para" | "retail" | "super";
  cheapestPrice: number;
  cheapestStore: string;
  priciestPrice: number;
  priciestStore: string;
  promoPct: number;
  saving: number;
  offers: ProductOffer[];
};
type PriceChangeCard = {
  name: string;
  brand: string;
  img: string;
  href: string;
  source: "para" | "retail" | "super";
  oldPrice: number;
  newPrice: number;
  shop: string;
  changePct: number;
  down: boolean;
};
type StatsMetric = { label: string; value: number | null; suffix?: string; tone?: "red" | "emerald" | "gold" };
type ChatPayload =
  | { kind: "products"; title: string; cards: ProductCard[] }
  | { kind: "price_changes"; title: string; cards: PriceChangeCard[] }
  | { kind: "stats"; title: string; index: number | null; metrics: StatsMetric[] };

function parseChatData(content: string): { intro: string; data: ChatPayload | null } {
  const match = content.match(/<<CHATDATA:([\s\S]*?)>>/);
  if (!match) return { intro: content, data: null };
  try {
    const data = JSON.parse(match[1]) as ChatPayload;
    const intro = content.slice(0, match.index).trim();
    return { intro, data };
  } catch {
    return { intro: content.replace(/<<CHATDATA:[\s\S]*?>>/, "").trim(), data: null };
  }
}

const SOURCE_CHIP: Record<ProductCard["source"], { label: string; cls: string }> = {
  para:   { label: "Para",        cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  retail: { label: "Retail",      cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  super:  { label: "Supermarché", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(2).replace(/\.?0+$/, "").replace(".", ",")} DT`;
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(value)) return;
    const start = performance.now();
    const dur = 900;
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{Math.round(display).toLocaleString("fr-FR")}{suffix}</>;
}

function ProductCardItem({ c }: { c: ProductCard }) {
  const chip = SOURCE_CHIP[c.source];
  return (
    <a
      href={c.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/card flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-white/[0.06] hover:shadow-[0_4px_20px_rgba(246,196,83,0.15)]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
        {c.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.img}
            alt={c.name}
            className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg opacity-50">📦</span>
        )}
        {c.promoPct > 0 && (
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-brand-red px-1.5 py-0.5 text-[9px] font-black text-white shadow animate-pulse">
            −{c.promoPct}%
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {c.brand && (
            <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-brand-gold">{c.brand}</span>
          )}
          <span className={`shrink-0 rounded-full border px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider ${chip.cls}`}>
            {chip.label}
          </span>
        </div>
        <div className="mt-0.5 line-clamp-2 text-[12px] font-bold text-white">{c.name}</div>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[14px] font-black tabular-nums text-brand-gold drop-shadow-[0_0_8px_rgba(246,196,83,0.4)]">
            {fmtPrice(c.cheapestPrice)}
          </span>
          {c.priciestPrice > c.cheapestPrice && (
            <span className="text-[10px] text-white/35 line-through tabular-nums">{fmtPrice(c.priciestPrice)}</span>
          )}
        </div>

        <div className="mt-0.5 text-[10px] text-white/55">
          chez <span className="font-bold text-emerald-400">{c.cheapestStore}</span>
          {c.saving > 0 && (
            <> · économisez <span className="font-bold text-emerald-400">{fmtPrice(c.saving)}</span></>
          )}
        </div>
      </div>
    </a>
  );
}

function PriceChangeCardItem({ c }: { c: PriceChangeCard }) {
  const chip = SOURCE_CHIP[c.source];
  return (
    <a
      href={c.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/card flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-white/[0.06]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
        {c.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.img}
            alt={c.name}
            className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg opacity-50">📦</span>
        )}
        <span className={`absolute -right-0.5 -top-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black text-white shadow ${c.down ? "bg-emerald-500" : "bg-red-500"} animate-pulse`}>
          {c.down ? "↘" : "↗"} {c.changePct}%
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {c.brand && <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-brand-gold">{c.brand}</span>}
          <span className={`shrink-0 rounded-full border px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider ${chip.cls}`}>{chip.label}</span>
        </div>
        <div className="mt-0.5 line-clamp-2 text-[12px] font-bold text-white">{c.name}</div>
        <div className="mt-1 flex items-baseline gap-1.5 text-[12px] tabular-nums">
          <span className="text-white/40 line-through">{fmtPrice(c.oldPrice)}</span>
          <span className="text-white/30">→</span>
          <span className={`font-black ${c.down ? "text-emerald-400" : "text-red-400"} drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]`}>
            {fmtPrice(c.newPrice)}
          </span>
        </div>
        <div className="mt-0.5 text-[10px] text-white/55">chez <span className="font-bold text-white/80">{c.shop}</span></div>
      </div>
    </a>
  );
}

function StatsPanel({ data }: { data: Extract<ChatPayload, { kind: "stats" }> }) {
  const toneCls: Record<NonNullable<StatsMetric["tone"]>, string> = {
    red: "text-red-400 from-red-500/20 to-red-500/0",
    emerald: "text-emerald-400 from-emerald-500/20 to-emerald-500/0",
    gold: "text-brand-gold from-brand-gold/20 to-brand-gold/0",
  };
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-3">
      {data.index != null && (
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">Indice</span>
          <span className="text-2xl font-black tabular-nums text-brand-gold drop-shadow-[0_0_10px_rgba(246,196,83,0.4)]">
            <CountUp value={data.index} />
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {data.metrics.map((m) => (
          <div key={m.label} className={`rounded-lg border border-white/5 bg-gradient-to-br ${m.tone ? toneCls[m.tone] : "from-white/[0.04] to-white/[0.01]"} p-2`}>
            <div className={`text-base font-black tabular-nums ${m.tone ? toneCls[m.tone].split(" ")[0] : "text-white"}`}>
              {m.value != null ? <CountUp value={m.value} suffix={m.suffix ?? ""} /> : "—"}
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-white/50">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StructuredReply({ data }: { data: ChatPayload }) {
  if (data.kind === "products") {
    return (
      <div className="mt-2 space-y-1.5">
        {data.cards.map((c, i) => <ProductCardItem key={`${c.name}-${i}`} c={c} />)}
      </div>
    );
  }
  if (data.kind === "price_changes") {
    return (
      <div className="mt-2 space-y-1.5">
        {data.cards.map((c, i) => <PriceChangeCardItem key={`${c.name}-${i}`} c={c} />)}
      </div>
    );
  }
  if (data.kind === "stats") {
    return <div className="mt-2"><StatsPanel data={data} /></div>;
  }
  return null;
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setVoiceSupported(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition));
  }, []);

  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const transcript: string = e.results?.[0]?.[0]?.transcript ?? "";
      console.log("[Voice] transcript:", transcript);
      if (transcript.trim()) {
        setInput(transcript.trim());
        sendMessage(transcript.trim());
      }
    };
    rec.onerror = (e: any) => {
      console.error("[Voice] error:", e.error);
      setIsListening(false);
    };
    rec.onend = () => {
      console.log("[Voice] ended");
      setIsListening(false);
    };

    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }

  const isIdle = messages.length === 0;

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply || (data.error ? `Erreur : ${data.error}${data.details ? ` (${data.details})` : ""}` : "Désolé, je n'ai pas pu répondre. Réessayez."),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur de connexion. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        className="fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-redDark shadow-[0_4px_20px_rgba(225,29,45,0.5)] ring-2 ring-brand-gold/30 transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_28px_rgba(225,29,45,0.65)] active:scale-95 overflow-hidden"
      >
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            open ? "rotate-90 opacity-0 scale-75" : "rotate-0 opacity-100 scale-100"
          }`}
        >
          <Image src="/mascot.png" alt="Assistant" width={44} height={44} className="object-contain" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            open ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-75"
          }`}
        >
          <ChevronDown className="h-6 w-6 text-white" />
        </span>
        {unread > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-black text-slate-900 ring-2 ring-white dark:ring-bg-900">
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-5 z-[80] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 sm:w-96 ${
          open
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-4 opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "80vh", background: "#0d1117" }}
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 px-4 py-3" style={{ background: "#161b27" }}>
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden bg-[#0d1117]">
            <Image src="/mascot.png" alt="Assistant" width={38} height={38} className="object-contain" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#161b27] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Assistant 1111</p>
            <p className="text-[11px] text-emerald-400 font-medium">En ligne · IA prix</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: "calc(80vh - 130px)" }}
        >
          {isIdle ? (
            /* ── Idle / welcome screen ── */
            <div className="flex flex-col items-center px-5 pt-8 pb-4">
              {/* Mascot */}
              <div className="relative mb-4">
                {/* Greeting bubble */}
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-semibold text-white shadow-lg"
                  style={{ background: "#1e2636" }}
                >
                  Salut ! 👋
                  <span className="block text-[11px] font-normal text-white/60">Demande-moi un produit !</span>
                  {/* Tail */}
                  <span
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0"
                    style={{
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "8px solid #1e2636",
                    }}
                  />
                </div>
                <Image
                  src="/mascot.png"
                  alt="Assistant 1111"
                  width={130}
                  height={130}
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* Title */}
              <h2 className="mt-2 text-center text-xl font-extrabold text-white leading-tight">
                Votre assistant{" "}
                <span className="text-brand-red">intelligent</span> prix
              </h2>

              {/* Subtitle */}
              <p className="mt-2 text-center text-[13px] text-white/50 leading-snug">
                Cherchez un produit, le moins cher,<br />ou où il est disponible.
              </p>

              {/* Suggestion chips */}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s.replace(/^\S+\s/, ""))}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-brand-red/40 hover:bg-brand-red/10 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Messages ── */
            <div className="px-4 py-4 space-y-3">
              {messages.map((msg, i) => {
                const parsed = msg.role === "assistant" ? parseChatData(msg.content) : { intro: msg.content, data: null };
                const isStructured = parsed.data !== null;
                return (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full overflow-hidden bg-[#161b27]">
                        <Image src="/mascot.png" alt="Assistant" width={24} height={24} className="object-contain" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "max-w-[80%] rounded-tr-sm bg-gradient-to-br from-brand-red to-brand-redDark text-white shadow-md"
                          : isStructured
                            ? "w-[88%] rounded-tl-sm bg-white/[0.07] text-white/90"
                            : "max-w-[80%] rounded-tl-sm bg-white/[0.07] text-white/90"
                      }`}
                    >
                      {parsed.intro && <div>{parsed.intro}</div>}
                      {parsed.data && <StructuredReply data={parsed.data} />}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-2">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full overflow-hidden bg-[#161b27]">
                    <Image src="/mascot.png" alt="Assistant" width={24} height={24} className="object-contain" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white/[0.07] px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-2" style={{ background: "#0d1117" }}>
          {/* Listening indicator bar */}
          {isListening && (
            <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-brand-red/10 border border-brand-red/30 px-3 py-2">
              <span className="flex gap-0.5 items-end h-4">
                {[0, 150, 300, 150, 0].map((delay, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-brand-red animate-bounce"
                    style={{ height: `${[8, 14, 18, 14, 8][i]}px`, animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
              <span className="text-xs font-medium text-brand-red">Je vous écoute… parlez maintenant</span>
            </div>
          )}
          <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition ${
            isListening
              ? "border-brand-red/60 ring-1 ring-brand-red/30 bg-brand-red/5"
              : "border-white/10 bg-white/[0.05] focus-within:border-brand-red/40 focus-within:ring-1 focus-within:ring-brand-red/20"
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "🎤 Écoute en cours…" : "Posez votre question…"}
              disabled={loading || isListening}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none"
            />
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                disabled={loading}
                aria-label={isListening ? "Arrêter l'écoute" : "Recherche vocale"}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed ${
                  isListening
                    ? "bg-brand-red text-white shadow-[0_0_10px_rgba(225,29,45,0.6)]"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                }`}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
            )}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Envoyer"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-red to-brand-redDark text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-white/20">
            Propulsé par Groq · Llama 3.3 · 1111.tn
          </p>
        </div>
      </div>
    </>
  );
}

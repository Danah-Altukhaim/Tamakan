import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useSession } from "../../app/session";
import { Badge, Button, PageHeader } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { Markdown } from "../../components/Markdown";
import type { AssistantAnswer, Citation } from "../../data/types";

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
  answer?: AssistantAnswer;
}

export function Assistant() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tracks } = useSession();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setTurns((prev) => [...prev, { role: "user", text: q }]);
    setBusy(true);
    try {
      const answer = await api.ask(q);
      setTurns((prev) => [...prev, { role: "assistant", text: answer.answer, answer }]);
    } catch {
      setTurns((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry — the assistant is unavailable right now." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function resetChat() {
    setTurns([]);
    setInput("");
  }

  function goToCitation(c: Citation) {
    if (c.kind === "track") navigate(`/tracks/${c.id}`);
    else if (c.kind === "module") {
      const trackId = tracks.find((tk) => tk.modules.some((m) => m.id === c.id))?.id;
      if (trackId) navigate(`/tracks/${trackId}`);
    } else navigate("/explore");
  }

  const examples = [t("assistant.ex1"), t("assistant.ex2"), t("assistant.ex3")];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={t("assistant.title")} subtitle={t("assistant.subtitle")} />
        {turns.length > 0 && (
          <Button
            variant="ghost"
            onClick={resetChat}
            disabled={busy}
            className="mt-1 shrink-0"
            aria-label={t("assistant.newChat")}
          >
            <Icon name="refresh" size={16} /> {t("assistant.newChat")}
          </Button>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-[var(--separator)] bg-[var(--card)] shadow-[var(--shadow-card)]">
        {/* Messages */}
        <div ref={listRef} className="max-h-[52vh] min-h-[320px] overflow-y-auto p-5">
          {turns.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <div
                className="mb-4 grid h-14 w-14 place-items-center rounded-2xl text-[var(--koc-blue)]"
                style={{ background: "var(--fill-subtle)" }}
              >
                <Icon name="assistant" size={28} />
              </div>
              <p className="mb-6 max-w-md text-sm text-[var(--text-muted)]">
                {t("assistant.intro")}
              </p>
              <div className="w-full">
                <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">
                  {t("assistant.examplesTitle")}
                </div>
                <div className="flex flex-col gap-2">
                  {examples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => ask(ex)}
                      className="rounded-xl border border-[var(--separator)] px-4 py-2.5 text-start text-sm hover:bg-[var(--fill-subtle)]"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {turns.map((turn, i) => (
                <div
                  key={i}
                  className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={[
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      turn.role === "user"
                        ? "bg-[var(--koc-blue)] text-white"
                        : "bg-[var(--fill-subtle)] text-[var(--text)]",
                    ].join(" ")}
                  >
                    {turn.role === "assistant" ? (
                      <Markdown text={turn.text} />
                    ) : (
                      <p>{turn.text}</p>
                    )}

                    {turn.answer && (
                      <div className="mt-3 space-y-2">
                        {turn.answer.citations.length > 0 && (
                          <div>
                            <div className="mb-1.5 text-xs font-semibold text-[var(--text-muted)]">
                              {t("assistant.sources")}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {turn.answer.citations.map((c) => (
                                <button key={`${c.kind}-${c.id}`} onClick={() => goToCitation(c)}>
                                  <Badge tone="sky">
                                    <Icon name="link" size={12} /> {c.label}
                                  </Badge>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span>
                            {t("assistant.confidence")}: {Math.round(turn.answer.confidence * 100)}%
                          </span>
                          {turn.answer.escalate && (
                            <Badge tone="amber">
                              <Icon name="alert" size={12} /> {t("assistant.escalate")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[var(--fill-subtle)] px-4 py-3 text-sm text-[var(--text-muted)]">
                    {t("assistant.thinking")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2 border-t border-[var(--separator)] p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("assistant.placeholder")}
            className="flex-1 rounded-xl border border-[var(--separator)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--koc-blue)]"
            aria-label={t("assistant.placeholder")}
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            {t("assistant.send")}
          </Button>
        </form>
      </div>
    </div>
  );
}

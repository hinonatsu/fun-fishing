"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Anchor, Check, ChevronDown, Fish, Search, Waves } from "lucide-react";

export type FishingSearchValues = {
  season: string;
  area: string;
  field: string;
};

type FishingHeroProps = {
  onSearch?: (values: FishingSearchValues) => void;
};

const fields = [
  { key: "season", label: "時期", options: ["今月", "来月", "春", "夏", "秋", "冬"] },
  { key: "area", label: "エリア", options: ["北海道", "東北", "関東", "中部", "関西", "中国・四国", "九州・沖縄"] },
  { key: "field", label: "フィールド", options: ["堤防", "サーフ", "磯", "船", "河川・湖"] },
] as const;

/** React + Tailwind CSS + lucide-react. Pass onSearch to connect your results page. */
export default function FishingHero({ onSearch }: FishingHeroProps) {
  const [values, setValues] = useState<FishingSearchValues>({
    season: "今月",
    area: "関東",
    field: "堤防",
  });
  const [activeField, setActiveField] = useState<keyof FishingSearchValues | null>(null);
  const [submitted, setSubmitted] = useState<FishingSearchValues | null>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const id = useId();

  function focusTrigger(key: keyof FishingSearchValues) {
    searchRef.current?.querySelector<HTMLButtonElement>(`[data-field="${key}"]`)?.focus();
  }

  useEffect(() => {
    if (!activeField) return;

    const root = searchRef.current;
    const panel = root?.querySelector<HTMLElement>("[data-options]");
    const selected = panel?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    selected?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !root?.contains(event.target)) {
        setActiveField(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setActiveField(null);
        if (activeField) focusTrigger(activeField);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    root?.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      root?.removeEventListener("keydown", handleEscape);
    };
  }, [activeField]);

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="relative isolate min-h-[680px] overflow-hidden bg-gradient-to-r from-blue-900 to-slate-800 px-4 pb-16 pt-12 text-white sm:px-8 sm:pb-24 sm:pt-16 lg:min-h-[760px]"
    >
      {/* Ambient ocean light; no external images or stylesheet required. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.16),transparent_65%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 left-1/2 -z-10 h-[420px] w-[130%] -translate-x-1/2 rounded-[50%] border border-white/10 bg-sky-400/5" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-72 left-1/2 -z-10 h-[500px] w-[160%] -translate-x-1/2 rounded-[50%] border border-white/5" />

      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2.5 text-sm font-bold tracking-[0.14em]">
          <Fish aria-hidden="true" className="h-7 w-7 text-sky-200" strokeWidth={1.6} />
          FUN FISHING
        </div>

        <div className="mx-auto mt-16 max-w-4xl text-center sm:mt-20">
          <p className="mb-5 text-[10px] font-semibold tracking-[0.28em] text-sky-200/80 sm:text-xs">
            FIND YOUR NEXT FISHING SETUP
          </p>
          <h1 id={`${id}-title`} className="text-[clamp(1.75rem,5.5vw,3.75rem)] font-bold leading-tight tracking-tight">
            最適な仕掛けを、最安で。
          </h1>
          <p className="mt-5 text-sm leading-7 text-blue-100/75 sm:text-base">
            いつ、どこで、釣りをする？
            <br className="sm:hidden" />
            あなたの一日に合う道具を見つけよう。
          </p>
        </div>

        <form
          ref={searchRef}
          aria-label="釣りの条件検索"
          className="relative mx-auto mt-10 max-w-3xl sm:mt-12"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setActiveField(null);
            }
          }}
          onSubmit={(event) => {
            event.preventDefault();
            setActiveField(null);
            setSubmitted({ ...values });
            onSearch?.({ ...values });
          }}
        >
          <div className="flex items-center rounded-full bg-white p-1.5 text-slate-900 shadow-xl shadow-black/25 ring-1 ring-white/20 sm:p-2">
            <div className="flex min-w-0 flex-1 divide-x divide-gray-200">
              {fields.map(({ key, label }) => (
                <div key={key} className="min-w-0 flex-1">
                  <button
                    type="button"
                    id={`${id}-${key}-trigger`}
                    data-field={key}
                    aria-expanded={activeField === key}
                    aria-controls={activeField === key ? `${id}-${key}-options` : undefined}
                    onClick={() => setActiveField(activeField === key ? null : key)}
                    className={`group flex w-full min-w-0 items-center justify-between gap-1 px-3 py-3 text-left transition-colors hover:bg-gray-100 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:px-7 sm:py-4 ${
                      key === "season" ? "rounded-l-full" : "rounded-none"
                    } ${activeField === key ? "bg-gray-100" : ""}`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold leading-5 text-slate-900 sm:text-xs">{label}</span>
                      <span className="block truncate text-xs leading-5 text-slate-500 sm:text-sm">{values[key]}</span>
                    </span>
                    <ChevronDown aria-hidden="true" className={`hidden h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform sm:block ${activeField === key ? "rotate-180" : ""}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="ml-1 shrink-0 border-l border-gray-200 pl-2 sm:ml-2 sm:pl-3">
              <button
                type="submit"
                aria-label="この条件で仕掛けを検索"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-md shadow-red-500/20 transition hover:scale-105 hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none sm:h-14 sm:w-14"
              >
                <Search aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
              </button>
            </div>
          </div>

          {fields.map(({ key, label, options }, index) => activeField === key && (
            <div
              key={key}
              id={`${id}-${key}-options`}
              data-options
              role="group"
              aria-labelledby={`${id}-${key}-trigger`}
              className={`absolute left-0 right-0 top-full z-20 mt-3 max-h-64 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-3 text-left text-slate-900 shadow-2xl shadow-black/20 sm:right-auto sm:w-64 ${
                index === 1 ? "sm:left-1/3" : index === 2 ? "sm:left-auto sm:right-16" : ""
              }`}
              onKeyDown={(event) => {
                const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
                const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
                const next = event.key === "ArrowDown" ? (current + 1) % buttons.length
                  : event.key === "ArrowUp" ? (current - 1 + buttons.length) % buttons.length
                  : event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : null;
                if (next !== null) {
                  event.preventDefault();
                  buttons[next]?.focus();
                }
              }}
            >
              <p className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-400">{label}を選択</p>
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={values[key] === option}
                  onClick={() => {
                    setValues((previous) => ({ ...previous, [key]: option }));
                    setSubmitted(null);
                    setActiveField(null);
                    focusTrigger(key);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${values[key] === option ? "bg-blue-50 font-semibold text-blue-800" : "text-slate-600"}`}
                >
                  {option}
                  {values[key] === option && <Check aria-hidden="true" className="h-4 w-4" />}
                </button>
              ))}
            </div>
          ))}
        </form>

        <div role="status" aria-live="polite" aria-atomic="true" className="mx-auto mt-5 min-h-6 max-w-3xl text-center text-xs leading-6 text-blue-100/70">
          {submitted
            ? `検索条件：${submitted.season} / ${submitted.area} / ${submitted.field}`
            : "釣りの条件から、あなたにぴったりの仕掛け探し。"}
        </div>

        <div className="mt-14 flex items-center justify-center gap-3 text-[11px] text-sky-100/55 sm:mt-16 sm:gap-5 sm:text-xs">
          <span className="flex items-center gap-2"><Waves aria-hidden="true" className="h-4 w-4" />次の一投が、楽しみになる。</span>
          <span aria-hidden="true" className="h-3 w-px bg-white/20" />
          <span className="flex items-center gap-2"><Anchor aria-hidden="true" className="h-3.5 w-3.5" />道具選びを、もっと気軽に。</span>
        </div>
      </div>
    </section>
  );
}

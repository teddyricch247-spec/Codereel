'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { Check, Pause, Play, RotateCcw } from 'lucide-react';

type Token = [string, string];

const LINES: Token[][] = [
  [['kw', 'const'], ['', ' reel = '], ['fn', 'codereel'], ['', '('], ['st', '"v2.4-launch"'], ['', ')']],
  [['', '  .'], ['fn', 'intro'], ['', '('], ['st', '"Ship faster."'], ['', ', { '], ['kw', 'beat'], ['', ': '], ['nu', '124'], ['', ' })']],
  [['', '  .'], ['fn', 'uiDemo'], ['', '('], ['st', '"Taskly"'], ['', ', '], ['st', '"Publish release"'], ['', ')']],
  [['', '  .'], ['fn', 'metric'], ['', '('], ['st', '"+212%"'], ['', ', '], ['st', '"signups"'], ['', ')']],
  [['', '  .'], ['fn', 'palette'], ['', '('], ['st', '"#4a43e8"'], ['', ', '], ['st', '"#d9f56b"'], ['', ')']],
  [['', '  .'], ['fn', 'render'], ['', '('], ['nu', '1080'], ['', ', '], ['nu', '60'], ['', ')']],
];

const LENS = LINES.map((t) => t.reduce((a, [, s]) => a + s.length, 0));
const BARS = [24, 38, 34, 58, 78, 100];

const SCENE_LABELS = ['Kinetic hook', 'Product walkthrough', 'Growth proof', '1080p master'];

function Line({ tokens, n }: { tokens: Token[]; n: number }) {
  const offsets = tokens.reduce<number[]>((acc, [, text], i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + tokens[i - 1][1].length);
    return acc;
  }, []);

  return (
    <>
      {tokens.map(([cls, text], i) => {
        const remaining = Math.max(0, n - offsets[i]);
        const s = text.slice(0, remaining);
        if (!s) return null;
        return cls ? (
          <span key={i} className={cls}>
            {s}
          </span>
        ) : (
          <Fragment key={i}>{s}</Fragment>
        );
      })}
    </>
  );
}

export default function HeroStage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [typed, setTyped] = useState<number[]>(() => LENS.slice());
  const [caret, setCaret] = useState(-1);
  const [act, setAct] = useState(1);
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [metricVal, setMetricVal] = useState(212);
  const [progress, setProgress] = useState(25);
  const [phase, setPhase] = useState<'typing' | 'playing' | 'ready'>('playing');
  const [cycle, setCycle] = useState(0);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let alive = true;
    let vis = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const io = new IntersectionObserver((e) => {
      vis = e[0]?.isIntersecting ?? true;
    });
    if (ref.current) io.observe(ref.current);

    const wait = async (ms: number) => {
      let left = ms;
      while (alive && left > 0) {
        const chunk = Math.min(80, left);
        await sleep(chunk);
        if (!pausedRef.current && vis && !document.hidden) {
          left -= chunk;
        }
      }
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => {
        alive = false;
        io.disconnect();
      };
    }

    (async () => {
      while (alive) {
        // Phase 1: Fast crisp code authoring
        setPhase('typing');
        setScene(-1);
        setAct(-1);
        setProgress(0);
        setTyped(LINES.map(() => 0));
        await wait(260);

        for (let i = 0; i < LINES.length && alive; i++) {
          setCaret(i);
          for (let c = 2; c <= LENS[i] && alive; c += 2) {
            setTyped((t) => {
              const a = t.slice();
              a[i] = Math.min(LENS[i], c);
              return a;
            });
            await wait(14);
          }
          setTyped((t) => {
            const a = t.slice();
            a[i] = LENS[i];
            return a;
          });
          if (i === 1) {
            setScene(0);
            setProgress(25);
          }
          await wait(50);
        }
        if (!alive) return;
        setCaret(-1);

        // Phase 2: Play 4 choreographed scenes synced to code lines
        setPhase('playing');
        const durations = [1900, 2300, 2200, 2100];
        for (let k = 0; k < 4 && alive; k++) {
          setScene(k);
          setAct(k < 3 ? k + 1 : 5);
          setProgress((k + 1) * 25);

          if (k === 2) {
            const t0 = performance.now();
            const animMetric = () => {
              if (!alive) return;
              const p = Math.min(1, (performance.now() - t0) / 1000);
              setMetricVal(Math.round(212 * (1 - Math.pow(1 - p, 3))));
              if (p < 1) requestAnimationFrame(animMetric);
            };
            requestAnimationFrame(animMetric);
          }

          await wait(durations[k]);
        }

        if (!alive) return;
        setPhase('ready');
        setAct(-1);
        await wait(1800);
      }
    })();

    return () => {
      alive = false;
      io.disconnect();
    };
  }, [cycle]);

  const jumpToScene = (idx: number) => {
    setTyped(LENS.slice());
    setCaret(-1);
    setPhase('playing');
    setScene(idx);
    setAct(idx < 3 ? idx + 1 : 5);
    setProgress((idx + 1) * 25);
    if (idx === 2) setMetricVal(212);
  };

  return (
    <div className="stage" ref={ref}>
      <div className="frame">
        {/* Window Top Chrome */}
        <div className="bar items-center justify-between">
          <div className="flex items-center gap-1.5">
            <s />
            <s />
            <s />
            <span className="ml-2 text-[11px] font-mono-tabular text-[#8b98cc]">
              launch-reel.ts
            </span>
          </div>
          <span className="text-[10.5px] font-mono-tabular text-[#d9f56b]">
            {phase === 'typing'
              ? 'Compiling timeline…'
              : phase === 'ready'
                ? '1080p MP4 ready'
                : `Scene ${(scene >= 0 ? scene : 0) + 1}/4 · 60fps`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[0.95fr_1.05fr] min-h-[320px]">
          {/* Left Code Editor Pane */}
          <div className="code border-b sm:border-b-0 sm:border-r border-[#1e264d] flex flex-col justify-between">
            <div>
              {LINES.map((tokens, i) => (
                <p
                  key={i}
                  className={act === i ? 'act flex items-center' : 'flex items-center'}
                  style={{ fontSize: '11.5px', lineHeight: '24px' }}
                >
                  <span className="inline-block w-4 text-[#4c578c] select-none mr-1.5 text-[10px] tabular-nums">
                    {i + 1}
                  </span>
                  <span className="truncate">
                    <Line tokens={tokens} n={typed[i]} />
                    {caret === i && <i className="caret" />}
                  </span>
                </p>
              ))}
            </div>

            {/* Bottom Beat / Frame Scrubber Indicators inside Editor */}
            <div className="mt-4 pt-3 border-t border-[#1e264d] flex items-center justify-end gap-3 px-2 text-[10.5px] font-mono-tabular text-[#7d8cc4]">
              <span>1920×1080 · MP4</span>
              <div className="flex items-center gap-1">
                {SCENE_LABELS.map((lbl, idx) => (
                  <button
                    key={lbl}
                    type="button"
                    title={lbl}
                    aria-label={`Jump to ${lbl}`}
                    onClick={() => jumpToScene(idx)}
                    className={`w-4 h-1.5 rounded-full transition-all cursor-pointer ${
                      scene === idx
                        ? 'bg-[#d9f56b] w-6'
                        : 'bg-[#2a3466] hover:bg-[#4b599e]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Live Motion Preview Viewport */}
          <div className="view relative min-h-[250px] flex flex-col justify-between p-3.5">
            {/* Base Timeline Compiler State (visible briefly while lines 1-2 type) */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-5 text-center transition-opacity duration-300 ${
                scene === -1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                background: 'linear-gradient(150deg, #1b185e 0%, #3b36c4 58%, #6d9bff 100%)',
              }}
            >
              <div className="w-full max-w-[200px] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#d9f56b]">
                  <span>SCENE GRAPH</span>
                  <span>60 FPS</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full bg-white/25 w-full" />
                  <div className="h-2 rounded-full bg-[#d9f56b]/80 w-4/5" />
                  <div className="h-2 rounded-full bg-white/20 w-3/5" />
                </div>
              </div>
            </div>

            {/* Top HUD */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-[#0f1633]/75 text-white text-[10.5px] font-semibold backdrop-blur-sm">
                {scene >= 0 ? SCENE_LABELS[scene] : 'Building scenes…'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Play hero preview' : 'Pause hero preview'}
                  className="w-6 h-6 rounded-full bg-white/90 text-[#0f1633] flex items-center justify-center hover:bg-white cursor-pointer"
                >
                  {paused ? <Play className="w-3 h-3 ml-0.5" /> : <Pause className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaused(false);
                    setCycle((c) => c + 1);
                  }}
                  aria-label="Replay hero preview"
                  className="w-6 h-6 rounded-full bg-[#0f1633]/70 text-white flex items-center justify-center hover:bg-[#0f1633] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Scene 0: Kinetic Launch Hook */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-5 text-center transition-all duration-500 ${
                scene === 0
                  ? 'opacity-100 scale-100 blur-0'
                  : 'opacity-0 scale-95 blur-[4px] pointer-events-none'
              }`}
              style={{
                background: 'linear-gradient(145deg, #211a6e 0%, #4a43e8 55%, #7fb0ff 100%)',
              }}
            >
              <div className="px-2.5 py-0.5 rounded-full bg-white/15 text-[#d9f56b] text-[10px] font-mono-tabular mb-2.5">
                v2.4 RELEASE
              </div>
              <div className="text-[32px] font-extrabold leading-[0.98] tracking-[-0.04em] text-white">
                Build once.
                <br />
                <span className="text-[#d9f56b]">Ship faster.</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="w-8 h-1.5 rounded-full bg-[#d9f56b]" />
                <span className="w-3 h-1.5 rounded-full bg-white/40" />
                <span className="w-2 h-1.5 rounded-full bg-white/25" />
              </div>
            </div>

            {/* Scene 1: Live SaaS Product UI Walkthrough */}
            <div
              className={`absolute inset-0 flex items-center justify-center p-5 transition-all duration-500 ${
                scene === 1
                  ? 'opacity-100 scale-100 blur-0'
                  : 'opacity-0 scale-95 blur-[4px] pointer-events-none'
              }`}
              style={{
                background: 'linear-gradient(155deg, #e8f0ff 0%, #cfdeff 100%)',
              }}
            >
              <div className="w-full max-w-[235px] bg-white rounded-xl p-3 shadow-[0_18px_36px_-14px_rgba(15,22,51,0.3)] border border-white text-[#0f1633]">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e3e9f6]">
                  <span className="w-3 h-3 rounded bg-[#4a43e8]" />
                  <span className="text-[11px] font-bold">Taskly</span>
                  <span className="ml-auto text-[10px] font-semibold text-[#5a6483]">Today</span>
                </div>
                <div className="my-2.5 space-y-1.5">
                  {[
                    ['Script synced', 'Done'],
                    ['Motion locked', 'Done'],
                    ['Release notes', 'Ready'],
                  ].map(([title, st]) => (
                    <div
                      key={title}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#f4f7fd] text-[10px]"
                    >
                      <span className="font-semibold">{title}</span>
                      <span className="font-bold text-[#4a43e8]">{st}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#16a34a]">
                    <Check className="w-3 h-3" /> Published
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#0f1633] text-white text-[10px] font-bold">
                    Publish release
                  </span>
                </div>
              </div>
            </div>

            {/* Scene 2: Growth Proof & Animated Chart */}
            <div
              className={`absolute inset-0 bg-white flex flex-col justify-center px-6 text-[#0f1633] transition-all duration-500 ${
                scene === 2
                  ? 'opacity-100 scale-100 blur-0'
                  : 'opacity-0 scale-95 blur-[4px] pointer-events-none'
              }`}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[36px] font-extrabold leading-none tracking-[-0.05em] text-[#4a43e8] tabular-nums">
                    +{metricVal}%
                  </div>
                  <div className="mt-1 text-xs font-bold">qualified signups</div>
                  <div className="text-[10.5px] text-[#5a6483]">first 14 days post-launch</div>
                </div>
                <div className="flex items-end gap-1.5 h-20 pb-1.5 border-b border-[#e3e9f6]">
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className="w-3 rounded-t transition-all duration-700"
                      style={{
                        height: scene === 2 ? `${h}%` : '12%',
                        background:
                          i === 5 ? '#d9f56b' : i === 4 ? '#4a43e8' : '#a9c4ff',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Scene 3: 1080p Render & Delivery Finale */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-white transition-all duration-500 ${
                scene === 3 || phase === 'ready'
                  ? 'opacity-100 scale-100 blur-0'
                  : 'opacity-0 scale-95 blur-[4px] pointer-events-none'
              }`}
              style={{
                background: 'linear-gradient(150deg, #10162f 0%, #242b5c 55%, #4a43e8 100%)',
              }}
            >
              <div className="w-9 h-9 rounded-full bg-[#d9f56b] text-[#0f1633] flex items-center justify-center mb-2.5">
                <Check className="w-5 h-5" strokeWidth={2.75} />
              </div>
              <div className="text-[24px] font-extrabold leading-tight tracking-tight">
                Your video is <span className="text-[#d9f56b]">ready.</span>
              </div>
              <div className="mt-1 text-[11px] font-mono-tabular text-[#b4c3ff]">
                1920×1080 · 60fps · 24.8 MB
              </div>
              <span className="dl mt-3">Download MP4</span>
            </div>

            {/* Bottom Scrubber Track */}
            <div className="relative z-10 mt-auto">
              <div className="h-1.5 w-full rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-[#d9f56b] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass g1">
        <b>24 hours</b>typical first cut
      </div>
      <div className="glass g2">
        <b>1080p</b>MP4, yours to keep
      </div>
    </div>
  );
}

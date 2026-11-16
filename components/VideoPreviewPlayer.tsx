'use client';

import { useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { STYLE_LABELS, type VideoOrder } from '@/lib/mock-db';

export default function VideoPreviewPlayer({ order }: { order: VideoOrder }) {
  const [playing, setPlaying] = useState(true);
  const [runKey, setRunKey] = useState(0);

  const safeColor = /^#[0-9a-f]{6}$/i.test(order.brandColor) ? order.brandColor : '#4a43e8';

  const restart = () => {
    setPlaying(true);
    setRunKey((k) => k + 1);
  };

  return (
    <div className="space-y-3">
      <div
        key={runKey}
        className={`relative aspect-video w-full rounded-[20px] border-4 border-white bg-[#10162f] overflow-hidden shadow-[0_24px_48px_-24px_rgba(15,22,51,0.5)] ${
          playing ? '' : 'paused'
        }`}
      >
        {/* Top bar info inside player */}
        <div className="absolute top-3.5 left-4 right-4 z-10 flex items-center justify-between text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-[#0f1633]/75 text-white backdrop-blur-sm">
            {STYLE_LABELS[order.style]} · {order.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#d9f56b] text-[#0f1633]">
            {order.status === 'Rendering first cut' ? 'Preview storyboard' : '1080p master preview'}
          </span>
        </div>

        {/* Custom animated code-built scene tailored to this order's style + brandColor */}
        {order.style === 'kinetic' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
            style={{
              background: `linear-gradient(135deg, #10162f 0%, ${safeColor} 60%, #7fb0ff 100%)`,
            }}
          >
            <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#d9f56b] mb-3">
              {order.id}
            </div>
            <h3 className="text-[clamp(26px,4vw,44px)] font-extrabold tracking-tight text-white max-w-xl leading-[1.06] animate-[in_0.7s_ease_forwards]">
              {order.title}
            </h3>
            <p className="mt-3 text-sm sm:text-base text-white/85 max-w-md">{order.goal}</p>
          </div>
        )}

        {order.style === 'demo' && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-[#edf3ff] to-[#d9e7ff]">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-[0_20px_40px_-16px_rgba(15,22,51,0.22)] border border-[#e3e9f6]">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#e3e9f6]">
                <span className="w-3.5 h-3.5 rounded" style={{ background: safeColor }} />
                <span className="text-sm font-bold text-[#0f1633] truncate">{order.title}</span>
                <span className="ml-auto text-xs font-medium text-[#5a6483]">Today</span>
              </div>
              <div className="my-3.5 space-y-2">
                {['Scene timing locked', 'Brand color applied', 'Export ready'].map((step) => (
                  <div
                    key={step}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f4f7fd] text-xs font-semibold text-[#0f1633]"
                  >
                    <span>{step}</span>
                    <span className="text-[#4a43e8]">Done</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: safeColor }}
                >
                  {order.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {order.style === 'data' && (
          <div className="absolute inset-0 bg-white flex items-center justify-between gap-8 px-8 sm:px-14">
            <div className="max-w-xs">
              <div className="text-[clamp(36px,5vw,60px)] font-extrabold tracking-tight leading-none tabular-nums" style={{ color: safeColor }}>
                +212%
              </div>
              <div className="mt-2 text-base sm:text-lg font-bold text-[#0f1633]">
                {order.title}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-[#5a6483] line-clamp-2">{order.goal}</div>
            </div>
            <div className="flex items-end gap-2.5 h-36 pb-3 border-b-2 border-[#e3e9f6]">
              {[28, 42, 38, 62, 82, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-5 sm:w-7 rounded-t-md transition-all duration-700"
                  style={{
                    height: playing ? `${h}%` : '20%',
                    background:
                      i === 5 ? '#d9f56b' : i === 4 ? safeColor : '#9db8ff',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {order.style === 'code' && (
          <div className="absolute inset-0 bg-[#10162f] flex flex-col justify-center px-8 sm:px-14 font-mono-tabular text-xs sm:text-sm text-[#c9d4ff]">
            <div className="space-y-1.5">
              <div>
                <span className="text-[#ff9fc2]">const</span> reel ={' '}
                <span className="text-[#9fb8ff]">video</span>(
                <span className="text-[#d9f56b]">&quot;{order.id.toLowerCase()}&quot;</span>)
              </div>
              <div>
                {'  '}.<span className="text-[#9fb8ff]">title</span>(
                <span className="text-[#d9f56b]">&quot;{order.title}&quot;</span>)
              </div>
              <div>
                {'  '}.<span className="text-[#9fb8ff]">theme</span>(
                <span className="text-[#d9f56b]">&quot;{safeColor}&quot;</span>)
              </div>
              <div>
                {'  '}.<span className="text-[#9fb8ff]">render</span>(
                <span className="text-[#ffcf8a]">1080</span>)
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-[#1d2547] px-4 py-3 text-xs space-y-1 max-w-md">
              <div>$ reel render --1080 --fps 60</div>
              <div className="text-[#d9f56b]">✓ Rendered {order.length} master</div>
            </div>
          </div>
        )}

        {/* Bottom playbar */}
        <div className="absolute bottom-3.5 left-4 right-4 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause preview' : 'Play preview'}
            className="w-9 h-9 rounded-full bg-white text-[#0f1633] flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={restart}
            aria-label="Restart preview"
            className="w-9 h-9 rounded-full bg-[#0f1633]/75 text-white flex items-center justify-center backdrop-blur-sm hover:bg-[#0f1633] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
            <div
              className={`h-full bg-[#d9f56b] rounded-full transition-all duration-1000 ${
                playing ? 'w-3/4' : 'w-1/3'
              }`}
            />
          </div>
          <span className="text-xs font-mono-tabular text-white/90 bg-[#0f1633]/65 px-2.5 py-1 rounded-full">
            {order.length}
          </span>
        </div>
      </div>
    </div>
  );
}

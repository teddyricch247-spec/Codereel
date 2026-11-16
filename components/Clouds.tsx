'use client';

import { useEffect, useRef } from 'react';

/**
 * Pure-code procedural FBM (Fractal Brownian Motion) cloud engine.
 * Zero image files — every texture, sideways drift layer, and cursor wake
 * is generated mathematically in TypeScript and rendered to HTML5 Canvas.
 *
 * Uses proportional world-space tiling (matching 1200x680 natural cloud proportions)
 * so clouds always drift sideways without vertical "up-to-down" stretching.
 */
export const CLOUD_CONFIG = {
  // Texture resolution of the periodic FBM cloud maps (wide 2:1 for natural sideways banks)
  texWidth: 480,
  texHeight: 240,
  // Render buffer resolution (upscaled smoothly onto the canvas)
  renderWidth: 384,
  renderHeight: 192,
  // Base cloud density threshold (lower = more cloud coverage, higher = clearer sky)
  coverageThreshold: 0.46,
  // Edge softness of cloud formations (0.20 = crisp cumulus, 0.40 = soft mist)
  edgeSoftness: 0.27,
  // Natural cloud tile size in CSS pixels (prevents vertical stretching on tall containers)
  tileWorldWidth: 1180,
  tileWorldHeight: 640,
  // Horizontal drift speeds of the 3 parallax cloud layers (matching Codereel's opposing layers)
  layerSpeeds: [0.36, -0.5, 0.22] as const,
  // Opacities of the 3 layered FBM textures
  layerOpacities: [0.9, 0.64, 0.72] as const,
  // PC cursor aerodynamic disturbance settings
  wakeRadius: 165,
  partingStrength: 5.5,
  slipstreamDrag: 0.6,
  curlStrength: 1.35,
  springStiffness: 0.036,
  damping: 0.88,
  maxDisplacement: 74,
};

interface CloudTextureSet {
  w: number;
  h: number;
  layers: [Uint8Array, Uint8Array, Uint8Array];
}

let cachedTextures: CloudTextureSet | null = null;

function hash2D(ix: number, iy: number, seed: number): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) | 0;
  n = Math.imul(n, 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function periodicValueNoise(
  x: number,
  y: number,
  periodX: number,
  periodY: number,
  seed: number
): number {
  const gx = x * periodX;
  const gy = y * periodY;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = fade(gx - x0);
  const fy = fade(gy - y0);

  const ix0 = ((x0 % periodX) + periodX) % periodX;
  const iy0 = ((y0 % periodY) + periodY) % periodY;
  const ix1 = (ix0 + 1) % periodX;
  const iy1 = (iy0 + 1) % periodY;

  const v00 = hash2D(ix0, iy0, seed);
  const v10 = hash2D(ix1, iy0, seed);
  const v01 = hash2D(ix0, iy1, seed);
  const v11 = hash2D(ix1, iy1, seed);

  const nx0 = v00 + (v10 - v00) * fx;
  const nx1 = v01 + (v11 - v01) * fx;
  return nx0 + (nx1 - nx0) * fy;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function buildPeriodicFbmLayer(
  w: number,
  h: number,
  seed: number,
  basePeriodX: number,
  basePeriodY: number,
  coverageBoost = 0
): Uint8Array {
  const data = new Uint8Array(w * h);
  const low = CLOUD_CONFIG.coverageThreshold - coverageBoost;
  const high = low + CLOUD_CONFIG.edgeSoftness;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;

      // Sideways-biased wind domain warp so wisps trail horizontally, never vertically
      const warpX =
        periodicValueNoise(nx + 0.17, ny + 0.31, basePeriodX, basePeriodY, seed + 91) * 0.095;
      const warpY =
        periodicValueNoise(nx + 0.53, ny + 0.79, basePeriodX, basePeriodY, seed + 173) * 0.028;

      const wx = nx + warpX;
      const wy = ny + warpY;

      let sum = 0;
      let amp = 0.52;
      let norm = 0;
      let px = basePeriodX;
      let py = basePeriodY;

      // 5 octaves of periodic fractal noise
      for (let oct = 0; oct < 5; oct++) {
        sum += periodicValueNoise(wx, wy, px, py, seed + oct * 37) * amp;
        norm += amp;
        amp *= 0.5;
        px *= 2;
        py *= 2;
      }

      const fbm = sum / norm;
      const density = smoothstep(low, high, fbm);
      data[y * w + x] = Math.round(Math.pow(density, 1.12) * 255);
    }
  }
  return data;
}

function getCloudTextures(): CloudTextureSet {
  if (cachedTextures) return cachedTextures;
  const w = CLOUD_CONFIG.texWidth;
  const h = CLOUD_CONFIG.texHeight;
  // Horizontal period < vertical period in 2:1 texture produces natural sideways cumulus banks
  cachedTextures = {
    w,
    h,
    layers: [
      buildPeriodicFbmLayer(w, h, 101, 3, 5, 0.03),
      buildPeriodicFbmLayer(w, h, 409, 4, 6, -0.02),
      buildPeriodicFbmLayer(w, h, 919, 3, 4, 0.01),
    ],
  };
  return cachedTextures;
}

export default function Clouds({ soft = false }: { soft?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const textures = getCloudTextures();
    const tw = textures.w;
    const th = textures.h;
    const [layerA, layerB, layerC] = textures.layers;

    const rw = CLOUD_CONFIG.renderWidth;
    const rh = CLOUD_CONFIG.renderHeight;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = rw;
    offCanvas.height = rh;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const imgData = offCtx.createImageData(rw, rh);
    const pixels32 = new Uint32Array(imgData.data.buffer);

    const gw = 32;
    const gh = 18;
    const nodeCount = gw * gh;
    const dispX = new Float32Array(nodeCount);
    const dispY = new Float32Array(nodeCount);
    const velX = new Float32Array(nodeCount);
    const velY = new Float32Array(nodeCount);

    let width = container.clientWidth || 1200;
    let height = container.clientHeight || 560;

    const resize = () => {
      width = container.clientWidth || 1200;
      height = container.clientHeight || 560;
      canvas.width = Math.max(360, Math.min(960, Math.round(width * 0.75)));
      canvas.height = Math.max(180, Math.min(600, Math.round(height * 0.75)));
    };
    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    const pointer = {
      active: false,
      x: -9999,
      y: -9999,
      lastX: -9999,
      lastY: -9999,
      vx: 0,
      vy: 0,
      lastMoveTs: 0,
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left - 60 ||
        e.clientX > rect.right + 60 ||
        e.clientY < rect.top - 60 ||
        e.clientY > rect.bottom + 60
      ) {
        pointer.active = false;
        return;
      }

      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;

      if (!pointer.active) {
        pointer.lastX = lx;
        pointer.lastY = ly;
      }

      const rawVx = lx - pointer.lastX;
      const rawVy = ly - pointer.lastY;
      pointer.vx = pointer.vx * 0.4 + Math.max(-36, Math.min(36, rawVx)) * 0.6;
      pointer.vy = pointer.vy * 0.4 + Math.max(-36, Math.min(36, rawVy)) * 0.6;
      pointer.lastX = lx;
      pointer.lastY = ly;
      pointer.x = lx;
      pointer.y = ly;
      pointer.active = true;
      pointer.lastMoveTs = performance.now();
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    const offsets = [0, 64, 150];
    const [opA, opB, opC] = CLOUD_CONFIG.layerOpacities;
    const masterGain = soft ? 0.78 : 0.94;

    const renderFrame = (hasWake: boolean) => {
      const oxA = ((Math.floor(offsets[0]) % tw) + tw) % tw;
      const oxB = ((Math.floor(offsets[1]) % tw) + tw) % tw;
      const oxC = ((Math.floor(offsets[2]) % tw) + tw) % tw;

      // Map render pixels to natural world-space cloud coordinates so clouds keep sideways proportions
      const worldScaleX = (width / CLOUD_CONFIG.tileWorldWidth) * (tw / rw);
      const worldScaleY = (height / CLOUD_CONFIG.tileWorldHeight) * (th / rh);

      if (!hasWake) {
        for (let py = 0; py < rh; py++) {
          const tyBase = ((Math.floor(py * worldScaleY) % th) + th) % th;
          const rowTex = tyBase * tw;
          const rowOut = py * rw;
          for (let px = 0; px < rw; px++) {
            const txBase = ((Math.floor(px * worldScaleX) % tw) + tw) % tw;
            const a = layerA[rowTex + ((txBase + oxA) % tw)] * opA;
            const b = layerB[rowTex + ((txBase + oxB) % tw)] * opB;
            const c = layerC[rowTex + ((txBase + oxC) % tw)] * opC;

            const inv = (1 - a / 255) * (1 - b / 255) * (1 - c / 255);
            const alpha = Math.min(255, Math.round((1 - inv) * 255 * masterGain));
            pixels32[rowOut + px] = (alpha << 24) | 0x00ffffff;
          }
        }
      } else {
        for (let py = 0; py < rh; py++) {
          const v = (py / (rh - 1)) * (gh - 1);
          const gy0 = Math.min(gh - 2, Math.floor(v));
          const fy = v - gy0;
          const rowOut = py * rw;

          for (let px = 0; px < rw; px++) {
            const u = (px / (rw - 1)) * (gw - 1);
            const gx0 = Math.min(gw - 2, Math.floor(u));
            const fx = u - gx0;

            const idx00 = gy0 * gw + gx0;
            const idx10 = idx00 + 1;
            const idx01 = idx00 + gw;
            const idx11 = idx01 + 1;

            const dx0 = dispX[idx00] + (dispX[idx10] - dispX[idx00]) * fx;
            const dx1 = dispX[idx01] + (dispX[idx11] - dispX[idx01]) * fx;
            const dx = dx0 + (dx1 - dx0) * fy;

            const dy0 = dispY[idx00] + (dispY[idx10] - dispY[idx00]) * fx;
            const dy1 = dispY[idx01] + (dispY[idx11] - dispY[idx01]) * fx;
            const dy = dy0 + (dy1 - dy0) * fy;

            const sx = px - dx * 0.55;
            const sy = py - dy * 0.55;

            const tx = ((Math.round(sx * worldScaleX) % tw) + tw) % tw;
            const ty = ((Math.round(sy * worldScaleY) % th) + th) % th;
            const tyB = ((Math.round((sy - dy * 0.14) * worldScaleY) % th) + th) % th;

            const a = layerA[ty * tw + ((tx + oxA) % tw)] * opA;
            const b = layerB[tyB * tw + ((tx + oxB) % tw)] * opB;
            const c = layerC[ty * tw + ((tx + oxC) % tw)] * opC;

            const wakeMag = Math.hypot(dx, dy);
            const thin = Math.max(0.58, 1 - wakeMag * 0.006);

            const inv = (1 - a / 255) * (1 - b / 255) * (1 - c / 255);
            const alpha = Math.min(255, Math.round((1 - inv) * 255 * masterGain * thin));
            pixels32[rowOut + px] = (alpha << 24) | 0x00ffffff;
          }
        }
      }

      offCtx.putImageData(imgData, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
    };

    renderFrame(false);

    if (prefersReducedMotion) {
      return () => {
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('mouseleave', onPointerLeave);
      };
    }

    let rafId = 0;
    let lastTick = performance.now();

    const tick = (now: number) => {
      rafId = window.requestAnimationFrame(tick);
      if (!isVisible || document.hidden) return;

      const dt = Math.min(48, now - lastTick);
      const pointerIdle = now - pointer.lastMoveTs > 60;
      if (pointerIdle) {
        pointer.vx *= 0.82;
        pointer.vy *= 0.82;
      }

      const hasActiveCursor = pointer.active && !pointerIdle;
      if (!hasActiveCursor && dt < 30) return;
      lastTick = now;

      const stepFactor = dt / 16.67;
      offsets[0] += CLOUD_CONFIG.layerSpeeds[0] * stepFactor * 0.55;
      offsets[1] += CLOUD_CONFIG.layerSpeeds[1] * stepFactor * 0.55;
      offsets[2] += CLOUD_CONFIG.layerSpeeds[2] * stepFactor * 0.55;

      const cursorSpeed = Math.hypot(pointer.vx, pointer.vy);
      const cellW = width / (gw - 1);
      const cellH = height / (gh - 1);
      const radiusSq = CLOUD_CONFIG.wakeRadius * CLOUD_CONFIG.wakeRadius;

      let totalEnergy = 0;

      for (let gy = 0; gy < gh; gy++) {
        const ny = gy * cellH;
        for (let gx = 0; gx < gw; gx++) {
          const idx = gy * gw + gx;
          const nx = gx * cellW;

          if (pointer.active) {
            const rx = nx + dispX[idx] - pointer.x;
            const ry = ny + dispY[idx] - pointer.y;
            const dSq = rx * rx + ry * ry;

            if (dSq < radiusSq && dSq > 0.01) {
              const dist = Math.sqrt(dSq);
              const falloff = Math.pow(1 - dist / CLOUD_CONFIG.wakeRadius, 1.6);
              const ux = rx / dist;
              const uy = ry / dist;

              const speedBoost = 1 + Math.min(2.2, cursorSpeed * 0.12);
              const push = CLOUD_CONFIG.partingStrength * falloff * speedBoost;

              velX[idx] +=
                ux * push +
                pointer.vx * CLOUD_CONFIG.slipstreamDrag * falloff -
                uy * CLOUD_CONFIG.curlStrength * falloff * Math.min(1.5, cursorSpeed * 0.08);

              velY[idx] +=
                uy * push * 0.9 +
                pointer.vy * CLOUD_CONFIG.slipstreamDrag * falloff +
                ux * CLOUD_CONFIG.curlStrength * falloff * Math.min(1.5, cursorSpeed * 0.08);
            }
          }

          velX[idx] += -dispX[idx] * CLOUD_CONFIG.springStiffness;
          velY[idx] += -dispY[idx] * CLOUD_CONFIG.springStiffness;
          velX[idx] *= CLOUD_CONFIG.damping;
          velY[idx] *= CLOUD_CONFIG.damping;

          dispX[idx] += velX[idx];
          dispY[idx] += velY[idx];

          const mag = Math.hypot(dispX[idx], dispY[idx]);
          if (mag > CLOUD_CONFIG.maxDisplacement) {
            const cap = CLOUD_CONFIG.maxDisplacement / mag;
            dispX[idx] *= cap;
            dispY[idx] *= cap;
          }

          totalEnergy += mag + Math.hypot(velX[idx], velY[idx]);
        }
      }

      renderFrame(totalEnergy > 0.5);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, [soft]);

  return (
    <div ref={containerRef} className={'clouds' + (soft ? ' soft' : '')} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

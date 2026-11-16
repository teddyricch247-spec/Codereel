'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Clouds from './Clouds';

const VIDEO_SRC = '';

const STYLES = [
  { slug: 'kinetic', name: 'Kinetic type' },
  { slug: 'demo', name: 'Product demo' },
  { slug: 'data', name: 'Data story' },
  { slug: 'code', name: 'Code explainer' },
] as const;

const DUR = 5000;
const SLIDE_EASE = [0.16, 1, 0.3, 1] as const;

type CodeToken = [string, string];
const CODE: CodeToken[][] = [
  [
    ['k', 'const'],
    ['', ' reel = '],
    ['f', 'video'],
    ['', '('],
    ['s', '"launch"'],
    ['', ')'],
  ],
  [
    ['', '  .'],
    ['f', 'scene'],
    ['', '('],
    ['s', '"title"'],
    ['', ', '],
    ['s', '"Ship faster"'],
    ['', ')'],
  ],
  [
    ['', '  .'],
    ['f', 'animate'],
    ['', '('],
    ['s', '"rise"'],
    ['', ', '],
    ['n', '0.8'],
    ['', ')'],
  ],
  [
    ['', '  .'],
    ['f', 'theme'],
    ['', '('],
    ['s', '"indigo"'],
    ['', ')'],
  ],
  [
    ['', 'reel.'],
    ['f', 'render'],
    ['', '('],
    ['n', '1080'],
    ['', ')'],
  ],
];

function Tokens({ t }: { t: CodeToken[] }) {
  return (
    <>
      {t.map(([c, s], i) =>
        c ? (
          <b key={i} className={c}>
            {s}
          </b>
        ) : (
          <span key={i}>{s}</span>
        )
      )}
    </>
  );
}

const sceneVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 44,
    scale: 0.96,
    filter: 'blur(6px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.44,
      ease: SLIDE_EASE,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -38,
    scale: 0.97,
    filter: 'blur(5px)',
    transition: {
      duration: 0.3,
      ease: SLIDE_EASE,
    },
  }),
};

export default function Showcase() {
  const [[cur, dir], setSlide] = useState<[number, number]>([0, 1]);
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [seen, setSeen] = useState(false);
  const [n, setN] = useState(0);
  const el = useRef(0);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const show = (k: number) => {
    el.current = 0;
    setSlide(([prev]) => [k, k >= prev ? 1 : -1]);
    setRun((r) => r + 1);
  };

  useEffect(() => {
    if (!playerRef.current) return;
    const io = new IntersectionObserver((e) => setSeen(e[0]?.isIntersecting ?? false), {
      threshold: 0.35,
    });
    io.observe(playerRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (!seen || paused || document.hidden) return;
      el.current += 100;
      if (el.current >= DUR) {
        el.current = 0;
        setSlide(([prev]) => [(prev + 1) % 4, 1]);
        setRun((r) => r + 1);
      }
    }, 100);
    return () => clearInterval(t);
  }, [seen, paused]);

  useEffect(() => {
    if (cur !== 2) return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / 1300);
      setN(Math.round(212 * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [cur, run]);

  const hasVideo = !!VIDEO_SRC;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="show-h">
        <div className={'show' + (hasVideo ? ' has-video' : '')} id="showcase">
          <Clouds soft />
          <div className="show-in">
            <div className="head">
              <h2 id="show-h">See what we can make for you</h2>
              <p>
                Four styles, all built in code so they stay sharp at any size. Tap a style to
                preview it, then order the one you like.
              </p>
            </div>
            <div
              ref={playerRef}
              className={
                'player' +
                (hasVideo ? ' has-video' : '') +
                (paused ? ' paused' : '') +
                (seen ? '' : ' out')
              }
              role="group"
              aria-label="Example video reel"
            >
              {hasVideo ? (
                <video
                  src={VIDEO_SRC}
                  muted
                  loop
                  playsInline
                  autoPlay
                  aria-label="Showreel of example videos"
                />
              ) : (
                <div className="reel">
                  <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                    {cur === 0 && (
                      <motion.div
                        key={`s1-${run}`}
                        custom={dir}
                        variants={sceneVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="scene s1 on"
                      >
                        <div className="kt">
                          {['Your idea.', 'In motion.', 'Delivered.'].map((t, i) => (
                            <span key={i}>
                              <b style={{ '--d': i } as React.CSSProperties}>{t}</b>
                            </span>
                          ))}
                        </div>
                        <i className="orb o1" />
                        <i className="orb o2" />
                      </motion.div>
                    )}

                    {cur === 1 && (
                      <motion.div
                        key={`s2-${run}`}
                        custom={dir}
                        variants={sceneVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="scene s2 on"
                      >
                        <div className="app">
                          <div className="app-top">
                            <i />
                            <em>Taskly</em>
                            <u>Today</u>
                          </div>
                          <div className="rows">
                            {['Done', 'Done', 'New'].map((u, i) => (
                              <div
                                className="row"
                                style={{ '--d': i } as React.CSSProperties}
                                key={i}
                              >
                                <i />
                                <div style={{ flex: 1 }}>
                                  <b />
                                  <s />
                                </div>
                                <u>{u}</u>
                              </div>
                            ))}
                          </div>
                          <div className="app-foot">
                            <span className="go">Create report</span>
                          </div>
                        </div>
                        <div className="toast-m">
                          <i>✓</i> Report created
                        </div>
                        <svg className="cursor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M4 2l16 9-7 2-3 7z"
                            fill="#0f1633"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    )}

                    {cur === 2 && (
                      <motion.div
                        key={`s3-${run}`}
                        custom={dir}
                        variants={sceneVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="scene s3 on"
                      >
                        <div>
                          <div className="big" role="img" aria-label="Plus 212 percent">
                            +{n}%
                          </div>
                          <div className="cap">
                            more views<small>in the first week after launch</small>
                          </div>
                        </div>
                        <div className="chart" aria-hidden="true">
                          {[26, 38, 34, 56, 78, 100].map((h, i) => (
                            <i
                              key={i}
                              style={{ '--h': `${h}%`, '--d': i } as React.CSSProperties}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {cur === 3 && (
                      <motion.div
                        key={`s4-${run}`}
                        custom={dir}
                        variants={sceneVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="scene s4 on"
                      >
                        <div className="ed" aria-hidden="true">
                          {CODE.map((t, i) => (
                            <span
                              key={i}
                              style={
                                {
                                  '--c': t.reduce((a, [, s]) => a + s.length, 0),
                                  '--d': i,
                                } as React.CSSProperties
                              }
                            >
                              <Tokens t={t} />
                            </span>
                          ))}
                        </div>
                        <div className="term" aria-hidden="true">
                          <span style={{ '--d': 0 } as React.CSSProperties}>
                            $ reel render --1080
                          </span>
                          <span style={{ '--d': 1 } as React.CSSProperties}>
                            <em>✓</em> Rendered in 4.2s
                          </span>
                          <span style={{ '--d': 2 } as React.CSSProperties}>
                            <em>✓</em> Saved to your account
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    <motion.span
                      key={STYLES[cur].slug}
                      initial={{ opacity: 0, y: -6, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.94 }}
                      transition={{ duration: 0.22, ease: SLIDE_EASE }}
                      className="rtag"
                    >
                      {STYLES[cur].name}
                    </motion.span>
                  </AnimatePresence>
                  <span className="rbadge">Placeholder reel</span>
                  <div className="segs" aria-hidden="true">
                    {STYLES.map((_, i) => (
                      <i
                        key={i + '-' + (i === cur ? run : 'x')}
                        className={'seg' + (i < cur ? ' done' : i === cur ? ' on' : '')}
                      />
                    ))}
                  </div>
                  <button
                    className="pp"
                    type="button"
                    aria-label={paused ? 'Play reel' : 'Pause reel'}
                    onClick={() => setPaused((p) => !p)}
                  >
                    <svg className="i-pause" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                    </svg>
                    <svg className="i-play" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 4l13 8-13 8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {!hasVideo && (
              <div className="reel-nav-wrap">
                <div className="reel-nav" role="group" aria-label="Choose an example style">
                  {STYLES.map((s, i) => {
                    const active = cur === i;
                    return (
                      <motion.button
                        key={s.slug}
                        className="rchip"
                        type="button"
                        aria-pressed={active}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        onClick={() => show(i)}
                      >
                        {active && (
                          <motion.span
                            layoutId="showcase-style-pill"
                            className="rchip-bg"
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 32,
                              mass: 0.85,
                            }}
                          />
                        )}
                        <span className="rchip-lbl">{s.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="reel-cta">
              {hasVideo ? (
                <Link className="btn lime" href="/order">
                  Order your video <span className="arr">→</span>
                </Link>
              ) : (
                <Link className="btn lime" href={'/order?style=' + STYLES[cur].slug}>
                  Order <span className="lbl-s">{STYLES[cur].name}</span>{' '}
                  <span className="arr">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Clouds from './Clouds';
import Nav from './Nav';
import Footer from './Footer';
import { emitMockDbChange, getMockDbVersion, subscribeMockDb } from '@/lib/db-events';
import {
  createMockOrder,
  getCatalogPlans,
  getCurrentUser,
  getDb,
  getUserBrandKit,
  signupMockUser,
  type PlanSlug,
  type VideoStyle,
} from '@/lib/mock-db';

const PLANS: Record<
  PlanSlug,
  { name: string; price: number; lens: string[]; edits: string; txt: string }
> = {
  single: {
    name: 'Single',
    price: 149,
    lens: ['15 seconds', '30 seconds'],
    edits: '2',
    txt: 'You can request up to two rounds of edits, then download the MP4.',
  },
  pack: {
    name: 'Pack of 3',
    price: 399,
    lens: ['15 seconds', '30 seconds'],
    edits: '2 each',
    txt: 'Each video includes up to two rounds of edits.',
  },
  long: {
    name: 'Long form',
    price: 299,
    lens: ['60 seconds', '90 seconds'],
    edits: '3',
    txt: 'You can request up to three rounds of edits, then download the MP4.',
  },
};

const STYLES: Record<VideoStyle, string> = {
  kinetic: 'Kinetic type',
  demo: 'Product demo',
  data: 'Data story',
  code: 'Code explainer',
};

const STEPS = ['Style', 'Details', 'Payment', 'Account'];

const V: Record<string, (v: string) => boolean> = {
  goal: (v) => v.trim().length > 0,
  email: (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim()),
  cname: (v) => v.trim().length >= 2,
  cnum: (v) => {
    const d = v.replace(/\D/g, '');
    return d.length >= 13 && d.length <= 19;
  },
  cexp: (v) => {
    const m = /^(0[1-9]|1[0-2])\/(\d\d)$/.exec(v);
    return !!m && new Date(2000 + +m[2], +m[1], 1) > new Date();
  },
  ccvc: (v) => /^\d{3,4}$/.test(v),
  apw: (v) => v.length >= 8,
};

const MSG: Record<string, string> = {
  goal: 'Tell us briefly what the video is for.',
  email: 'Enter a valid email address, like you@example.com.',
  cname: 'Enter the name shown on the card.',
  cnum: 'Enter the 13 to 19 digit number on the front of the card.',
  cexp: 'Use MM/YY with a date that hasn’t passed.',
  ccvc: 'Enter the 3 or 4 digit security code.',
  apw: 'Use at least 8 characters.',
};

const FMT: Record<string, (v: string) => string> = {
  cnum: (v) =>
    v
      .replace(/\D/g, '')
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, '$1 '),
  cexp: (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  },
  ccvc: (v) => v.replace(/\D/g, ''),
};

function getOrderLiveSnapshot(): string {
  if (typeof window === 'undefined') return 'ssr';
  const cfg = getDb().catalogConfig;
  const user = getCurrentUser();
  return `${getMockDbVersion()}:${cfg.singlePrice}:${cfg.packPrice}:${cfg.longPrice}:${cfg.standardTurnaroundDays}:${user?.id ?? 'anon'}:${user?.packCreditsRemaining ?? 0}`;
}

export default function OrderFlow() {
  const params = useSearchParams();
  const initialStyle = params.get('style') as VideoStyle | null;
  const initialPlan = params.get('plan') as PlanSlug | null;

  const liveSnap = useSyncExternalStore(subscribeMockDb, getOrderLiveSnapshot, () => 'ssr');
  const liveCfg =
    liveSnap === 'ssr'
      ? { singlePrice: 149, packPrice: 399, longPrice: 299, standardTurnaroundDays: 1, priorityTurnaroundDays: 1 }
      : getDb().catalogConfig;
  const activeUser = liveSnap === 'ssr' ? null : getCurrentUser();

  const livePlans: Record<
    PlanSlug,
    { name: string; price: number; lens: string[]; edits: string; txt: string; days: number }
  > = {
    single: { ...PLANS.single, price: liveCfg.singlePrice, days: liveCfg.standardTurnaroundDays },
    pack: { ...PLANS.pack, price: liveCfg.packPrice, days: liveCfg.priorityTurnaroundDays },
    long: { ...PLANS.long, price: liveCfg.longPrice, days: liveCfg.standardTurnaroundDays },
  };

  const [step, setStep] = useState(() =>
    initialStyle && STYLES[initialStyle] ? 2 : 1
  );
  const [style, setStyle] = useState<VideoStyle>(() =>
    initialStyle && STYLES[initialStyle] ? initialStyle : 'kinetic'
  );
  const [plan, setPlan] = useState<PlanSlug>(() =>
    initialPlan && PLANS[initialPlan] ? initialPlan : 'single'
  );
  const [lenSel, setLenSel] = useState('');
  const [usePackCredit, setUsePackCredit] = useState(false);
  const [f, setF] = useState(() => {
    const active = typeof window !== 'undefined' ? getCurrentUser() : null;
    const kit = active ? getUserBrandKit(active.id) : null;
    return {
      goal: '',
      notes: '',
      col: kit?.primaryColor || '#4a43e8',
      email: active?.email || '',
      cname: active?.name || '',
      cnum: '',
      cexp: '',
      ccvc: '',
      apw: '',
    };
  });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [oid, setOid] = useState('');

  const head = useRef<HTMLHeadingElement | null>(null);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (prev.current === null) {
      prev.current = step;
      return;
    }
    if (prev.current === step) return;
    prev.current = step;
    head.current?.focus({ preventScroll: true });
    head.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [step]);

  const p = livePlans[plan];
  const canRedeemCredit =
    Boolean(activeUser && activeUser.packCreditsRemaining > 0) && plan !== 'long';
  const redeemingCredit = canRedeemCredit && usePackCredit;
  const len = p.lens.includes(lenSel) ? lenSel : p.lens[0];

  const set = (k: keyof typeof f, v: string) => {
    setF((o) => ({ ...o, [k]: v }));
    setErrs((e) => (e[k] ? { ...e, [k]: false } : e));
  };

  const check = (keys: Array<keyof typeof f>) => {
    const next: Record<string, boolean> = {};
    for (const k of keys) {
      if (V[k] && !V[k](f[k])) next[k] = true;
    }
    setErrs((e) => ({ ...e, ...next }));
    return Object.keys(next).length === 0;
  };

  const pay = () => {
    if (!redeemingCredit && !check(['email', 'cname', 'cnum', 'cexp', 'ccvc'])) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const current = getCurrentUser();
      if (current) {
        const order = createMockOrder({
          userId: current.id,
          style,
          plan: redeemingCredit ? 'single' : plan,
          length: len,
          brandColor: f.col,
          goal: f.goal,
          notes: f.notes,
          usePackCredit: redeemingCredit,
        });
        emitMockDbChange();
        setOid(order.id);
        setStep(5);
      } else {
        setStep(4);
      }
    }, 450);
  };

  const create = () => {
    if (!check(['apw'])) return;
    const user = signupMockUser({
      name: f.cname,
      email: f.email,
      password: f.apw,
      company: f.cname.split(' ')[0] + ' Studio',
    });
    const order = createMockOrder({
      userId: user.id,
      style,
      plan,
      length: len,
      brandColor: f.col,
      goal: f.goal,
      notes: f.notes,
    });
    emitMockDbChange();
    setOid(order.id);
    setStep(5);
  };

  const field = (
    id: keyof typeof f,
    label: string,
    opts: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div className={'field' + (errs[id] ? ' bad' : '')}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={f[id]}
        aria-invalid={!!errs[id]}
        aria-describedby={id + '-e'}
        onChange={(e) => set(id, FMT[id] ? FMT[id](e.target.value) : e.target.value)}
        onBlur={() => V[id] && f[id] && setErrs((e) => ({ ...e, [id]: !V[id](f[id]) }))}
        {...opts}
      />
      <div className="err" id={id + '-e'}>
        {MSG[id]}
      </div>
    </div>
  );

  const styleOptions: Array<{
    slug: VideoStyle;
    cls: string;
    pv: React.ReactNode;
    text: string;
  }> = [
    {
      slug: 'kinetic',
      cls: 'p1',
      pv: <span>Move.</span>,
      text: 'Bold words that move with the beat. Great for announcements.',
    },
    {
      slug: 'demo',
      cls: 'p2',
      pv: (
        <div className="ui">
          <i />
          <i />
          <i />
          <em />
        </div>
      ),
      text: 'Clean app walkthroughs with animated interface moments.',
    },
    {
      slug: 'data',
      cls: 'p3',
      pv: (
        <div className="bars">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      ),
      text: 'Charts and numbers that build up as you explain them.',
    },
    {
      slug: 'code',
      cls: 'p4',
      pv: (
        <>
          <div>$ npm run build</div>
          <div>
            <em>✓</em> compiled
          </div>
          <div>
            <em>✓</em> rendered
          </div>
        </>
      ),
      text: 'Terminal and editor scenes for developer-friendly content.',
    },
  ];

  return (
    <>
      <header className="hero ord">
        <Clouds />
        <div className="wrap">
          <Nav cta={{ href: '/pricing', label: 'See pricing', short: 'Pricing' }} />
          <div className="ohead">
            <h1>Order your video</h1>
            <p>Pick a style, fill in the short brief, pay once and create your account.</p>
            <ol className="stepper" aria-label="Order progress">
              {STEPS.map((name, i) => {
                const n = i + 1;
                const cls = step > n ? 'done' : step === n ? 'cur' : undefined;
                return (
                  <li key={name} className={cls} aria-current={step === n ? 'step' : undefined}>
                    <b>{step > n ? '✓' : n}</b>
                    <span>{name}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </header>

      <main className="wrap">
        <div className="olay">
          <div className="card">
            <MotionConfig reducedMotion="user">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 1 && (
                    <section>
                      <h2 tabIndex={-1} ref={head}>
                        Choose your style
                      </h2>
                      <p className="lead">
                        Every video is built in code so it looks crisp everywhere. Pick one to start.
                      </p>
                      <div className="styles o" role="group" aria-label="Video styles">
                        {styleOptions.map((item) => {
                          const selected = style === item.slug;
                          return (
                            <motion.button
                              key={item.slug}
                              className="style relative"
                              type="button"
                              aria-pressed={selected}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                              onClick={() => setStyle(item.slug)}
                            >
                              {selected && (
                                <motion.span
                                  layoutId="order-style-ring"
                                  aria-hidden="true"
                                  className="pointer-events-none absolute -inset-[2px] rounded-[24px] border-2 border-[#4a43e8] shadow-[0_14px_28px_-18px_rgba(74,67,232,0.55)]"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 420,
                                    damping: 32,
                                  }}
                                />
                              )}
                              <div className={'pv ' + item.cls}>{item.pv}</div>
                              <h3>{STYLES[item.slug]}</h3>
                              <p>{item.text}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                      <div className="nav2">
                        <Link className="back" href="/#showcase">
                          See examples again
                        </Link>
                        <button className="btn lime" type="button" onClick={() => setStep(2)}>
                          Continue with <span>{STYLES[style]}</span> <span className="arr">→</span>
                        </button>
                      </div>
                    </section>
                  )}

                  {step === 2 && (
                    <section>
                      <h2 tabIndex={-1} ref={head}>
                        Plan and details
                      </h2>
                      <p className="lead">
                        Choose how many videos you need, then tell us what this one is for.
                      </p>
                      <div className="plans" role="radiogroup" aria-label="Plan">
                        {(
                          [
                            ['single', 'One video up to 30 seconds. 2 edit rounds.'],
                            ['pack', 'Three videos up to 30 seconds each. Priority delivery.'],
                            ['long', 'One video up to 90 seconds. 3 edit rounds.'],
                          ] as const
                        ).map(([k, text]) => (
                          <label className="po" key={k}>
                            <input
                              type="radio"
                              name="plan"
                              value={k}
                              checked={plan === k}
                              onChange={() => {
                                setPlan(k);
                                if (k === 'long') setUsePackCredit(false);
                              }}
                            />
                            <b>
                              {livePlans[k].name}{' '}
                              <span className="tabular-nums">${livePlans[k].price}</span>
                            </b>
                            {text}
                            {k === 'pack' && <em>Best value</em>}
                          </label>
                        ))}
                      </div>
                      {canRedeemCredit && activeUser && (
                        <label className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-[#4a43e8]/30 bg-[#eeedff] px-3.5 py-2.5 text-xs font-semibold text-[#0f1633] cursor-pointer">
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={usePackCredit}
                              onChange={(e) => setUsePackCredit(e.target.checked)}
                              className="w-4 h-4 accent-[#4a43e8]"
                            />
                            <span>
                              Redeem 1 prepaid pack credit ({activeUser.packCreditsRemaining}{' '}
                              available on {activeUser.name}&rsquo;s account)
                            </span>
                          </span>
                          <span className="font-mono-tabular text-[#4a43e8]">$0 due</span>
                        </label>
                      )}
                      {plan === 'pack' && !redeemingCredit && (
                        <p className="hint">
                          This brief is for your first video. You’ll add the other two from your account.
                        </p>
                      )}
                      {field('goal', 'What is the video for?', {
                        placeholder: 'e.g. Launch announcement for my app',
                        autoComplete: 'off',
                      })}
                      <div className="two">
                        <div className="field">
                          <label htmlFor="len">Length</label>
                          <select id="len" value={len} onChange={(e) => setLenSel(e.target.value)}>
                            {p.lens.map((l) => (
                              <option key={l} value={l}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label htmlFor="col">Brand color</label>
                          <div className="col">
                            <input
                              type="color"
                              aria-label="Pick brand color"
                              value={/^#[0-9a-f]{6}$/i.test(f.col) ? f.col : '#4a43e8'}
                              onChange={(e) => set('col', e.target.value)}
                            />
                            <input
                              id="col"
                              value={f.col}
                              maxLength={7}
                              autoComplete="off"
                              onChange={(e) => set('col', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="notes">
                          Script or notes <span className="opt">(optional)</span>
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={f.notes}
                          placeholder="Anything we should say or show?"
                          onChange={(e) => set('notes', e.target.value)}
                        />
                      </div>
                      <div className="nav2">
                        <button className="back" type="button" onClick={() => setStep(1)}>
                          ← Back
                        </button>
                        <button
                          className="btn lime"
                          type="button"
                          onClick={() => check(['goal']) && setStep(3)}
                        >
                          Continue to payment <span className="arr">→</span>
                        </button>
                      </div>
                    </section>
                  )}

                  {step === 3 && (
                    <section>
                      <h2 tabIndex={-1} ref={head}>
                        {redeemingCredit ? 'Confirm pack credit order' : 'Pay once, securely'}
                      </h2>
                      <p className="lead">
                        {redeemingCredit
                          ? 'Using 1 prepaid credit from your account. No card required.'
                          : 'One flat price. We start as soon as the payment clears, and you create your account right after.'}
                      </p>
                      {redeemingCredit && activeUser ? (
                        <div className="rounded-[18px] bg-[#f4f7fd] border border-[#e3e9f6] p-4 space-y-1.5 text-sm text-[#0f1633]">
                          <div className="font-semibold">
                            Signed in as {activeUser.name} ({activeUser.email})
                          </div>
                          <div className="text-xs text-[#5a6483]">
                            {activeUser.packCreditsRemaining} prepaid pack{' '}
                            {activeUser.packCreditsRemaining === 1 ? 'credit' : 'credits'} available
                            → {activeUser.packCreditsRemaining - 1} remaining after this order.
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="warn">
                            <b>⚠ Prototype only.</b> No payment is taken and nothing is sent anywhere. Don’t
                            enter real card details. Any test numbers like 4242 4242 4242 4242 work here.
                          </p>
                          {field('email', 'Email for your receipt', {
                            type: 'email',
                            inputMode: 'email',
                            autoComplete: 'email',
                            placeholder: 'you@example.com',
                          })}
                          {field('cname', 'Name on card', {
                            autoComplete: 'off',
                            placeholder: 'Full name',
                          })}
                          {field('cnum', 'Card number', {
                            inputMode: 'numeric',
                            autoComplete: 'off',
                            placeholder: '4242 4242 4242 4242',
                          })}
                          <div className="two">
                            {field('cexp', 'Expiry', {
                              inputMode: 'numeric',
                              autoComplete: 'off',
                              placeholder: '12/28',
                              maxLength: 5,
                            })}
                            {field('ccvc', 'CVC', {
                              inputMode: 'numeric',
                              autoComplete: 'off',
                              placeholder: '123',
                              maxLength: 4,
                            })}
                          </div>
                        </>
                      )}
                      <div className="nav2">
                        <button className="back" type="button" onClick={() => setStep(2)}>
                          ← Back
                        </button>
                        <button className="btn lime" type="button" disabled={busy} onClick={pay}>
                          {busy ? (
                            'Processing…'
                          ) : redeemingCredit ? (
                            <>
                              Redeem 1 credit &amp; submit <span className="arr">→</span>
                            </>
                          ) : (
                            <>
                              Pay ${p.price} <span className="arr">→</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="lock">
                        Fake checkout for prototype flow only ·{' '}
                        <Link href="/terms" className="underline text-[#4a43e8]">
                          Terms
                        </Link>{' '}
                        ·{' '}
                        <Link href="/privacy" className="underline text-[#4a43e8]">
                          Privacy
                        </Link>
                      </p>
                    </section>
                  )}

                  {step === 4 && (
                    <section>
                      <h2 tabIndex={-1} ref={head}>
                        Payment received. Create your account
                      </h2>
                      <p className="lead">So your finished videos are waiting for you in one place.</p>
                      <div className="field">
                        <label htmlFor="aemail">Email</label>
                        <input id="aemail" readOnly value={f.email} />
                      </div>
                      {field('apw', 'Choose a password', {
                        type: 'password',
                        autoComplete: 'new-password',
                        placeholder: 'At least 8 characters',
                      })}
                      <div className="nav2">
                        <span />
                        <button className="btn lime" type="button" onClick={create}>
                          Create account <span className="arr">→</span>
                        </button>
                      </div>
                    </section>
                  )}

                  {step === 5 && (
                    <section>
                      <div className="done-ico" aria-hidden="true">
                        ✓
                      </div>
                      <h2 tabIndex={-1} ref={head}>
                        You’re all set
                      </h2>
                      <p className="lead">
                        Order <b className="font-mono-tabular">{oid}</b> is saved in your prototype
                        account. Your first cut arrives{' '}
                        {p.days <= 1 ? 'within 24 hours' : `in about ${p.days} days`}, and you can
                        inspect the brief and status right now. {p.txt}
                      </p>
                      <div className="nav2">
                        <Link className="btn dark" href="/">
                          Back to home
                        </Link>
                        <Link className="btn lime" href={`/account/orders/${oid}`}>
                          Open in my account <span className="arr">→</span>
                        </Link>
                      </div>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </MotionConfig>
          </div>

          <aside className="sum" aria-label="Your order">
            <h3>Your order</h3>
            <dl>
              <dt>Style</dt>
              <dd>
                {STYLES[style]}
                {step < 4 && (
                  <button className="lnk" type="button" onClick={() => setStep(1)}>
                    Change
                  </button>
                )}
              </dd>
              <dt>Plan</dt>
              <dd>{redeemingCredit ? 'Pack credit' : p.name}</dd>
              <dt>Length</dt>
              <dd>{len}</dd>
              <dt>Edit rounds</dt>
              <dd>{p.edits}</dd>
              <dt>First cut</dt>
              <dd>{p.days <= 1 ? 'Within 24 hours' : `About ${p.days} days`}</dd>
            </dl>
            <div className="tot">
              <span>Total</span>
              <b className="tabular-nums">{redeemingCredit ? '$0' : `$${p.price}`}</b>
            </div>
            <ul>
              <li>Flat price, nothing else to pay</li>
              <li>1080p MP4 in your account</li>
              <li>No sales calls</li>
            </ul>
          </aside>
        </div>

        <section className="faqmini">
          <h2>Questions before you order?</h2>
          <p>
            The answers are on the <Link href="/#faq">home page</Link>. There are no sales calls,
            so everything you need is there.
          </p>
        </section>
        <Footer />
      </main>
    </>
  );
}

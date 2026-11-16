'use client';

import Link from 'next/link';
import Clouds from './Clouds';
import { FadeInSection, StaggerItem } from './MotionPrimitives';

export function Bento() {
  return (
    <section style={{ paddingTop: '56px' }} aria-label="At a glance">
      <div className="bento">
        <StaggerItem index={0} className="tile">
          <p>Typical turnaround</p>
          <div>
            <div className="n tabular-nums">24 hrs</div>
            <p>from payment to first cut</p>
          </div>
        </StaggerItem>
        <StaggerItem index={1} className="tile l">
          <p>Edit rounds included</p>
          <div>
            <div className="n tabular-nums">2</div>
            <p>tweak text, timing and colors</p>
          </div>
        </StaggerItem>
        <StaggerItem index={2} className="tile d">
          <h3>
            Pick. Brief. Pay.
            <br />
            That’s the whole process.
          </h3>
          <div>
            <p>No sales calls, no back-and-forth to get a quote.</p>
            <Link className="more" href="/pricing">
              See pricing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </StaggerItem>
      </div>
    </section>
  );
}

export function How() {
  const steps = [
    ['1', 'Pick a style and tell us what you need', 'Fill in a short brief: goal, length, script or notes, brand colors.'],
    ['2', 'Pay once, securely', 'One flat price. We start as soon as the payment clears.'],
    ['3', 'Create your account', 'So every video you order stays in one place.'],
    ['4', 'Review and download', 'Request up to two rounds of edits, then download the MP4.'],
  ];

  return (
    <section id="how">
      <FadeInSection>
        <div className="head">
          <h2>How it works</h2>
          <p>Four steps, and you never touch the code.</p>
        </div>
      </FadeInSection>
      <ol className="how">
        {steps.map(([num, title, desc], idx) => (
          <li key={num}>
            <StaggerItem index={idx}>
              <div className="grid gap-3.5">
                <span className="w-[30px] h-[30px] rounded-full bg-[#0f1633] text-white grid place-items-center font-bold text-[13px]">
                  {num}
                </span>
                <div>
                  <b>{title}</b>
                  <p>{desc}</p>
                </div>
              </div>
            </StaggerItem>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq">
      <FadeInSection>
        <div className="head">
          <h2>Good to know</h2>
        </div>
        <div className="faq">
          <details>
            <summary>Do I need to know how to code?</summary>
            <p>No. You send the brief and we handle everything else.</p>
          </details>
          <details>
            <summary>What do I get?</summary>
            <p>A 1080p MP4 in your account, ready for social, your site or ads.</p>
          </details>
          <details>
            <summary>How do edits work?</summary>
            <p>Reply inside your account with what to change. Each plan includes edit rounds.</p>
          </details>
          <details>
            <summary>Can I order more later?</summary>
            <p>Yes. Your account keeps every video and brief for easy reorders.</p>
          </details>
          <details>
            <summary>How long does it take?</summary>
            <p>Most first cuts arrive within 24 hours after payment. Pack of 3 orders get priority.</p>
          </details>
          <details>
            <summary>Do I need to talk to anyone first?</summary>
            <p>No. There are no sales calls. Pick a style, fill in the brief and pay.</p>
          </details>
        </div>
      </FadeInSection>
    </section>
  );
}

export function FinalCta() {
  return (
    <section aria-label="Order now">
      <FadeInSection>
        <div className="cta">
          <Clouds soft />
          <div>
            <h2>Ready to see your idea move?</h2>
            <div className="cta-row" style={{ marginTop: '22px' }}>
              <Link className="btn dark" href="/order">
                Choose your style{' '}
                <span className="arr" style={{ background: 'var(--lime)', color: 'var(--ink)' }}>
                  →
                </span>
              </Link>
            </div>
          </div>
          <div className="knot" aria-hidden="true" />
        </div>
      </FadeInSection>
    </section>
  );
}

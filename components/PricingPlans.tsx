'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { StaggerItem } from './MotionPrimitives';
import { subscribeMockDb } from '@/lib/db-events';
import { getDb } from '@/lib/mock-db';

function getCatalogSnapshot(): string {
  if (typeof window === 'undefined') return '149:399:299';
  const cfg = getDb().catalogConfig;
  return `${cfg.singlePrice}:${cfg.packPrice}:${cfg.longPrice}`;
}

export default function PricingPlans() {
  const snap = useSyncExternalStore(subscribeMockDb, getCatalogSnapshot, () => '149:399:299');
  const [singlePrice, packPrice, longPrice] = snap.split(':').map(Number);

  return (
    <div className="price">
      <StaggerItem index={0} className="plan">
        <h3>Single</h3>
        <div className="amt tabular-nums">${singlePrice}</div>
        <ul>
          <li>One video up to 30 seconds</li>
          <li>Any style</li>
          <li>2 edit rounds</li>
        </ul>
        <Link className="btn dark" href="/order?plan=single">
          Choose Single
        </Link>
      </StaggerItem>
      <StaggerItem index={1} className="plan hot">
        <h3>Pack of 3</h3>
        <div className="amt tabular-nums">${packPrice}</div>
        <ul>
          <li>Three videos up to 30 seconds</li>
          <li>Mix styles freely</li>
          <li>Priority delivery</li>
          <li>2 edit rounds each</li>
        </ul>
        <Link className="btn lime" href="/order?plan=pack">
          Choose Pack of 3
        </Link>
      </StaggerItem>
      <StaggerItem index={2} className="plan">
        <h3>Long form</h3>
        <div className="amt tabular-nums">${longPrice}</div>
        <ul>
          <li>One video up to 90 seconds</li>
          <li>Any style</li>
          <li>3 edit rounds</li>
        </ul>
        <Link className="btn dark" href="/order?plan=long">
          Choose Long form
        </Link>
      </StaggerItem>
    </div>
  );
}


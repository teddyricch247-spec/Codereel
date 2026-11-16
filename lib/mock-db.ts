import initialDb from '@/data/mock-db.json';

export type VideoStyle = 'kinetic' | 'demo' | 'data' | 'code';
export type PlanSlug = 'single' | 'pack' | 'long';
export type OrderStatus =
  | 'Ready to download'
  | 'Edit round in progress'
  | 'Rendering first cut'
  | 'Delivered';

export interface RevisionMessage {
  id: string;
  author: string;
  role: 'studio' | 'client';
  timestamp: string;
  timecode: string;
  note: string;
}

export interface VideoOrder {
  id: string;
  userId: string;
  title: string;
  style: VideoStyle;
  plan: PlanSlug;
  length: string;
  brandColor: string;
  goal: string;
  notes: string;
  status: OrderStatus;
  editsTotal: number;
  editsUsed: number;
  createdAt: string;
  etaDate: string;
  deliveredAt: string | null;
  resolution: string;
  fileSize: string;
  assignedProducer?: string;
  priority?: 'Priority' | 'Standard';
  internalNote?: string;
  revisions: RevisionMessage[];
}

export interface BrandKit {
  companyName: string;
  primaryColor: string;
  accentColor: string;
  defaultStyle: VideoStyle;
  defaultLength: string;
  toneNotes: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  company: string;
  role: string;
  planName: string;
  packCreditsRemaining: number;
  joinedAt: string;
}

export interface MockReceipt {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}

export interface ClientInquiry {
  id: string;
  userId: string;
  orderId?: string;
  subject: string;
  message: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
  reply: string;
}

export interface CatalogConfig {
  singlePrice: number;
  packPrice: number;
  longPrice: number;
  standardTurnaroundDays: number;
  priorityTurnaroundDays: number;
}

export interface MockDatabase {
  users: MockUser[];
  brandKits: Record<string, BrandKit>;
  orders: VideoOrder[];
  receipts: MockReceipt[];
  inquiries: ClientInquiry[];
  catalogConfig: CatalogConfig;
}

const DB_KEY = 'codereel_mock_db_v2';
const SESSION_KEY = 'codereel_mock_session_v1';

export const STYLE_LABELS: Record<VideoStyle, string> = {
  kinetic: 'Kinetic type',
  demo: 'Product demo',
  data: 'Data story',
  code: 'Code explainer',
};

export const PLAN_DETAILS: Record<
  PlanSlug,
  { name: string; price: number; edits: number; creditsGranted: number }
> = {
  single: { name: 'Single', price: 149, edits: 2, creditsGranted: 0 },
  pack: { name: 'Pack of 3', price: 399, edits: 2, creditsGranted: 2 },
  long: { name: 'Long form', price: 299, edits: 3, creditsGranted: 0 },
};

export function getCatalogPlans(config?: CatalogConfig) {
  const cfg = config ?? getDb().catalogConfig;
  return {
    single: {
      name: 'Single',
      price: cfg.singlePrice,
      edits: 2,
      creditsGranted: 0,
      turnaroundDays: cfg.standardTurnaroundDays,
    },
    pack: {
      name: 'Pack of 3',
      price: cfg.packPrice,
      edits: 2,
      creditsGranted: 2,
      turnaroundDays: cfg.priorityTurnaroundDays,
    },
    long: {
      name: 'Long form',
      price: cfg.longPrice,
      edits: 3,
      creditsGranted: 0,
      turnaroundDays: cfg.standardTurnaroundDays,
    },
  } as const;
}

function cloneInitialDb(): MockDatabase {
  return JSON.parse(JSON.stringify(initialDb)) as MockDatabase;
}

export function getDb(): MockDatabase {
  if (typeof window === 'undefined') {
    return cloneInitialDb();
  }
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const fresh = cloneInitialDb();
      window.localStorage.setItem(DB_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<MockDatabase>;
    const base = cloneInitialDb();
    return {
      users: parsed.users ?? base.users,
      brandKits: parsed.brandKits ?? base.brandKits,
      orders: parsed.orders ?? base.orders,
      receipts: parsed.receipts ?? base.receipts,
      inquiries: parsed.inquiries ?? base.inquiries,
      catalogConfig: parsed.catalogConfig ?? base.catalogConfig,
    };
  } catch {
    return cloneInitialDb();
  }
}

export function saveDb(db: MockDatabase): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage quota errors in restricted preview contexts
  }
}

export function resetMockDb(): MockDatabase {
  const fresh = cloneInitialDb();
  saveDb(fresh);
  if (typeof window !== 'undefined') {
    const currentId = getCurrentUserId();
    if (currentId && !fresh.users.some((u) => u.id === currentId)) {
      window.localStorage.setItem(SESSION_KEY, fresh.users[0]?.id ?? '');
    }
  }
  return fresh;
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function getCurrentUser(): MockUser | null {
  const uid = getCurrentUserId();
  if (!uid) return null;
  const db = getDb();
  return db.users.find((u) => u.id === uid) ?? null;
}

export function loginMockUser(
  email: string,
  password: string
): { ok: true; user: MockUser } | { ok: false; error: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { ok: false, error: 'Enter both your email and password.' };
  }
  const db = getDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    if (existing.password !== password) {
      return {
        ok: false,
        error: 'Password does not match this prototype account (demo password: demo1234).',
      };
    }
    window.localStorage.setItem(SESSION_KEY, existing.id);
    return { ok: true, user: existing };
  }

  return {
    ok: false,
    error: 'No mock account found for that email. Use the demo fill button or create a prototype account.',
  };
}

export function loginAsDemoUser(email = 'maya@acme.co'): MockUser {
  const db = getDb();
  const user = db.users.find((u) => u.email === email) ?? db.users[0];
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_KEY, user.id);
  }
  return user;
}

export function signupMockUser(input: {
  name: string;
  email: string;
  password: string;
  company?: string;
}): MockUser {
  const db = getDb();
  const cleanEmail = input.email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    window.localStorage.setItem(SESSION_KEY, existing.id);
    return existing;
  }

  const today = new Date().toISOString().slice(0, 10);
  const id = 'usr_' + Math.random().toString(36).slice(2, 8);
  const company = input.company?.trim() || 'Personal Workspace';

  const newUser: MockUser = {
    id,
    name: input.name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    password: input.password,
    company,
    role: 'Creator',
    planName: 'Starter',
    packCreditsRemaining: 0,
    joinedAt: today,
  };

  db.users.unshift(newUser);
  db.brandKits[id] = {
    companyName: company,
    primaryColor: '#4a43e8',
    accentColor: '#d9f56b',
    defaultStyle: 'kinetic',
    defaultLength: '30 seconds',
    toneNotes: 'Clean code-built motion tailored for product launches.',
  };

  const eta = new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10);
  db.orders.unshift({
    id: 'CR-' + Math.floor(4120 + Math.random() * 800),
    userId: id,
    title: `${company} Welcome Sample`,
    style: 'kinetic',
    plan: 'single',
    length: '15 seconds',
    brandColor: '#4a43e8',
    goal: 'Prototype sample reel generated automatically for your new account.',
    notes: 'Try watching the preview, downloading, or submitting an edit round below.',
    status: 'Ready to download',
    editsTotal: 2,
    editsUsed: 0,
    createdAt: today,
    etaDate: eta,
    deliveredAt: today,
    resolution: '1080p MP4',
    fileSize: '18.4 MB',
    assignedProducer: 'Samira Chen',
    priority: 'Standard',
    internalNote: 'Auto-seeded starter sample.',
    revisions: [
      {
        id: 'rev_' + Date.now(),
        author: 'Codereel Studio',
        role: 'studio',
        timestamp: `${today} 09:00`,
        timecode: '0:00',
        note: 'Starter sample video ready to preview and test edit requests.',
      },
    ],
  });

  saveDb(db);
  window.localStorage.setItem(SESSION_KEY, id);
  return newUser;
}

export function logoutMockUser(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getUserOrders(userId: string): VideoOrder[] {
  const db = getDb();
  return db.orders.filter((o) => o.userId === userId);
}

export function getOrderById(orderId: string): VideoOrder | null {
  const db = getDb();
  return db.orders.find((o) => o.id === orderId) ?? null;
}

export function getUserReceipts(userId: string): MockReceipt[] {
  const db = getDb();
  return db.receipts.filter((r) => r.userId === userId);
}

export function getUserBrandKit(userId: string): BrandKit {
  const db = getDb();
  return (
    db.brandKits[userId] ?? {
      companyName: 'My Brand',
      primaryColor: '#4a43e8',
      accentColor: '#d9f56b',
      defaultStyle: 'kinetic',
      defaultLength: '30 seconds',
      toneNotes: '',
    }
  );
}

export function updateUserBrandKit(userId: string, kit: BrandKit): void {
  const db = getDb();
  db.brandKits[userId] = kit;
  const user = db.users.find((u) => u.id === userId);
  if (user && kit.companyName.trim()) {
    user.company = kit.companyName.trim();
  }
  saveDb(db);
}

export function getUserInquiries(userId: string): ClientInquiry[] {
  const db = getDb();
  return db.inquiries.filter((i) => i.userId === userId);
}

export function createClientInquiry(input: {
  userId: string;
  orderId?: string;
  subject: string;
  message: string;
}): ClientInquiry {
  const db = getDb();
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const item: ClientInquiry = {
    id: 'INQ-' + Math.floor(310 + Math.random() * 680),
    userId: input.userId,
    orderId: input.orderId?.trim() || undefined,
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: 'Open',
    createdAt: stamp,
    reply: '',
  };
  db.inquiries.unshift(item);
  saveDb(db);
  return item;
}

export function createMockOrder(input: {
  userId: string;
  title?: string;
  style: VideoStyle;
  plan: PlanSlug;
  length: string;
  brandColor: string;
  goal: string;
  notes: string;
  usePackCredit?: boolean;
}): VideoOrder {
  const db = getDb();
  const plans = getCatalogPlans(db.catalogConfig);
  const planInfo = plans[input.plan];
  const today = new Date().toISOString().slice(0, 10);
  const eta = new Date(Date.now() + planInfo.turnaroundDays * 86400000)
    .toISOString()
    .slice(0, 10);
  const oid = 'CR-' + Math.floor(4200 + Math.random() * 5700);

  const derivedTitle =
    input.title?.trim() ||
    (input.goal.trim().length > 36
      ? input.goal.trim().slice(0, 36).trim() + '…'
      : input.goal.trim()) ||
    `${STYLE_LABELS[input.style]} Video`;

  const order: VideoOrder = {
    id: oid,
    userId: input.userId,
    title: derivedTitle,
    style: input.style,
    plan: input.plan,
    length: input.length,
    brandColor: input.brandColor,
    goal: input.goal,
    notes: input.notes,
    status: 'Rendering first cut',
    editsTotal: planInfo.edits,
    editsUsed: 0,
    createdAt: today,
    etaDate: eta,
    deliveredAt: null,
    resolution: '1080p MP4',
    fileSize: 'Pending',
    assignedProducer: 'Unassigned',
    priority: input.plan === 'pack' ? 'Priority' : 'Standard',
    internalNote: 'Newly received from client checkout.',
    revisions: [
      {
        id: 'rev_' + Date.now(),
        author: 'Codereel Studio',
        role: 'studio',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        timecode: '0:00',
        note: 'Order confirmed. Brief locked and code scenes queued for first cut.',
      },
    ],
  };

  db.orders.unshift(order);

  const user = db.users.find((u) => u.id === input.userId);
  if (user) {
    if (input.usePackCredit && user.packCreditsRemaining > 0) {
      user.packCreditsRemaining -= 1;
    } else {
      if (input.plan === 'pack') {
        user.packCreditsRemaining += planInfo.creditsGranted;
        user.planName = 'Pack of 3';
      }
      db.receipts.unshift({
        id: 'INV-2026-' + Math.floor(200 + Math.random() * 799),
        userId: input.userId,
        date: today,
        description: `${planInfo.name} (${input.length} · ${STYLE_LABELS[input.style]}) — ${oid}`,
        amount: planInfo.price,
        status: 'Paid',
      });
    }
  }

  saveDb(db);
  return order;
}

export function submitEditRequest(
  orderId: string,
  authorName: string,
  timecode: string,
  note: string
): VideoOrder | null {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;
  if (order.editsUsed >= order.editsTotal) return order;

  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  order.editsUsed += 1;
  order.status = 'Edit round in progress';
  order.revisions.push({
    id: 'rev_' + Date.now(),
    author: authorName,
    role: 'client',
    timestamp: stamp,
    timecode: timecode.trim() || '0:00',
    note: note.trim(),
  });

  saveDb(db);
  return order;
}

export function markOrderReadyDemo(orderId: string): VideoOrder | null {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;
  const today = new Date().toISOString().slice(0, 10);
  order.status = 'Ready to download';
  order.deliveredAt = today;
  order.fileSize = order.fileSize === 'Pending' ? '26.4 MB' : order.fileSize;
  order.revisions.push({
    id: 'rev_' + Date.now(),
    author: 'Codereel Studio',
    role: 'studio',
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    timecode: '0:00',
    note: 'Updated cut rendered at 1080p. Ready for review and download.',
  });
  saveDb(db);
  return order;
}

/* =========================================================
   ADMIN CRUD HELPERS (Prototype Local DB Operations)
   ========================================================= */

export function adminCreateOrder(input: {
  userId: string;
  title: string;
  style: VideoStyle;
  plan: PlanSlug;
  length: string;
  brandColor?: string;
  goal: string;
  notes?: string;
  assignedProducer?: string;
  priority?: 'Priority' | 'Standard';
  resolution?: string;
  createReceipt?: boolean;
}): VideoOrder {
  const db = getDb();
  const plans = getCatalogPlans(db.catalogConfig);
  const planInfo = plans[input.plan];
  const today = new Date().toISOString().slice(0, 10);
  const priority = input.priority ?? (input.plan === 'pack' ? 'Priority' : 'Standard');
  const days =
    priority === 'Priority'
      ? db.catalogConfig.priorityTurnaroundDays
      : db.catalogConfig.standardTurnaroundDays;
  const eta = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const oid = 'CR-' + Math.floor(4200 + Math.random() * 5700);
  const kit = db.brandKits[input.userId];

  const order: VideoOrder = {
    id: oid,
    userId: input.userId,
    title: input.title.trim() || `${STYLE_LABELS[input.style]} Video`,
    style: input.style,
    plan: input.plan,
    length: input.length,
    brandColor: input.brandColor?.trim() || kit?.primaryColor || '#4a43e8',
    goal: input.goal.trim(),
    notes: input.notes?.trim() ?? '',
    status: 'Rendering first cut',
    editsTotal: planInfo.edits,
    editsUsed: 0,
    createdAt: today,
    etaDate: eta,
    deliveredAt: null,
    resolution: input.resolution ?? '1080p MP4',
    fileSize: 'Pending',
    assignedProducer: input.assignedProducer || 'Unassigned',
    priority,
    internalNote: 'Created manually via Admin console.',
    revisions: [
      {
        id: 'rev_' + Date.now(),
        author: 'Codereel Studio',
        role: 'studio',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        timecode: '0:00',
        note: 'Order logged by studio team and queued for first cut.',
      },
    ],
  };

  db.orders.unshift(order);
  if (input.createReceipt) {
    db.receipts.unshift({
      id: 'INV-2026-' + Math.floor(200 + Math.random() * 799),
      userId: input.userId,
      date: today,
      description: `${planInfo.name} (${input.length} · ${STYLE_LABELS[input.style]}) — ${oid}`,
      amount: planInfo.price,
      status: 'Paid',
    });
  }
  saveDb(db);
  return order;
}

export function adminDeleteOrder(orderId: string): boolean {
  const db = getDb();
  const prevLen = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== orderId);
  if (db.orders.length === prevLen) return false;
  saveDb(db);
  return true;
}

export function adminUpdateOrder(
  orderId: string,
  patch: Partial<
    Pick<
      VideoOrder,
      | 'title'
      | 'status'
      | 'etaDate'
      | 'fileSize'
      | 'resolution'
      | 'editsTotal'
      | 'assignedProducer'
      | 'priority'
      | 'internalNote'
      | 'deliveredAt'
    >
  >
): VideoOrder | null {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;
  Object.assign(order, patch);
  if (
    (patch.status === 'Ready to download' || patch.status === 'Delivered') &&
    !order.deliveredAt
  ) {
    order.deliveredAt = new Date().toISOString().slice(0, 10);
    if (order.fileSize === 'Pending') {
      order.fileSize = '25.6 MB';
    }
  }
  saveDb(db);
  return order;
}

export function adminPostStudioReply(
  orderId: string,
  timecode: string,
  note: string,
  markReady = false
): VideoOrder | null {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  order.revisions.push({
    id: 'rev_' + Date.now(),
    author: order.assignedProducer && order.assignedProducer !== 'Unassigned'
      ? `${order.assignedProducer} (Codereel)`
      : 'Codereel Studio',
    role: 'studio',
    timestamp: stamp,
    timecode: timecode.trim() || '0:00',
    note: note.trim(),
  });

  if (markReady) {
    order.status = 'Ready to download';
    order.deliveredAt = new Date().toISOString().slice(0, 10);
    if (order.fileSize === 'Pending') {
      order.fileSize = '27.2 MB';
    }
  }

  saveDb(db);
  return order;
}

export function adminUpdateClient(
  userId: string,
  patch: Partial<Pick<MockUser, 'planName' | 'packCreditsRemaining' | 'role' | 'company'>>
): MockUser | null {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  Object.assign(user, patch);
  if (user.packCreditsRemaining < 0) user.packCreditsRemaining = 0;
  saveDb(db);
  return user;
}

export function adminCreateClient(input: {
  name: string;
  email: string;
  company: string;
  role?: string;
  planName?: string;
  packCreditsRemaining?: number;
  primaryColor?: string;
  defaultStyle?: VideoStyle;
}): MockUser {
  const db = getDb();
  const cleanEmail = input.email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) return existing;

  const today = new Date().toISOString().slice(0, 10);
  const id = 'usr_' + Math.random().toString(36).slice(2, 8);
  const user: MockUser = {
    id,
    name: input.name.trim(),
    email: cleanEmail,
    password: 'demo1234',
    company: input.company.trim() || 'Client Workspace',
    role: input.role?.trim() || 'Founder',
    planName: input.planName || 'Starter',
    packCreditsRemaining: Math.max(0, input.packCreditsRemaining ?? 0),
    joinedAt: today,
  };
  db.users.unshift(user);
  db.brandKits[id] = {
    companyName: user.company,
    primaryColor: input.primaryColor || '#4a43e8',
    accentColor: '#d9f56b',
    defaultStyle: input.defaultStyle || 'kinetic',
    defaultLength: '30 seconds',
    toneNotes: 'Added via studio admin directory.',
  };
  saveDb(db);
  return user;
}

export function adminUpdateClientBrandKit(userId: string, kit: BrandKit): void {
  updateUserBrandKit(userId, kit);
}

export function adminReplyInquiry(
  inquiryId: string,
  reply: string,
  status: 'Open' | 'Resolved' = 'Resolved'
): ClientInquiry | null {
  const db = getDb();
  const item = db.inquiries.find((i) => i.id === inquiryId);
  if (!item) return null;
  item.reply = reply.trim();
  item.status = status;
  saveDb(db);
  return item;
}

export function adminUpdateReceiptStatus(receiptId: string, status: string): MockReceipt | null {
  const db = getDb();
  const r = db.receipts.find((x) => x.id === receiptId);
  if (!r) return null;
  r.status = status;
  saveDb(db);
  return r;
}

export function adminUpdateCatalogConfig(config: CatalogConfig): void {
  const db = getDb();
  db.catalogConfig = config;
  saveDb(db);
}

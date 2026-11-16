import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  adminCreateClient,
  adminCreateOrder,
  adminDeleteOrder,
  adminPostStudioReply,
  adminReplyInquiry,
  adminUpdateCatalogConfig,
  adminUpdateClient,
  adminUpdateClientBrandKit,
  adminUpdateOrder,
  adminUpdateReceiptStatus,
  createClientInquiry,
  createMockOrder,
  getCatalogPlans,
  getCurrentUser,
  getDb,
  getOrderById,
  getUserBrandKit,
  getUserInquiries,
  getUserReceipts,
  loginMockUser,
  resetMockDb,
  signupMockUser,
  submitEditRequest,
} from './mock-db';

function installMemoryStorage() {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };

  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: mockStorage },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  installMemoryStorage();
  resetMockDb();
});

test('loads seeded mock database with users, orders, receipts, inquiries, and catalogConfig', () => {
  const db = getDb();
  assert.ok(db.users.length >= 3);
  assert.ok(db.orders.length >= 6);
  assert.ok(db.inquiries.length >= 3);
  assert.equal(db.catalogConfig.singlePrice, 149);
});

test('login, signup, create order, pack credit redemption, and client edit submission persist cleanly', () => {
  const loginRes = loginMockUser('maya@acme.co', 'demo1234');
  assert.equal(loginRes.ok, true);
  assert.equal(getCurrentUser()?.id, 'usr_maya');

  const beforeCredits = getCurrentUser()!.packCreditsRemaining;
  const beforeReceipts = getUserReceipts('usr_maya').length;
  const creditOrder = createMockOrder({
    userId: 'usr_maya',
    style: 'kinetic',
    plan: 'single',
    length: '15 seconds',
    brandColor: '#4a43e8',
    goal: 'Redeem pack slot',
    notes: '',
    usePackCredit: true,
  });
  assert.equal(creditOrder.status, 'Rendering first cut');
  assert.equal(getCurrentUser()?.packCreditsRemaining, beforeCredits - 1);
  assert.equal(getUserReceipts('usr_maya').length, beforeReceipts);

  const createdUser = signupMockUser({
    name: 'Sam Patel',
    email: 'sam@launch.dev',
    password: 'password123',
    company: 'Launch Dev',
  });
  assert.equal(getCurrentUser()?.id, createdUser.id);

  const order = createMockOrder({
    userId: createdUser.id,
    style: 'demo',
    plan: 'pack',
    length: '30 seconds',
    brandColor: '#4a43e8',
    goal: 'Product launch reel',
    notes: 'Highlight key metrics',
  });
  assert.equal(order.status, 'Rendering first cut');
  assert.equal(order.priority, 'Priority');

  const updated = submitEditRequest(order.id, createdUser.name, '0:10', 'Make headline larger');
  assert.equal(updated?.editsUsed, 1);
  assert.equal(updated?.status, 'Edit round in progress');
});

test('client inquiry creation syncs with admin inbox reply', () => {
  const created = createClientInquiry({
    userId: 'usr_maya',
    orderId: 'CR-4104',
    subject: 'Font question',
    message: 'Can we use JetBrains Mono for the terminal overlay?',
  });
  assert.equal(created.status, 'Open');
  assert.ok(getUserInquiries('usr_maya').some((i) => i.id === created.id));

  const resolved = adminReplyInquiry(created.id, 'Yes, JetBrains Mono is our default monospace face.', 'Resolved');
  assert.equal(resolved?.status, 'Resolved');
  const clientView = getUserInquiries('usr_maya').find((i) => i.id === created.id);
  assert.equal(clientView?.reply, 'Yes, JetBrains Mono is our default monospace face.');
});

test('admin CRUD helpers manage orders, clients, brand kits, replies, receipts, and dynamic catalog pricing', () => {
  const newClient = adminCreateClient({
    name: 'Jordan Lee',
    email: 'jordan@vanguard.ai',
    company: 'Vanguard AI',
    planName: 'Pack of 3',
    packCreditsRemaining: 3,
    primaryColor: '#4a43e8',
    defaultStyle: 'data',
  });
  assert.equal(newClient.company, 'Vanguard AI');

  adminUpdateClientBrandKit(newClient.id, {
    companyName: 'Vanguard Labs',
    primaryColor: '#10162f',
    accentColor: '#d9f56b',
    defaultStyle: 'code',
    defaultLength: '30 seconds',
    toneNotes: 'Updated via admin',
  });
  assert.equal(getUserBrandKit(newClient.id).companyName, 'Vanguard Labs');

  const manualOrder = adminCreateOrder({
    userId: newClient.id,
    title: 'Vanguard CLI Launch',
    style: 'code',
    plan: 'single',
    length: '30 seconds',
    goal: 'Launch announcement',
    assignedProducer: 'Samira Chen',
    priority: 'Priority',
    resolution: '4K MP4',
    createReceipt: true,
  });
  assert.equal(manualOrder.resolution, '4K MP4');
  assert.equal(getUserReceipts(newClient.id).length, 1);

  const updatedOrder = adminUpdateOrder(manualOrder.id, {
    assignedProducer: 'Marcus Bell',
    status: 'Edit round in progress',
    editsTotal: 4,
    internalNote: 'Prioritize CLI pacing',
  });
  assert.equal(updatedOrder?.assignedProducer, 'Marcus Bell');
  assert.equal(updatedOrder?.editsTotal, 4);

  const repliedOrder = adminPostStudioReply(
    manualOrder.id,
    '0:14',
    'Delivered crisp CLI cut at 1080p.',
    true
  );
  assert.equal(repliedOrder?.status, 'Ready to download');
  assert.ok(getOrderById(manualOrder.id)?.revisions.some((r) => r.note.includes('Delivered crisp CLI')));

  assert.equal(adminDeleteOrder(manualOrder.id), true);
  assert.equal(getOrderById(manualOrder.id), null);

  const updatedClient = adminUpdateClient('usr_maya', {
    packCreditsRemaining: 4,
    planName: 'Pack of 3',
  });
  assert.equal(updatedClient?.packCreditsRemaining, 4);

  const refunded = adminUpdateReceiptStatus('INV-2026-108', 'Refunded');
  assert.equal(refunded?.status, 'Refunded');

  adminUpdateCatalogConfig({
    singlePrice: 179,
    packPrice: 449,
    longPrice: 329,
    standardTurnaroundDays: 3,
    priorityTurnaroundDays: 1,
  });
  assert.equal(getCatalogPlans().single.price, 179);
  assert.equal(getCatalogPlans().pack.turnaroundDays, 1);

  const reset = resetMockDb();
  assert.equal(reset.catalogConfig.singlePrice, 149);
});


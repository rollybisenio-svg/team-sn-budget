import { FIREBASE_CONFIG } from './firebase-config.js';

/* =========================================================
   Team SN Home Budget System
   Amounts are stored as whole fils (1 AED = 100 fils) so
   every fils adds up exactly.
   ========================================================= */

const DEMO = new URLSearchParams(location.search).has('demo') ||
  !FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.startsWith('PASTE');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON = MONTHS.map(m => m.slice(0, 3));
const PEOPLE = ['Bokx', 'Missy', 'Joint'];
const AVATAR = { bokx: 'img/bokx.png', missy: 'img/missy.png', girl: 'img/girl.png', sky: 'img/sky.png' };
const PIE = ['#9C8BE0', '#7FC3A0', '#7FA8DD', '#F2A7C3', '#F3C77A', '#76C6C4', '#C3A6EE', '#A8CDEB', '#E9B79A', '#B5D98C'];

const PHONE_BILLS = [
  { id: 'bill_du_missy', name: "Missy's du", amount: 15000, freq: 'monthly', month: 1, icon: '📱', group: 'Phone & Internet' },
  { id: 'bill_du_rolly', name: "Rolly's du", amount: 15000, freq: 'monthly', month: 1, icon: '📱', group: 'Phone & Internet' },
  { id: 'bill_eand', name: 'Home Wireless (e&)', amount: 20000, freq: 'monthly', month: 1, icon: '📡', group: 'Phone & Internet' },
];
const GROUP_ICON = { 'Utilities': '💡', 'Phone & Internet': '📶', 'Pets': '🐾' };

const DEFAULT_SETTINGS = {
  year: 2027,
  income: [
    { id: 'inc_bokx', name: 'Bokx Salary', amount: 700000, icon: 'bokx' },
    { id: 'inc_missy', name: 'Missy Salary', amount: 1200000, icon: 'missy' },
    { id: 'inc_bonus', name: 'Bonus', amount: 0, icon: '🎉' },
    { id: 'inc_other', name: 'Other Income', amount: 0, icon: '💵' },
  ],
  bills: [
    { id: 'bill_rent', name: 'Rent', amount: 500000, freq: 'monthly', month: 1, icon: '🏠' },
    { id: 'bill_school', name: 'School Fees', amount: 800000, freq: 'split', month: 9, icon: '🎒' },
    { id: 'bill_elec', name: 'Electricity', amount: 25000, freq: 'monthly', month: 1, icon: '💡', group: 'Utilities' },
    { id: 'bill_water', name: 'Water', amount: 10000, freq: 'monthly', month: 1, icon: '💧', group: 'Utilities' },
    { id: 'bill_muni', name: 'Municipality Fee', amount: 15000, freq: 'monthly', month: 1, icon: '🏛️', group: 'Utilities' },
    ...PHONE_BILLS,
    { id: 'bill_ins', name: 'Insurance', amount: 200000, freq: 'yearly', month: 1, icon: '🛡️' },
    { id: 'bill_church', name: 'Church Giving', amount: 20000, freq: 'monthly', month: 1, icon: '⛪' },
    { id: 'bill_sky', name: "Sky's Food", amount: 15000, freq: 'monthly', month: 1, icon: 'pet:pet_sky', group: 'Pets' },
  ],
  pets: [{ id: 'pet_sky', name: 'Sky', icon: 'sky' }],
  categories: [
    { id: 'cat_groc', name: 'Groceries', limit: 150000, icon: '🛒' },
    { id: 'cat_dine', name: 'Dining Out', limit: 60000, icon: '🍽️' },
    { id: 'cat_shop', name: 'Shopping', limit: 50000, icon: '🛍️' },
    { id: 'cat_kids', name: "Kids' Activities", limit: 30000, icon: 'girl' },
    { id: 'cat_petrol', name: 'Petrol', limit: 40000, icon: '⛽' },
    { id: 'cat_tools', name: 'Daddy Tools', limit: 20000, icon: '🔧' },
    { id: 'cat_bike', name: 'Bicycle Parts', limit: 15000, icon: '🚲' },
    { id: 'cat_misc', name: 'Miscellaneous', limit: 30000, icon: '📦' },
  ],
  goals: [
    { id: 'goal_emerg', name: 'Emergency Fund', target: 0, monthly: 20000, start: 0, icon: '🛟' },
    { id: 'goal_travel', name: 'Travel', target: 0, monthly: 0, start: 0, icon: '✈️' },
    { id: 'goal_school', name: 'School Savings', target: 0, monthly: 0, start: 0, icon: '🎓' },
  ],
  methods: ['Cash', 'Debit Card', 'Credit Card', 'Google Pay'],
  migrated: ['util-split', 'groups-v1'],
};

// One-time updates to a budget that was already set up.
function migrate(s) {
  const done = s.migrated || [];
  if (done.includes('util-split') && done.includes('groups-v1')) return null;
  const out = clone(s);
  out.bills = out.bills || [];
  if (!done.includes('util-split')) {
    const i = out.bills.findIndex(b => b.id === 'bill_util');
    if (i >= 0) {
      out.bills.splice(i, 1,
        { id: 'bill_elec', name: 'Electricity', amount: 25000, freq: 'monthly', month: 1, icon: '💡' },
        { id: 'bill_water', name: 'Water', amount: 10000, freq: 'monthly', month: 1, icon: '💧' },
        { id: 'bill_muni', name: 'Municipality Fee', amount: 15000, freq: 'monthly', month: 1, icon: '🏛️' });
    }
  }
  if (!done.includes('groups-v1')) {
    out.bills.forEach(b => { if (['bill_elec', 'bill_water', 'bill_muni'].includes(b.id)) b.group = 'Utilities'; });
    const i = out.bills.findIndex(b => b.id === 'bill_phone');
    if (i >= 0) out.bills.splice(i, 1, ...clone(PHONE_BILLS));
    if (!out.pets || !out.pets.length) out.pets = [{ id: 'pet_sky', name: 'Sky', icon: 'sky' }];
    const sky = out.bills.find(b => b.id === 'bill_sky');
    if (sky) { sky.icon = 'pet:pet_sky'; sky.group = 'Pets'; }
  }
  out.migrated = [...new Set([...done, 'util-split', 'groups-v1'])];
  return out;
}

/* ---------------- helpers ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + '_' + Math.random().toString(36).slice(2, 9);
const pad = n => String(n).padStart(2, '0');
const ym = (y, m) => `${y}-${pad(m)}`;
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const clone = o => JSON.parse(JSON.stringify(o));

function money(fils, opts = {}) {
  const neg = fils < 0;
  const s = (Math.abs(fils) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${neg ? '−' : (opts.plus ? '+' : '')}${opts.noCur ? '' : 'AED '}${s}`;
}
function short(fils) {
  const v = fils / 100;
  if (Math.abs(v) >= 1000) return (v / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'k';
  return Math.round(v).toLocaleString('en-US');
}
function toFils(str) {
  const n = parseFloat(String(str ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
const filsToInput = f => f ? (f / 100).toFixed(2).replace(/\.00$/, '') : '';

// An icon is an emoji, a family picture name (bokx, missy, girl, sky),
// an uploaded photo (data:image...) or a pet link (pet:<id>).
function iconParts(ic) {
  if (typeof ic === 'string' && ic.startsWith('pet:')) {
    const pet = ((S.draft || S.settings)?.pets || []).find(x => x.id === ic.slice(4));
    ic = pet ? pet.icon : '🐾';
  }
  if (AVATAR[ic]) return { src: AVATAR[ic], cat: ic === 'sky' };
  if (typeof ic === 'string' && ic.startsWith('data:image')) return { src: ic };
  return { emoji: ic || '•' };
}
function icon(ic, cls = '') {
  const p = iconParts(ic);
  if (p.src) return `<div class="ico ${p.cat ? '' : 'round'} ${cls}"><img src="${esc(p.src)}" alt="" class="${p.cat ? 'cat' : ''}"></div>`;
  return `<div class="ico ${cls}">${esc(p.emoji)}</div>`;
}
function smallIcon(ic) {
  const p = iconParts(ic);
  if (p.src) return `<img src="${esc(p.src)}" alt="" class="${p.cat ? 'cat' : ''}">`;
  return `<span>${esc(p.emoji)}</span>`;
}
const isPicIcon = ic => typeof ic === 'string' && (ic.startsWith('pet:') || ic.startsWith('data:'));

/* bill groups: keep the order of Settings, a group sits where its first bill is */
function billGroups(bills) {
  const out = [], map = {};
  bills.forEach(b => {
    const g = (b.group || '').trim();
    if (!g) { out.push({ single: b }); return; }
    if (!map[g]) { map[g] = { name: g, items: [] }; out.push(map[g]); }
    map[g].items.push(b);
  });
  return out;
}
function groupIcon(g) {
  if (GROUP_ICON[g.name]) return GROUP_ICON[g.name];
  return g.items[0]?.icon || '📁';
}
const openGroups = new Set((() => { try { return JSON.parse(localStorage.getItem('tsn-open') || '[]'); } catch { return []; } })());
function toggleGroup(name) {
  openGroups.has(name) ? openGroups.delete(name) : openGroups.add(name);
  try { localStorage.setItem('tsn-open', JSON.stringify([...openGroups])); } catch { /* */ }
}
const chev = open => `<svg class="chev ${open ? 'open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`;
function personAv(p) {
  if (p === 'Bokx') return `<img src="${AVATAR.bokx}" alt="">`;
  if (p === 'Missy') return `<img src="${AVATAR.missy}" alt="">`;
  return '';
}
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------------- backends ---------------- */
async function firebaseBackend() {
  const V = '10.12.2';
  const base = `https://www.gstatic.com/firebasejs/${V}`;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`),
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = A.getAuth(app);
  let db;
  try {
    db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  } catch {
    db = F.getFirestore(app);
  }
  const home = F.doc(db, 'households', 'teamsn');
  const txCol = F.collection(db, 'households', 'teamsn', 'tx');
  A.getRedirectResult(auth).catch(e => showLoginError(e));
  return {
    onAuth: cb => A.onAuthStateChanged(auth, cb),
    async signIn() {
      const p = new A.GoogleAuthProvider();
      p.setCustomParameters({ prompt: 'select_account' });
      try {
        await A.signInWithPopup(auth, p);
      } catch (e) {
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(e.code)) {
          await A.signInWithRedirect(auth, p);
        } else throw e;
      }
    },
    signOut: () => A.signOut(auth),
    watchSettings: (cb, err) => F.onSnapshot(home, s => cb(s.exists() ? s.data().settings : null), err),
    saveSettings: settings => F.setDoc(home, { settings, updatedAt: F.serverTimestamp() }, { merge: true }),
    watchTx: (cb, err) => F.onSnapshot(txCol, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), err),
    addTx: t => F.addDoc(txCol, { ...t, createdAt: F.serverTimestamp() }),
    updateTx: (id, t) => F.updateDoc(F.doc(txCol, id), t),
    deleteTx: id => F.deleteDoc(F.doc(txCol, id)),
    async clearTx() {
      const snap = await F.getDocs(txCol);
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const b = F.writeBatch(db);
        docs.slice(i, i + 400).forEach(d => b.delete(d.ref));
        await b.commit();
      }
      return docs.length;
    },
  };
}

function demoBackend() {
  const KEY = 'tsn-demo';
  let data = { settings: null, tx: [] };
  try { data = JSON.parse(store.get(KEY)) || data; } catch { /* fresh */ }
  const subs = { s: [], t: [], a: [] };
  const persist = () => { store.set(KEY, JSON.stringify(data)); subs.s.forEach(f => f(data.settings)); subs.t.forEach(f => f(clone(data.tx))); };
  let user = store.get('tsn-demo-user') ? { displayName: 'Demo', email: 'demo' } : null;
  return {
    onAuth(cb) { subs.a.push(cb); setTimeout(() => cb(user), 0); return () => {}; },
    async signIn() { user = { displayName: 'Demo', email: 'demo' }; store.set('tsn-demo-user', '1'); subs.a.forEach(f => f(user)); },
    async signOut() { user = null; try { localStorage.removeItem('tsn-demo-user'); } catch { /* */ } subs.a.forEach(f => f(user)); },
    watchSettings(cb) { subs.s.push(cb); setTimeout(() => cb(data.settings), 0); return () => {}; },
    async saveSettings(s) { data.settings = clone(s); persist(); },
    watchTx(cb) { subs.t.push(cb); setTimeout(() => cb(clone(data.tx)), 0); return () => {}; },
    async addTx(t) { data.tx.push({ ...t, id: uid('tx') }); persist(); },
    async updateTx(id, t) { const i = data.tx.findIndex(x => x.id === id); if (i >= 0) data.tx[i] = { ...data.tx[i], ...t }; persist(); },
    async deleteTx(id) { data.tx = data.tx.filter(x => x.id !== id); persist(); },
    async clearTx() { const n = data.tx.length; data.tx = []; persist(); return n; },
  };
}

/* ---------------- state ---------------- */
const S = {
  be: null,
  user: undefined,
  settings: null,
  tx: [],
  loaded: { s: false, t: false },
  view: 'home',
  y: 2027, m: 1,
  me: store.get('tsn-me') || '',
  hist: { scope: 'month', who: 'all', q: '' },
  draft: null,     // settings being edited
  unsub: [],
  loginError: '',
};

function setInitialMonth() {
  const d = new Date();
  const year = S.settings?.year || 2027;
  if (d.getFullYear() === year) { S.y = year; S.m = d.getMonth() + 1; }
  else { S.y = year; S.m = d.getFullYear() > year ? 12 : 1; }
}

/* ---------------- calculations ---------------- */
function billPlan(b, m) {
  if (b.freq === 'monthly') return b.amount;
  if (b.freq === 'split') return Math.round(b.amount / 12);
  return Number(b.month) === m ? b.amount : 0;
}
const sum = (arr, f = x => x) => arr.reduce((a, x) => a + f(x), 0);
const txOfMonth = (y, m) => S.tx.filter(t => t.date?.startsWith(ym(y, m)));
const txOfYear = y => S.tx.filter(t => t.date?.startsWith(String(y)));

function monthStats(y, m) {
  const st = S.settings, list = txOfMonth(y, m);
  const by = (kind, ref) => sum(list.filter(t => t.kind === kind && (ref == null || t.ref === ref)), t => t.amount);
  const income = st.income.map(i => ({ ...i, got: by('income', i.id) }));
  const bills = st.bills.map(b => {
    const plan = billPlan(b, m), paid = by('bill', b.id);
    const status = plan === 0 ? (paid > 0 ? 'paid' : 'none') : paid >= plan ? 'paid' : paid > 0 ? 'part' : 'due';
    return { ...b, plan, paid, status };
  });
  const cats = st.categories.map(c => ({ ...c, spent: by('expense', c.id) }));
  const goals = st.goals.map(g => ({ ...g, saved: by('saving', g.id) }));
  const incomeGot = sum(list.filter(t => t.kind === 'income'), t => t.amount);
  const billsPaid = sum(list.filter(t => t.kind === 'bill'), t => t.amount);
  const expenses = sum(list.filter(t => t.kind === 'expense'), t => t.amount);
  const saved = sum(list.filter(t => t.kind === 'saving'), t => t.amount);
  const spent = billsPaid + expenses;
  const spendPlan = sum(bills, b => b.plan) + sum(cats, c => c.limit);
  const who = PEOPLE.map(p => ({ p, v: sum(list.filter(t => (t.kind === 'bill' || t.kind === 'expense') && t.who === p), t => t.amount) }));
  const methods = st.methods.map(mm => ({ mm, v: sum(list.filter(t => (t.kind === 'bill' || t.kind === 'expense') && t.method === mm), t => t.amount) }));
  return {
    list, income, bills, cats, goals, incomeGot, incomePlan: sum(st.income, i => i.amount),
    billsPaid, expenses, saved, spent, spendPlan, left: incomeGot - spent - saved, who, methods,
  };
}

/* ---------------- render: shell ---------------- */
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  year: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 20V11M10 20V5M15 20v-7M20 20V8"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
};

function render() {
  const app = $('#app');
  if (S.user === undefined) { app.innerHTML = `<div class="splash"><img src="img/sky.png" alt=""><p>Loading…</p></div>`; return; }
  if (!S.user) { app.innerHTML = loginView(); return; }
  if (!S.loaded.s || !S.loaded.t || !S.settings) { app.innerHTML = `<div class="splash"><img src="img/sky.png" alt=""><p>Opening your budget…</p></div>`; return; }
  if (!S.me) { app.innerHTML = whoAmIView(); return; }

  const scrollY = window.scrollY;
  let body = '';
  if (S.view === 'home') body = homeView();
  else if (S.view === 'year') body = yearView();
  else if (S.view === 'history') body = historyView();
  else body = settingsView();

  app.innerHTML = body + navView() + (S.view === 'settings' && settingsDirty() ? saveBar() : '');
  if (S.keepScroll) window.scrollTo(0, scrollY);
  S.keepScroll = false;
}

function familyStrip() {
  const pets = (S.settings?.pets || []).slice(0, 3).map(p => {
    const ip = iconParts(p.icon);
    if (ip.src) return `<img src="${esc(ip.src)}" alt="${esc(p.name)}" class="${ip.cat ? 'cat' : ''}">`;
    return `<span class="pet-emoji" title="${esc(p.name)}">${esc(ip.emoji)}</span>`;
  }).join('');
  return `<div class="family"><img src="${AVATAR.bokx}" alt="Bokx"><img src="${AVATAR.missy}" alt="Missy"><img src="${AVATAR.girl}" alt="">${pets}</div>`;
}

function hero(title, withMonth) {
  const hi = S.me && S.me !== 'Joint' ? `Hi ${esc(S.me)} 👋` : 'Hi there 👋';
  return `<header class="hero">
    <div class="hero-top">
      <div><div class="hello">${hi}</div><div class="brand">${esc(title)}</div></div>
      ${familyStrip()}
    </div>
    ${withMonth === 'month' ? `<div class="month-switch">
      <button data-act="month" data-d="-1" aria-label="Previous month">‹</button>
      <div class="label">${MONTHS[S.m - 1]} ${S.y}</div>
      <button data-act="month" data-d="1" aria-label="Next month">›</button>
    </div>` : withMonth === 'year' ? `<div class="month-switch">
      <button data-act="year" data-d="-1" aria-label="Previous year">‹</button>
      <div class="label">${S.y}</div>
      <button data-act="year" data-d="1" aria-label="Next year">›</button>
    </div>` : '<div style="height:18px"></div>'}
  </header>`;
}

function navView() {
  const b = (v, ic, label) => `<button data-act="view" data-v="${v}" class="${S.view === v ? 'on' : ''}">${ICONS[ic]}${label}</button>`;
  return `<nav class="nav">
    ${b('home', 'home', 'Home')}${b('year', 'year', 'Year')}
    <div><button class="add" data-act="add" aria-label="Add entry">${ICONS.plus}</button></div>
    ${b('history', 'list', 'History')}${b('settings', 'gear', 'Settings')}
  </nav>`;
}

/* ---------------- login / who am I ---------------- */
function loginView() {
  return `<div class="login">
    <img class="sky" src="${AVATAR.sky}" alt="">
    <h1>Team SN</h1>
    <p>Home Budget System</p>
    <div class="family"><img src="${AVATAR.bokx}" alt=""><img src="${AVATAR.missy}" alt=""><img src="${AVATAR.girl}" alt=""></div>
    <button class="btn-google" data-act="signin">
      <svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
      Sign in with Google
    </button>
    ${S.loginError ? `<div class="err">${esc(S.loginError)}</div>` : ''}
    ${DEMO ? `<div class="demo-note">Preview mode: entries stay on this device only.</div>` : ''}
  </div>`;
}

function showLoginError(e) {
  if (!e) return;
  const map = {
    'auth/popup-closed-by-user': '',
    'auth/cancelled-popup-request': '',
    'auth/unauthorized-domain': 'This web address is not allowed yet. Add it under Firebase → Authentication → Settings → Authorized domains.',
    'auth/network-request-failed': 'No internet connection. Try again when you are online.',
  };
  S.loginError = map[e.code] ?? `Sign-in failed (${e.code || e.message}).`;
  render();
}

function whoAmIView() {
  const guess = /michelle|missy/i.test(S.user?.displayName || '') ? 'Missy' : /rolly|bokx/i.test(S.user?.displayName || '') ? 'Bokx' : '';
  return `<div class="login">
    <img class="sky" src="${AVATAR.sky}" alt="">
    <h1>Who's using this phone?</h1>
    <p>New entries will be marked as spent by you. You can still pick someone else on any entry.</p>
    <div class="me-pick" style="width:100%;max-width:340px">
      ${['Bokx', 'Missy'].map(p => `<button data-act="setme" data-p="${p}" class="${guess === p ? 'on' : ''}"><img src="${AVATAR[p.toLowerCase()]}" alt="">${p}</button>`).join('')}
    </div>
  </div>`;
}

/* ---------------- HOME (month) ---------------- */
function ring(pct, color) {
  const r = 34, c = 2 * Math.PI * r, p = Math.max(0, Math.min(pct, 1));
  return `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${r}" fill="none" stroke="#F0EDF7" stroke-width="9"/>
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c * p} ${c}"/></svg>`;
}
function barClass(p) { return p > 1 ? 'over' : p >= 0.8 ? 'warn' : ''; }

function homeView() {
  const st = monthStats(S.y, S.m);
  const pct = st.spendPlan ? st.spent / st.spendPlan : 0;
  const ringColor = pct > 1 ? '#C2405A' : pct >= 0.8 ? '#E6B53C' : '#6B5CA5';
  const visibleBills = st.bills.filter(b => b.plan > 0 || b.paid > 0);
  const hiddenBills = st.bills.length - visibleBills.length;
  const unpaid = visibleBills.filter(b => b.status === 'due' || b.status === 'part').length;
  const hasAny = st.list.length > 0;

  return hero('Team SN Budget', 'month') + `<main>
    <section class="card summary">
      <div class="summary-top">
        <div class="left">
          <div class="lbl">Left over this month</div>
          <div class="big num ${st.left < 0 ? 'neg' : ''}">${money(st.left)}</div>
          <div class="sub">${hasAny ? `Spent ${Math.round(pct * 100)}% of the ${money(st.spendPlan)} plan` : 'No entries yet. Tap + to add one.'}</div>
        </div>
        <div class="ring">${ring(pct, ringColor)}<div class="c"><b>${Math.round(pct * 100)}%</b><span>of plan</span></div></div>
      </div>
      <div class="kpis">
        <div class="kpi in"><div class="k">Money in</div><div class="v num">${money(st.incomeGot, { noCur: true })}</div></div>
        <div class="kpi out"><div class="k">Spent</div><div class="v num">${money(st.spent, { noCur: true })}</div></div>
        <div class="kpi sv"><div class="k">Saved</div><div class="v num">${money(st.saved, { noCur: true })}</div></div>
      </div>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--green)"></span>Income</h2><span class="meta num">${money(st.incomeGot)} of ${money(st.incomePlan)}</span></div>
    <section class="card">
      ${st.income.map(i => `<div class="row">
        ${icon(i.icon)}
        <div class="main"><div class="name">${esc(i.name)}</div><div class="detail num">Planned ${money(i.amount)}</div></div>
        ${i.got > 0
          ? `<div class="amt num" style="color:var(--green)">${money(i.got)}<small>received</small></div>`
          : i.amount > 0 ? `<button class="act green" data-act="quick" data-kind="income" data-ref="${i.id}">Received</button>`
          : `<button class="act soft" data-act="add" data-kind="income" data-ref="${i.id}">Add</button>`}
      </div>`).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple)"></span>Bills</h2><span class="meta">${unpaid ? `${unpaid} to pay` : visibleBills.length ? 'All paid 🎉' : ''}</span></div>
    <section class="card">
      ${billGroups(visibleBills).map(g => g.single ? billRow(g.single) : billGroupRow(g)).join('') || '<div class="empty">No bills this month.</div>'}
      ${hiddenBills ? `<div class="detail" style="font-size:12.5px;color:var(--muted);font-weight:700;padding-top:8px">${hiddenBills} yearly bill${hiddenBills > 1 ? 's' : ''} not due this month. <button data-act="add" data-kind="bill" style="color:var(--purple);font-weight:900">Log a payment</button></div>` : ''}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--blue)"></span>Everyday spending</h2><span class="meta num">${money(st.expenses)} of ${money(sum(st.cats, c => c.limit))}</span></div>
    <section class="card">
      ${st.cats.map(c => {
        const p = c.limit ? c.spent / c.limit : (c.spent ? 2 : 0);
        return `<div class="row" data-act="add" data-kind="expense" data-ref="${c.id}" style="cursor:pointer">
          ${icon(c.icon)}
          <div class="main">
            <div class="name">${esc(c.name)}</div>
            <div class="bar ${barClass(p)}"><i style="width:${Math.min(p, 1) * 100}%"></i></div>
            <div class="cat-line num"><span>${money(c.spent)} spent</span><span class="${c.limit - c.spent < 0 ? 'over' : ''}">${c.limit - c.spent < 0 ? `${money(c.spent - c.limit)} over` : `${money(c.limit - c.spent)} left`}</span></div>
          </div>
        </div>`;
      }).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--teal)"></span>Savings</h2><span class="meta num">${money(st.saved)} this month</span></div>
    <section class="card">
      ${st.goals.map(g => {
        const total = g.start + sum(S.tx.filter(t => t.kind === 'saving' && t.ref === g.id), t => t.amount);
        const p = g.target ? total / g.target : 0;
        return `<div class="row">
          ${icon(g.icon)}
          <div class="main">
            <div class="name">${esc(g.name)}</div>
            <div class="detail num">This month ${money(g.saved)}${g.monthly ? ` of ${money(g.monthly)}` : ''} · total ${money(total)}</div>
            ${g.target ? `<div class="bar teal"><i style="width:${Math.min(p, 1) * 100}%"></i></div><div class="cat-line num"><span>${Math.round(p * 100)}% of ${money(g.target)}</span></div>` : ''}
          </div>
          ${g.monthly && g.saved < g.monthly ? `<button class="act soft" data-act="quick" data-kind="saving" data-ref="${g.id}">Save</button>` : g.monthly ? `<span class="pill paid">Done</span>` : ''}
        </div>`;
      }).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple-m)"></span>Who spent</h2></div>
    <section class="card">
      <div class="who-grid">
        ${st.who.map(w => `<div class="who"><div class="av ${w.p === 'Joint' ? 'joint' : ''}">${w.p === 'Joint' ? '2' : personAv(w.p)}</div><b>${w.p}</b><span class="num">${money(w.v)}</span></div>`).join('')}
      </div>
      <div class="chips-stat">${st.methods.map(x => `<div class="chip-stat">${esc(x.mm)}<b class="num">${money(x.v)}</b></div>`).join('')}</div>
    </section>
    <div class="foot">${DEMO ? 'Preview mode · entries stay on this device' : 'Synced for Bokx & Missy'}</div>
  </main>`;
}

function billRow(b, sub = false) {
  return `<div class="row ${sub ? 'sub-row' : ''}">
    ${icon(b.icon)}
    <div class="main"><div class="name">${esc(b.name)}</div>
      <div class="detail num">${b.freq === 'split' ? `${money(b.plan)} monthly share` : money(b.plan)}${b.paid && b.paid !== b.plan ? ` · paid ${money(b.paid)}` : ''}</div></div>
    ${b.status === 'paid' ? `<span class="pill paid">Paid</span>`
      : `<button class="act" data-act="quick" data-kind="bill" data-ref="${b.id}">Pay</button>`}
  </div>`;
}
function billGroupRow(g) {
  const open = openGroups.has(g.name);
  const plan = sum(g.items, b => b.plan), paid = sum(g.items, b => b.paid);
  const nPaid = g.items.filter(b => b.status === 'paid').length, n = g.items.length;
  const pill = nPaid === n ? `<span class="pill paid">Paid</span>`
    : nPaid > 0 || paid > 0 ? `<span class="pill part">${nPaid}/${n} paid</span>`
    : `<span class="pill due">${n} to pay</span>`;
  return `<div class="row grp" data-act="toggle" data-g="${esc(g.name)}" role="button" aria-expanded="${open}">
    ${icon(groupIcon(g))}
    <div class="main"><div class="name">${esc(g.name)}</div>
      <div class="detail num">${n} bill${n > 1 ? 's' : ''} · ${money(plan)}${paid && paid !== plan ? ` · paid ${money(paid)}` : ''}</div></div>
    ${pill}${chev(open)}
  </div>
  ${open ? `<div class="grp-items">${g.items.map(b => billRow(b, true)).join('')}</div>` : ''}`;
}

/* ---------------- YEAR ---------------- */
function barChart(months) {
  const W = 340, H = 190, pl = 34, pb = 22, pt = 10;
  const max = Math.max(1, ...months.flatMap(x => [x.inc, x.out + x.sav]));
  const nice = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / nice) * nice;
  const cw = (W - pl) / 12, bw = cw * 0.32;
  const y = v => pt + (H - pt - pb) * (1 - v / top);
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const v = top * i / 4;
    g += `<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#EFECF6"/><text x="${pl - 5}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="#8C86A3" font-weight="700">${short(v)}</text>`;
  }
  months.forEach((x, i) => {
    const cx = pl + cw * i + cw / 2;
    const ih = y(0) - y(x.inc), oh = y(0) - y(x.out), sh = y(0) - y(x.sav);
    g += `<rect x="${cx - bw - 1}" y="${y(x.inc)}" width="${bw}" height="${Math.max(ih, 0)}" rx="3" fill="#7FC3A0"/>`;
    g += `<rect x="${cx + 1}" y="${y(x.out)}" width="${bw}" height="${Math.max(oh, 0)}" rx="3" fill="#9C8BE0"/>`;
    g += `<rect x="${cx + 1}" y="${y(x.out) - sh}" width="${bw}" height="${Math.max(sh, 0)}" rx="3" fill="#76C6C4"/>`;
    g += `<text x="${cx}" y="${H - 6}" text-anchor="middle" font-size="9.5" fill="${i + 1 === S.m ? '#6B5CA5' : '#8C86A3'}" font-weight="800">${MON[i][0]}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Income and spending by month">${g}</svg>
    <div class="legend"><span><i style="background:#7FC3A0"></i>Income</span><span><i style="background:#9C8BE0"></i>Spent</span><span><i style="background:#76C6C4"></i>Saved</span></div>`;
}

function donut(items) {
  const total = sum(items, x => x.v);
  if (!total) return `<div class="empty"><img src="${AVATAR.sky}" alt="">Nothing spent yet this year.</div>`;
  const r = 50, c = 2 * Math.PI * r;
  let off = 0, arcs = '';
  items.forEach((x, i) => {
    if (!x.v) return;
    const len = c * x.v / total;
    arcs += `<circle cx="70" cy="70" r="${r}" fill="none" stroke="${PIE[i % PIE.length]}" stroke-width="22" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;
    off += len;
  });
  return `<div class="donut-wrap">
    <svg viewBox="0 0 140 140">${arcs}<text x="70" y="66" text-anchor="middle" font-size="10" fill="#8C86A3" font-weight="800">TOTAL</text><text x="70" y="82" text-anchor="middle" font-size="14" fill="#2F2A45" font-weight="900">${short(total)}</text></svg>
    <div class="donut-legend">${items.map((x, i) => x.v ? `<div><i style="background:${PIE[i % PIE.length]}"></i><span>${esc(x.name)}</span><b class="num">${Math.round(x.v / total * 100)}%</b></div>` : '').join('')}</div>
  </div>`;
}

function yearView() {
  const st = S.settings;
  const months = MONTHS.map((_, i) => {
    const s = monthStats(S.y, i + 1);
    return { inc: s.incomeGot, out: s.spent, sav: s.saved, plan: s.spendPlan };
  });
  const inc = sum(months, x => x.inc), out = sum(months, x => x.out), sav = sum(months, x => x.sav), plan = sum(months, x => x.plan);
  const list = txOfYear(S.y);
  const byRef = (kind, id) => sum(list.filter(t => t.kind === kind && t.ref === id), t => t.amount);
  const cats = st.categories.map(c => ({ name: c.name, icon: c.icon, v: byRef('expense', c.id), lim: c.limit * 12 }));
  const bills = st.bills.map(b => ({ ...b, yplan: b.freq === 'monthly' ? b.amount * 12 : b.amount, paid: byRef('bill', b.id) }));
  const who = PEOPLE.map(p => ({ name: p, v: sum(list.filter(t => (t.kind === 'bill' || t.kind === 'expense') && t.who === p), t => t.amount) }));
  const rate = inc ? sav / inc : 0;

  return hero('Year overview', 'year') + `<main>
    <section class="card summary">
      <div class="summary-top">
        <div class="left">
          <div class="lbl">Left over in ${S.y}</div>
          <div class="big num ${inc - out - sav < 0 ? 'neg' : ''}">${money(inc - out - sav)}</div>
          <div class="sub">Saving ${Math.round(rate * 100)}% of income · spent ${plan ? Math.round(out / plan * 100) : 0}% of the yearly plan</div>
        </div>
        <div class="ring">${ring(rate / 0.2, '#3C8C8C')}<div class="c"><b>${Math.round(rate * 100)}%</b><span>saved</span></div></div>
      </div>
      <div class="kpis">
        <div class="kpi in"><div class="k">Income</div><div class="v num">${short(inc)}</div></div>
        <div class="kpi out"><div class="k">Spent</div><div class="v num">${short(out)}</div></div>
        <div class="kpi sv"><div class="k">Saved</div><div class="v num">${short(sav)}</div></div>
      </div>
    </section>

    <div class="sec-title"><h2>Month by month</h2><span class="meta">AED</span></div>
    <section class="card">${barChart(months)}</section>

    <div class="sec-title"><h2>Where the money went</h2></div>
    <section class="card">${donut(cats)}</section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--blue)"></span>Spending limits for the year</h2></div>
    <section class="card">
      ${cats.map(c => {
        const p = c.lim ? c.v / c.lim : (c.v ? 2 : 0);
        return `<div class="row">${icon(c.icon)}<div class="main"><div class="name">${esc(c.name)}</div>
          <div class="bar ${barClass(p)}"><i style="width:${Math.min(p, 1) * 100}%"></i></div>
          <div class="cat-line num"><span>${money(c.v)}</span><span>of ${money(c.lim)}</span></div></div></div>`;
      }).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple)"></span>Bills paid this year</h2></div>
    <section class="card">
      ${billGroups(bills).map(g => {
        const one = (b, cls = '') => {
          const p = b.yplan ? b.paid / b.yplan : 0;
          return `<div class="row ${cls}">${icon(b.icon)}<div class="main"><div class="name">${esc(b.name)}</div>
            <div class="bar purple"><i style="width:${Math.min(p, 1) * 100}%"></i></div>
            <div class="cat-line num"><span>${money(b.paid)} paid</span><span>${money(Math.max(b.yplan - b.paid, 0))} to go</span></div></div></div>`;
        };
        if (g.single) return one(g.single);
        const open = openGroups.has(g.name);
        const tot = { yplan: sum(g.items, b => b.yplan), paid: sum(g.items, b => b.paid) };
        const p = tot.yplan ? tot.paid / tot.yplan : 0;
        return `<div class="row grp" data-act="toggle" data-g="${esc(g.name)}" role="button" aria-expanded="${open}">${icon(groupIcon(g))}<div class="main"><div class="name">${esc(g.name)}</div>
            <div class="bar purple"><i style="width:${Math.min(p, 1) * 100}%"></i></div>
            <div class="cat-line num"><span>${money(tot.paid)} paid</span><span>${money(Math.max(tot.yplan - tot.paid, 0))} to go</span></div></div>${chev(open)}</div>
          ${open ? `<div class="grp-items">${g.items.map(b => one(b, 'sub-row')).join('')}</div>` : ''}`;
      }).join('')}
    </section>

    <div class="sec-title"><h2>Who spent</h2></div>
    <section class="card"><div class="who-grid">
      ${who.map(w => `<div class="who"><div class="av ${w.name === 'Joint' ? 'joint' : ''}">${w.name === 'Joint' ? '2' : personAv(w.name)}</div><b>${w.name}</b><span class="num">${money(w.v)}</span></div>`).join('')}
    </div></section>
  </main>`;
}

/* ---------------- HISTORY ---------------- */
function refInfo(t) {
  const st = S.settings;
  const pools = { income: st.income, bill: st.bills, expense: st.categories, saving: st.goals };
  const item = (pools[t.kind] || []).find(x => x.id === t.ref);
  return { name: item?.name || t.refName || 'Removed item', icon: item?.icon || t.refIcon || '•' };
}

function historyView() {
  const h = S.hist;
  let list = h.scope === 'month' ? txOfMonth(S.y, S.m) : S.tx.slice();
  if (h.who !== 'all') list = list.filter(t => t.who === h.who);
  const q = h.q.trim().toLowerCase();
  if (q) list = list.filter(t => (refInfo(t).name + ' ' + (t.note || '') + ' ' + (t.method || '')).toLowerCase().includes(q));
  list.sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)));

  const groups = {};
  list.forEach(t => (groups[t.date] = groups[t.date] || []).push(t));
  const out = sum(list.filter(t => t.kind === 'bill' || t.kind === 'expense'), t => t.amount);

  const chip = (k, v, label, extra = '') => `<button class="fchip ${h[k] === v ? 'on' : ''}" data-act="hist" data-k="${k}" data-v="${v}">${extra}${label}</button>`;
  return hero('History', h.scope === 'month' ? 'month' : null) + `<main>
    <input class="search" type="search" placeholder="Search entries" value="${esc(h.q)}" data-act="search" aria-label="Search entries">
    <div class="filters">
      ${chip('scope', 'month', MONTHS[S.m - 1])}${chip('scope', 'all', 'All time')}
      ${chip('who', 'all', 'Everyone')}${chip('who', 'Bokx', 'Bokx', personAv('Bokx'))}${chip('who', 'Missy', 'Missy', personAv('Missy'))}${chip('who', 'Joint', 'Joint')}
    </div>
    <div class="day-head"><span>${list.length} entr${list.length === 1 ? 'y' : 'ies'}</span><span class="num">Spent ${money(out)}</span></div>
    ${Object.keys(groups).length ? Object.entries(groups).map(([d, items]) => {
      const dt = new Date(d + 'T00:00:00');
      return `<div class="day-head"><span>${dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
        <section class="card" style="padding:4px 16px">${items.map(t => {
          const r = refInfo(t);
          const sign = t.kind === 'income' ? '+' : t.kind === 'saving' ? '' : '−';
          return `<div class="row tx-row" data-act="edit" data-id="${esc(t.id)}">
            ${icon(r.icon)}
            <div class="main"><div class="name">${esc(r.name)}</div>
              <div class="detail">${personAv(t.who).replace('<img', '<img class="who-mini"')}${esc(t.who || '')}${t.method && (t.kind === 'bill' || t.kind === 'expense') ? ' · ' + esc(t.method) : ''}${t.note ? ' · ' + esc(t.note) : ''}</div></div>
            <div class="amt num ${t.kind}">${sign}${money(t.amount, { noCur: true })}<small>${{ income: 'income', bill: 'bill', expense: 'spent', saving: 'saved' }[t.kind]}</small></div>
          </div>`;
        }).join('')}</section>`;
    }).join('') : `<section class="card"><div class="empty"><img src="${AVATAR.sky}" alt="">No entries${q ? ' match your search' : ' yet'}.</div></section>`}
  </main>`;
}

/* ---------------- ADD / EDIT SHEET ---------------- */
let sheet = null;
const KIND_LABEL = { expense: 'Spending', bill: 'Bill', income: 'Income', saving: 'Savings' };

function defaultDate() {
  const t = todayStr();
  return t.startsWith(ym(S.y, S.m)) ? t : `${ym(S.y, S.m)}-01`;
}

function openSheet(opts = {}) {
  const st = S.settings;
  if (opts.id) {
    const t = S.tx.find(x => x.id === opts.id);
    if (!t) return;
    sheet = { id: t.id, kind: t.kind, ref: t.ref, amount: filsToInput(t.amount), who: t.who, method: t.method || st.methods[0], date: t.date, note: t.note || '' };
  } else {
    const kind = opts.kind || 'expense';
    sheet = { id: null, kind, ref: opts.ref || null, amount: '', who: S.me || 'Bokx', method: store.get('tsn-method') || st.methods[1] || st.methods[0], date: defaultDate(), note: '' };
    if (!sheet.ref) sheet.ref = poolFor(kind)[0]?.id || null;
    if (kind === 'income') { const inc = st.income.find(i => i.id === sheet.ref); if (inc?.icon === 'missy') sheet.who = 'Missy'; if (inc?.icon === 'bokx') sheet.who = 'Bokx'; }
  }
  renderSheet(true);
}
function poolFor(kind) {
  const st = S.settings;
  return { expense: st.categories, bill: st.bills, income: st.income, saving: st.goals }[kind] || [];
}
function closeSheet() { sheet = null; $('#sheet-root').innerHTML = ''; document.body.style.overflow = ''; }

function renderSheet(focus) {
  if (!sheet) return;
  const st = S.settings;
  const pool = poolFor(sheet.kind);
  const showMethod = sheet.kind === 'expense' || sheet.kind === 'bill';
  $('#sheet-root').innerHTML = `<div class="overlay" data-act="close"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="${sheet.id ? 'Edit entry' : 'New entry'}">
    <div class="grab"></div>
    <h3>${sheet.id ? 'Edit entry' : 'New entry'}<button data-act="close" aria-label="Close">×</button></h3>
    <div class="seg">${Object.entries(KIND_LABEL).map(([k, l]) => `<button data-act="kind" data-k="${k}" class="${sheet.kind === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="amount-in"><span>AED</span><input id="amt" inputmode="decimal" placeholder="0.00" value="${esc(sheet.amount)}" autocomplete="off" aria-label="Amount"></div>
    <div class="field-label">${{ expense: 'Category', bill: 'Bill', income: 'Income', saving: 'Goal' }[sheet.kind]}</div>
    ${(() => {
      const chip = x => `<button data-act="ref" data-id="${x.id}" class="${sheet.ref === x.id ? 'on' : ''}">${smallIcon(x.icon)}${esc(x.name)}</button>`;
      if (sheet.kind !== 'bill') return `<div class="pick">${pool.map(chip).join('')}</div>`;
      const groups = billGroups(pool);
      const singles = groups.filter(g => g.single).map(g => g.single);
      return `<div class="pick">${singles.map(chip).join('')}</div>` +
        groups.filter(g => !g.single).map(g => `<div class="pick-group">${esc(g.name)}</div><div class="pick">${g.items.map(chip).join('')}</div>`).join('');
    })()}
    <div class="field-label">${sheet.kind === 'income' ? 'Received by' : sheet.kind === 'saving' ? 'Saved by' : 'Spent by'}</div>
    <div class="pick">${PEOPLE.map(p => `<button data-act="who" data-p="${p}" class="${sheet.who === p ? 'on' : ''}">${personAv(p) || '👫'}${p}</button>`).join('')}</div>
    ${showMethod ? `<div class="field-label">Paid with</div>
    <div class="pick">${st.methods.map(mm => `<button data-act="method" data-m="${esc(mm)}" class="${sheet.method === mm ? 'on' : ''}">${{ 'Cash': '💵', 'Debit Card': '💳', 'Credit Card': '💳', 'Google Pay': '📱' }[mm] || '💰'} ${esc(mm)}</button>`).join('')}</div>` : ''}
    <div class="two">
      <div><div class="field-label">Date</div><input class="inp" type="date" id="date" value="${esc(sheet.date)}"></div>
      <div><div class="field-label">Note</div><input class="inp" id="note" placeholder="Optional" value="${esc(sheet.note)}" maxlength="80"></div>
    </div>
    <button class="btn-main" data-act="save">${sheet.id ? 'Save changes' : 'Add entry'}</button>
    ${sheet.id ? `<button class="btn-del" data-act="delete">Delete entry</button>` : ''}
  </div>`;
  document.body.style.overflow = 'hidden';
  if (focus && !sheet.id) setTimeout(() => $('#amt')?.focus(), 250);
}
function readSheetInputs() {
  if (!sheet) return;
  sheet.amount = $('#amt')?.value ?? sheet.amount;
  sheet.date = $('#date')?.value || sheet.date;
  sheet.note = $('#note')?.value ?? sheet.note;
}

async function saveSheet() {
  readSheetInputs();
  const amount = toFils(sheet.amount);
  if (!amount) { toast('Enter an amount'); $('#amt')?.focus(); return; }
  if (!sheet.ref) { toast('Pick a category'); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sheet.date)) { toast('Pick a date'); return; }
  const item = poolFor(sheet.kind).find(x => x.id === sheet.ref);
  const showMethod = sheet.kind === 'expense' || sheet.kind === 'bill';
  const t = {
    kind: sheet.kind, ref: sheet.ref, refName: item?.name || '', refIcon: item?.icon || '',
    amount, who: sheet.who, method: showMethod ? sheet.method : '', date: sheet.date, note: sheet.note.trim(),
    by: S.me || '',
  };
  if (showMethod) store.set('tsn-method', sheet.method);
  const id = sheet.id;
  closeSheet();
  try {
    if (id) { await S.be.updateTx(id, t); toast('Entry updated'); }
    else { await S.be.addTx(t); toast(`${money(amount)} added`); }
  } catch (e) { toast('Could not save. Check your connection.'); console.error(e); }
}

async function quickAdd(kind, ref) {
  const st = S.settings;
  const item = poolFor(kind).find(x => x.id === ref);
  if (!item) return;
  let amount = 0, who = S.me || 'Bokx';
  if (kind === 'income') { amount = item.amount; if (item.icon === 'bokx') who = 'Bokx'; if (item.icon === 'missy') who = 'Missy'; }
  if (kind === 'bill') { const plan = billPlan(item, S.m); const paid = sum(txOfMonth(S.y, S.m).filter(t => t.kind === 'bill' && t.ref === ref), t => t.amount); amount = Math.max(plan - paid, 0); }
  if (kind === 'saving') { const got = sum(txOfMonth(S.y, S.m).filter(t => t.kind === 'saving' && t.ref === ref), t => t.amount); amount = Math.max(item.monthly - got, 0); }
  // Open the sheet pre-filled so the amount can be checked before saving.
  openSheet({ kind, ref });
  sheet.amount = filsToInput(amount);
  sheet.who = who;
  if (kind !== 'income' && kind !== 'saving') sheet.method = store.get('tsn-method') || st.methods[1] || st.methods[0];
  renderSheet(false);
}

/* ---------------- SETTINGS ---------------- */
const settingsDirty = () => S.draft && JSON.stringify(S.draft) !== JSON.stringify(S.settings);
function ensureDraft() { if (!S.draft) S.draft = clone(S.settings); return S.draft; }

function moneyInput(path, val) {
  return `<div class="money"><input class="inp num" inputmode="decimal" data-set="${path}" data-type="money" value="${esc(filsToInput(val))}" placeholder="0"></div>`;
}
function iconField(path, val) {
  if (isPicIcon(val)) return `<div class="icon-static">${smallIcon(val)}</div>`;
  return textInput(path, val, '', 'icon-inp');
}
function textInput(path, val, ph = '', cls = '') {
  return `<input class="inp ${cls}" data-set="${path}" value="${esc(val)}" placeholder="${esc(ph)}">`;
}

function settingsView() {
  const d = S.draft || S.settings;
  const monthSel = (path, val) => `<select class="inp" data-set="${path}" data-type="int">${MON.map((m, i) => `<option value="${i + 1}" ${Number(val) === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select>`;
  const freqSel = (path, val) => `<select class="inp" data-set="${path}">
    <option value="monthly" ${val === 'monthly' ? 'selected' : ''}>Every month</option>
    <option value="yearly" ${val === 'yearly' ? 'selected' : ''}>Once a year</option>
    <option value="split" ${val === 'split' ? 'selected' : ''}>Yearly, split monthly</option></select>`;

  return hero('Settings', null) + `<main>
    <section class="card">
      <div class="field-label" style="margin-top:0">This phone belongs to</div>
      <div class="me-pick">${['Bokx', 'Missy'].map(p => `<button data-act="setme" data-p="${p}" class="${S.me === p ? 'on' : ''}"><img src="${AVATAR[p.toLowerCase()]}" alt="">${p}</button>`).join('')}</div>
      <div class="field-label">Budget year</div>
      <input class="inp num" inputmode="numeric" data-set="year" data-type="int" value="${esc(d.year)}" style="max-width:120px">
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--green)"></span>Income (monthly)</h2></div>
    <section class="card">
      ${d.income.map((x, i) => `<div class="set-row">
        <div class="line">${textInput(`income.${i}.icon`, x.icon, '', 'icon-inp')}${textInput(`income.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="income" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="line">${moneyInput(`income.${i}.amount`, x.amount)}</div>
      </div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="income">+ Add income</button>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:#E9A0BD"></span>Pets</h2></div>
    <section class="card">
      ${(d.pets || []).map((x, i) => `<div class="set-row">
        <div class="line">
          <button class="pet-pic" data-act="petphoto" data-i="${i}" aria-label="Change photo">${smallIcon(x.icon)}<span class="cam">📷</span></button>
          ${textInput(`pets.${i}.name`, x.name, 'Pet name')}
          <button class="x-btn" data-act="rm" data-list="pets" data-i="${i}" aria-label="Remove">×</button>
        </div>
        <div class="emoji-pick">${['🐶', '🐱', '🐰', '🐹', '🐦', '🐟', '🐢', '🐾'].map(em => `<button data-act="petemoji" data-i="${i}" data-e="${em}" class="${x.icon === em ? 'on' : ''}">${em}</button>`).join('')}</div>
      </div>`).join('') || '<div class="detail" style="color:var(--muted);font-weight:700;font-size:13px">No pets yet.</div>'}
      <button class="add-row" data-act="addrow" data-list="pets">+ Add a pet</button>
      <div class="detail" style="color:var(--muted);font-weight:700;font-size:12.5px;margin-top:10px">Tap the picture to use a photo. Each pet gets its own food bill in the Pets group below. Set the amount there.</div>
      <input type="file" id="petfile" accept="image/*" hidden>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple)"></span>Fixed bills</h2></div>
    <section class="card">
      <datalist id="grp-list">${[...new Set(d.bills.map(b => (b.group || '').trim()).filter(Boolean))].map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      ${d.bills.map((x, i) => `<div class="set-row">
        <div class="line">${iconField(`bills.${i}.icon`, x.icon)}${textInput(`bills.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="bills" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="line">${moneyInput(`bills.${i}.amount`, x.amount)}${freqSel(`bills.${i}.freq`, x.freq)}</div>
        <div class="line"><span class="mini" style="margin:0;flex:none">Group</span><input class="inp" list="grp-list" data-set="bills.${i}.group" value="${esc(x.group || '')}" placeholder="None (e.g. Utilities)"></div>
        ${x.freq !== 'monthly' ? `<div class="line"><span class="mini" style="margin:0;flex:none">${x.freq === 'yearly' ? 'Paid in' : 'Due in'}</span>${monthSel(`bills.${i}.month`, x.month)}</div>` : ''}
      </div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="bills">+ Add bill</button>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--blue)"></span>Everyday spending limits</h2></div>
    <section class="card">
      ${d.categories.map((x, i) => `<div class="set-row">
        <div class="line">${textInput(`categories.${i}.icon`, x.icon, '', 'icon-inp')}${textInput(`categories.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="categories" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="line">${moneyInput(`categories.${i}.limit`, x.limit)}</div>
      </div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="categories">+ Add category</button>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--teal)"></span>Savings goals</h2></div>
    <section class="card">
      ${d.goals.map((x, i) => `<div class="set-row">
        <div class="line">${textInput(`goals.${i}.icon`, x.icon, '', 'icon-inp')}${textInput(`goals.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="goals" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="two"><div><div class="mini">Target</div>${moneyInput(`goals.${i}.target`, x.target)}</div><div><div class="mini">Each month</div>${moneyInput(`goals.${i}.monthly`, x.monthly)}</div></div>
        <div><div class="mini">Already saved before</div>${moneyInput(`goals.${i}.start`, x.start)}</div>
      </div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="goals">+ Add goal</button>
    </section>

    <div class="sec-title"><h2>Payment methods</h2></div>
    <section class="card">
      ${d.methods.map((x, i) => `<div class="set-row"><div class="line">${textInput(`methods.${i}`, x, 'Method')}<button class="x-btn" data-act="rm" data-list="methods" data-i="${i}" aria-label="Remove">×</button></div></div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="methods">+ Add method</button>
    </section>

    <div class="sec-title"><h2>More</h2></div>
    <section class="card">
      <div class="detail" style="font-size:13px;color:var(--muted);font-weight:700">Icons: use any emoji, or type bokx, missy, girl or sky for the family pictures.</div>
      <button class="link-btn" data-act="export">Download all entries (CSV for Excel)</button>
      <button class="link-btn" data-act="clearall" style="color:var(--red)">Clear all entries (${S.tx.length})</button>
      <button class="link-btn" data-act="signout" style="color:var(--red)">Sign out${S.user?.email && !DEMO ? ` (${esc(S.user.email)})` : ''}</button>
    </section>
    <div class="foot">Team SN Home Budget System</div>
  </main>`;
}

function saveBar() {
  return `<div class="save-bar"><span>Unsaved changes</span><button class="ghost" data-act="discard">Undo</button><button data-act="savesettings">Save</button></div>`;
}

function setPath(obj, path, val) {
  const keys = path.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
  o[keys[keys.length - 1]] = val;
}

function newRow(list) {
  return {
    income: { id: uid('inc'), name: '', amount: 0, icon: '💵' },
    bills: { id: uid('bill'), name: '', amount: 0, freq: 'monthly', month: 1, icon: '🧾' },
    categories: { id: uid('cat'), name: '', limit: 0, icon: '🏷️' },
    goals: { id: uid('goal'), name: '', target: 0, monthly: 0, start: 0, icon: '🎯' },
    methods: '',
    pets: { id: uid('pet'), name: '', icon: '🐾' },
  }[list];
}

async function saveSettings() {
  const d = S.draft;
  d.pets = d.pets || [];
  ['income', 'bills', 'categories', 'goals', 'pets'].forEach(k => { d[k] = d[k].filter(x => x.name.trim()); d[k].forEach(x => { x.name = x.name.trim(); x.icon = (x.icon || '').trim() || '•'; }); });
  d.bills.forEach(b => { b.group = (b.group || '').trim(); });
  // Each pet has a food bill in the Pets group; a removed pet takes its bill along.
  const petIds = new Set(d.pets.map(p => p.id));
  d.bills = d.bills.filter(b => !(b.icon || '').startsWith('pet:') || petIds.has(b.icon.slice(4)));
  d.pets.forEach(p => {
    if (!d.bills.some(b => b.icon === 'pet:' + p.id)) {
      d.bills.push({ id: uid('bill'), name: `${p.name}'s Food`, amount: 0, freq: 'monthly', month: 1, icon: 'pet:' + p.id, group: 'Pets' });
    }
  });
  d.methods = d.methods.map(m => m.trim()).filter(Boolean);
  if (!d.methods.length) d.methods = ['Cash'];
  if (!(d.year >= 2000 && d.year <= 2100)) d.year = S.settings.year;
  try {
    await S.be.saveSettings(d);
    S.draft = null;
    toast('Settings saved');
  } catch (e) { toast('Could not save. Check your connection.'); console.error(e); }
}

function exportCsv() {
  const rows = [['Date', 'Type', 'Category', 'Amount (AED)', 'Spent by', 'Paid with', 'Note']];
  S.tx.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
    rows.push([t.date, KIND_LABEL[t.kind], refInfo(t).name, (t.amount / 100).toFixed(2), t.who || '', t.method || '', t.note || '']);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
  a.download = `team-sn-budget-${todayStr()}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------------- events ---------------- */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const a = el.dataset.act;
  if (a === 'search') return;

  switch (a) {
    case 'signin':
      S.loginError = '';
      try { await S.be.signIn(); } catch (err) { showLoginError(err); }
      break;
    case 'signout':
      if (settingsDirty()) S.draft = null;
      await S.be.signOut();
      break;
    case 'setme':
      S.me = el.dataset.p; store.set('tsn-me', S.me); S.keepScroll = true; render();
      break;
    case 'view':
      if (S.view === 'settings' && settingsDirty() && !confirmLeave()) return;
      if (S.view === 'settings') S.draft = null;
      S.view = el.dataset.v; render(); window.scrollTo(0, 0);
      break;
    case 'month': {
      let m = S.m + Number(el.dataset.d), y = S.y;
      if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
      S.m = m; S.y = y; render();
      break;
    }
    case 'year': S.y += Number(el.dataset.d); render(); break;
    case 'add': openSheet({ kind: el.dataset.kind, ref: el.dataset.ref }); break;
    case 'quick': quickAdd(el.dataset.kind, el.dataset.ref); break;
    case 'edit': openSheet({ id: el.dataset.id }); break;
    case 'close': closeSheet(); break;
    case 'kind':
      readSheetInputs();
      if (sheet.kind !== el.dataset.k) { sheet.kind = el.dataset.k; sheet.ref = poolFor(sheet.kind)[0]?.id || null; }
      renderSheet(false);
      break;
    case 'ref':
      readSheetInputs(); sheet.ref = el.dataset.id;
      if (sheet.kind === 'income') { const inc = S.settings.income.find(i => i.id === sheet.ref); if (inc?.icon === 'missy') sheet.who = 'Missy'; if (inc?.icon === 'bokx') sheet.who = 'Bokx'; }
      renderSheet(false);
      break;
    case 'who': readSheetInputs(); sheet.who = el.dataset.p; renderSheet(false); break;
    case 'method': readSheetInputs(); sheet.method = el.dataset.m; renderSheet(false); break;
    case 'save': saveSheet(); break;
    case 'delete': {
      const id = sheet.id;
      if (!confirm('Delete this entry?')) return;
      closeSheet();
      try { await S.be.deleteTx(id); toast('Entry deleted'); } catch { toast('Could not delete. Check your connection.'); }
      break;
    }
    case 'hist':
      S.hist[el.dataset.k] = el.dataset.v; render();
      break;
    case 'addrow': {
      const d = ensureDraft(); d[el.dataset.list].push(newRow(el.dataset.list)); S.keepScroll = true; render();
      const inputs = document.querySelectorAll(`[data-set^="${el.dataset.list}."]`);
      const last = [...inputs].filter(x => !x.classList.contains('icon-inp') && x.tagName === 'INPUT').pop();
      last?.focus();
      break;
    }
    case 'rm': {
      const d = ensureDraft(); d[el.dataset.list].splice(Number(el.dataset.i), 1); S.keepScroll = true; render();
      break;
    }
    case 'discard': S.draft = null; S.keepScroll = true; render(); break;
    case 'savesettings': await saveSettings(); S.keepScroll = true; render(); break;
    case 'export': exportCsv(); break;
    case 'toggle': toggleGroup(el.dataset.g); S.keepScroll = true; render(); break;
    case 'petphoto': S.petIdx = Number(el.dataset.i); $('#petfile')?.click(); break;
    case 'petemoji': {
      const d = ensureDraft(); d.pets[Number(el.dataset.i)].icon = el.dataset.e; S.keepScroll = true; render();
      break;
    }
    case 'clearall': {
      if (!S.tx.length) { toast('There are no entries to clear'); return; }
      const word = prompt(`This deletes all ${S.tx.length} entries for both of you and cannot be undone. Your settings (salaries, bills, limits, goals) stay.\n\nType DELETE to confirm.`);
      if ((word || '').trim().toUpperCase() !== 'DELETE') { toast('Nothing was deleted'); return; }
      try { const n = await S.be.clearTx(); toast(`${n} entries cleared. Fresh start!`); }
      catch (err) { console.error(err); toast('Could not clear. Check your connection.'); }
      break;
    }
  }
});

function confirmLeave() { return confirm('You have unsaved settings. Leave without saving?'); }

document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.act === 'search') {
    S.hist.q = el.value;
    const pos = el.selectionStart;
    render();
    const s = $('.search'); s.focus(); try { s.setSelectionRange(pos, pos); } catch { /* */ }
    return;
  }
  if (el.dataset.set) {
    const d = ensureDraft();
    let v = el.value;
    if (el.dataset.type === 'money') v = toFils(v);
    if (el.dataset.type === 'int') v = parseInt(v, 10) || 0;
    setPath(d, el.dataset.set, v);
    // Show or hide the save bar without redrawing the whole page while typing.
    const bar = $('.save-bar');
    if (settingsDirty() && !bar) $('#app').insertAdjacentHTML('beforeend', saveBar());
    if (!settingsDirty() && bar) bar.remove();
  }
});
function resizeImage(file, size = 160) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const side = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}
document.addEventListener('change', async e => {
  if (e.target.id === 'petfile' && e.target.files?.[0]) {
    try {
      const data = await resizeImage(e.target.files[0]);
      const d = ensureDraft();
      if (d.pets[S.petIdx]) d.pets[S.petIdx].icon = data;
      S.keepScroll = true; render();
    } catch { toast('Could not read that photo'); }
    return;
  }
  // Frequency changes show or hide the month picker.
  if (e.target.dataset.set?.endsWith('.freq')) { S.keepScroll = true; render(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sheet) closeSheet();
  if (e.key === 'Enter' && sheet && (e.target.id === 'amt' || e.target.id === 'note')) { e.preventDefault(); saveSheet(); }
});

/* ---------------- start ---------------- */
function subscribe() {
  S.unsub.forEach(f => f && f());
  S.unsub = [];
  S.loaded = { s: false, t: false };
  const onErr = err => {
    console.error(err);
    if (err?.code === 'permission-denied') {
      S.loginError = `${S.user?.email || 'This account'} doesn't have access to this budget. Sign in with Bokx's or Missy's Google account.`;
      S.be.signOut();
    } else toast('Connection problem. Your changes will sync when you are back online.');
  };
  S.unsub.push(S.be.watchSettings(async s => {
    if (!s) {
      // First ever sign-in: create the starting budget.
      try { await S.be.saveSettings(clone(DEFAULT_SETTINGS)); } catch (e) { onErr(e); }
      return;
    }
    const upgraded = migrate(s);
    if (upgraded) { try { await S.be.saveSettings(upgraded); } catch (e) { onErr(e); } return; }
    const first = !S.loaded.s;
    S.settings = { ...clone(DEFAULT_SETTINGS), ...s };
    S.loaded.s = true;
    if (first) setInitialMonth();
    if (sheet) return;           // don't disturb an open entry form
    if (S.view === 'settings' && S.draft) return;
    S.keepScroll = true; render();
  }, onErr));
  S.unsub.push(S.be.watchTx(list => {
    S.tx = list.filter(t => t && t.date && Number.isFinite(t.amount));
    S.loaded.t = true;
    if (sheet) return;
    if (S.view === 'settings' && S.draft) return;
    S.keepScroll = true; render();
  }, onErr));
}

async function start() {
  try {
    S.be = DEMO ? demoBackend() : await firebaseBackend();
  } catch (e) {
    console.error(e);
    $('#app').innerHTML = `<div class="login"><img class="sky" src="${AVATAR.sky}" alt=""><h1>Can't connect</h1><p>Check your internet connection and reopen the app.</p></div>`;
    return;
  }
  S.be.onAuth(user => {
    S.user = user || null;
    if (user) { S.loginError = ''; subscribe(); }
    else { S.unsub.forEach(f => f && f()); S.unsub = []; S.settings = null; S.tx = []; closeSheet(); }
    render();
  });
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  // When a new version is published, switch to it automatically.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading || sheet) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then(reg => {
      reg.update();
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update(); });
    })
    .catch(() => { /* offline shell is optional */ });
}
start();

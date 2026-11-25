import { FIREBASE_CONFIG } from './firebase-config.js';
import { THEMES, THEME_ORDER, DEFAULT_THEME, applyTheme, motif, bambooEdges } from './themes.js';

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

const PHONE_BILLS = [
  { id: 'bill_du_missy', name: "Missy's du", amount: 15000, freq: 'monthly', month: 1, icon: '📱', group: 'Phone & Internet' },
  { id: 'bill_du_rolly', name: "Rolly's du", amount: 15000, freq: 'monthly', month: 1, icon: '📱', group: 'Phone & Internet' },
  { id: 'bill_eand', name: 'Home Wireless (e&)', amount: 20000, freq: 'monthly', month: 1, icon: '📡', group: 'Phone & Internet' },
];
const PET_TYPES = [
  { name: 'Food', icon: '🍗' },
  { name: 'Cat Litter', icon: '🪣' },
  { name: 'Medical', icon: '💊' },
  { name: 'Grooming', icon: '✂️' },
];
const GROUP_ICON = { 'Insurances': '🛡️', 'Car': '🚗', 'Bokx': 'bokx', 'Missy': 'missy', 'TAQA': '⚡', 'Utilities': '💡', 'Phone & Internet': '📶', 'Pets': '🐾', 'Raye': 'girl', 'Family & Giving': '🤲', 'Allowances': '👛' };

// Bokx's car costs. Amounts start at 0 until they are known.
const CAR_BILLS = [
  { id: 'bill_car_mortgage', name: 'Car Mortgage', amount: 0, freq: 'monthly', month: 1, icon: '🚗', group: 'Car' },
  { id: 'bill_car_maint', name: 'Car Maintenance', amount: 0, freq: 'monthly', month: 1, icon: '🔧', group: 'Car' },
  { id: 'bill_petrol', name: 'Petrol', amount: 0, freq: 'monthly', month: 1, icon: '⛽', group: 'Car' },
  { id: 'bill_car_ins', name: 'Car Insurance (annual)', amount: 0, freq: 'yearly', month: 1, icon: '🛡️', group: 'Car' },
  { id: 'bill_car_reg', name: 'Car Registration/Renewal (annual)', amount: 0, freq: 'yearly', month: 1, icon: '📋', group: 'Car' },
];

// The family's agreed monthly budget (Nov 2026). Amounts are in fils.
const BUDGET_BILLS = [
  { id: 'bill_rent', name: 'Rent', amount: 500000, freq: 'monthly', month: 1, icon: '🏠' },
  { id: 'bill_elec', name: 'Electricity', amount: 60000, freq: 'monthly', month: 1, icon: '💡', group: 'TAQA' },
  { id: 'bill_water', name: 'Water', amount: 15000, freq: 'monthly', month: 1, icon: '💧', group: 'TAQA' },
  { id: 'bill_muni', name: 'Municipality Fee', amount: 25000, freq: 'monthly', month: 1, icon: '🏛️', group: 'TAQA' },
  { id: 'bill_eand', name: 'e& Home Wireless', amount: 23000, freq: 'monthly', month: 1, icon: '📡' },
  { id: 'bill_sunlife', name: 'Sunlife Insurance', amount: 110000, freq: 'monthly', month: 1, icon: '🛡️', group: 'Insurances' },
  { id: 'bill_sss', name: 'SSS (Social Security)', amount: 50000, freq: 'monthly', month: 1, icon: '🪪', group: 'Insurances' },
  { id: 'bill_col', name: 'COL Financial', amount: 0, freq: 'monthly', month: 1, icon: '📈', group: 'Insurances' },
  { id: 'bill_raye_school', name: "Raye's School Fee", amount: 100000, freq: 'monthly', month: 1, icon: '🎒', group: 'Raye' },
  { id: 'bill_raye_piano', name: "Raye's Piano Lesson", amount: 70000, freq: 'monthly', month: 1, icon: '🎹', group: 'Raye' },
  { id: 'bill_raye_taxi', name: 'School Taxi Allowance', amount: 30000, freq: 'monthly', month: 1, icon: '🚕', group: 'Raye', flex: true },
  { id: 'bill_church', name: 'Church Giving', amount: 50000, freq: 'monthly', month: 1, icon: '⛪', group: 'Family & Giving', flex: true },
  { id: 'bill_remit', name: 'Family Remittance', amount: 50000, freq: 'monthly', month: 1, icon: '💸', group: 'Family & Giving', flex: true },
  { id: 'bill_allow_missy', name: 'Missy Allowance', amount: 60000, freq: 'monthly', month: 1, icon: 'missy', group: 'Allowances' },
  { id: 'bill_allow_bokx', name: 'Bokx Allowance', amount: 60000, freq: 'monthly', month: 1, icon: 'bokx', group: 'Allowances' },
  ...CAR_BILLS,
];
const BUDGET_CATS = [
  { id: 'cat_groc', name: 'Groceries', limit: 200000, icon: '🛒' },
  { id: 'cat_pets', name: 'Pets', limit: 30000, icon: '🐾', pets: true },
  { id: 'cat_health', name: "Family's Health", limit: 30000, icon: '🩺' },
  { id: 'cat_lpg', name: 'LPG & Drinking Water', limit: 5000, icon: '🔥', period: 'year', subs: [
    { name: 'Water coupon booklet', icon: '💧', price: 17500 },
    { name: 'LPG tank', icon: '🔥', price: 6500 },
  ] },
  { id: 'cat_misc', name: 'Miscellaneous', limit: 50000, icon: '📦' },
];

// Each of us has Salary, Bonus, Air Ticket Allowance and Leave Credit Conversion.
function personIncome(who, salary) {
  const k = who.toLowerCase();
  return [
    { id: `inc_${k}`, name: `${who} Salary`, amount: salary, icon: k, group: who, who },
    { id: `inc_${k}_bonus`, name: `${who} Bonus`, amount: 0, icon: '🎉', group: who, who },
    { id: `inc_${k}_ticket`, name: `${who} Air Ticket Allowance`, amount: 0, icon: '✈️', group: who, who },
    { id: `inc_${k}_leave`, name: `${who} Leave Credit Conversion`, amount: 0, icon: '🏖️', group: who, who },
  ];
}

const DEFAULT_SETTINGS = {
  year: 2027,
  income: [...personIncome('Bokx', 700000), ...personIncome('Missy', 1200000), { id: 'inc_other', name: 'Other Income', amount: 0, icon: '💵' }],
  bills: BUDGET_BILLS,
  pets: [{ id: 'pet_sky', name: 'Sky', icon: 'sky' }],
  petTypes: PET_TYPES,
  categories: BUDGET_CATS,
  goals: [
    { id: 'goal_family', name: 'Family Savings', target: 0, monthly: 200000, start: 0, icon: '🏦' },
    { id: 'goal_emerg', name: 'Emergency Fund', target: 0, monthly: 0, start: 0, icon: '🛟' },
    { id: 'goal_travel', name: 'Travel', target: 0, monthly: 0, start: 0, icon: '✈️' },
    { id: 'goal_school', name: 'School Savings', target: 0, monthly: 0, start: 0, icon: '🎓' },
  ],
  methods: ['Cash', 'Debit Card', 'Credit Card', 'Google Pay'],
  migrated: ['util-split', 'groups-v1', 'pets-v2', 'budget-v3', 'income-v2', 'savings-v2', 'bills-v4', 'flex-v5'],
};

// One-time updates to a budget that was already set up.
function migrate(s) {
  const done = s.migrated || [];
  if (['util-split', 'groups-v1', 'pets-v2', 'budget-v3', 'income-v2', 'savings-v2', 'bills-v4', 'flex-v5'].every(k => done.includes(k))) return null;
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
  if (!done.includes('pets-v2')) {
    // Pet costs move from fixed bills to one Pets budget in everyday spending.
    const petBills = out.bills.filter(b => (b.icon || '').startsWith('pet:') || b.id === 'bill_sky');
    const budget = sum(petBills, b => b.amount || 0);
    out.bills = out.bills.filter(b => !petBills.includes(b));
    out.categories = out.categories || [];
    if (!out.categories.some(c => c.pets)) {
      const cat = { id: 'cat_pets', name: 'Pets', limit: budget || 15000, icon: '🐾', pets: true };
      const mi = out.categories.findIndex(c => c.id === 'cat_misc');
      mi >= 0 ? out.categories.splice(mi, 0, cat) : out.categories.push(cat);
    }
    if (!out.petTypes || !out.petTypes.length) out.petTypes = clone(PET_TYPES);
    if (!out.pets || !out.pets.length) out.pets = [{ id: 'pet_sky', name: 'Sky', icon: 'sky' }];
  }
  if (!done.includes('budget-v3')) {
    // New family budget: replace bills and spending categories, keep pets and their types.
    out.bills = clone(BUDGET_BILLS);
    out.categories = clone(BUDGET_CATS);
    out.goals = out.goals || [];
    const em = out.goals.find(g => g.id === 'goal_emerg');
    if (em) em.monthly = 200000;
    else out.goals.unshift({ id: 'goal_emerg', name: 'Emergency Fund', target: 0, monthly: 200000, start: 0, icon: '🛟' });
  }
  if (!done.includes('income-v2')) {
    // Group income by person, keeping the salary amounts already set.
    const old = out.income || [];
    const sal = id => old.find(i => i.id === id)?.amount;
    const others = old.filter(i => !['inc_bokx', 'inc_missy', 'inc_bonus'].includes(i.id) && !/^inc_(bokx|missy)_/.test(i.id));
    out.income = [...personIncome('Bokx', sal('inc_bokx') ?? 700000), ...personIncome('Missy', sal('inc_missy') ?? 1200000), ...others];
  }
  if (!done.includes('savings-v2')) {
    // The 2,000 a month goes to Family Savings; Emergency Fund is topped up by hand.
    out.goals = out.goals || [];
    if (!out.goals.some(g => g.id === 'goal_family')) out.goals.unshift({ id: 'goal_family', name: 'Family Savings', target: 0, monthly: 200000, start: 0, icon: '🏦' });
    const em = out.goals.find(g => g.id === 'goal_emerg');
    if (em && em.monthly === 200000) em.monthly = 0;
  }
  if (!done.includes('bills-v4')) {
    // SSS joins Sunlife under Insurances with COL Financial; add the car bills.
    const bills = out.bills;
    const take = id => { const i = bills.findIndex(b => b.id === id); return i >= 0 ? bills.splice(i, 1)[0] : null; };
    const sss = take('bill_sss') || { id: 'bill_sss', name: 'SSS (Social Security)', amount: 50000, freq: 'monthly', month: 1, icon: '🪪' };
    const col = take('bill_col') || { id: 'bill_col', name: 'COL Financial', amount: 0, freq: 'monthly', month: 1, icon: '📈' };
    sss.group = 'Insurances'; col.group = 'Insurances';
    const sun = bills.find(b => b.id === 'bill_sunlife');
    if (sun) { sun.group = 'Insurances'; bills.splice(bills.indexOf(sun) + 1, 0, sss, col); }
    else bills.push(sss, col);
    CAR_BILLS.forEach(c => { if (!bills.some(b => b.id === c.id)) bills.push(clone(c)); });
  }
  if (!done.includes('flex-v5')) {
    // These have a monthly budget but are paid bit by bit.
    out.bills.forEach(b => { if (['bill_raye_taxi', 'bill_church', 'bill_remit'].includes(b.id)) b.flex = true; });
  }
  out.migrated = [...new Set([...done, 'util-split', 'groups-v1', 'pets-v2', 'budget-v3', 'income-v2', 'savings-v2', 'bills-v4', 'flex-v5'])];
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

S.theme = store.get('tsn-theme') || DEFAULT_THEME;
if (!THEMES[S.theme]) S.theme = DEFAULT_THEME;
let T = applyTheme(S.theme);
function updateDeco() { const el = document.getElementById('bg-deco'); if (el) el.innerHTML = S.theme === 'take' ? bambooEdges() : ''; }
updateDeco();
function setTheme(k) {
  if (!THEMES[k]) return;
  S.theme = k; store.set('tsn-theme', k);
  T = applyTheme(k); updateDeco();
  S.keepScroll = true; render();
}

// The app always opens on the current month.
function setInitialMonth() {
  const d = new Date();
  S.y = d.getFullYear(); S.m = d.getMonth() + 1;
  S.openedYm = ym(S.y, S.m);
}
// If the app is left open into a new month, jump to it when it comes back on screen.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !S.settings) return;
  const d = new Date();
  if (ym(d.getFullYear(), d.getMonth() + 1) !== S.openedYm && !sheet) { setInitialMonth(); S.keepScroll = true; render(); }
});

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
  else if (S.view === 'savings') body = savingsView();
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
    <div class="motif">${motif(S.theme)}</div>
    <div class="hero-top">
      <div class="brand-wrap"><span class="hanko">家計簿</span><div><div class="hello">${hi}</div><div class="brand">${esc(title)}</div></div></div>
      ${familyStrip()}
    </div>
    ${withMonth === 'month' ? `<div class="month-switch">
      <button data-act="month" data-d="-1" aria-label="Previous month">‹</button>
      <div class="label">${MONTHS[S.m - 1]} ${S.y}</div>
      <button data-act="month" data-d="1" aria-label="Next month">›</button>
    </div>` : withMonth === 'year' ? `${S.view === 'year' ? reportTabs() : ''}<div class="month-switch" style="margin-top:10px">
      <button data-act="year" data-d="-1" aria-label="Previous year">‹</button>
      <div class="label">${S.y}</div>
      <button data-act="year" data-d="1" aria-label="Next year">›</button>
    </div>` : withMonth === 'tabs' ? reportTabs() : '<div style="height:18px"></div>'}
  </header>`;
}

function navView() {
  const b = (v, ic, label) => `<button data-act="view" data-v="${v}" class="${S.view === v ? 'on' : ''}">${ICONS[ic]}${label}</button>`;
  return `<nav class="nav">
    ${b('home', 'home', 'Home')}<button data-act="view" data-v="${S.reportTab || 'savings'}" class="${S.view === 'year' || S.view === 'savings' ? 'on' : ''}">${ICONS.year}Reports</button>
    <div><button class="add" data-act="add" aria-label="Add entry">${ICONS.plus}</button></div>
    ${b('history', 'list', 'History')}${b('settings', 'gear', 'Settings')}
  </nav>`;
}

/* ---------------- login / who am I ---------------- */
function loginView() {
  return `<div class="login">
    <img class="logo" src="img/logo.png" alt="Bokx and Missy">
    <h1>Team SN</h1>
    <div class="kakeibo">家計簿 · Home Budget System</div>
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
  return `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${r}" fill="none" stroke="${T.track}" stroke-width="9"/>
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c * p} ${c}"/></svg>`;
}
function barClass(p) { return p > 1 ? 'over' : p >= 0.8 ? 'warn' : ''; }

function homeView() {
  const st = monthStats(S.y, S.m);
  const pct = st.spendPlan ? st.spent / st.spendPlan : 0;
  const ringColor = pct > 1 ? '#C2405A' : pct >= 0.8 ? '#E6B53C' : T.primary;
  const visibleBills = st.bills.filter(b => b.plan > 0 || b.paid > 0 || !b.amount);
  const hiddenBills = st.bills.length - visibleBills.length;
  const unpaid = visibleBills.filter(b => b.plan > 0 && !b.flex && (b.status === 'due' || b.status === 'part')).length;
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

    <div class="sec-title"><h2><span class="dot" style="background:var(--green)"></span>Income <span class="jp">収入</span></h2><span class="meta num">${money(st.incomeGot)} of ${money(st.incomePlan)}</span></div>
    <section class="card">
      ${billGroups(st.income).map(g => g.single ? incomeRow(g.single) : incomeGroupRow(g)).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple)"></span>Bills <span class="jp">固定費</span></h2><span class="meta">${unpaid ? `${unpaid} to pay` : visibleBills.length ? 'All paid 🎉' : ''}</span></div>
    <section class="card">
      ${billGroups(visibleBills).map(g => g.single ? billRow(g.single) : billGroupRow(g)).join('') || '<div class="empty">No bills this month.</div>'}
      ${hiddenBills ? `<div class="detail" style="font-size:12.5px;color:var(--muted);font-weight:700;padding-top:8px">${hiddenBills} yearly bill${hiddenBills > 1 ? 's' : ''} not due this month. <button data-act="add" data-kind="bill" style="color:var(--purple);font-weight:900">Log a payment</button></div>` : ''}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--blue)"></span>Everyday spending <span class="jp">生活費</span></h2><span class="meta num">${money(st.expenses)} of ${money(sum(st.cats, c => c.limit))}</span></div>
    <section class="card">
      ${st.cats.map(c => catRow(c, st.list)).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--teal)"></span>Savings <span class="jp">貯金</span></h2><span class="meta num">${money(st.saved)} this month</span></div>
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
          ${g.monthly && g.saved < g.monthly ? `<button class="act soft" data-act="quick" data-kind="saving" data-ref="${g.id}">Save</button>` : g.monthly ? `<span class="pill paid">Done</span>` : `<button class="act soft" data-act="add" data-kind="saving" data-ref="${g.id}">Add</button>`}
        </div>`;
      }).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple-m)"></span>Who spent <span class="jp">誰が</span></h2></div>
    <section class="card">
      <div class="who-grid">
        ${st.who.map(w => `<div class="who"><div class="av ${w.p === 'Joint' ? 'joint' : ''}">${w.p === 'Joint' ? '2' : personAv(w.p)}</div><b>${w.p}</b><span class="num">${money(w.v)}</span></div>`).join('')}
      </div>
      <div class="chips-stat">${st.methods.map(x => `<div class="chip-stat">${esc(x.mm)}<b class="num">${money(x.v)}</b></div>`).join('')}</div>
    </section>
    <div class="foot">${DEMO ? 'Preview mode · entries stay on this device' : 'Synced for Bokx & Missy'}</div>
  </main>`;
}

function incomeAction(i) {
  return i.got > 0
    ? `<div class="amt num" style="color:var(--green)">${money(i.got)}<small>received</small></div>`
    : i.amount > 0 ? `<button class="act green" data-act="quick" data-kind="income" data-ref="${i.id}">Mark received</button>`
    : `<button class="act soft" data-act="add" data-kind="income" data-ref="${i.id}">Add</button>`;
}
function incomeRow(i, sub = false, group = '') {
  return `<div class="row ${sub ? 'sub-row' : ''}">
    ${icon(i.icon)}
    <div class="main"><div class="name">${esc(shortName(i.name, group))}</div><div class="detail num">${i.amount ? `Planned ${money(i.amount)}` : 'When received'}</div></div>
    ${incomeAction(i)}
  </div>`;
}
function incomeGroupRow(g) {
  const key = 'inc:' + g.name, open = openGroups.has(key);
  const plan = sum(g.items, i => i.amount), got = sum(g.items, i => i.got);
  // The salary (the planned item) gets its button right on the group line.
  const main = g.items.find(i => i.amount > 0);
  const right = main && !main.got ? incomeAction(main)
    : got > 0 ? `<div class="amt num" style="color:var(--green)">${money(got)}<small>received</small></div>` : '';
  return `<div class="row grp" data-act="toggle" data-g="${esc(key)}" role="button" aria-expanded="${open}">
    ${icon(groupIcon(g))}
    <div class="main"><div class="name">${esc(g.name)}</div>
      <div class="detail num">Planned ${money(plan)}</div></div>
    ${right}${chev(open)}
  </div>
  ${open ? `<div class="grp-items">${g.items.map(i => incomeRow(i, true, g.name)).join('')}</div>` : ''}`;
}
function flexRow(b, sub) {
  const p = b.plan ? b.paid / b.plan : (b.paid ? 2 : 0);
  const left = b.plan - b.paid;
  return `<div class="row ${sub ? 'sub-row' : ''}">
    ${icon(b.icon)}
    <div class="main"><div class="name">${esc(b.name)}</div>
      <div class="bar ${barClass(p)}"><i style="width:${Math.min(p, 1) * 100}%"></i></div>
      <div class="cat-line num"><span>${money(b.paid, { noCur: true })} of ${money(b.plan, { noCur: true })}</span><span class="${left < 0 ? 'over' : ''}">${left < 0 ? `${money(-left, { noCur: true })} over` : `${money(left, { noCur: true })} left`}</span></div></div>
    <button class="act soft plus" data-act="add" data-kind="bill" data-ref="${b.id}" aria-label="Add amount">+</button>
  </div>`;
}
function billRow(b, sub = false) {
  if (b.flex && b.plan) return flexRow(b, sub);
  return `<div class="row ${sub ? 'sub-row' : ''}">
    ${icon(b.icon)}
    <div class="main"><div class="name">${esc(b.name)}</div>
      <div class="detail num">${!b.plan ? (b.freq === 'yearly' ? 'Yearly · amount not set' : 'Add when paid') : b.freq === 'split' ? `${money(b.plan)} monthly share` : money(b.plan)}${b.plan && b.paid && b.paid !== b.plan ? ` · paid ${money(b.paid)}` : ''}</div></div>
    ${!b.plan ? (b.paid ? `<div class="amt num">${money(b.paid)}<small>this month</small></div><button class="act soft plus" data-act="add" data-kind="bill" data-ref="${b.id}" aria-label="Add more">+</button>` : `<button class="act soft" data-act="add" data-kind="bill" data-ref="${b.id}">Add</button>`)
      : b.status === 'paid' ? `<span class="pill paid">Paid</span>`
      : `<button class="act" data-act="quick" data-kind="bill" data-ref="${b.id}">Pay</button>`}
  </div>`;
}
function billGroupRow(g) {
  const open = openGroups.has(g.name);
  const plan = sum(g.items, b => b.plan), paid = sum(g.items, b => b.paid);
  const planned = g.items.filter(b => b.plan > 0 && !b.flex);
  const flex = g.items.filter(b => b.plan > 0 && b.flex);
  const nPaid = planned.filter(b => b.status === 'paid').length, n = planned.length;
  const flexLeft = sum(flex, b => b.plan - b.paid);
  const pill = !n && flex.length ? `<span class="pill ${flexLeft < 0 ? 'due' : 'paid'}">${flexLeft < 0 ? `${money(-flexLeft, { noCur: true })} over` : `${money(flexLeft, { noCur: true })} left`}</span>`
    : !n ? (paid ? `<span class="pill paid">${money(paid, { noCur: true })}</span>` : '')
    : nPaid === n ? `<span class="pill paid">Paid</span>`
    : nPaid > 0 || paid > 0 ? `<span class="pill part">${nPaid}/${n} paid</span>`
    : `<span class="pill due">${n} to pay</span>`;
  return `<div class="row grp" data-act="toggle" data-g="${esc(g.name)}" role="button" aria-expanded="${open}">
    ${icon(groupIcon(g))}
    <div class="main"><div class="name">${esc(g.name)}</div>
      <div class="detail num">${g.items.length} item${g.items.length > 1 ? 's' : ''}${plan ? ` · ${money(plan)}` : ''}${paid && paid !== plan ? ` · paid ${money(paid)}` : ''}</div></div>
    ${pill}${chev(open)}
  </div>
  ${open ? `<div class="grp-items">${g.items.map(b => billRow(b, true)).join('')}</div>` : ''}`;
}

function petIcon(petId) { return petId ? 'pet:' + petId : '🐾'; }
function catRow(c, list) {
  const st = S.settings;
  const yearly = c.period === 'year';
  const subs = c.pets ? (st.petTypes || []) : (c.subs || []);
  const expandable = c.pets || subs.length > 0;
  const items = list.filter(t => t.kind === 'expense' && t.ref === c.id);
  let spent = c.spent, limit = c.limit;
  if (yearly) {
    spent = sum(txOfYear(S.y).filter(t => t.kind === 'expense' && t.ref === c.id), t => t.amount);
    limit = c.limit * 12;
  }
  const p = limit ? spent / limit : (spent ? 2 : 0);
  const key = 'cat:' + c.id, open = expandable && openGroups.has(key);
  const pets = c.pets ? (st.pets || []) : [];
  const head = `${icon(pets.length === 1 ? petIcon(pets[0].id) : c.icon)}
    <div class="main">
      <div class="name">${esc(c.name)}${pets.length ? ` <span class="name-sub">${esc(pets.map(x => x.name).join(', '))}</span>` : ''}${yearly ? '<span class="year-note">yearly</span>' : ''}</div>
      <div class="bar ${barClass(p)}"><i style="width:${Math.min(p, 1) * 100}%"></i></div>
      <div class="cat-line num"><span>${yearly ? `${money(spent)} this year` : `${money(spent)} spent`}</span><span class="${limit - spent < 0 ? 'over' : ''}">${limit - spent < 0 ? `${money(spent - limit)} over` : `${money(limit - spent)} left`}</span></div>
    </div>`;
  if (!expandable) return `<div class="row" data-act="add" data-kind="expense" data-ref="${c.id}" style="cursor:pointer">${head}</div>`;
  const types = subs.map(pt => ({ ...pt, v: sum(items.filter(t => t.sub === pt.name), t => t.amount) }));
  const other = sum(items.filter(t => !subs.some(pt => pt.name === t.sub)), t => t.amount);
  const perPet = pets.map(pt => ({ ...pt, v: sum(items.filter(t => t.pet === pt.id), t => t.amount) }));
  return `<div class="row grp" data-act="toggle" data-g="${esc(key)}" role="button" aria-expanded="${open}">${head}${chev(open)}</div>
  ${open ? `<div class="grp-items">
    ${types.map(t => `<div class="row sub-row" data-act="add" data-kind="expense" data-ref="${c.id}" data-sub="${esc(t.name)}" style="cursor:pointer">
      ${icon(t.icon)}<div class="main"><div class="name">${esc(t.name)}</div>${t.price ? `<div class="detail num">${money(t.price)} each</div>` : ''}</div>
      <div class="amt num">${money(t.v)}<small>this month</small></div></div>`).join('')}
    ${other ? `<div class="row sub-row">${icon('•')}<div class="main"><div class="name">Other</div></div><div class="amt num">${money(other)}</div></div>` : ''}
    ${pets.length > 1 ? `<div class="pet-split">${perPet.map(x => `<span>${smallIcon(petIcon(x.id))}${esc(x.name)} <b class="num">${money(x.v)}</b></span>`).join('')}</div>` : ''}
    <button class="act soft pet-add" data-act="add" data-kind="expense" data-ref="${c.id}">+ Add ${c.pets ? 'pet expense' : 'entry'}</button>
  </div>` : ''}`;
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
    g += `<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="${T.line}"/><text x="${pl - 5}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="${T.muted}" font-weight="700">${short(v)}</text>`;
  }
  months.forEach((x, i) => {
    const cx = pl + cw * i + cw / 2;
    const ih = y(0) - y(x.inc), oh = y(0) - y(x.out), sh = y(0) - y(x.sav);
    g += `<rect x="${cx - bw - 1}" y="${y(x.inc)}" width="${bw}" height="${Math.max(ih, 0)}" rx="3" fill="${T.income}"/>`;
    g += `<rect x="${cx + 1}" y="${y(x.out)}" width="${bw}" height="${Math.max(oh, 0)}" rx="3" fill="${T.spend}"/>`;
    g += `<rect x="${cx + 1}" y="${y(x.out) - sh}" width="${bw}" height="${Math.max(sh, 0)}" rx="3" fill="${T.save}" opacity=".75"/>`;
    g += `<text x="${cx}" y="${H - 6}" text-anchor="middle" font-size="9.5" fill="${i + 1 === S.m ? T.primary : T.muted}" font-weight="800">${MON[i][0]}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Income and spending by month">${g}</svg>
    <div class="legend"><span><i style="background:${T.income}"></i>Income</span><span><i style="background:${T.spend}"></i>Spent</span><span><i style="background:${T.save};opacity:.75"></i>Saved</span></div>`;
}

function donut(items, emptyText = 'Nothing spent yet this year.', center = 'TOTAL') {
  const total = sum(items, x => x.v);
  if (!total) return `<div class="empty"><img src="${AVATAR.sky}" alt="">${esc(emptyText)}</div>`;
  const r = 50, c = 2 * Math.PI * r;
  let off = 0, arcs = '';
  items.forEach((x, i) => {
    if (!x.v) return;
    const len = c * x.v / total;
    arcs += `<circle cx="70" cy="70" r="${r}" fill="none" stroke="${T.pie[i % T.pie.length]}" stroke-width="22" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;
    off += len;
  });
  return `<div class="donut-wrap">
    <svg viewBox="0 0 140 140">${arcs}<text x="70" y="66" text-anchor="middle" font-size="10" fill="${T.muted}" font-weight="800">${esc(center)}</text><text x="70" y="82" text-anchor="middle" font-size="14" fill="${T.ink}" font-weight="900">${short(total)}</text></svg>
    <div class="donut-legend">${items.map((x, i) => x.v ? `<div><i style="background:${T.pie[i % T.pie.length]}"></i><span>${esc(x.name)}</span><b class="num">${Math.round(x.v / total * 100)}%</b></div>` : '').join('')}</div>
  </div>`;
}

/* ---------------- SAVINGS REPORT ---------------- */
function reportTabs() {
  const t = S.view === 'year' ? 'year' : 'savings';
  return `<div class="report-tabs">
    <button data-act="view" data-v="savings" class="${t === 'savings' ? 'on' : ''}">Savings 貯金</button>
    <button data-act="view" data-v="year" class="${t === 'year' ? 'on' : ''}">Year overview 年間</button>
  </div>`;
}

// Months from the first entry up to this month.
function trackedMonths() {
  const d = new Date(), cur = { y: d.getFullYear(), m: d.getMonth() + 1 };
  const dates = S.tx.map(t => t.date).filter(Boolean).sort();
  let y = cur.y, m = cur.m;
  if (dates.length) { y = Number(dates[0].slice(0, 4)); m = Number(dates[0].slice(5, 7)); }
  if (y * 12 + m > cur.y * 12 + cur.m) { y = cur.y; m = cur.m; }
  const out = [];
  while (y * 12 + m <= cur.y * 12 + cur.m) {
    out.push({ y, m, current: y === cur.y && m === cur.m });
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

// Budget vs actual for each area over a set of months. Bills not yet paid in the
// running month are left out, so an unpaid bill never looks like a saving.
function areaResults(months) {
  const st = S.settings;
  const rows = [];
  const billKey = b => (b.group || '').trim() || b.id;
  const groups = {};
  st.bills.forEach(b => {
    let plan = 0, actual = 0;
    months.forEach(({ y, m, current }) => {
      const p = billPlan(b, m);
      const a = sum(txOfMonth(y, m).filter(t => t.kind === 'bill' && t.ref === b.id), t => t.amount);
      if (current && a === 0 && !b.flex) return;
      plan += p; actual += a;
    });
    const k = billKey(b);
    if (!groups[k]) {
      groups[k] = { name: (b.group || '').trim() || b.name, icon: (b.group || '').trim() ? (GROUP_ICON[b.group] || b.icon) : b.icon, plan: 0, actual: 0, type: 'Bill' };
      rows.push(groups[k]);
    }
    groups[k].plan += plan; groups[k].actual += actual;
  });
  st.categories.forEach(c => {
    let plan = 0, actual = 0;
    months.forEach(({ y, m }) => {
      plan += c.limit;
      actual += sum(txOfMonth(y, m).filter(t => t.kind === 'expense' && t.ref === c.id), t => t.amount);
    });
    rows.push({ name: c.name, icon: c.icon, plan, actual, type: c.period === 'year' ? 'Spread over the year' : 'Everyday' });
  });
  return rows.filter(r => r.plan || r.actual).map(r => ({ ...r, diff: r.plan - r.actual }));
}

function savingsChart(series) {
  const W = 340, H = 200, pl = 40, pr = 8, pb = 24, pt = 12;
  const vals = series.flatMap(x => [x.net, x.run, 0]);
  let max = Math.max(...vals), min = Math.min(...vals);
  if (max === min) max = min + 100000;
  const span = max - min, step = Math.pow(10, Math.floor(Math.log10(span / 3 || 1)));
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const y = v => pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo || 1));
  const n = series.length, cw = (W - pl - pr) / Math.max(n, 1), bw = Math.min(cw * 0.5, 26);
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const v = lo + (hi - lo) * i / 4;
    g += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="${T.line}"/><text x="${pl - 5}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="${T.muted}" font-weight="700">${short(v)}</text>`;
  }
  g += `<line x1="${pl}" x2="${W - pr}" y1="${y(0)}" y2="${y(0)}" stroke="${T.muted}" stroke-width="1" opacity=".6"/>`;
  const pts = [];
  series.forEach((x, i) => {
    const cx = pl + cw * i + cw / 2;
    const top = Math.min(y(x.net), y(0)), h = Math.abs(y(x.net) - y(0));
    g += `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${Math.max(h, 1)}" rx="3" fill="${x.net < 0 ? '#C2405A' : T.income}" opacity="${x.current ? 0.55 : 0.9}"/>`;
    const lbl = n > 8 ? MON[x.m - 1][0] : MON[x.m - 1];
    g += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="9.5" fill="${x.current ? T.primary : T.muted}" font-weight="800">${lbl}</text>`;
    pts.push([cx, y(x.run)]);
  });
  if (pts.length > 1) g += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${T.save}" stroke-width="2.5" stroke-linejoin="round"/>`;
  pts.forEach(([cx, cy]) => { g += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#fff" stroke="${T.save}" stroke-width="2"/>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Saved each month and running total">${g}</svg>
    <div class="legend"><span><i style="background:${T.income}"></i>Saved that month</span><span><i style="background:${T.save};height:3px;border-radius:2px;vertical-align:3px"></i>Running total</span></div>`;
}

function savingsView() {
  S.reportTab = 'savings';
  const st = S.settings;
  const months = trackedMonths();
  let run = 0;
  const series = months.map(mm => {
    const s = monthStats(mm.y, mm.m);
    const net = s.incomeGot - s.spent;
    run += net;
    const toGoals = s.saved, plan = sum(st.goals, g => g.monthly);
    return { ...mm, inc: s.incomeGot, spent: s.spent, net, run, toGoals, plan, rate: s.incomeGot ? net / s.incomeGot : 0 };
  });
  const cur = series[series.length - 1];
  const done = series.filter(x => !x.current);
  const avg = done.length ? sum(done, x => x.net) / done.length : (cur ? cur.net : 0);
  const totalInc = sum(series, x => x.inc);
  const rate = totalInc ? run / totalInc : 0;

  // goals: running balances
  const goals = st.goals.map(g => ({ ...g, bal: g.start + sum(S.tx.filter(t => t.kind === 'saving' && t.ref === g.id), t => t.amount) }));
  const goalTotal = sum(goals, g => g.bal);

  // areas: pick the period
  const hasDone = done.some(x => x.inc || x.spent);
  if (!S.areaScope) S.areaScope = hasDone ? 'last' : 'cur';
  const scopeMonths = S.areaScope === 'cur' ? series.filter(x => x.current)
    : S.areaScope === 'last' ? done.slice(-1) : done;
  const areas = areaResults(scopeMonths);
  const under = areas.filter(a => a.diff > 0).sort((a, b) => b.diff - a.diff);
  const over = areas.filter(a => a.diff < 0).sort((a, b) => a.diff - b.diff);
  const onTarget = areas.filter(a => a.diff === 0 && a.plan);
  const scopeLabel = S.areaScope === 'cur' ? `${MONTHS[cur.m - 1]} so far` : S.areaScope === 'last' ? (done.length ? `${MONTHS[done[done.length - 1].m - 1]} ${done[done.length - 1].y}` : 'Last month') : (done.length ? `${MON[done[0].m - 1]} ${done[0].y} – ${MON[done[done.length - 1].m - 1]} ${done[done.length - 1].y}` : 'All finished months');
  const maxDiff = Math.max(1, ...areas.map(a => Math.abs(a.diff)));
  const chip = (v, label) => `<button class="fchip ${S.areaScope === v ? 'on' : ''}" data-act="areascope" data-v="${v}">${label}</button>`;
  const areaRow = (a, good) => `<div class="row">
      ${icon(a.icon)}
      <div class="main"><div class="name">${esc(a.name)}</div>
        <div class="bar ${good ? '' : 'over'}"><i style="width:${Math.abs(a.diff) / maxDiff * 100}%"></i></div>
        <div class="cat-line num"><span>${a.type === 'Bill' && a.actual === 0 ? `Nothing paid of ${money(a.plan)} · not logged yet?` : `Spent ${money(a.actual)} of ${money(a.plan)}`}${a.type === 'Spread over the year' ? ' · bought every few months' : ''}</span></div></div>
      <div class="amt num" style="color:${good ? 'var(--green)' : 'var(--red)'}">${good ? '+' : '−'}${money(Math.abs(a.diff), { noCur: true })}<small>${good ? 'saved' : 'over'}</small></div>
    </div>`;

  return hero('Savings', 'tabs') + `<main>
    <section class="card summary">
      <div class="summary-top">
        <div class="left">
          <div class="lbl">Total saved so far</div>
          <div class="big num ${run < 0 ? 'neg' : ''}">${money(run)}</div>
          <div class="sub">Since ${MONTHS[series[0].m - 1]} ${series[0].y} · money in minus money spent</div>
        </div>
        <div class="ring">${ring(rate / 0.25, T.save)}<div class="c"><b>${Math.round(rate * 100)}%</b><span>of income</span></div></div>
      </div>
      <div class="kpis">
        <div class="kpi in"><div class="k">This month</div><div class="v num">${money(cur.net, { noCur: true })}</div></div>
        <div class="kpi out"><div class="k">Average</div><div class="v num">${money(Math.round(avg), { noCur: true })}</div></div>
        <div class="kpi sv"><div class="k">In goals</div><div class="v num">${money(goalTotal, { noCur: true })}</div></div>
      </div>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--green)"></span>Saved each month <span class="jp">月別</span></h2><span class="meta">AED</span></div>
    <section class="card">${savingsChart(series)}</section>

    <section class="card" style="padding:6px 16px">
      ${series.slice().reverse().map(x => `<div class="row">
        <div class="month-chip ${x.current ? 'cur' : ''}"><b>${MON[x.m - 1]}</b><span>${x.y}</span></div>
        <div class="main">
          <div class="name num" style="color:${x.net < 0 ? 'var(--red)' : 'var(--green)'}">${money(x.net)}${x.current ? ' <span class="name-sub">so far</span>' : ''}</div>
          <div class="detail num">In ${money(x.inc, { noCur: true })} · spent ${money(x.spent, { noCur: true })} · ${Math.round(x.rate * 100)}%</div>
        </div>
        <div class="amt num">${money(x.run, { noCur: true })}<small>running total</small></div>
      </div>`).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--teal)"></span>Savings goals <span class="jp">貯金</span></h2><span class="meta num">${money(goalTotal)}</span></div>
    <section class="card">
      ${donut(goals.map(g => ({ name: g.name, v: Math.max(g.bal, 0) })), 'No money in savings goals yet.', 'SAVED')}
      <div style="margin-top:10px">${goals.map(g => {
        const monthIn = sum(txOfMonth(cur.y, cur.m).filter(t => t.kind === 'saving' && t.ref === g.id), t => t.amount);
        return `<div class="row">${icon(g.icon)}<div class="main"><div class="name">${esc(g.name)}</div>
          <div class="detail num">${g.monthly ? `This month ${money(monthIn)} of ${money(g.monthly)}` : `This month ${money(monthIn)}`}${g.target ? ` · target ${money(g.target)}` : ''}</div>
          ${g.target ? `<div class="bar teal"><i style="width:${Math.min(g.bal / g.target, 1) * 100}%"></i></div>` : ''}</div>
          <div class="amt num" style="color:var(--teal)">${money(g.bal, { noCur: true })}<small>balance</small></div></div>`;
      }).join('')}</div>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--blue)"></span>Where you saved <span class="jp">予算</span></h2></div>
    <div class="filters">${chip('cur', 'This month so far')}${done.length ? chip('last', 'Last month') + chip('all', 'All months') : ''}</div>
    <section class="card summary" style="padding:14px 16px">
      <div class="lbl">${esc(scopeLabel)}</div>
      <div class="kpis" style="margin-top:8px">
        <div class="kpi in"><div class="k">Under budget</div><div class="v num">${money(sum(under, a => a.diff), { noCur: true })}</div></div>
        <div class="kpi out" style="background:var(--red-l);color:var(--red)"><div class="k">Over budget</div><div class="v num">${money(-sum(over, a => a.diff), { noCur: true })}</div></div>
        <div class="kpi sv"><div class="k">On budget</div><div class="v num">${onTarget.length}</div></div>
      </div>
      ${S.areaScope === 'cur' ? '<div class="detail" style="font-size:12px;color:var(--muted);font-weight:700;margin-top:10px">The month isn’t over, so spending limits still have room. Bills count once they are paid.</div>' : ''}
    </section>
    ${under.length ? `<section class="card">
      <div class="area-head good">Did well 👏</div>
      ${donut(under.map(a => ({ name: a.name, v: a.diff })), '', 'SAVED')}
      <div style="margin-top:6px">${under.map(a => areaRow(a, true)).join('')}</div>
    </section>` : ''}
    ${over.length ? `<section class="card"><div class="area-head bad">Went over</div>${over.map(a => areaRow(a, false)).join('')}</section>` : ''}
    ${!under.length && !over.length ? `<section class="card"><div class="empty"><img src="${AVATAR.sky}" alt="">Nothing to compare yet. Add some entries first.</div></section>` : ''}
    <div class="foot">Saved = money in minus bills and spending. Money moved into savings goals counts as saved.</div>
  </main>`;
}

function yearView() {
  S.reportTab = 'year';
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
        <div class="ring">${ring(rate / 0.2, T.save)}<div class="c"><b>${Math.round(rate * 100)}%</b><span>saved</span></div></div>
      </div>
      <div class="kpis">
        <div class="kpi in"><div class="k">Income</div><div class="v num">${short(inc)}</div></div>
        <div class="kpi out"><div class="k">Spent</div><div class="v num">${short(out)}</div></div>
        <div class="kpi sv"><div class="k">Saved</div><div class="v num">${short(sav)}</div></div>
      </div>
    </section>

    <div class="sec-title"><h2>Month by month <span class="jp">月別</span></h2><span class="meta">AED</span></div>
    <section class="card">${barChart(months)}</section>

    <div class="sec-title"><h2>Where the money went <span class="jp">内訳</span></h2></div>
    <section class="card">${donut(cats)}</section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--blue)"></span>Spending limits for the year <span class="jp">予算</span></h2></div>
    <section class="card">
      ${cats.map(c => {
        const p = c.lim ? c.v / c.lim : (c.v ? 2 : 0);
        return `<div class="row">${icon(c.icon)}<div class="main"><div class="name">${esc(c.name)}</div>
          <div class="bar ${barClass(p)}"><i style="width:${Math.min(p, 1) * 100}%"></i></div>
          <div class="cat-line num"><span>${money(c.v)}</span><span>of ${money(c.lim)}</span></div></div></div>`;
      }).join('')}
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple)"></span>Bills paid this year <span class="jp">年間</span></h2></div>
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

    <div class="sec-title"><h2>Who spent <span class="jp">誰が</span></h2></div>
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
  if (t.kind === 'expense' && (item?.pets || t.pet)) {
    const pet = (st.pets || []).find(x => x.id === t.pet);
    const petName = pet?.name || t.petName || '';
    return { name: [petName, t.sub].filter(Boolean).join(' · ') || item?.name || 'Pets', icon: pet ? petIcon(pet.id) : '🐾' };
  }
  const base = item?.name || t.refName || 'Removed item';
  if (t.kind === 'expense' && t.sub) {
    const sb = (item?.subs || []).find(x => x.name === t.sub);
    return { name: `${base} · ${t.sub}`, icon: sb?.icon || item?.icon || t.refIcon || '•' };
  }
  return { name: base, icon: item?.icon || t.refIcon || '•' };
}

function historyView() {
  const h = S.hist;
  let list = h.scope === 'month' ? txOfMonth(S.y, S.m) : S.tx.slice();
  if (h.who !== 'all') list = list.filter(t => t.who === h.who);
  const q = h.q.trim().toLowerCase();
  if (q) list = list.filter(t => (refInfo(t).name + ' ' + (t.sub ? 'pets ' : '') + (t.note || '') + ' ' + (t.method || '')).toLowerCase().includes(q));
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
    sheet = { id: t.id, kind: t.kind, ref: t.ref, amount: filsToInput(t.amount), who: t.who, method: t.method || st.methods[0], date: t.date, note: t.note || '', pet: t.pet || null, sub: t.sub || null };
  } else {
    const kind = opts.kind || 'expense';
    sheet = { id: null, kind, ref: opts.ref || null, amount: '', who: S.me || 'Bokx', method: store.get('tsn-method') || st.methods[1] || st.methods[0], date: defaultDate(), note: '' };
    if (!sheet.ref) sheet.ref = poolFor(kind)[0]?.id || null;
    if (kind === 'income') { const w = incomeWho(st.income.find(i => i.id === sheet.ref)); if (w) sheet.who = w; }
    sheet.sub = opts.sub || null;
    const qs = catSubs(sheet.ref).find(x => x.name === sheet.sub);
    if (kind === 'expense' && qs?.price) sheet.amount = filsToInput(qs.price);
  }
  fillPetDefaults();
  renderSheet(true);
}
function catSubs(ref) { const c = S.settings.categories.find(x => x.id === ref); return c && !c.pets ? (c.subs || []) : []; }
function incomeWho(inc) {
  if (!inc) return null;
  if (inc.who) return inc.who;
  if (inc.icon === 'bokx' || inc.group === 'Bokx') return 'Bokx';
  if (inc.icon === 'missy' || inc.group === 'Missy') return 'Missy';
  return null;
}
// Inside a group, "Bokx Bonus" reads as just "Bonus".
const shortName = (name, group) => group && name.startsWith(group + ' ') ? name.slice(group.length + 1) : name;
function isPetCat(ref) { return !!S.settings.categories.find(c => c.id === ref)?.pets; }
function fillPetDefaults() {
  if (!sheet || sheet.kind !== 'expense' || !isPetCat(sheet.ref)) return;
  const st = S.settings;
  if (!sheet.pet || !(st.pets || []).some(p => p.id === sheet.pet)) sheet.pet = st.pets?.[0]?.id || null;
  if (!sheet.sub) sheet.sub = st.petTypes?.[0]?.name || null;
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
      if (sheet.kind !== 'bill' && sheet.kind !== 'income') return `<div class="pick">${pool.map(chip).join('')}</div>`;
      const groups = billGroups(pool);
      const singles = groups.filter(g => g.single).map(g => g.single);
      return `<div class="pick">${singles.map(chip).join('')}</div>` +
        groups.filter(g => !g.single).map(g => `<div class="pick-group">${esc(g.name)}</div><div class="pick">${g.items.map(x => chip({ ...x, name: shortName(x.name, g.name) })).join('')}</div>`).join('');
    })()}
    ${sheet.kind === 'expense' && isPetCat(sheet.ref) ? `
      ${(st.pets || []).length > 1 ? `<div class="field-label">Which pet</div>
      <div class="pick">${st.pets.map(pt => `<button data-act="pet" data-id="${pt.id}" class="${sheet.pet === pt.id ? 'on' : ''}">${smallIcon(petIcon(pt.id))}${esc(pt.name)}</button>`).join('')}</div>` : ''}
      <div class="field-label">${(st.pets || []).length === 1 ? `For ${esc(st.pets[0].name)}` : 'Type'}</div>
      <div class="pick">${(st.petTypes || []).map(pt => `<button data-act="sub" data-n="${esc(pt.name)}" class="${sheet.sub === pt.name ? 'on' : ''}">${smallIcon(pt.icon)}${esc(pt.name)}</button>`).join('')}</div>`
    : sheet.kind === 'expense' && catSubs(sheet.ref).length ? `<div class="field-label">What did you buy?</div>
      <div class="pick">${catSubs(sheet.ref).map(sb => `<button data-act="sub" data-n="${esc(sb.name)}" class="${sheet.sub === sb.name ? 'on' : ''}">${smallIcon(sb.icon)}${esc(sb.name)}${sb.price ? ` <span class="price num">${money(sb.price, { noCur: true })}</span>` : ''}</button>`).join('')}</div>` : ''}
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
  if (sheet.kind === 'expense' && isPetCat(sheet.ref)) {
    const pet = (S.settings.pets || []).find(x => x.id === sheet.pet);
    t.pet = sheet.pet || ''; t.petName = pet?.name || ''; t.sub = sheet.sub || '';
  } else { t.pet = ''; t.petName = ''; t.sub = sheet.kind === 'expense' && catSubs(sheet.ref).some(x => x.name === sheet.sub) ? sheet.sub : ''; }
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
  if (kind === 'income') { amount = item.amount; who = incomeWho(item) || who; }
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

function themeCard(k) {
  const t = THEMES[k];
  return `<button class="theme-card ${S.theme === k ? 'on' : ''} ${k === 'take' ? 'special' : ''}" data-act="theme" data-k="${k}" aria-pressed="${S.theme === k}">
    <div class="sw" style="background:linear-gradient(140deg, ${t.hero[0]}, ${t.hero[1]} 55%, ${t.hero[2]})">${motif(k)}<span class="k">${t.jp}</span>
      <span class="dots">${[t.primary, t.income, t.spend, t.save, t.accent].map(c => `<i style="background:${c}"></i>`).join('')}</span></div>
    <div class="tx"><b>${t.name}</b><span>${t.note}</span></div>
    ${S.theme === k ? '<span class="tick">✓</span>' : ''}
  </button>`;
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
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--accent)"></span>Theme <span class="jp">色</span></h2><span class="meta">This phone only</span></div>
    <section class="card"><div class="theme-grid">${THEME_ORDER.map(themeCard).join('')}</div></section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--green)"></span>Income (monthly) <span class="jp">収入</span></h2></div>
    <section class="card">
      ${d.income.map((x, i) => `<div class="set-row">
        <div class="line">${textInput(`income.${i}.icon`, x.icon, '', 'icon-inp')}${textInput(`income.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="income" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="line">${moneyInput(`income.${i}.amount`, x.amount)}</div>
        <div class="line"><span class="mini" style="margin:0;flex:none">Group</span><input class="inp" list="inc-grp-list" data-set="income.${i}.group" value="${esc(x.group || '')}" placeholder="None (e.g. Bokx)"></div>
      </div>`).join('')}
      <datalist id="inc-grp-list"><option value="Bokx"><option value="Missy"></datalist>
      <button class="add-row" data-act="addrow" data-list="income">+ Add income</button>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--accent)"></span>Pets <span class="jp">ペット</span></h2></div>
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
      <div class="detail" style="color:var(--muted);font-weight:700;font-size:12.5px;margin-top:10px">Tap the picture to use a photo. The monthly Pets budget is under Everyday spending limits.</div>
      <input type="file" id="petfile" accept="image/*" hidden>
      <div class="field-label">Pet expense types</div>
      ${(d.petTypes || []).map((x, i) => `<div class="set-row"><div class="line">${textInput(`petTypes.${i}.icon`, x.icon, '', 'icon-inp')}${textInput(`petTypes.${i}.name`, x.name, 'Type')}<button class="x-btn" data-act="rm" data-list="petTypes" data-i="${i}" aria-label="Remove">×</button></div></div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="petTypes">+ Add type</button>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--purple)"></span>Fixed bills <span class="jp">固定費</span></h2></div>
    <section class="card">
      <datalist id="grp-list">${[...new Set(d.bills.map(b => (b.group || '').trim()).filter(Boolean))].map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      ${d.bills.map((x, i) => `<div class="set-row">
        <div class="line">${iconField(`bills.${i}.icon`, x.icon)}${textInput(`bills.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="bills" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="line">${moneyInput(`bills.${i}.amount`, x.amount)}${freqSel(`bills.${i}.freq`, x.freq)}</div>
        <label class="check"><input type="checkbox" data-set="bills.${i}.flex" data-type="bool" ${x.flex ? 'checked' : ''}> Budget only: add amounts bit by bit</label>
        <div class="line"><span class="mini" style="margin:0;flex:none">Group</span><input class="inp" list="grp-list" data-set="bills.${i}.group" value="${esc(x.group || '')}" placeholder="None (e.g. Utilities)"></div>
        ${x.freq !== 'monthly' ? `<div class="line"><span class="mini" style="margin:0;flex:none">${x.freq === 'yearly' ? 'Paid in' : 'Due in'}</span>${monthSel(`bills.${i}.month`, x.month)}</div>` : ''}
      </div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="bills">+ Add bill</button>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--blue)"></span>Everyday spending limits <span class="jp">生活費</span></h2></div>
    <section class="card">
      ${d.categories.map((x, i) => `<div class="set-row">
        <div class="line">${textInput(`categories.${i}.icon`, x.icon, '', 'icon-inp')}${textInput(`categories.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="categories" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="line">${moneyInput(`categories.${i}.limit`, x.limit)}<span class="mini" style="margin:0;flex:none">a month</span></div>
        <label class="check"><input type="checkbox" data-set="categories.${i}.period" data-type="yearcheck" ${x.period === 'year' ? 'checked' : ''}> Track over the whole year (for things bought every few months)</label>
        ${x.pets ? '' : `${(x.subs || []).length ? `<div class="subs-edit"><div class="mini">Quick items (fill the amount when picked)</div>${x.subs.map((sb, j) => `<div class="line">${textInput(`categories.${i}.subs.${j}.icon`, sb.icon, '', 'icon-inp')}${textInput(`categories.${i}.subs.${j}.name`, sb.name, 'Item')}${moneyInput(`categories.${i}.subs.${j}.price`, sb.price)}<button class="x-btn" data-act="rmsub" data-i="${i}" data-j="${j}" aria-label="Remove">×</button></div>`).join('')}</div>` : ''}
        <button class="mini-add" data-act="addsub" data-i="${i}">+ Quick item</button>`}
      </div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="categories">+ Add category</button>
    </section>

    <div class="sec-title"><h2><span class="dot" style="background:var(--teal)"></span>Savings goals <span class="jp">貯金</span></h2></div>
    <section class="card">
      ${d.goals.map((x, i) => `<div class="set-row">
        <div class="line">${textInput(`goals.${i}.icon`, x.icon, '', 'icon-inp')}${textInput(`goals.${i}.name`, x.name, 'Name')}<button class="x-btn" data-act="rm" data-list="goals" data-i="${i}" aria-label="Remove">×</button></div>
        <div class="two"><div><div class="mini">Target</div>${moneyInput(`goals.${i}.target`, x.target)}</div><div><div class="mini">Each month</div>${moneyInput(`goals.${i}.monthly`, x.monthly)}</div></div>
        <div><div class="mini">Already saved before</div>${moneyInput(`goals.${i}.start`, x.start)}</div>
      </div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="goals">+ Add goal</button>
    </section>

    <div class="sec-title"><h2>Payment methods <span class="jp">支払い</span></h2></div>
    <section class="card">
      ${d.methods.map((x, i) => `<div class="set-row"><div class="line">${textInput(`methods.${i}`, x, 'Method')}<button class="x-btn" data-act="rm" data-list="methods" data-i="${i}" aria-label="Remove">×</button></div></div>`).join('')}
      <button class="add-row" data-act="addrow" data-list="methods">+ Add method</button>
    </section>

    <div class="sec-title"><h2>More <span class="jp">その他</span></h2></div>
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
    petTypes: { name: '', icon: '🐾' },
  }[list];
}

async function saveSettings() {
  const d = S.draft;
  d.pets = d.pets || [];
  ['income', 'bills', 'categories', 'goals', 'pets'].forEach(k => { d[k] = d[k].filter(x => x.name.trim()); d[k].forEach(x => { x.name = x.name.trim(); x.icon = (x.icon || '').trim() || '•'; }); });
  d.bills.forEach(b => { b.group = (b.group || '').trim(); });
  d.income.forEach(x => { x.group = (x.group || '').trim(); if (['Bokx', 'Missy'].includes(x.group)) x.who = x.group; else delete x.who; });
  d.categories.forEach(c => {
    if (c.subs) c.subs = c.subs.filter(x => (x.name || '').trim()).map(x => ({ name: x.name.trim(), icon: (x.icon || '').trim() || '•', price: x.price || 0 }));
    if (c.period !== 'year') delete c.period;
  });
  d.petTypes = (d.petTypes || []).filter(x => x.name.trim()).map(x => ({ name: x.name.trim(), icon: (x.icon || '').trim() || '🐾' }));
  if (d.pets.length && !d.categories.some(c => c.pets)) {
    d.categories.push({ id: 'cat_pets', name: 'Pets', limit: 0, icon: '🐾', pets: true });
  }
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
    case 'add': openSheet({ kind: el.dataset.kind, ref: el.dataset.ref, sub: el.dataset.sub }); break;
    case 'quick': quickAdd(el.dataset.kind, el.dataset.ref); break;
    case 'edit': openSheet({ id: el.dataset.id }); break;
    case 'close': closeSheet(); break;
    case 'kind':
      readSheetInputs();
      if (sheet.kind !== el.dataset.k) { sheet.kind = el.dataset.k; sheet.ref = poolFor(sheet.kind)[0]?.id || null; }
      renderSheet(false);
      break;
    case 'ref':
      readSheetInputs(); if (sheet.ref !== el.dataset.id) sheet.sub = null; sheet.ref = el.dataset.id; fillPetDefaults();
      if (sheet.kind === 'income') { const w = incomeWho(S.settings.income.find(i => i.id === sheet.ref)); if (w) sheet.who = w; }
      renderSheet(false);
      break;
    case 'who': readSheetInputs(); sheet.who = el.dataset.p; renderSheet(false); break;
    case 'pet': readSheetInputs(); sheet.pet = el.dataset.id; renderSheet(false); break;
    case 'sub': {
      readSheetInputs();
      const subs = catSubs(sheet.ref);
      if (subs.length) {
        const prev = subs.find(x => x.name === sheet.sub), next = subs.find(x => x.name === el.dataset.n);
        const cur = toFils(sheet.amount);
        if (sheet.sub === el.dataset.n) { sheet.sub = null; }
        else {
          sheet.sub = el.dataset.n;
          // Fill in the usual price unless a different amount was typed.
          if (next?.price && (!cur || (prev && cur === prev.price))) sheet.amount = filsToInput(next.price);
        }
      } else sheet.sub = el.dataset.n;
      renderSheet(false);
      break;
    }
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
    case 'theme': setTheme(el.dataset.k); break;
    case 'areascope': S.areaScope = el.dataset.v; S.keepScroll = true; render(); break;
    case 'addsub': {
      const d = ensureDraft(); const c = d.categories[Number(el.dataset.i)];
      c.subs = c.subs || []; c.subs.push({ name: '', icon: '🏷️', price: 0 }); S.keepScroll = true; render();
      break;
    }
    case 'rmsub': {
      const d = ensureDraft(); d.categories[Number(el.dataset.i)].subs.splice(Number(el.dataset.j), 1); S.keepScroll = true; render();
      break;
    }
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
    if (el.dataset.type === 'yearcheck') v = el.checked ? 'year' : 'month';
    if (el.dataset.type === 'bool') v = el.checked;
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

/* =========================================================
   Five classic Japanese colorways. Each phone keeps its own pick.
   ========================================================= */

export const THEMES = {
  take: {
    name: 'Bamboo', jp: '竹', note: 'Special · greens of a bamboo grove',
    primary: '#2E6B4F', primaryD: '#1D4A36', primaryL: '#E2EEE3', primaryM: '#A8CAB0',
    income: '#5C8A2E', incomeL: '#ECF3DC', incomeM: '#C5DCA0',
    spend: '#2F7F7A', spendL: '#DCEEEB', spendM: '#A6D1CB',
    save: '#A9832A', saveL: '#F4EBD2',
    accent: '#B5452F',
    bg: '#EEF2E8', ink: '#1F2B24', muted: '#7A8A7F', line: '#E1E8DE', soft: '#F1F5EE', track: '#E6ECE3',
    hero: ['#4C8A62', '#2E6B4F', '#163828'],
    pie: ['#2E6B4F', '#7BA05B', '#A9832A', '#2F7F7A', '#B8D39A', '#4F9A82', '#D6B86A', '#5C8A2E', '#9CC3B5', '#C9D9A8'],
  },
  ai: {
    name: 'Indigo', jp: '藍', note: 'Ai-zome indigo and vermilion',
    primary: '#27466F', primaryD: '#182F4F', primaryL: '#E3E9F2', primaryM: '#AEBFD8',
    income: '#3D7A68', incomeL: '#DFEFE9', incomeM: '#A9D0C3',
    spend: '#4E72A8', spendL: '#E3EBF6', spendM: '#B4C8E6',
    save: '#B8862B', saveL: '#F5ECD6',
    accent: '#C0392B',
    bg: '#F1EEE7', ink: '#1C2433', muted: '#7D8494', line: '#E4E2DC', soft: '#F4F3EF', track: '#E9E7E1',
    hero: ['#3D6496', '#27466F', '#111E33'],
    pie: ['#27466F', '#C0392B', '#4E72A8', '#B8862B', '#8FA9CF', '#3D7A68', '#E0A28E', '#5A5F7A', '#C9D5E8', '#E8CF95'],
  },
  sakura: {
    name: 'Sakura', jp: '桜', note: 'Cherry blossom and wisteria',
    primary: '#B0536B', primaryD: '#863A4F', primaryL: '#FAE8ED', primaryM: '#EBB3C2',
    income: '#5E8F62', incomeL: '#E4F1E4', incomeM: '#B5D5B6',
    spend: '#B0536B', spendL: '#FAE8ED', spendM: '#EBB3C2',
    save: '#7E66A8', saveL: '#ECE6F5',
    accent: '#B0536B',
    bg: '#FAF2F1', ink: '#3A2830', muted: '#94818A', line: '#F0E2E4', soft: '#FBF4F5', track: '#F2E6E8',
    hero: ['#D98DA2', '#B0536B', '#6F2C40'],
    pie: ['#B0536B', '#EBB3C2', '#7E66A8', '#5E8F62', '#D98DA2', '#C3B1DD', '#F1CDD6', '#A0C4A2', '#8E4A5E', '#E8C9A0'],
  },
  momiji: {
    name: 'Autumn Maple', jp: '紅葉', note: 'Momiji red, persimmon and gold',
    primary: '#A33D2A', primaryD: '#76281B', primaryL: '#F7E5DE', primaryM: '#E2A791',
    income: '#677C2C', incomeL: '#EDF1DC', incomeM: '#C9D49C',
    spend: '#C0662A', spendL: '#F8E9DB', spendM: '#EBC09E',
    save: '#A9832A', saveL: '#F4EBD2',
    accent: '#A33D2A',
    bg: '#F6EFE5', ink: '#33231C', muted: '#8F7F75', line: '#ECE2D6', soft: '#F8F3EC', track: '#EEE5DA',
    hero: ['#C96B3E', '#A33D2A', '#4F1D14'],
    pie: ['#A33D2A', '#C0662A', '#A9832A', '#677C2C', '#E2A791', '#7A4A3A', '#EBC09E', '#D6B86A', '#C9D49C', '#5E3A2E'],
  },
  sumi: {
    name: 'Ink & Gold', jp: '墨', note: 'Sumi ink, washi paper and gold leaf',
    primary: '#2E2C2A', primaryD: '#151413', primaryL: '#EBE8E2', primaryM: '#BDB6AA',
    income: '#56704F', incomeL: '#E3EBE0', incomeM: '#B5C6AE',
    spend: '#47525E', spendL: '#E5E8EC', spendM: '#B8C0C9',
    save: '#A6842B', saveL: '#F3EBD3',
    accent: '#B8952F',
    bg: '#F0EDE7', ink: '#1E1D1B', muted: '#86817A', line: '#E3DFD8', soft: '#F4F2EE', track: '#E8E4DD',
    hero: ['#4B4743', '#2E2C2A', '#0E0D0C'],
    pie: ['#2E2C2A', '#A6842B', '#47525E', '#56704F', '#8A847C', '#D3BE7E', '#6E7A86', '#B5C6AE', '#C9C3B8', '#5E5A54'],
  },
};
export const THEME_ORDER = ['take', 'ai', 'sakura', 'momiji', 'sumi'];
export const DEFAULT_THEME = 'take';

const rgb = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}`; };

export function applyTheme(key) {
  const t = THEMES[key] || THEMES[DEFAULT_THEME];
  const r = document.documentElement.style;
  const set = (k, v) => r.setProperty(k, v);
  set('--purple', t.primary); set('--purple-d', t.primaryD); set('--purple-l', t.primaryL); set('--purple-m', t.primaryM);
  set('--green', t.income); set('--green-l', t.incomeL); set('--green-m', t.incomeM);
  set('--blue', t.spend); set('--blue-l', t.spendL); set('--blue-m', t.spendM);
  set('--teal', t.save); set('--teal-l', t.saveL);
  set('--accent', t.accent);
  set('--bg', t.bg); set('--ink', t.ink); set('--muted', t.muted); set('--line', t.line);
  set('--soft', t.soft); set('--track', t.track);
  set('--primary-rgb', rgb(t.primary));
  set('--shadow', `0 6px 24px rgba(${rgb(t.primaryD)}, .09), 0 1px 3px rgba(${rgb(t.primaryD)}, .07)`);
  set('--btn-grad', `linear-gradient(140deg, ${t.hero[0]}, ${t.primary} 55%, ${t.hero[2]})`);
  set('--glow', `0 10px 22px rgba(${rgb(t.primary)}, .38)`);
  set('--hero-bg', `linear-gradient(150deg, rgba(${rgb(t.hero[0])}, .90) 0%, rgba(${rgb(t.hero[1])}, .93) 48%, rgba(${rgb(t.hero[2])}, .96) 100%), url("img/bg-tokyo.jpg") center 35% / cover`);
  document.documentElement.dataset.theme = key in THEMES ? key : DEFAULT_THEME;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t.hero[1]);
  return t;
}

/* ---------- decorations drawn in the header ---------- */
const W = 'rgba(255,255,255,';

function bamboo() {
  const stalk = (x, w, top, segs, op) => {
    let s = `<rect x="${x}" y="${top}" width="${w}" height="260" rx="${w / 2}" fill="${W}${op})"/>`;
    for (let i = 1; i < segs; i++) {
      const y = top + i * (240 / segs);
      s += `<rect x="${x - 2}" y="${y}" width="${w + 4}" height="3.5" rx="1.75" fill="${W}${op + 0.12})"/>`;
    }
    return s;
  };
  const leaf = (x, y, rot, len, op) =>
    `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 0 C ${len * 0.3} -${len * 0.13}, ${len * 0.7} -${len * 0.1}, ${len} 0 C ${len * 0.7} ${len * 0.08}, ${len * 0.3} ${len * 0.11}, 0 0 Z" fill="${W}${op})"/>`;
  return `<svg viewBox="0 0 220 240" aria-hidden="true">
    ${stalk(150, 15, -20, 4, 0.18)}${stalk(185, 11, -40, 5, 0.13)}${stalk(118, 9, 10, 4, 0.10)}
    ${leaf(150, 40, 200, 70, 0.22)}${leaf(150, 44, 230, 58, 0.17)}${leaf(165, 100, -20, 72, 0.2)}${leaf(165, 104, 12, 56, 0.15)}
    ${leaf(185, 150, 205, 66, 0.18)}${leaf(196, 60, -35, 50, 0.14)}${leaf(127, 160, 195, 52, 0.14)}
  </svg>`;
}
function seigaiha() {
  let s = '';
  const r = 22;
  for (let row = 0; row < 7; row++) {
    for (let col = -1; col < 6; col++) {
      const cx = col * r * 2 + (row % 2 ? r : 0), cy = row * r * 0.55 * 2 + 40;
      [r, r * 0.72, r * 0.44].forEach((rr, i) => {
        s += `<path d="M ${cx - rr} ${cy} A ${rr} ${rr} 0 0 1 ${cx + rr} ${cy}" fill="none" stroke="${W}${0.16 - i * 0.03})" stroke-width="2"/>`;
      });
    }
  }
  return `<svg viewBox="0 0 220 240" aria-hidden="true">${s}</svg>`;
}
function sakura() {
  const flower = (x, y, size, rot, op) => {
    let p = '';
    for (let i = 0; i < 5; i++) {
      p += `<path transform="rotate(${i * 72})" d="M0 0 C ${-size * 0.55} ${-size * 0.45}, ${-size * 0.42} ${-size * 1.05}, ${-size * 0.1} ${-size * 1.05} L 0 ${-size * 0.88} L ${size * 0.1} ${-size * 1.05} C ${size * 0.42} ${-size * 1.05}, ${size * 0.55} ${-size * 0.45}, 0 0 Z" fill="${W}${op})"/>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${p}<circle r="${size * 0.14}" fill="${W}${op + 0.15})"/></g>`;
  };
  return `<svg viewBox="0 0 220 240" aria-hidden="true">
    ${flower(160, 60, 34, 10, 0.2)}${flower(200, 140, 22, 40, 0.16)}${flower(110, 130, 16, 20, 0.14)}${flower(205, 30, 14, 0, 0.13)}${flower(140, 200, 12, 15, 0.12)}
  </svg>`;
}
function momiji() {
  const leaf = (x, y, size, rot, op) => {
    const pts = [];
    const lobes = [[-90, 1], [-135, 0.42], [-155, 0.9], [-190, 0.4], [-215, 0.72], [-245, 0.32], [90, 0.25], [-295, 0.32], [-325, 0.72], [-350, 0.4], [-25, 0.9], [-45, 0.42]];
    lobes.sort((a, b) => a[0] - b[0]).forEach(([a, k]) => { const rad = a * Math.PI / 180; pts.push(`${(Math.cos(rad) * size * k).toFixed(1)},${(Math.sin(rad) * size * k).toFixed(1)}`); });
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><polygon points="${pts.join(' ')}" fill="${W}${op})"/><line x1="0" y1="0" x2="0" y2="${size * 0.55}" stroke="${W}${op})" stroke-width="2.5"/></g>`;
  };
  return `<svg viewBox="0 0 220 240" aria-hidden="true">
    ${leaf(165, 70, 48, 15, 0.2)}${leaf(205, 160, 30, -25, 0.15)}${leaf(110, 150, 22, 35, 0.13)}${leaf(200, 25, 18, -10, 0.12)}
  </svg>`;
}
function sumi() {
  const cloud = (x, y, w, op) => `<rect x="${x}" y="${y}" width="${w}" height="9" rx="4.5" fill="rgba(212,180,100,${op})"/><rect x="${x + w * 0.25}" y="${y + 13}" width="${w * 0.7}" height="9" rx="4.5" fill="rgba(212,180,100,${op})"/>`;
  return `<svg viewBox="0 0 220 240" aria-hidden="true">
    <path d="M 196 92 A 52 52 0 1 0 170 140" fill="none" stroke="${W}.2)" stroke-width="13" stroke-linecap="round"/>
    <path d="M 194 104 A 48 48 0 0 1 186 126" fill="none" stroke="${W}.12)" stroke-width="5" stroke-linecap="round"/>
    ${cloud(95, 30, 70, 0.45)}${cloud(150, 185, 60, 0.35)}
  </svg>`;
}
export function motif(key) {
  return { take: bamboo, ai: seigaiha, sakura, momiji, sumi }[key in THEMES ? key : DEFAULT_THEME]();
}

/* Faint bamboo along the page edges for the Bamboo theme. */
export function bambooEdges() {
  const col = (x, w, op) => {
    let s = `<rect x="${x}" y="0" width="${w}" height="1000" rx="${w / 2}" fill="rgba(46,107,79,${op})"/>`;
    for (let y = 70; y < 1000; y += 130) s += `<rect x="${x - 2}" y="${y}" width="${w + 4}" height="4" rx="2" fill="rgba(46,107,79,${op + 0.05})"/>`;
    return s;
  };
  return `<svg class="edge left" viewBox="0 0 60 1000" preserveAspectRatio="xMinYMin slice" aria-hidden="true">${col(8, 14, 0.07)}${col(34, 9, 0.05)}</svg>
    <svg class="edge right" viewBox="0 0 60 1000" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">${col(38, 14, 0.07)}${col(16, 9, 0.05)}</svg>`;
}

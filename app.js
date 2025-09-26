
// Utility: format money ARS (no external libs)
const fmtARS = (n) => new Intl.NumberFormat('es-AR', {style:'currency', currency:'ARS', maximumFractionDigits:2}).format(n);

let ALL = [];
const dom = {
  grid: document.getElementById('grid'),
  search: document.getElementById('search'),
  type: document.getElementById('filter-type'),
  days: document.getElementById('filter-days'),
  brand: document.getElementById('filter-brand'),
  tpl: document.getElementById('card-tpl')
};

const load = async () => {
  const res = await fetch('data/genetics.json?cache=' + Date.now());
  ALL = await res.json();
  hydrateFilters();
  render();
};

const hydrateFilters = () => {
  const brands = Array.from(new Set(ALL.map(x => x.brand))).sort();
  brands.forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    dom.brand.appendChild(o);
  });
};

const passDaysFilter = (g, val) => {
  if(!val) return true;
  const d = Number(g.flower_days || 0);
  if (val === '<=55') return d && d <= 55;
  if (val === '56-60') return d >= 56 && d <= 60;
  if (val === '61-65') return d >= 61 && d <= 65;
  if (val === '>65') return d && d > 65;
  return true;
};

const render = () => {
  const q = dom.search.value.trim().toLowerCase();
  const t = dom.type.value;
  const d = dom.days.value;
  const b = dom.brand.value;

  const filtered = ALL.filter(g => {
    const hay = (g.name + ' ' + (g.flavor||'') + ' ' + (g.brand||'')).toLowerCase();
    const okQ = !q || hay.includes(q);
    const okT = !t || g.type === t;
    const okB = !b || g.brand === b;
    const okD = passDaysFilter(g, d);
    return okQ && okT && okB && okD;
  });

  dom.grid.innerHTML = '';
  filtered.forEach(g => {
    const node = dom.tpl.content.cloneNode(true);
    node.querySelector('.type').textContent = g.type;
    node.querySelector('.name').textContent = g.name;
    node.querySelector('.brand-line').textContent = g.brand;
    node.querySelector('.flavor').textContent = g.flavor || '—';
    node.querySelector('.days').textContent = g.flower_days ?? '—';
    node.querySelector('.thc').textContent = g.thc != null ? (g.thc + ' %') : '—';
    node.querySelector('.cbd').textContent = g.cbd != null ? (g.cbd + ' %') : '—';
    node.querySelector('.seeds').textContent = g.seeds ?? '—';
    node.querySelector('.ratio').textContent = g.ratio || '';
    node.querySelector('.price').textContent = g.price_ars ? fmtARS(g.price_ars) : '';
    dom.grid.appendChild(node);
  });
};

['input','change'].forEach(evt => {
  dom.search.addEventListener(evt, render);
  dom.type.addEventListener(evt, render);
  dom.days.addEventListener(evt, render);
  dom.brand.addEventListener(evt, render);
});

load();

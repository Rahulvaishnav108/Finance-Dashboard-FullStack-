/* components.js — reusable UI building blocks */

// ── Category <select> ────────────────────────────────────
let _catCache = null;
async function getCategoryOptions(filterType = null) {
  if (!_catCache) {
    const res = await api.categories.list();
    _catCache  = res.success ? res.data : [];
  }
  const cats = filterType
    ? _catCache.filter(c => c.type === filterType || c.type === 'both')
    : _catCache;
  return cats.map(c => `<option value="${c.id}" data-type="${c.type}">${escHtml(c.name)}</option>`).join('');
}
function invalidateCategoryCache() { _catCache = null; }

async function buildCategorySelect(id, selectedId = '', filterType = null, label = 'Category') {
  const opts = await getCategoryOptions(filterType);
  return `
    <div class="form-group">
      <label>${label}</label>
      <select id="${id}">
        <option value="">— No category —</option>
        ${opts}
      </select>
    </div>`;
}

function setCategorySelectValue(selectId, value) {
  const sel = document.getElementById(selectId);
  if (sel && value) sel.value = value;
}

// ── Pagination renderer ──────────────────────────────────
function renderPagination(containerId, pagination, onPageChange) {
  const { page, totalPages, total, limit } = pagination;
  if (totalPages <= 1 && total === 0) return;
  const container = document.getElementById(containerId);
  if (!container) return;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  let btns = '';
  btns += `<button ${page === 1 ? 'disabled' : ''} onclick="(${onPageChange.toString()})(${page - 1})">‹</button>`;

  const range = pageRange(page, totalPages);
  for (const p of range) {
    if (p === '…') { btns += `<button disabled>…</button>`; }
    else { btns += `<button class="${p === page ? 'active' : ''}" onclick="(${onPageChange.toString()})(${p})">${p}</button>`; }
  }

  btns += `<button ${page === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="(${onPageChange.toString()})(${page + 1})">›</button>`;

  container.innerHTML = `
    <div class="pagination">${btns}</div>
    <div class="pagination-info">${total > 0 ? `Showing ${from}–${to} of ${total}` : 'No results'}</div>
  `;
}

function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

// ── Chart factory ────────────────────────────────────────
const ChartInstances = {};

function destroyChart(id) {
  if (ChartInstances[id]) { ChartInstances[id].destroy(); delete ChartInstances[id]; }
}

function getChartColors() {
  const isDark = document.body.classList.contains('dark');
  return {
    grid:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text:   isDark ? '#94a3b8' : '#64748b',
    income: '#22c55e',
    expense:'#ef4444',
    primary:'#6366f1',
  };
}

function makeLineChart(canvasId, labels, datasets) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const c = getChartColors();
  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: c.text, boxWidth: 12, padding: 16, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: c.grid }, ticks: { color: c.text, font: { size: 10 } } },
        y: { grid: { color: c.grid }, ticks: { color: c.text, font: { size: 10 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } },
      },
    },
  });
}

function makeBarChart(canvasId, labels, datasets) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const c = getChartColors();
  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: c.text, boxWidth: 12, padding: 16, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: 'transparent' }, ticks: { color: c.text, font: { size: 10 } } },
        y: { grid: { color: c.grid }, ticks: { color: c.text, font: { size: 10 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } },
      },
    },
  });
}

function makeDoughnutChart(canvasId, labels, data, colors) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const c = getChartColors();
  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: document.body.classList.contains('dark') ? '#181c27' : '#fff' }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position: 'right', labels: { color: c.text, boxWidth: 10, padding: 12, font: { size: 10 } } } },
    },
  });
}

// ── Empty state helper ───────────────────────────────────
function emptyState(icon, title, subtitle = '') {
  return `<div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <h3>${escHtml(title)}</h3>
    ${subtitle ? `<p class="text-sm text-muted">${escHtml(subtitle)}</p>` : ''}
  </div>`;
}

// ── Form field builders ──────────────────────────────────
function textField(id, label, opts = {}) {
  const { type = 'text', placeholder = '', value = '', required = false, min, max } = opts;
  const attrs = [
    `id="${id}" type="${type}"`,
    placeholder ? `placeholder="${escHtml(placeholder)}"` : '',
    value ? `value="${escHtml(value)}"` : '',
    required ? 'required' : '',
    min !== undefined ? `min="${min}"` : '',
    max !== undefined ? `max="${max}"` : '',
  ].filter(Boolean).join(' ');
  return `<div class="form-group"><label>${escHtml(label)}${required ? ' <span style="color:var(--danger)">*</span>' : ''}</label><input ${attrs} /></div>`;
}

function selectField(id, label, options, selectedVal = '', required = false) {
  const opts = options.map(o =>
    `<option value="${escHtml(o.value)}" ${o.value == selectedVal ? 'selected' : ''}>${escHtml(o.label)}</option>`
  ).join('');
  return `<div class="form-group"><label>${escHtml(label)}${required ? ' <span style="color:var(--danger)">*</span>' : ''}</label><select id="${id}">${opts}</select></div>`;
}

function textareaField(id, label, value = '', placeholder = '') {
  return `<div class="form-group"><label>${escHtml(label)}</label><textarea id="${id}" placeholder="${escHtml(placeholder)}">${escHtml(value)}</textarea></div>`;
}

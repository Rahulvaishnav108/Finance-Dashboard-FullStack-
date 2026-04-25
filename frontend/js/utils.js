/* utils.js — shared helpers used across all pages */

// ── Formatting ──────────────────────────────────────────
function fmt(n) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDatetime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}
function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function badgeHtml(value, type = '') {
  const cls = type || value?.toLowerCase().replace(/\s+/g, '-');
  return `<span class="badge badge-${cls}">${value}</span>`;
}
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Toast ───────────────────────────────────────────────
function toast(message, type = 'success') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type] || '•'}</span><span>${escHtml(message)}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ── Modal ───────────────────────────────────────────────
function openModal(title, bodyHtml, footerHtml = '') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-footer').innerHTML = footerHtml;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Focus first input
  setTimeout(() => document.getElementById('modal-body')?.querySelector('input, select, textarea')?.focus(), 50);
}
function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Loading state ───────────────────────────────────────
function setPageContent(html) {
  document.getElementById('page-content').innerHTML = html;
}
function setPageLoading() {
  setPageContent('<div class="page-loading">Loading…</div>');
}

// ── API error extraction ────────────────────────────────
function apiErrMsg(res) {
  if (!res) return 'Unknown error';
  if (res.errors?.length) return res.errors.map(e => `${e.field}: ${e.message}`).join(' · ');
  return res.message || 'Request failed';
}

// ── Form helpers ────────────────────────────────────────
function formVal(id) { return document.getElementById(id)?.value?.trim() || ''; }
function setFormErr(id, msg) {
  let el = document.getElementById(id + '-err');
  if (!el) { el = document.createElement('div'); el.id = id + '-err'; el.className = 'alert alert-error'; document.getElementById(id)?.insertAdjacentElement('afterend', el); }
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}
function clearFormErrs() { document.querySelectorAll('[id$="-err"].alert').forEach(e => e.classList.add('hidden')); }

// ── Confirm dialog ──────────────────────────────────────
function confirmDelete(entityName, onConfirm) {
  openModal(
    'Confirm Delete',
    `<p>Are you sure you want to delete <strong>${escHtml(entityName)}</strong>? This action cannot be undone.</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-danger" onclick="closeModal();(${onConfirm.toString()})()">Delete</button>`
  );
}

// ── Theme toggle ────────────────────────────────────────
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  document.body.classList.toggle('light', !isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
function applyTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.body.className = saved;
}

// ── Sidebar ─────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Auth ────────────────────────────────────────────────
async function doLogin() {
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-password').value;

  if (!email || !pwd) { errEl.textContent = 'Email and password are required'; errEl.classList.remove('hidden'); return; }

  btn.disabled = true; btn.textContent = 'Signing in…';
  errEl.classList.add('hidden');

  const res = await api.auth.login({ email, password: pwd });
  btn.disabled = false; btn.textContent = 'Sign in';

  if (res.success) {
    Auth.setToken(res.data.access_token);
    Auth.setRefresh(res.data.refresh_token);
    Auth.setUser(res.data.user);
    window.Router.go('dashboard');
  } else {
    errEl.textContent = apiErrMsg(res);
    errEl.classList.remove('hidden');
  }
}

async function doLogout() {
  const rt = Auth.getRefresh();
  if (rt) await api.auth.logout({ refresh_token: rt }).catch(() => {});
  Auth.clear();
  window.Router.go('login');
}

function togglePwd() {
  const inp = document.getElementById('login-password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ── Enter key on login ──────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-screen') && !document.getElementById('login-screen').classList.contains('hidden')) {
    doLogin();
  }
});

// Apply saved theme immediately
applyTheme();

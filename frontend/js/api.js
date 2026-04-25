/* api.js — centralised HTTP client with auto token refresh */

const API_BASE = window.location.protocol === 'file:'
  ? 'http://localhost:3000/api/v1'
  : '/api/v1';

const Auth = {
  getToken()  { return localStorage.getItem('access_token'); },
  setToken(t) { localStorage.setItem('access_token', t); },
  getRefresh()  { return localStorage.getItem('refresh_token'); },
  setRefresh(t) { localStorage.setItem('refresh_token', t); },
  getUser()   { return JSON.parse(localStorage.getItem('user') || 'null'); },
  setUser(u)  { localStorage.setItem('user', JSON.stringify(u)); },
  clear()     { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); localStorage.removeItem('user'); },
  isLoggedIn(){ return !!this.getToken(); },
  hasRole(...roles) { const u = this.getUser(); return u && roles.includes(u.role); },
};

let _refreshing = null;

async function apiFetch(path, opts = {}, retry = true) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers };
  const res = await fetch(API_BASE + path, { ...opts, headers });

  // Token expired → try refresh once
  if (res.status === 401 && retry) {
    const refreshToken = Auth.getRefresh();
    if (refreshToken) {
      if (!_refreshing) {
        _refreshing = apiFetch('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        }, false).then(r => {
          _refreshing = null;
          if (r.success) {
            Auth.setToken(r.data.access_token);
            Auth.setRefresh(r.data.refresh_token);
          } else {
            Auth.clear();
            window.location.hash = '';
            window.Router?.go('login');
          }
          return r;
        }).catch(() => { _refreshing = null; Auth.clear(); });
      }
      const refreshResult = await _refreshing;
      if (refreshResult?.success) {
        return apiFetch(path, opts, false); // retry once
      }
    } else {
      Auth.clear();
    }
  }

  if (res.status === 204) return { success: true, data: null };
  return res.json();
}

const get  = (path, params) => {
  const qs = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== '' && v != null))) : '';
  return apiFetch(path + qs);
};
const post   = (path, body) => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) });
const put    = (path, body) => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) });
const del    = (path)       => apiFetch(path, { method: 'DELETE' });
const download = async (path, params, filename) => {
  const token = Auth.getToken();
  const qs = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== '' && v != null))) : '';
  const res = await fetch(API_BASE + path + qs, { headers: { Authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ── Auth endpoints ──
const api = {
  auth: {
    login:          (body)    => post('/auth/login', body),
    logout:         (body)    => post('/auth/logout', body),
    me:             ()        => get('/auth/me'),
    changePassword: (body)    => put('/auth/change-password', body),
    updateProfile:  (body)    => put('/auth/profile', body),
  },
  users: {
    list:   (p)    => get('/users', p),
    get:    (id)   => get(`/users/${id}`),
    create: (body) => post('/users', body),
    update: (id, body) => put(`/users/${id}`, body),
    delete: (id)   => del(`/users/${id}`),
  },
  records: {
    list:   (p)    => get('/records', p),
    get:    (id)   => get(`/records/${id}`),
    create: (body) => post('/records', body),
    update: (id, body) => put(`/records/${id}`, body),
    delete: (id)   => del(`/records/${id}`),
    export: (p)    => download('/records/export', p, `records-${new Date().toISOString().slice(0,10)}.csv`),
  },
  categories: {
    list:   ()     => get('/categories'),
    get:    (id)   => get(`/categories/${id}`),
    create: (body) => post('/categories', body),
    update: (id, body) => put(`/categories/${id}`, body),
    delete: (id)   => del(`/categories/${id}`),
  },
  dashboard: {
    overview:   (p) => get('/dashboard/overview', p),
    summary:    (p) => get('/dashboard/summary', p),
    categories: (p) => get('/dashboard/categories', p),
    monthly:    (p) => get('/dashboard/trends/monthly', p),
    weekly:     (p) => get('/dashboard/trends/weekly', p),
    recent:     (p) => get('/dashboard/recent', p),
    insights:   (p) => get('/dashboard/insights', p),
  },
  audit: {
    list: (p) => get('/audit', p),
  },
};

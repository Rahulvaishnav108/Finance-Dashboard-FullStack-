/* pages/audit.js */

const AuditPage = {
  page: 1,
  filters: { action: '', resource: '', date_from: '', date_to: '' },
  entriesById: {},

  async render() {
    setPageContent(`
      <div class="page-actions"><h2>Audit Log</h2></div>
      <div class="card">
        <div class="filters-bar">
          <input type="text" id="au-action"   placeholder="Filter by action…"   oninput="AuditPage.onFilterChange()" style="min-width:160px" />
          <select id="au-resource" onchange="AuditPage.onFilterChange()">
            <option value="">All Resources</option>
            <option value="users">Users</option>
            <option value="financial_records">Records</option>
            <option value="categories">Categories</option>
            <option value="refresh_tokens">Auth Tokens</option>
          </select>
          <input type="date" id="au-from" onchange="AuditPage.onFilterChange()" />
          <input type="date" id="au-to"   onchange="AuditPage.onFilterChange()" />
          <button class="btn btn-ghost btn-sm" onclick="AuditPage.resetFilters()">Reset</button>
        </div>
        <div class="table-wrap" id="audit-table-wrap"><div class="page-loading">Loading…</div></div>
        <div id="audit-pagination"></div>
      </div>
    `);
    await this.load();
  },

  onFilterChange() {
    clearTimeout(this._d);
    this._d = setTimeout(() => {
      this.filters.action    = document.getElementById('au-action')?.value.trim() || '';
      this.filters.resource  = document.getElementById('au-resource')?.value || '';
      this.filters.date_from = document.getElementById('au-from')?.value || '';
      this.filters.date_to   = document.getElementById('au-to')?.value || '';
      this.page = 1;
      this.load();
    }, 300);
  },

  resetFilters() {
    this.filters = { action:'', resource:'', date_from:'', date_to:'' };
    document.getElementById('au-action').value   = '';
    document.getElementById('au-resource').value = '';
    document.getElementById('au-from').value     = '';
    document.getElementById('au-to').value       = '';
    this.page = 1;
    this.load();
  },

  async load() {
    const res  = await api.audit.list({ ...this.filters, page: this.page, limit: 20 });
    const wrap = document.getElementById('audit-table-wrap');
    if (!wrap) return;
    if (!res.success) { wrap.innerHTML = `<div class="alert alert-error">${apiErrMsg(res)}</div>`; return; }
    if (!res.data.length) { wrap.innerHTML = emptyState('◉', 'No audit entries found'); return; }
    this.entriesById = Object.fromEntries(res.data.map(e => [String(e.id), e]));

    wrap.innerHTML = `<table>
      <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Resource</th><th>Detail</th></tr></thead>
      <tbody>${res.data.map(e => this.renderRow(e)).join('')}</tbody>
    </table>`;
    renderPagination('audit-pagination', res.pagination, p => { this.page = p; this.load(); });
  },

  renderRow(e) {
    const actionColor = e.action.includes('delete') ? 'var(--danger)' : e.action.includes('create') || e.action.includes('register') ? 'var(--success)' : 'var(--primary)';
    const hasData = e.new_data || e.old_data;
    return `<tr>
      <td class="text-muted text-sm" style="white-space:nowrap">${fmtDatetime(e.created_at)}</td>
      <td>
        <div style="font-size:0.84rem;font-weight:600">${escHtml(e.actor_name || '—')}</div>
        <div class="text-muted text-sm">${escHtml(e.actor_email || '')}</div>
      </td>
      <td><code style="color:${actionColor};font-size:0.78rem;background:var(--bg3);padding:2px 6px;border-radius:4px">${escHtml(e.action)}</code></td>
      <td class="text-muted text-sm">${escHtml(e.resource)}${e.resource_id ? `<br><code style="font-size:0.68rem;color:var(--text3)">${e.resource_id.slice(0,8)}…</code>` : ''}</td>
      <td>${hasData ? `<button class="btn btn-ghost btn-sm" onclick="AuditPage.showDetail('${e.id}')">View</button>` : '<span class="text-muted">—</span>'}</td>
    </tr>`;
  },

  showDetail(id) {
    const entry = this.entriesById[String(id)];
    if (!entry) {
      toast('Audit entry is no longer available on this page', 'error');
      return;
    }

    const detail = {
      action: entry.action,
      resource: entry.resource,
      resource_id: entry.resource_id,
      actor: entry.actor_email || entry.actor_name || null,
      created_at: entry.created_at,
      old_data: entry.old_data,
      new_data: entry.new_data,
    };

    openModal('Audit Detail', `
      <pre style="font-size:0.78rem;overflow:auto;background:var(--bg3);padding:1rem;border-radius:8px;color:var(--text)">${escHtml(JSON.stringify(detail, null, 2))}</pre>
    `);
  },
};

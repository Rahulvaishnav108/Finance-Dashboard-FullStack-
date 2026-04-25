/* pages/audit.js */

const AuditPage = {
  page: 1,
  filters: { action: '', resource: '', date_from: '', date_to: '' },

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
      <td>${hasData ? `<button class="btn btn-ghost btn-sm" onclick="AuditPage.showDetail(${e.id ? `'${e.id}'` : JSON.stringify(e)})">View</button>` : '<span class="text-muted">—</span>'}</td>
    </tr>`;
  },

  showDetail(entryOrId) {
    // For simplicity, entry is passed inline
    const e = typeof entryOrId === 'string' ? entryOrId : entryOrId;
    // Re-fetch or display from data already in DOM is complex; show inline passed data
    openModal('Audit Detail', `
      <pre style="font-size:0.78rem;overflow:auto;background:var(--bg3);padding:1rem;border-radius:8px;color:var(--text)">${escHtml(JSON.stringify(typeof entryOrId === 'object' ? entryOrId : {}, null, 2))}</pre>
    `);
  },
};

/* pages/profile.js */

const ProfilePage = {
  async render() {
    const user = Auth.getUser();
    setPageContent(`
      <div class="page-actions"><h2>My Profile</h2></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;max-width:800px">
        <div class="card">
          <div class="card-header"><span class="card-title">Personal Info</span></div>
          <div style="text-align:center;margin-bottom:1.5rem">
            <div class="avatar" style="width:64px;height:64px;font-size:1.4rem;margin:0 auto 0.75rem">${initials(user?.full_name)}</div>
            <div style="font-weight:700">${escHtml(user?.full_name)}</div>
            <div class="text-muted text-sm">${escHtml(user?.email)}</div>
            <div style="margin-top:0.4rem">${badgeHtml(user?.role)}</div>
          </div>
          ${textField('prof-name','Full Name',{value:user?.full_name||'',required:true})}
          <div id="prof-err" class="alert alert-error hidden"></div>
          <button class="btn btn-primary btn-sm w-full" onclick="ProfilePage.saveName()">Update Name</button>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Change Password</span></div>
          ${textField('prof-curr','Current Password',{type:'password',placeholder:'Your current password'})}
          ${textField('prof-new', 'New Password',     {type:'password',placeholder:'Min 8 chars, uppercase, number'})}
          ${textField('prof-conf','Confirm Password', {type:'password',placeholder:'Repeat new password'})}
          <div id="pwd-err" class="alert alert-error hidden"></div>
          <div id="pwd-ok"  class="alert alert-success hidden">Password changed successfully</div>
          <button class="btn btn-primary btn-sm w-full" onclick="ProfilePage.changePassword()">Change Password</button>
        </div>
      </div>
    `);
  },

  async saveName() {
    const errEl = document.getElementById('prof-err');
    const name  = document.getElementById('prof-name')?.value.trim();
    if (!name || name.length < 2) { errEl.textContent = 'Name must be at least 2 characters'; errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    const res = await api.auth.updateProfile({ full_name: name });
    if (res.success) {
      const user = Auth.getUser();
      user.full_name = res.data.full_name;
      Auth.setUser(user);
      window.Router._updateSidebarUser();
      toast('Profile updated', 'success');
    } else {
      errEl.textContent = apiErrMsg(res);
      errEl.classList.remove('hidden');
    }
  },

  async changePassword() {
    const errEl = document.getElementById('pwd-err');
    const okEl  = document.getElementById('pwd-ok');
    errEl.classList.add('hidden'); okEl.classList.add('hidden');
    const curr = document.getElementById('prof-curr')?.value;
    const nw   = document.getElementById('prof-new')?.value;
    const conf = document.getElementById('prof-conf')?.value;
    if (!curr) { errEl.textContent = 'Current password required'; errEl.classList.remove('hidden'); return; }
    if (!nw || nw.length < 8) { errEl.textContent = 'New password must be at least 8 characters'; errEl.classList.remove('hidden'); return; }
    if (nw !== conf) { errEl.textContent = 'Passwords do not match'; errEl.classList.remove('hidden'); return; }
    const res = await api.auth.changePassword({ current_password: curr, new_password: nw });
    if (res.success) {
      okEl.classList.remove('hidden');
      document.getElementById('prof-curr').value = '';
      document.getElementById('prof-new').value  = '';
      document.getElementById('prof-conf').value = '';
    } else {
      errEl.textContent = apiErrMsg(res);
      errEl.classList.remove('hidden');
    }
  },
};

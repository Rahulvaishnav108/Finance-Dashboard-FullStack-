/* pages/users.js */

const UsersPage = {
  page: 1,
  filters: { role: '', status: '', search: '' },

  async render() {
    setPageContent(`
      <div class="page-actions">
        <h2>User Management</h2>
        <button class="btn btn-primary btn-sm" onclick="UsersPage.openCreate()">+ New User</button>
      </div>
      <div class="card">
        <div class="filters-bar">
          <input type="text" id="uf-search" placeholder="🔍 Search name or email…" oninput="UsersPage.onFilterChange()" style="min-width:200px" />
          <select id="uf-role" onchange="UsersPage.onFilterChange()">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <select id="uf-status" onchange="UsersPage.onFilterChange()">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div class="table-wrap" id="users-table-wrap"><div class="page-loading">Loading…</div></div>
        <div id="users-pagination"></div>
      </div>
    `);
    await this.load();
  },

  onFilterChange() {
    clearTimeout(this._d);
    this._d = setTimeout(() => {
      this.filters.search = document.getElementById('uf-search')?.value.trim() || '';
      this.filters.role   = document.getElementById('uf-role')?.value || '';
      this.filters.status = document.getElementById('uf-status')?.value || '';
      this.page = 1;
      this.load();
    }, 300);
  },

  async load() {
    const res  = await api.users.list({ ...this.filters, page: this.page, limit: 15 });
    const wrap = document.getElementById('users-table-wrap');
    if (!wrap) return;
    if (!res.success) { wrap.innerHTML = `<div class="alert alert-error">${apiErrMsg(res)}</div>`; return; }
    if (!res.data.length) { wrap.innerHTML = emptyState('◎', 'No users found'); return; }

    const me = Auth.getUser();
    wrap.innerHTML = `<table>
      <thead><tr>
        <th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th>Created</th><th>Actions</th>
      </tr></thead>
      <tbody>${res.data.map(u => this.renderRow(u, me)).join('')}</tbody>
    </table>`;
    renderPagination('users-pagination', res.pagination, (p) => { this.page = p; this.load(); });
  },

  renderRow(u, me) {
    const isSelf = u.id === me?.id;
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.6rem">
          <div class="avatar" style="width:30px;height:30px;font-size:0.68rem">${initials(u.full_name)}</div>
          <div>
            <div style="font-weight:600;font-size:0.88rem">${escHtml(u.full_name)} ${isSelf ? '<span class="badge badge-viewer">You</span>' : ''}</div>
            <div class="text-muted text-sm">${escHtml(u.email)}</div>
          </div>
        </div>
      </td>
      <td>${badgeHtml(u.role)}</td>
      <td>${badgeHtml(u.status)}</td>
      <td class="text-muted text-sm">${u.last_login_at ? timeAgo(u.last_login_at) : 'Never'}</td>
      <td class="text-muted text-sm">${fmtDate(u.created_at)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="UsersPage.openEdit('${u.id}')">Edit</button>
          ${!isSelf ? `<button class="btn btn-danger btn-sm" onclick="UsersPage.confirmDel('${u.id}','${escHtml(u.full_name)}')">Del</button>` : ''}
        </div>
      </td>
    </tr>`;
  },

  _modalHtml(u = null) {
    const roleOpts = [{ value:'viewer',label:'Viewer' },{ value:'analyst',label:'Analyst' },{ value:'admin',label:'Admin' }];
    const statusOpts = [{ value:'active',label:'Active' },{ value:'inactive',label:'Inactive' },{ value:'suspended',label:'Suspended' }];
    return `
      ${textField('u-name', 'Full Name', { value:u?.full_name||'', required:true, placeholder:'Jane Doe' })}
      ${textField('u-email', 'Email', { type:'email', value:u?.email||'', required:!u, placeholder:'jane@example.com' })}
      ${u ? '' : textField('u-pwd', 'Password', { type:'password', required:true, placeholder:'Min 8 chars, 1 uppercase, 1 number' })}
      <div class="form-row">
        ${selectField('u-role',   'Role',   roleOpts,   u?.role  ||'viewer', true)}
        ${u ? selectField('u-status', 'Status', statusOpts, u?.status||'active', true) : ''}
      </div>
      <div id="u-err" class="alert alert-error hidden"></div>
    `;
  },

  openCreate() {
    openModal('New User', this._modalHtml(), `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="UsersPage.save()">Create User</button>
    `);
  },

  async openEdit(id) {
    const res = await api.users.get(id);
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    openModal('Edit User', this._modalHtml(res.data), `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="UsersPage.save('${id}')">Save Changes</button>
    `);
  },

  async save(id = null) {
    const errEl = document.getElementById('u-err');
    const name  = document.getElementById('u-name')?.value.trim();
    const email = document.getElementById('u-email')?.value.trim();
    const pwd   = document.getElementById('u-pwd')?.value;
    const role   = document.getElementById('u-role')?.value;
    const status = document.getElementById('u-status')?.value;

    if (!name)          { errEl.textContent = 'Full name is required';       errEl.classList.remove('hidden'); return; }
    if (!id && !email)  { errEl.textContent = 'Email is required';           errEl.classList.remove('hidden'); return; }
    if (!id && (!pwd || pwd.length < 8)) { errEl.textContent = 'Password must be at least 8 characters'; errEl.classList.remove('hidden'); return; }

    const body = id
      ? { full_name: name, role, status }
      : { full_name: name, email, password: pwd, role };

    const res = id ? await api.users.update(id, body) : await api.users.create(body);
    if (res.success) {
      toast(id ? 'User updated' : 'User created', 'success');
      closeModal();
      this.load();
    } else {
      errEl.textContent = apiErrMsg(res);
      errEl.classList.remove('hidden');
    }
  },

  confirmDel(id, name) {
    confirmDelete(name, async () => {
      const res = await api.users.delete(id);
      if (res.success) { toast('User deleted', 'success'); this.load(); }
      else toast(apiErrMsg(res), 'error');
    });
  },
};

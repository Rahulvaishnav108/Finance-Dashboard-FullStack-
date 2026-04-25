/* pages/records.js */

const RecordsPage = {
  filters: { type: '', category_id: '', date_from: '', date_to: '', search: '', sort_by: 'date', sort_dir: 'desc' },
  page: 1,
  canWrite: false,
  canDelete: false,

  async render() {
    this.canWrite  = Auth.hasRole('analyst', 'admin');
    this.canDelete = Auth.hasRole('admin');
    this.page = 1;

    setPageContent(`
      <div class="page-actions">
        <h2>Financial Records</h2>
        ${this.canWrite ? `<button class="btn btn-primary btn-sm" onclick="RecordsPage.openCreate()">+ New Record</button>` : ''}
        ${this.canWrite ? `<button class="btn btn-ghost btn-sm" onclick="RecordsPage.exportCSV()" title="Export CSV">⬇ Export CSV</button>` : ''}
      </div>
      <div class="card">
        <div class="filters-bar" id="records-filters"></div>
        <div class="table-wrap" id="records-table-wrap"><div class="page-loading">Loading…</div></div>
        <div id="records-pagination"></div>
      </div>
    `);

    await this.buildFilters();
    await this.load();
  },

  async buildFilters() {
    const catRes  = await api.categories.list();
    const catOpts = catRes.success
      ? `<option value="">All Categories</option>` + catRes.data.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('')
      : '<option value="">All Categories</option>';

    document.getElementById('records-filters').innerHTML = `
      <input  type="text"   id="rf-search"   placeholder="🔍 Search…" value="${escHtml(this.filters.search)}" oninput="RecordsPage.onFilterChange()" style="min-width:180px" />
      <select id="rf-type" onchange="RecordsPage.onFilterChange()">
        <option value="">All Types</option>
        <option value="income"  ${this.filters.type==='income'  ? 'selected':''}>Income</option>
        <option value="expense" ${this.filters.type==='expense' ? 'selected':''}>Expense</option>
      </select>
      <select id="rf-cat" onchange="RecordsPage.onFilterChange()">${catOpts}</select>
      <input  type="date" id="rf-from" value="${this.filters.date_from}" onchange="RecordsPage.onFilterChange()" />
      <input  type="date" id="rf-to"   value="${this.filters.date_to}"   onchange="RecordsPage.onFilterChange()" />
      <select id="rf-sort" onchange="RecordsPage.onFilterChange()">
        <option value="date|desc"       ${this.filters.sort_by==='date'&&this.filters.sort_dir==='desc'?'selected':''}>Date ↓</option>
        <option value="date|asc"        ${this.filters.sort_by==='date'&&this.filters.sort_dir==='asc' ?'selected':''}>Date ↑</option>
        <option value="amount|desc"     ${this.filters.sort_by==='amount'&&this.filters.sort_dir==='desc'?'selected':''}>Amount ↓</option>
        <option value="amount|asc"      ${this.filters.sort_by==='amount'&&this.filters.sort_dir==='asc' ?'selected':''}>Amount ↑</option>
        <option value="created_at|desc" ${this.filters.sort_by==='created_at'?'selected':''}>Newest</option>
      </select>
      <button class="btn btn-ghost btn-sm" onclick="RecordsPage.resetFilters()">Reset</button>
    `;
    if (this.filters.category_id) document.getElementById('rf-cat').value = this.filters.category_id;
  },

  onFilterChange() {
    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this.filters.search      = document.getElementById('rf-search')?.value.trim() || '';
      this.filters.type        = document.getElementById('rf-type')?.value || '';
      this.filters.category_id = document.getElementById('rf-cat')?.value || '';
      this.filters.date_from   = document.getElementById('rf-from')?.value || '';
      this.filters.date_to     = document.getElementById('rf-to')?.value || '';
      const sort = document.getElementById('rf-sort')?.value.split('|') || ['date','desc'];
      this.filters.sort_by  = sort[0];
      this.filters.sort_dir = sort[1];
      this.page = 1;
      this.load();
    }, 300);
  },

  resetFilters() {
    this.filters = { type:'', category_id:'', date_from:'', date_to:'', search:'', sort_by:'date', sort_dir:'desc' };
    this.page = 1;
    this.buildFilters().then(() => this.load());
  },

  async load() {
    const res = await api.records.list({ ...this.filters, page: this.page, limit: 20 });
    const wrap = document.getElementById('records-table-wrap');
    if (!wrap) return;

    if (!res.success) { wrap.innerHTML = `<div class="alert alert-error">${apiErrMsg(res)}</div>`; return; }
    if (!res.data.length) { wrap.innerHTML = emptyState('📄', 'No records found', 'Try adjusting your filters'); return; }

    wrap.innerHTML = `<table>
      <thead><tr>
        <th>Date</th><th>Type</th><th>Category</th><th>Description</th>
        <th style="text-align:right">Amount</th><th>By</th>
        ${this.canWrite || this.canDelete ? '<th>Actions</th>' : ''}
      </tr></thead>
      <tbody>${res.data.map(r => this.renderRow(r)).join('')}</tbody>
    </table>`;

    renderPagination('records-pagination', res.pagination, (p) => { this.page = p; this.load(); });
  },

  renderRow(r) {
    const actions = [];
    if (this.canWrite)  actions.push(`<button class="btn btn-ghost btn-sm" onclick="RecordsPage.openEdit('${r.id}')">Edit</button>`);
    if (this.canDelete) actions.push(`<button class="btn btn-danger btn-sm" onclick="RecordsPage.confirmDel('${r.id}','${escHtml(r.description||r.id)}')">Del</button>`);
    return `<tr>
      <td>${fmtDate(r.date)}</td>
      <td>${badgeHtml(r.type)}</td>
      <td>${r.category ? `<span style="display:inline-flex;align-items:center;gap:4px">${r.category.color?`<span style="width:8px;height:8px;border-radius:50%;background:${escHtml(r.category.color)};display:inline-block"></span>`:''}${escHtml(r.category.name)}</span>` : '<span class="text-muted">—</span>'}</td>
      <td class="truncate" style="max-width:200px" title="${escHtml(r.description||'')}">${escHtml(r.description || '—')}</td>
      <td style="text-align:right;font-weight:700" class="${r.type==='income'?'text-success':'text-danger'}">${r.type==='income'?'+':'−'}${fmt(r.amount)}</td>
      <td class="text-muted text-sm">${escHtml(r.created_by?.full_name || '—')}</td>
      ${actions.length ? `<td><div class="table-actions">${actions.join('')}</div></td>` : ''}
    </tr>`;
  },

  async exportCSV() {
    const { type, category_id, date_from, date_to } = this.filters;
    toast('Preparing export…', 'info');
    await api.records.export({ type, category_id, date_from, date_to });
  },

  async openCreate() {
    const catOpts = await getCategoryOptions();
    openModal('New Record', `
      <div class="form-row">
        ${textField('rec-amount', 'Amount', { type:'number', placeholder:'0', min:0.01, required:true })}
        ${selectField('rec-type', 'Type', [
          { value:'income', label:'Income' },
          { value:'expense', label:'Expense' }
        ], 'income', true)}
      </div>
      ${textField('rec-date', 'Date', { type:'date', value: new Date().toISOString().slice(0,10), required:true })}
      <div class="form-group">
        <label>Category</label>
        <select id="rec-cat"><option value="">— No category —</option>${catOpts}</select>
      </div>
      ${textField('rec-desc', 'Description', { placeholder:'What is this for?' })}
      ${textField('rec-ref', 'Reference No.', { placeholder:'INV-001' })}
      ${textareaField('rec-notes', 'Notes', '', 'Optional notes…')}
      ${textField('rec-tags', 'Tags', { placeholder:'salary, bonus (comma separated)' })}
      <div id="rec-err" class="alert alert-error hidden"></div>
    `, `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="RecordsPage.save()">Create Record</button>
    `);
  },

  async openEdit(id) {
    const res = await api.records.get(id);
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    const r   = res.data;
    const catOpts = await getCategoryOptions();
    openModal('Edit Record', `
      <div class="form-row">
        ${textField('rec-amount', 'Amount', { type:'number', value: r.amount, min:0.01, required:true })}
        ${selectField('rec-type', 'Type', [{ value:'income', label:'Income' },{ value:'expense', label:'Expense' }], r.type, true)}
      </div>
      ${textField('rec-date', 'Date', { type:'date', value: r.date, required:true })}
      <div class="form-group">
        <label>Category</label>
        <select id="rec-cat"><option value="">— No category —</option>${catOpts}</select>
      </div>
      ${textField('rec-desc', 'Description', { value: r.description||'', placeholder:'What is this for?' })}
      ${textField('rec-ref', 'Reference No.', { value: r.reference_no||'' })}
      ${textareaField('rec-notes', 'Notes', r.notes||'')}
      ${textField('rec-tags', 'Tags', { value: (r.tags||[]).join(', ') })}
      <div id="rec-err" class="alert alert-error hidden"></div>
    `, `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="RecordsPage.save('${id}')">Save Changes</button>
    `);
    // Set category after modal renders
    setTimeout(() => { if (r.category?.id) document.getElementById('rec-cat').value = r.category.id; }, 0);
  },

  async save(id = null) {
    clearFormErrs();
    const errEl = document.getElementById('rec-err');
    const amount = parseFloat(document.getElementById('rec-amount')?.value);
    const type   = document.getElementById('rec-type')?.value;
    const date   = document.getElementById('rec-date')?.value;

    if (!amount || amount <= 0) { errEl.textContent = 'Amount must be a positive number'; errEl.classList.remove('hidden'); return; }
    if (!type)  { errEl.textContent = 'Type is required'; errEl.classList.remove('hidden'); return; }
    if (!date)  { errEl.textContent = 'Date is required'; errEl.classList.remove('hidden'); return; }

    const tagStr = document.getElementById('rec-tags')?.value || '';
    const tags   = tagStr.split(',').map(t => t.trim()).filter(Boolean);

    const body = {
      amount,
      type,
      date,
      category_id: document.getElementById('rec-cat')?.value || null,
      description: document.getElementById('rec-desc')?.value.trim() || null,
      reference_no: document.getElementById('rec-ref')?.value.trim() || null,
      notes: document.getElementById('rec-notes')?.value.trim() || null,
      tags: tags.length ? tags : null,
    };

    const res = id ? await api.records.update(id, body) : await api.records.create(body);
    if (res.success) {
      toast(id ? 'Record updated' : 'Record created', 'success');
      closeModal();
      this.load();
    } else {
      errEl.textContent = apiErrMsg(res);
      errEl.classList.remove('hidden');
    }
  },

  confirmDel(id, name) {
    confirmDelete(name, async () => {
      const res = await api.records.delete(id);
      if (res.success) { toast('Record deleted', 'success'); this.load(); }
      else toast(apiErrMsg(res), 'error');
    });
  },
};

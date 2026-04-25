/* pages/categories.js */

const CategoriesPage = {
  canCreate: false,
  canAdmin:  false,

  async render() {
    this.canCreate = Auth.hasRole('analyst', 'admin');
    this.canAdmin  = Auth.hasRole('admin');
    setPageContent(`
      <div class="page-actions">
        <h2>Categories</h2>
        ${this.canCreate ? `<button class="btn btn-primary btn-sm" onclick="CategoriesPage.openCreate()">+ New Category</button>` : ''}
      </div>
      <div class="card">
        <div class="table-wrap" id="cat-table-wrap"><div class="page-loading">Loading…</div></div>
      </div>
    `);
    await this.load();
  },

  async load() {
    const res  = await api.categories.list();
    const wrap = document.getElementById('cat-table-wrap');
    if (!wrap) return;
    if (!res.success) { wrap.innerHTML = `<div class="alert alert-error">${apiErrMsg(res)}</div>`; return; }
    if (!res.data.length) { wrap.innerHTML = emptyState('◈', 'No categories yet', 'Create your first category to organise records'); return; }

    wrap.innerHTML = `<table>
      <thead><tr>
        <th>Name</th><th>Type</th><th>Color</th><th>Description</th><th>Created By</th>
        ${this.canAdmin ? '<th>Actions</th>' : ''}
      </tr></thead>
      <tbody>${res.data.map(c => this.renderRow(c)).join('')}</tbody>
    </table>`;
    invalidateCategoryCache();
  },

  renderRow(c) {
    const actions = [];
    if (this.canAdmin) {
      actions.push(`<button class="btn btn-ghost btn-sm" onclick="CategoriesPage.openEdit('${c.id}')">Edit</button>`);
      actions.push(`<button class="btn btn-danger btn-sm" onclick="CategoriesPage.confirmDel('${c.id}','${escHtml(c.name)}')">Del</button>`);
    }
    return `<tr>
      <td><strong>${escHtml(c.name)}</strong></td>
      <td>${badgeHtml(c.type)}</td>
      <td>${c.color ? `<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:16px;height:16px;border-radius:4px;background:${escHtml(c.color)};border:1px solid var(--border)"></span><code style="font-size:0.75rem">${escHtml(c.color)}</code></span>` : '<span class="text-muted">—</span>'}</td>
      <td class="text-muted text-sm">${escHtml(c.description || '—')}</td>
      <td class="text-muted text-sm">${escHtml(c.created_by_name || '—')}</td>
      ${actions.length ? `<td><div class="table-actions">${actions.join('')}</div></td>` : ''}
    </tr>`;
  },

  _modalHtml(cat = null) {
    return `
      ${textField('cat-name', 'Category Name', { value: cat?.name||'', placeholder:'e.g. Salary, Rent…', required:true })}
      ${selectField('cat-type', 'Type', [
        { value:'income',  label:'Income only' },
        { value:'expense', label:'Expense only' },
        { value:'both',    label:'Both (Income & Expense)' },
      ], cat?.type||'expense', true)}
      <div class="form-group">
        <label>Colour</label>
        <div style="display:flex;gap:0.6rem;align-items:center">
          <input type="color" id="cat-color" value="${cat?.color||'#6366f1'}" style="width:44px;height:36px;padding:2px;cursor:pointer;border-radius:6px" />
          <input type="text"  id="cat-color-hex" value="${cat?.color||'#6366f1'}" placeholder="#RRGGBB" style="width:100px" oninput="CategoriesPage.syncColor('hex')" />
          <div id="cat-palette" style="display:flex;gap:4px;flex-wrap:wrap">
            ${['#6366f1','#22c55e','#ef4444','#f59e0b','#06b6d4','#8b5cf6','#ec4899','#f97316','#14b8a6','#84cc16']
              .map(col => `<span onclick="CategoriesPage.pickColor('${col}')" style="width:20px;height:20px;border-radius:4px;background:${col};cursor:pointer;border:2px solid transparent" title="${col}"></span>`).join('')}
          </div>
        </div>
      </div>
      ${textareaField('cat-desc', 'Description', cat?.description||'', 'Optional description…')}
      <div id="cat-err" class="alert alert-error hidden"></div>
    `;
  },

  openCreate() {
    openModal('New Category', this._modalHtml(), `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="CategoriesPage.save()">Create</button>
    `);
    this._bindColorSync();
  },

  async openEdit(id) {
    const res = await api.categories.get(id);
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    openModal('Edit Category', this._modalHtml(res.data), `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="CategoriesPage.save('${id}')">Save Changes</button>
    `);
    this._bindColorSync();
  },

  _bindColorSync() {
    setTimeout(() => {
      document.getElementById('cat-color')?.addEventListener('input', () => this.syncColor('picker'));
    }, 50);
  },

  syncColor(from) {
    if (from === 'picker') {
      document.getElementById('cat-color-hex').value = document.getElementById('cat-color').value;
    } else {
      const hex = document.getElementById('cat-color-hex').value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) document.getElementById('cat-color').value = hex;
    }
  },

  pickColor(hex) {
    document.getElementById('cat-color').value     = hex;
    document.getElementById('cat-color-hex').value = hex;
  },

  async save(id = null) {
    const errEl = document.getElementById('cat-err');
    const name  = document.getElementById('cat-name')?.value.trim();
    const type  = document.getElementById('cat-type')?.value;
    const color = document.getElementById('cat-color-hex')?.value.trim() || null;
    const desc  = document.getElementById('cat-desc')?.value.trim() || null;

    if (!name) { errEl.textContent = 'Name is required'; errEl.classList.remove('hidden'); return; }
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) { errEl.textContent = 'Color must be a valid hex code (#RRGGBB)'; errEl.classList.remove('hidden'); return; }

    const res = id
      ? await api.categories.update(id, { name, type, color, description: desc })
      : await api.categories.create({ name, type, color, description: desc });

    if (res.success) {
      toast(id ? 'Category updated' : 'Category created', 'success');
      invalidateCategoryCache();
      closeModal();
      this.load();
    } else {
      errEl.textContent = apiErrMsg(res);
      errEl.classList.remove('hidden');
    }
  },

  confirmDel(id, name) {
    confirmDelete(name, async () => {
      const res = await api.categories.delete(id);
      if (res.success) { toast('Category deleted', 'success'); invalidateCategoryCache(); this.load(); }
      else toast(apiErrMsg(res), 'error');
    });
  },
};

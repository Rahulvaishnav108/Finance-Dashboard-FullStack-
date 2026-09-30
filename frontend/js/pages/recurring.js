/* pages/recurring.js */

const RecurringPage = {
  canWrite: false,
  canDelete: false,
  items: [],
  categories: [],

  async render() {
    this.canWrite = Auth.hasRole('analyst', 'admin');
    this.canDelete = Auth.hasRole('admin');
    setPageContent(`
      <div class="page-actions">
        <h2>Recurring income and expenses</h2>
        ${this.canWrite ? '<button class="btn btn-primary btn-sm" onclick="RecurringPage.openCreate()">+ New recurring item</button>' : ''}
      </div>
      <div class="stats-grid" id="recurring-summary"><div class="page-loading">Loading…</div></div>
      <div class="card">
        <div class="table-wrap" id="recurring-table-wrap"><div class="page-loading">Loading…</div></div>
      </div>
    `);
    const [items, categories] = await Promise.all([api.recurring.list(), api.categories.list()]);
    if (!items.success) {
      document.getElementById('recurring-table-wrap').innerHTML = `<div class="alert alert-error">${apiErrMsg(items)}</div>`;
      return;
    }
    this.items = items.data;
    this.categories = categories.success ? categories.data : [];
    this.paint();
  },

  paint() {
    const today = new Date().toISOString().slice(0, 10);
    const active = this.items.filter(item => item.status === 'active');
    const monthlyized = (type) => active.filter(item => item.type === type)
      .reduce((total, item) => total + Number(item.amount) / (item.frequency === 'yearly' ? 12 : 1), 0);
    const dueCount = active.filter(item => item.next_due_date <= today).length;
    document.getElementById('recurring-summary').innerHTML = `
      <div class="stat-card income"><div class="stat-label">Monthly income</div><div class="stat-value income">${fmt(monthlyized('income'))}</div></div>
      <div class="stat-card expense"><div class="stat-label">Monthly expenses</div><div class="stat-value expense">${fmt(monthlyized('expense'))}</div></div>
      <div class="stat-card count"><div class="stat-label">Active schedules</div><div class="stat-value count">${active.length}</div></div>
      <div class="stat-card balance"><div class="stat-label">Due to record</div><div class="stat-value balance">${dueCount}</div></div>
    `;

    const wrap = document.getElementById('recurring-table-wrap');
    if (!this.items.length) {
      wrap.innerHTML = emptyState('↻', 'No recurring items', 'Add a subscription, retainer, rent, or other repeating item');
      return;
    }
    wrap.innerHTML = `<table>
      <thead><tr><th>Name</th><th>Type</th><th>Amount / Cycle</th><th>Category</th><th>Next due</th><th>Status</th>${this.canWrite ? '<th>Actions</th>' : ''}</tr></thead>
      <tbody>${this.items.map(item => this.renderRow(item, today)).join('')}</tbody>
    </table>`;
  },

  renderRow(item, today) {
    const due = item.status === 'active' && item.next_due_date <= today;
    const actions = [];
    if (this.canWrite) {
      if (due) actions.push(`<button class="btn btn-primary btn-sm" onclick="RecurringPage.recordPayment('${item.id}')">Record</button>`);
      actions.push(`<button class="btn btn-ghost btn-sm" onclick="RecurringPage.openEdit('${item.id}')">Edit</button>`);
    }
    if (this.canDelete) actions.push(`<button class="btn btn-danger btn-sm" onclick="RecurringPage.confirmDelete('${item.id}','${escHtml(item.name)}')">Delete</button>`);
    return `<tr>
      <td><strong>${escHtml(item.name)}</strong>${item.notes ? `<div class="text-muted text-sm">${escHtml(item.notes)}</div>` : ''}</td>
      <td>${badgeHtml(item.type)}</td>
      <td>${fmt(item.amount)} <span class="text-muted text-sm">/ ${item.frequency === 'yearly' ? 'year' : 'month'}</span></td>
      <td>${escHtml(item.category_name || '—')}</td>
      <td>${escHtml(item.next_due_date)}${due ? ' <span class="badge badge-expense">Due</span>' : ''}</td>
      <td>${badgeHtml(item.status)}</td>
      ${this.canWrite ? `<td><div class="table-actions">${actions.join('')}</div></td>` : ''}
    </tr>`;
  },

  formHtml(item = null) {
    const categoryOptions = [
      { value: '', label: 'No category' },
      ...this.categories.map(category => ({ value: category.id, label: category.name })),
    ];
    return `
      ${textField('recurring-name', 'Name', { value: item?.name || '', placeholder: 'e.g. Cloud hosting, monthly retainer', required: true })}
      <div class="form-row">
        ${selectField('recurring-type', 'Type', [{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }], item?.type || 'expense', true)}
        <div class="form-group"><label for="recurring-amount">Amount</label><input id="recurring-amount" type="number" min="0.01" step="0.01" value="${escHtml(item?.amount ?? '')}" required /></div>
      </div>
      <div class="form-row">
        ${selectField('recurring-frequency', 'Cycle', [{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }], item?.frequency || 'monthly', true)}
        ${selectField('recurring-category', 'Category', categoryOptions, item?.category_id || '', false)}
      </div>
      <div class="form-group"><label for="recurring-due">Next due date</label><input id="recurring-due" type="date" value="${item?.next_due_date || new Date().toISOString().slice(0, 10)}" required /></div>
      ${item ? selectField('recurring-status', 'Status', [{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'cancelled', label: 'Cancelled' }], item.status, true) : ''}
      ${textareaField('recurring-notes', 'Notes', item?.notes || '', 'Optional details…')}
      <div id="recurring-err" class="alert alert-error hidden"></div>
    `;
  },

  openCreate() {
    openModal('New recurring item', this.formHtml(), `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="RecurringPage.save()">Create</button>
    `);
  },

  async openEdit(id) {
    const res = await api.recurring.get(id);
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    openModal('Edit recurring item', this.formHtml(res.data), `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="RecurringPage.save('${id}')">Save changes</button>
    `);
  },

  async save(id = null) {
    const err = document.getElementById('recurring-err');
    const body = {
      name: document.getElementById('recurring-name').value.trim(),
      amount: Number(document.getElementById('recurring-amount').value),
      type: document.getElementById('recurring-type').value,
      frequency: document.getElementById('recurring-frequency').value,
      category_id: document.getElementById('recurring-category').value || null,
      next_due_date: document.getElementById('recurring-due').value,
      notes: document.getElementById('recurring-notes').value.trim() || null,
    };
    if (id) body.status = document.getElementById('recurring-status').value;
    const res = id ? await api.recurring.update(id, body) : await api.recurring.create(body);
    if (!res.success) { err.textContent = apiErrMsg(res); err.classList.remove('hidden'); return; }
    toast(id ? 'Recurring item updated' : 'Recurring item created', 'success');
    closeModal();
    await this.render();
  },

  async recordPayment(id) {
    const res = await api.recurring.recordPayment(id);
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    toast('Payment added to financial records', 'success');
    await this.render();
  },

  confirmDelete(id, name) {
    openModal('Delete recurring item', `<p>Delete <strong>${escHtml(name)}</strong>? This cannot be undone.</p>`, `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="closeModal();RecurringPage.remove('${id}')">Delete</button>
    `);
  },

  async remove(id) {
    const res = await api.recurring.delete(id);
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    toast('Recurring item deleted', 'success');
    await this.render();
  },
};
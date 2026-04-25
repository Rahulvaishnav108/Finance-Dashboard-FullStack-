/* pages/dashboard.js */

const DashboardPage = {
  dateFrom: '',
  dateTo:   '',

  async render() {
    setPageContent(`
      <div class="filters-bar" style="margin-bottom:1.25rem">
        <input type="date" id="df-from" placeholder="From" />
        <input type="date" id="df-to"   placeholder="To" />
        <button class="btn btn-ghost btn-sm" onclick="DashboardPage.applyFilter()">Apply</button>
        <button class="btn btn-ghost btn-sm" onclick="DashboardPage.resetFilter()">Reset</button>
      </div>
      <div id="dash-body"><div class="page-loading">Loading dashboard…</div></div>
    `);
    if (this.dateFrom) document.getElementById('df-from').value = this.dateFrom;
    if (this.dateTo)   document.getElementById('df-to').value   = this.dateTo;
    await this.loadData();
  },

  applyFilter() {
    this.dateFrom = document.getElementById('df-from').value;
    this.dateTo   = document.getElementById('df-to').value;
    this.loadData();
  },

  resetFilter() {
    this.dateFrom = ''; this.dateTo = '';
    document.getElementById('df-from').value = '';
    document.getElementById('df-to').value   = '';
    this.loadData();
  },

  async loadData() {
    const params = { date_from: this.dateFrom, date_to: this.dateTo };
    const isAnalyst = Auth.hasRole('analyst', 'admin');

    const [overviewRes, insightsRes] = await Promise.all([
      api.dashboard.overview(params),
      isAnalyst ? api.dashboard.insights(params) : Promise.resolve(null),
    ]);

    if (!overviewRes.success) {
      document.getElementById('dash-body').innerHTML = `<div class="alert alert-error">${apiErrMsg(overviewRes)}</div>`;
      return;
    }

    const { summary, category_totals, monthly_trends, recent_activity } = overviewRes.data;
    const insights = insightsRes?.data;

    document.getElementById('dash-body').innerHTML = `
      ${this.renderSummaryCards(summary)}
      ${insights ? this.renderInsightBar(insights) : ''}
      <div class="charts-grid">
        <div class="card">
          <div class="card-header"><span class="card-title">Monthly Trends</span></div>
          <div class="chart-wrap"><canvas id="chart-monthly"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Category Breakdown</span></div>
          <div class="chart-wrap"><canvas id="chart-category"></canvas></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div class="card">
          <div class="card-header"><span class="card-title">Recent Activity</span></div>
          <div class="activity-list" id="activity-list"></div>
        </div>
        ${insights ? this.renderTopCategories(insights) : '<div></div>'}
      </div>
    `;

    this.renderMonthlyChart(monthly_trends);
    this.renderCategoryChart(category_totals);
    this.renderActivity(recent_activity);
  },

  renderSummaryCards(s) {
    const netClass = s.net_balance >= 0 ? 'balance' : 'expense';
    return `<div class="stats-grid">
      <div class="stat-card income">
        <div class="stat-label">Total Income</div>
        <div class="stat-value income">${fmt(s.total_income)}</div>
        <div class="stat-sub">${s.income_count} transactions</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value expense">${fmt(s.total_expenses)}</div>
        <div class="stat-sub">${s.expense_count} transactions</div>
      </div>
      <div class="stat-card balance">
        <div class="stat-label">Net Balance</div>
        <div class="stat-value ${netClass}">${fmt(s.net_balance)}</div>
        <div class="stat-sub">${s.net_balance >= 0 ? '↑ Surplus' : '↓ Deficit'}</div>
      </div>
      <div class="stat-card count">
        <div class="stat-label">Total Records</div>
        <div class="stat-value count">${s.total_records}</div>
        <div class="stat-sub">All time</div>
      </div>
    </div>`;
  },

  renderInsightBar(ins) {
    const rate = ins.savings_rate ?? 0;
    const rateColor = rate >= 30 ? 'var(--success)' : rate >= 10 ? 'var(--warn)' : 'var(--danger)';
    const ratio = ins.expense_to_income_ratio ?? 0;
    return `<div class="card" style="margin-bottom:1rem">
      <div class="card-header">
        <span class="card-title">Financial Health</span>
        <span class="text-sm text-muted">Analyst Insights</span>
      </div>
      <div class="insights-row">
        <div class="insight-item">
          <div class="insight-value" style="color:${rateColor}">${rate.toFixed(1)}%</div>
          <div class="insight-label">Savings Rate</div>
          <div class="progress-bar" style="margin-top:0.6rem">
            <div class="progress-fill" style="width:${Math.min(rate,100)}%;background:${rateColor}"></div>
          </div>
        </div>
        <div class="insight-item">
          <div class="insight-value" style="color:var(--danger)">${ratio?.toFixed(1) ?? '—'}%</div>
          <div class="insight-label">Expense Ratio</div>
          <div class="progress-bar" style="margin-top:0.6rem">
            <div class="progress-fill" style="width:${Math.min(ratio||0,100)}%;background:var(--danger)"></div>
          </div>
        </div>
        <div class="insight-item">
          <div class="insight-value" style="color:var(--success)">${fmt(ins.summary?.net_balance)}</div>
          <div class="insight-label">Net Surplus</div>
        </div>
      </div>
    </div>`;
  },

  renderTopCategories(ins) {
    const rows = ins.top_expense_categories.map(c => `
      <div class="activity-item">
        <div class="activity-body">
          <div class="activity-desc">${escHtml(c.category)}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${c.percentage||0}%;background:var(--danger)"></div></div>
        </div>
        <div class="activity-amount text-danger">${fmt(c.total)}</div>
      </div>`).join('');
    return `<div class="card">
      <div class="card-header"><span class="card-title">Top Expense Categories</span></div>
      ${rows || emptyState('📊', 'No data yet')}
    </div>`;
  },

  renderMonthlyChart(data) {
    const labels   = data.map(d => d.month);
    const c        = getChartColors();
    makeLineChart('chart-monthly', labels, [
      { label: 'Income',  data: data.map(d => d.income),  borderColor: c.income,  backgroundColor: c.income + '22',  tension: 0.4, fill: true, pointRadius: 3 },
      { label: 'Expense', data: data.map(d => d.expense), borderColor: c.expense, backgroundColor: c.expense + '22', tension: 0.4, fill: true, pointRadius: 3 },
    ]);
  },

  renderCategoryChart(data) {
    const palette = ['#6366f1','#22c55e','#ef4444','#f59e0b','#06b6d4','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16'];
    const expenses = data.filter(d => d.type === 'expense').slice(0, 8);
    if (!expenses.length) { destroyChart('chart-category'); return; }
    makeDoughnutChart('chart-category',
      expenses.map(d => d.category_name),
      expenses.map(d => d.total),
      expenses.map((_, i) => palette[i % palette.length]),
    );
  },

  renderActivity(data) {
    const el = document.getElementById('activity-list');
    if (!el) return;
    if (!data.length) { el.innerHTML = emptyState('📋', 'No recent activity'); return; }
    el.innerHTML = data.slice(0, 8).map(r => `
      <div class="activity-item">
        <div class="activity-icon ${r.type}">${r.type === 'income' ? '↑' : '↓'}</div>
        <div class="activity-body">
          <div class="activity-desc">${escHtml(r.description || r.category_name || '—')}</div>
          <div class="activity-date">${fmtDate(r.date)} · ${escHtml(r.created_by_name || '—')}</div>
        </div>
        <div class="activity-amount ${r.type === 'income' ? 'text-success' : 'text-danger'}">${r.type === 'income' ? '+' : '-'}${fmt(r.amount)}</div>
      </div>`).join('');
  },
};

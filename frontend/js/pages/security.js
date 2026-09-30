/* pages/security.js */

const SecurityPage = {
  async render() {
    setPageContent(`
      <div class="page-actions"><h2>Security Center</h2></div>
      <div id="security-content"><div class="page-loading">Loading security status…</div></div>
    `);
    await this.load();
  },

  async load() {
    const res = await api.security.overview();
    const content = document.getElementById('security-content');
    if (!content) return;
    if (!res.success) {
      content.innerHTML = `<div class="alert alert-error">${apiErrMsg(res)}</div>`;
      return;
    }
    this.data = res.data;
    content.innerHTML = `
      ${this.renderMetrics(res.data.metrics)}
      <div class="card">
        <div class="card-header"><span class="card-title">Active protections</span><span class="text-sm text-muted">Runtime configuration</span></div>
        <div class="table-wrap">${this.renderControls(res.data.controls)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">IP blocklist</span></div>
        <div class="security-block-form">
          <div class="form-group"><label for="security-ip">IP address</label><input id="security-ip" type="text" inputmode="decimal" placeholder="203.0.113.10" autocomplete="off" /></div>
          <div class="form-group"><label for="security-reason">Reason</label><input id="security-reason" type="text" maxlength="200" placeholder="Optional note" /></div>
          <button class="btn btn-danger" onclick="SecurityPage.blockIp()">Block IP</button>
        </div>
        <div class="table-wrap">${this.renderBlockedIps(res.data.blocked_ips)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Recent security events</span><span class="text-sm text-muted">Latest 100</span></div>
        <div class="table-wrap">${this.renderEvents(res.data.events)}</div>
      </div>
    `;
  },

  renderMetrics(metrics) {
    return `<div class="stats-grid">
      <div class="stat-card balance"><div class="stat-label">Blocked IPs</div><div class="stat-value balance">${metrics.blocked_ip_count}</div></div>
      <div class="stat-card count"><div class="stat-label">Security events · 24h</div><div class="stat-value count">${metrics.events_24h}</div></div>
      <div class="stat-card expense"><div class="stat-label">Failed sign-in events · 24h</div><div class="stat-value expense">${metrics.failed_signins_24h}</div></div>
      <div class="stat-card"><div class="stat-label">Rate limits · 24h</div><div class="stat-value">${metrics.rate_limits_24h}</div></div>
      <div class="stat-card"><div class="stat-label">Blocked requests · 24h</div><div class="stat-value">${metrics.blocked_requests_24h}</div></div>
    </div>`;
  },

  renderControls(controls) {
    if (!controls.length) return emptyState('⬡', 'No security controls reported');
    return `<table><thead><tr><th>Control</th><th>Status</th><th>Details</th></tr></thead><tbody>
      ${controls.map(control => `<tr>
        <td><strong>${escHtml(control.name)}</strong></td>
        <td>${badgeHtml(control.status, control.status)}</td>
        <td class="text-muted text-sm">${escHtml(control.detail)}</td>
      </tr>`).join('')}
    </tbody></table>`;
  },

  renderBlockedIps(items) {
    if (!items.length) return emptyState('⌁', 'No blocked IP addresses');
    return `<table><thead><tr><th>IP address</th><th>Reason</th><th>Blocked by</th><th>Blocked at</th><th></th></tr></thead><tbody>
      ${items.map(item => `<tr>
        <td><code>${escHtml(item.ip_address)}</code></td>
        <td>${escHtml(item.reason || '—')}</td>
        <td>${escHtml(item.blocked_by_name || '—')}</td>
        <td>${fmtDatetime(item.blocked_at)}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="SecurityPage.unblockIp('${item.id}','${escHtml(item.ip_address)}')">Unblock</button></td>
      </tr>`).join('')}
    </tbody></table>`;
  },

  renderEvents(events) {
    if (!events.length) return emptyState('◷', 'No security events recorded');
    return `<table><thead><tr><th>Time</th><th>Severity</th><th>Event</th><th>IP address</th><th>Path</th><th>User</th></tr></thead><tbody>
      ${events.map(event => `<tr>
        <td>${fmtDatetime(event.created_at)}</td>
        <td>${badgeHtml(event.severity, event.severity)}</td>
        <td><strong>${escHtml(event.event_type)}</strong><div class="text-sm text-muted">${escHtml(event.message)}</div></td>
        <td><code>${escHtml(event.ip_address || '—')}</code></td>
        <td><code>${escHtml(event.path || '—')}</code></td>
        <td>${escHtml(event.user_name || 'System')}</td>
      </tr>`).join('')}
    </tbody></table>`;
  },

  async blockIp() {
    const ipAddress = document.getElementById('security-ip').value.trim();
    const reason = document.getElementById('security-reason').value.trim();
    if (!ipAddress) { toast('Enter an IP address', 'error'); return; }
    const res = await api.security.blockIp({ ip_address: ipAddress, reason: reason || null });
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    toast('IP address blocked', 'success');
    await this.load();
  },

  unblockIp(id, ipAddress) {
    openModal('Unblock IP address', `<p>Remove <strong>${escHtml(ipAddress)}</strong> from the blocklist?</p>`, `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();SecurityPage.confirmUnblock('${id}')">Unblock</button>
    `);
  },

  async confirmUnblock(id) {
    const res = await api.security.unblockIp(id);
    if (!res.success) { toast(apiErrMsg(res), 'error'); return; }
    toast('IP address unblocked', 'success');
    await this.load();
  },
};
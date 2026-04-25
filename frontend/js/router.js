/* router.js — hash-based SPA router */

const PAGES = {
  dashboard:  { title: 'Dashboard',   roles: null,              handler: () => DashboardPage.render() },
  records:    { title: 'Records',      roles: null,              handler: () => RecordsPage.render() },
  categories: { title: 'Categories',  roles: null,              handler: () => CategoriesPage.render() },
  users:      { title: 'Users',        roles: ['admin'],         handler: () => UsersPage.render() },
  audit:      { title: 'Audit Log',   roles: ['admin'],         handler: () => AuditPage.render() },
  profile:    { title: 'My Profile',  roles: null,              handler: () => ProfilePage.render() },
};

const Router = {
  current: null,

  init() {
    window.addEventListener('hashchange', () => this._route());
    this._route();
  },

  go(page) {
    window.location.hash = page === 'login' ? '' : page;
    if (page === 'login') this._showLogin();
  },

  async _route() {
    const hash = window.location.hash.replace('#', '').split('?')[0] || '';

    // Not logged in → always show login
    if (!Auth.isLoggedIn()) {
      this._showLogin();
      return;
    }

    // Logged in but no hash → go to dashboard
    if (!hash) {
      window.location.hash = 'dashboard';
      return;
    }

    const page = PAGES[hash];
    if (!page) { window.location.hash = 'dashboard'; return; }

    // Role guard
    const user = Auth.getUser();
    if (page.roles && !page.roles.includes(user?.role)) {
      toast('You do not have permission to view that page', 'error');
      window.location.hash = 'dashboard';
      return;
    }

    this._showApp();
    this._setActive(hash);
    document.getElementById('page-title').textContent = page.title;
    this.current = hash;
    await page.handler();
  },

  _showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    // Auto-fill demo hint
    const emailEl = document.getElementById('login-email');
    if (emailEl && !emailEl.value) emailEl.focus();
  },

  _showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    this._updateSidebarUser();
    this._updateAdminNav();
  },

  _updateSidebarUser() {
    const user = Auth.getUser();
    if (!user) return;
    document.getElementById('sidebar-name').textContent  = user.full_name || user.email;
    document.getElementById('sidebar-role').textContent  = user.role;
    document.getElementById('sidebar-role').className    = `user-role badge badge-${user.role}`;
    document.getElementById('sidebar-avatar').textContent = initials(user.full_name);
    document.getElementById('topbar-role').textContent   = user.role;
    document.getElementById('topbar-role').className     = `topbar-role badge badge-${user.role}`;
  },

  _updateAdminNav() {
    const user    = Auth.getUser();
    const adminEl = document.getElementById('admin-nav');
    if (adminEl) adminEl.style.display = user?.role === 'admin' ? 'block' : 'none';
  },

  _setActive(page) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  },
};

// Make Router globally accessible
window.Router = Router;

// Boot
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  Router.init();
});

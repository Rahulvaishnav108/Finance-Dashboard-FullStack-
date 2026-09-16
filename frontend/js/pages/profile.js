/* pages/profile.js — profile & password change */

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

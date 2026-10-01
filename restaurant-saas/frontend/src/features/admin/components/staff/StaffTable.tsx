import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Eye,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Star,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useStaffStore } from '../../store/staff.store';
import type { StaffRole, StaffDepartment, StaffStatus, StaffMember } from '../../store/staff.store';
import { apiClient } from '../../../../shared/services/apiClient';

// ── Constants ──────────────────────────────────────────────────────────────

const EDIT_ROLES: StaffRole[] = ['Manager', 'Chef', 'Server', 'Bartender', 'Host', 'Cleaner'];
const EDIT_DEPTS: StaffDepartment[] = [
  'Management',
  'Kitchen',
  'Service',
  'Bar',
  'Front Desk',
  'Cleaning',
];
const EDIT_STATUSES: StaffStatus[] = ['Active', 'On Leave', 'Inactive'];

const ROLES: Array<StaffRole | 'All Roles'> = [
  'All Roles',
  'Manager',
  'Chef',
  'Server',
  'Bartender',
  'Host',
  'Cleaner',
];
const DEPTS: Array<StaffDepartment | 'All Departments'> = [
  'All Departments',
  'Management',
  'Kitchen',
  'Service',
  'Bar',
  'Front Desk',
  'Cleaning',
];
const STATUSES: Array<StaffStatus | 'All'> = ['All', 'Active', 'On Leave', 'Inactive'];

const ROLE_COLORS: Record<StaffRole, string> = {
  Manager: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  Chef: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  Server: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  Bartender: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  Host: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  Cleaner: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_COLORS: Record<StaffStatus, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  'On Leave': 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  Inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

// ── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ── View Staff Modal ───────────────────────────────────────────────────────

function ViewStaffModal({
  member,
  onClose,
  onEdit,
  onViewHistory,
}: {
  member: StaffMember;
  onClose: () => void;
  onEdit: () => void;
  onViewHistory: () => void;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            Staff Member Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {member.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                {member.name}
              </h3>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[member.role]}`}
              >
                {member.role}
              </span>
            </div>
            <span
              className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[member.status]}`}
            >
              {member.status}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: member.email },
              { icon: Phone, label: 'Phone', value: member.phone },
              { icon: Building2, label: 'Department', value: member.department },
              { icon: Calendar, label: 'Hire Date', value: member.hireDate },
              { icon: DollarSign, label: 'Salary', value: `₹${member.salary.toLocaleString()}` },
              { icon: Star, label: 'Performance', value: `${member.performance} / 5.0` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onViewHistory}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl transition-colors"
          >
            View Login History
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            Edit Member
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Staff Modal ───────────────────────────────────────────────────────

function EditStaffModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}): JSX.Element {
  const { updateMember } = useStaffStore();
  const [form, setForm] = useState({
    name: member.name,
    email: member.email,
    phone: member.phone,
    password: '',
    dbRole: member.dbRole || (member.role === 'Chef' ? 'kitchen-staff' : member.role === 'Cleaner' ? 'cleaning-staff' : member.role === 'Manager' ? 'restaurant-admin' : 'service-staff'),
    kitchen_role: member.kitchen_role || '',
    staff_role: member.staff_role || '',
    cleaning_role: member.cleaning_role || '',
    status: member.status,
    salary: String(member.salary),
    performance: member.performance,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (form.password.trim() !== '') {
      if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        e.password = 'Must contain uppercase, lowercase, and digit';
      }
    }
    if (!form.salary || isNaN(Number(form.salary))) e.salary = 'Valid salary required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    let feRole: StaffRole = 'Server';
    let feDept: StaffDepartment = 'Service';
    if (form.dbRole === 'kitchen-staff') { feRole = 'Chef'; feDept = 'Kitchen'; }
    else if (form.dbRole === 'service-staff') { feRole = 'Server'; feDept = 'Service'; }
    else if (form.dbRole === 'cleaning-staff') { feRole = 'Cleaner'; feDept = 'Cleaning'; }
    else if (form.dbRole === 'restaurant-admin') { feRole = 'Manager'; feDept = 'Management'; }

    const initials = form.name
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase();
    updateMember(member.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password || undefined,
      dbRole: form.dbRole,
      kitchen_role: form.kitchen_role || undefined,
      staff_role: form.staff_role || undefined,
      cleaning_role: form.cleaning_role || undefined,
      role: feRole,
      department: feDept,
      status: form.status,
      salary: Number(form.salary),
      performance: form.performance,
      avatar: initials,
    });
    onClose();
  };

  const field = (key: keyof typeof form, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              Edit Staff Member
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update details for {member.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label
              htmlFor="edit-name"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              <User className="w-3.5 h-3.5" /> Full Name *
            </label>
            <input
              id="edit-name"
              type="text"
              value={form.name}
              onChange={(e) => field('name', e.target.value)}
              className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-900 dark:text-gray-100 ${
                errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label
              htmlFor="edit-email"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Email *
            </label>
            <input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => field('email', e.target.value)}
              className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-900 dark:text-gray-100 ${
                errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label
              htmlFor="edit-phone"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input
              id="edit-phone"
              type="text"
              value={form.phone}
              onChange={(e) => field('phone', e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Reset Password */}
          <div>
            <label
              htmlFor="edit-password"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              Reset Password
            </label>
            <input
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={(e) => field('password', e.target.value)}
              className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${
                errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Primary Role & Sub-role Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-db-role"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" /> Primary Role
              </label>
              <div className="relative">
                <select
                  id="edit-db-role"
                  value={form.dbRole}
                  onChange={(e) => {
                    const selectedRole = e.target.value;
                    let defaultSubRole = '';
                    if (selectedRole === 'kitchen-staff') defaultSubRole = 'CHEF';
                    else if (selectedRole === 'service-staff') defaultSubRole = 'WAITER';
                    else if (selectedRole === 'cleaning-staff') defaultSubRole = 'CLEANING_STAFF';

                    setForm((prev) => ({
                      ...prev,
                      dbRole: selectedRole,
                      kitchen_role: selectedRole === 'kitchen-staff' ? defaultSubRole : '',
                      staff_role: selectedRole === 'service-staff' ? defaultSubRole : '',
                      cleaning_role: selectedRole === 'cleaning-staff' ? defaultSubRole : '',
                    }));
                  }}
                  className="w-full appearance-none px-3 py-2.5 sm:py-2 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100"
                >
                  <option value="service-staff">Service Staff</option>
                  <option value="kitchen-staff">Kitchen Staff</option>
                  <option value="cleaning-staff">Cleaning Staff</option>
                  <option value="restaurant-admin">Restaurant Admin</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {form.dbRole !== 'restaurant-admin' && (
              <div>
                <label
                  htmlFor="edit-sub-role"
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" /> Operational Role
                </label>
                <div className="relative">
                  {form.dbRole === 'kitchen-staff' && (
                    <select
                      id="edit-sub-role"
                      value={form.kitchen_role}
                      onChange={(e) => field('kitchen_role', e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 sm:py-2 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100"
                    >
                      <option value="CHEF">Chef</option>
                      <option value="KITCHEN_SUPERVISOR">Kitchen Supervisor</option>
                      <option value="HEAD_CHEF">Head Chef</option>
                    </select>
                  )}
                  {form.dbRole === 'service-staff' && (
                    <select
                      id="edit-sub-role"
                      value={form.staff_role}
                      onChange={(e) => field('staff_role', e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 sm:py-2 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100"
                    >
                      <option value="WAITER">Waiter</option>
                      <option value="FLOOR_STAFF">Floor Staff</option>
                      <option value="FLOOR_SUPERVISOR">Floor Supervisor</option>
                    </select>
                  )}
                  {form.dbRole === 'cleaning-staff' && (
                    <select
                      id="edit-sub-role"
                      value={form.cleaning_role}
                      onChange={(e) => field('cleaning_role', e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 sm:py-2 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100"
                    >
                      <option value="CLEANING_STAFF">Cleaning Staff</option>
                      <option value="HOUSEKEEPING">Housekeeping</option>
                      <option value="CLEANING_SUPERVISOR">Cleaning Supervisor</option>
                    </select>
                  )}
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-status"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Status
              </label>
              <div className="relative">
                <select
                  id="edit-status"
                  value={form.status}
                  onChange={(e) => field('status', e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 sm:py-2 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100"
                >
                  {EDIT_STATUSES.map((s: StaffStatus) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label
                htmlFor="edit-salary"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" /> Salary (₹) *
              </label>
              <input
                id="edit-salary"
                type="number"
                value={form.salary}
                onChange={(e) => field('salary', e.target.value)}
                className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none text-gray-900 dark:text-gray-100 ${
                  errors.salary ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────

function DeleteConfirmModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}): JSX.Element {
  const { deleteMember } = useStaffStore();
  const handleDelete = () => {
    deleteMember(member.id);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 text-center">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 sm:hidden" />
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4 mt-2 sm:mt-0">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
          Remove Staff Member
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2.5 sm:py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewAllModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { members } = useStaffStore();
  const [search, setSearch] = useState('');
  const filtered = members.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              All Staff Members
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {members.length} total members
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{m.email}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:inline-flex ${ROLE_COLORS[m.role]}`}
                >
                  {m.role}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[m.status]}`}
                >
                  {m.status}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">No members found</div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Login History Modal ───────────────────────────────────────────────────

function LoginHistoryModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}): JSX.Element {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await apiClient.get(`/audit-logs?actorId=${member.id}&action=AUTH_LOGIN`);
        setLogs(res.data.data.logs || []);
      } catch (err) {
        console.error('Failed to fetch login history', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [member.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close login history"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              Login History
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Recent logins for {member.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading history...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No login history recorded</div>
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl"
              >
                <div className="flex justify-between items-center text-xs font-semibold text-gray-750 dark:text-gray-300">
                  <span>Logged In</span>
                  <span className="text-gray-400 font-normal">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <p>IP Address: {log.ipAddress || 'Unknown'}</p>
                  <p className="truncate" title={log.userAgent}>User Agent: {log.userAgent || 'Unknown'}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action Menu ────────────────────────────────────────────────────────────

function ActionMenu({
  viewAction,
  editAction,
  deleteAction,
}: {
  viewAction: () => void;
  editAction: () => void;
  deleteAction: () => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 w-40">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              viewAction();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              editAction();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Member
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              deleteAction();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── Mobile Staff Card ──────────────────────────────────────────────────────

function MobileStaffCard({
  member,
  onView,
  onEdit,
  onDelete,
}: {
  member: StaffMember;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      <Avatar initials={member.avatar} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {member.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role]}`}
          >
            {member.role}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[member.status]}`}
          >
            {member.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{member.department}</p>
      </div>
      <ActionMenu viewAction={onView} editAction={onEdit} deleteAction={onDelete} />
    </div>
  );
}

// ── Filter Sheet (mobile) ──────────────────────────────────────────────────

function FilterSheet({
  roleFilter,
  departmentFilter,
  statusFilter,
  onRoleChange,
  onDeptChange,
  onStatusChange,
  onClose,
}: {
  roleFilter: StaffRole | 'All Roles';
  departmentFilter: StaffDepartment | 'All Departments';
  statusFilter: StaffStatus | 'All';
  onRoleChange: (v: StaffRole | 'All Roles') => void;
  onDeptChange: (v: StaffDepartment | 'All Departments') => void;
  onStatusChange: (v: StaffStatus | 'All') => void;
  onClose: () => void;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl w-full p-5 space-y-4">
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Filter Staff</h3>

        <div className="space-y-3">
          <div>
            <label htmlFor="filter-role" className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
              Role
            </label>
            <div className="relative">
              <select
                id="filter-role"
                value={roleFilter}
                onChange={(e) => onRoleChange(e.target.value as StaffRole | 'All Roles')}
                className="w-full appearance-none px-3 py-2.5 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="filter-dept" className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
              Department
            </label>
            <div className="relative">
              <select
                id="filter-dept"
                value={departmentFilter}
                onChange={(e) =>
                  onDeptChange(e.target.value as StaffDepartment | 'All Departments')
                }
                className="w-full appearance-none px-3 py-2.5 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
              >
                {DEPTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="filter-status" className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
              Status
            </label>
            <div className="relative">
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value as StaffStatus | 'All')}
                className="w-full appearance-none px-3 py-2.5 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// ── Main Table ─────────────────────────────────────────────────────────────

export function StaffTable(): JSX.Element {
  const {
    members,
    searchQuery,
    roleFilter,
    departmentFilter,
    statusFilter,
    currentPage,
    perPage,
    showAll,
    setSearchQuery,
    setRoleFilter,
    setDepartmentFilter,
    setStatusFilter,
    setCurrentPage,
    fetchMembers,
  } = useStaffStore();

  const [viewMember, setViewMember] = useState<StaffMember | null>(null);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<StaffMember | null>(null);
  const [loginHistoryMember, setLoginHistoryMember] = useState<StaffMember | null>(null);
  const [showViewAll, setShowViewAll] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useEffect(() => {
    fetchMembers?.();
  }, [fetchMembers]);

  const filtered = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchR = roleFilter === 'All Roles' || m.role === roleFilter;
    const matchD = departmentFilter === 'All Departments' || m.department === departmentFilter;
    const matchS = statusFilter === 'All' || m.status === statusFilter;
    return matchQ && matchR && matchD && matchS;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(currentPage, totalPages);
  const paged = showAll ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  const hasActiveFilters =
    roleFilter !== 'All Roles' ||
    departmentFilter !== 'All Departments' ||
    statusFilter !== 'All';

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mr-1">
            Staff Members
          </h3>

          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as StaffRole | 'All Roles')}
              className="text-xs py-1.5 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-700 dark:text-gray-300"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value as StaffDepartment | 'All Departments')
              }
              className="text-xs py-1.5 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-700 dark:text-gray-300"
            >
              {DEPTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StaffStatus | 'All')}
              className="text-xs py-1.5 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-700 dark:text-gray-300"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowFilterSheet(true)}
            className={`sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400'
                : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {hasActiveFilters ? 'Filtered' : 'Filter'}
          </button>

          <button
            type="button"
            onClick={() => setShowViewAll(true)}
            className="ml-auto text-xs font-semibold text-orange-500 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Staff Member', 'Role', 'Department', 'Phone', 'Status', 'Hire Date', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paged.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={m.avatar} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[m.role]}`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {m.department}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{m.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[m.status]}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {m.hireDate}
                  </td>
                  <td className="px-4 py-3">
                    <ActionMenu
                      viewAction={() => setViewMember(m)}
                      editAction={() => setEditMember(m)}
                      deleteAction={() => setDeleteMember(m)}
                    />
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500"
                  >
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden">
          {paged.map((m) => (
            <MobileStaffCard
              key={m.id}
              member={m}
              onView={() => setViewMember(m)}
              onEdit={() => setEditMember(m)}
              onDelete={() => setDeleteMember(m)}
            />
          ))}
          {paged.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No staff members found
            </div>
          )}
        </div>

        {!showAll && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Showing {paged.length > 0 ? (page - 1) * perPage + 1 : 0} to{' '}
              {Math.min(page * perPage, filtered.length)} of {filtered.length} staff
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
              {filtered.length} staff
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(page - 1)}
                disabled={page <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    p === page
                      ? 'bg-orange-500 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage(page + 1)}
                disabled={page >= totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showFilterSheet && (
        <FilterSheet
          roleFilter={roleFilter}
          departmentFilter={departmentFilter}
          statusFilter={statusFilter}
          onRoleChange={setRoleFilter}
          onDeptChange={setDepartmentFilter}
          onStatusChange={setStatusFilter}
          onClose={() => setShowFilterSheet(false)}
        />
      )}
      {showViewAll && <ViewAllModal onClose={() => setShowViewAll(false)} />}
      {viewMember && (
        <ViewStaffModal
          member={viewMember}
          onClose={() => setViewMember(null)}
          onEdit={() => {
            setEditMember(viewMember);
            setViewMember(null);
          }}
          onViewHistory={() => {
            setLoginHistoryMember(viewMember);
            setViewMember(null);
          }}
        />
      )}
      {editMember && (
        <EditStaffModal member={editMember} onClose={() => setEditMember(null)} />
      )}
      {deleteMember && (
        <DeleteConfirmModal member={deleteMember} onClose={() => setDeleteMember(null)} />
      )}
      {loginHistoryMember && (
        <LoginHistoryModal
          member={loginHistoryMember}
          onClose={() => setLoginHistoryMember(null)}
        />
      )}
    </>
  );
}
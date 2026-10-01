import React, { useState } from 'react';
import {
  Download,
  Plus,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { StaffStatCards } from '../components/staff/StaffStatCards';
import { StaffTable } from '../components/staff/StaffTable';
import { TodaysSchedule, UpcomingBirthdays } from '../components/staff/StaffSchedule';
import {
  AttendanceOverview,
  PayrollSummary,
  PerformanceOverview,
  RolesDistribution,
} from '../components/staff/StaffAnalytics';
import { useStaffStore } from '../store/staff.store';
import type { StaffRole, StaffDepartment, StaffStatus } from '../store/staff.store';

// ── Constants ──────────────────────────────────────────────────────────────

const ROLES: StaffRole[] = ['Manager', 'Chef', 'Server', 'Bartender', 'Host', 'Cleaner'];
const DEPTS: StaffDepartment[] = ['Management', 'Kitchen', 'Service', 'Bar', 'Front Desk', 'Cleaning'];
const STATUSES: StaffStatus[] = ['Active', 'On Leave', 'Inactive'];

// ── Add Staff Modal ────────────────────────────────────────────────────────

interface AddStaffModalProps {
  onClose: () => void;
}

function AddStaffModal({ onClose }: AddStaffModalProps): JSX.Element {
  const { addMember } = useStaffStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dbRole: 'service-staff',
    kitchen_role: '',
    staff_role: '',
    cleaning_role: '',
    status: 'Active' as StaffStatus,
    salary: '',
    hireDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    performance: 4.0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.password.trim()) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      e.password = 'Must contain uppercase, lowercase, and digit';
    }
    if (!form.salary || isNaN(Number(form.salary))) e.salary = 'Valid salary required';
    return e;
  };

  const handleSubmit = () => {
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

    addMember({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      dbRole: form.dbRole,
      kitchen_role: form.kitchen_role || undefined,
      staff_role: form.staff_role || undefined,
      cleaning_role: form.cleaning_role || undefined,
      role: feRole,
      department: feDept,
      status: form.status,
      salary: Number(form.salary),
    });
    onClose();
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              Add Staff Member
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Fill in the details to add a new team member
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
          {/* Full Name */}
          <div>
            <label
              htmlFor="add-name"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              <User className="w-3.5 h-3.5" /> Full Name *
            </label>
            <input
              id="add-name"
              type="text"
              placeholder="e.g. Jane Doe"
              value={form.name}
              onChange={(e) => field('name', e.target.value)}
              className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${
                errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="add-email"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Email *
            </label>
            <input
              id="add-email"
              type="email"
              placeholder="jane@restaurant.com"
              value={form.email}
              onChange={(e) => field('email', e.target.value)}
              className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${
                errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="add-phone"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Phone *
            </label>
            <input
              id="add-phone"
              type="text"
              placeholder="+91 98765 00000"
              value={form.phone}
              onChange={(e) => field('phone', e.target.value)}
              className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${
                errors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="add-password"
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
            >
              Password *
            </label>
            <input
              id="add-password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
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
                htmlFor="add-db-role"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" /> Primary Role
              </label>
              <div className="relative">
                <select
                  id="add-db-role"
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
                  htmlFor="add-sub-role"
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" /> Operational Role
                </label>
                <div className="relative">
                  {form.dbRole === 'kitchen-staff' && (
                    <select
                      id="add-sub-role"
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
                      id="add-sub-role"
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
                      id="add-sub-role"
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

          {/* Status & Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="add-status"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Status
              </label>
              <div className="relative">
                <select
                  id="add-status"
                  value={form.status}
                  onChange={(e) => field('status', e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 sm:py-2 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label
                htmlFor="add-salary"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" /> Salary (₹) *
              </label>
              <input
                id="add-salary"
                type="number"
                placeholder="35000"
                value={form.salary}
                onChange={(e) => field('salary', e.target.value)}
                className={`w-full px-3 py-2.5 sm:py-2 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${
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
            onClick={handleSubmit}
            className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            Add Staff Member
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Export Report Modal ────────────────────────────────────────────────────

interface ExportReportModalProps {
  onClose: () => void;
}

function ExportReportModal({ onClose }: ExportReportModalProps): JSX.Element {
  const { members } = useStaffStore();
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [fields, setFields] = useState({
    name: true,
    email: true,
    role: true,
    department: true,
    phone: true,
    status: true,
    hireDate: true,
    salary: false,
    performance: false,
  });
  const [exported, setExported] = useState(false);

  const toggleField = (k: keyof typeof fields) =>
    setFields((prev) => ({ ...prev, [k]: !prev[k] }));

  const handleExport = () => {
    const activeFields = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k]) => k) as Array<keyof typeof fields>;
    const data = members.map((m) => {
      const row: Record<string, unknown> = {};
      activeFields.forEach((f) => {
        row[f] = m[f];
      });
      return row;
    });

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = activeFields.join(',');
      const rows = data.map((r) =>
        activeFields.map((f) => `"${r[f] ?? ''}"`).join(',')
      );
      content = [headers, ...rows].join('\n');
      filename = `staff-report-${new Date().toISOString().slice(0, 10)}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `staff-report-${new Date().toISOString().slice(0, 10)}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(onClose, 1200);
  };

  const FIELD_LABELS: Record<keyof typeof fields, string> = {
    name: 'Full Name',
    email: 'Email',
    role: 'Role',
    department: 'Department',
    phone: 'Phone',
    status: 'Status',
    hireDate: 'Hire Date',
    salary: 'Salary',
    performance: 'Performance',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              Export Staff Report
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {members.length} staff members will be exported
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
          {/* Format */}
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Export Format
            </p>
            <div className="flex gap-2">
              {(['csv', 'json'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-2.5 sm:py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    format === f
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Include Fields
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(fields) as Array<keyof typeof fields>).map((k) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={fields[k]}
                    onChange={() => toggleField(k)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {FIELD_LABELS[k]}
                  </span>
                </label>
              ))}
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
            onClick={handleExport}
            className={`flex items-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white rounded-xl transition-colors shadow-sm ${
              exported ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {exported ? 'Exported!' : `Export as ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function StaffManagementPage(): JSX.Element {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Staff Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your team, schedules, roles and performance
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Export Report</span>
            <span className="xs:hidden">Export</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Add Staff</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <StaffStatCards />

      {/* Table + Schedule/Birthdays */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        <StaffTable />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
          <TodaysSchedule />
          <UpcomingBirthdays />
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AttendanceOverview />
        <PayrollSummary />
        <PerformanceOverview />
        <RolesDistribution />
      </div>

      {/* Modals */}
      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} />}
      {showExportModal && <ExportReportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
}
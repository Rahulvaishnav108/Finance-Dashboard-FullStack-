import React, { useState, useEffect, useRef } from 'react';
import { STAFF, type KitchenStaff } from '../store/kitchenData';
import { useKitchenSearch } from '../components/dashboard/KitchenSearchContext';
import { useKitchenStore } from '../store/kitchen.store';
import ImageCropperModal from '../../customer/components/dashboard/ImageCropperModal';
import { useAuth } from '../../../auth/AuthProvider';
import { Navigate } from 'react-router-dom';

export interface JoineeRequest {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  avatar?: string;
}

const SEED_JOINEES: JoineeRequest[] = [
  { id: 'JR-01', name: 'Rohan Das', role: 'Line Cook', email: 'rohan.das@email.com', phone: '+91 99999 88888', appliedDate: '18-06-2026', status: 'pending' },
  { id: 'JR-02', name: 'Siddharth Sen', role: 'Kitchen Assistant', email: 'sid.sen@email.com', phone: '+91 88888 77777', appliedDate: '19-06-2026', status: 'pending' },
];

const ROLE_OPTIONS = [
  'Executive Chef',
  'Sous Chef',
  'Senior Chef',
  'Line Cook',
  'Pastry Chef',
  'Prep Cook',
  'Kitchen Assistant',
];

const STATION_OPTIONS = [
  'Grill Station',
  'Curry Station',
  'Fry Station',
  'Biryani Station',
  'Dessert Counter',
  'Beverage Station',
  'Prep Station',
  'Tandoor Station',
  '-',
];

export default function KitchenStaffPage() {
  const { user } = useAuth();

  const { query } = useKitchenSearch();
  const { profile: loggedInProfile, updateProfile } = useKitchenStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'roster' | 'joinees'>('roster');

  // Staff State
  const [staff, setStaff] = useState<KitchenStaff[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_staff');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse kitchen staff", e);
        }
      }
    }
    return STAFF;
  });

  // Joinee Requests State
  const [joinees, setJoinees] = useState<JoineeRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_joinees');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse joinees", e);
        }
      }
    }
    return SEED_JOINEES;
  });

  // UI state for filters and dropdowns
  const [statusFilter, setStatusFilter] = useState<'all' | 'on-duty' | 'on-break' | 'off-duty'>('all');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add staff member form state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState(ROLE_OPTIONS[3]); // default: Line Cook
  const [newStatus, setNewStatus] = useState<KitchenStaff['status']>('on-duty');
  const [newStation, setNewStation] = useState('-');
  const [newShift, setNewShift] = useState('6:00 AM - 2:00 PM');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  // Edit staff member form state
  const [editingStaff, setEditingStaff] = useState<KitchenStaff | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState<KitchenStaff['status']>('off-duty');
  const [editStation, setEditStation] = useState('');
  const [editShift, setEditShift] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Cropper inside forms
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

  // Persist staff and joinees to Local Storage
  useEffect(() => {
    localStorage.setItem('kitchen_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('kitchen_joinees', JSON.stringify(joinees));
  }, [joinees]);

  if (user?.internal_role === 'CHEF') {
    return <Navigate to="/kitchen" replace />;
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Merge the active logged-in chef profile dynamically into the staff array
  const mergedStaff = staff.map(member => {
    if (member.id === 'STF-01' && loggedInProfile) {
      return {
        ...member,
        name: loggedInProfile.name,
        role: loggedInProfile.role,
        status: loggedInProfile.status,
        avatar: loggedInProfile.avatar,
        station: loggedInProfile.station,
        shift: loggedInProfile.shift,
        phone: loggedInProfile.phone,
        email: loggedInProfile.email,
      };
    }
    return member;
  });

  // Filters Roster Staff
  const filteredStaff = mergedStaff.filter(member => {
    if (statusFilter !== 'all' && member.status !== statusFilter) return false;

    if (query) {
      const q = query.toLowerCase();
      return (
        member.name.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.station.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filters Joinees
  const filteredJoinees = joinees.filter(j => {
    if (query) {
      const q = query.toLowerCase();
      return (
        j.name.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        j.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Shift status toggle workflow
  const handleStatusCycle = (id: string) => {
    setStaff(prev =>
      prev.map(member => {
        if (member.id === id) {
          let nextStatus: 'on-duty' | 'on-break' | 'off-duty' = 'on-duty';
          if (member.status === 'on-duty') nextStatus = 'on-break';
          else if (member.status === 'on-break') nextStatus = 'off-duty';
          else nextStatus = 'on-duty';

          // Sync with profile store if it's the logged-in chef
          if (id === 'STF-01') {
            updateProfile({ status: nextStatus });
          }

          return {
            ...member,
            status: nextStatus,
            station: nextStatus === 'off-duty' ? '-' : member.station === '-' ? 'Prep Station' : member.station,
          };
        }
        return member;
      })
    );
    showToast('Staff status updated.');
  };

  // Station assignment workflow
  const handleAssignStation = (id: string) => {
    const stations = ['Grill Station', 'Curry Station', 'Fry Station', 'Biryani Station', 'Beverage Station', 'Prep Station'];
    setStaff(prev =>
      prev.map(member => {
        if (member.id === id) {
          const currentIdx = stations.indexOf(member.station);
          const nextIdx = (currentIdx + 1) % (stations.length + 1); // include "-"
          const nextStation = nextIdx === stations.length ? '-' : stations[nextIdx];
          const nextStatus = nextStation === '-' ? 'on-break' : 'on-duty';

          // Sync with profile store if it's the logged-in chef
          if (id === 'STF-01') {
            updateProfile({ station: nextStation, status: nextStatus });
          }

          return {
            ...member,
            station: nextStation,
            status: nextStatus,
          };
        }
        return member;
      })
    );
    showToast('Station assignment updated.');
  };

  // Remove staff member from roster
  const handleRemoveStaff = (id: string) => {
    if (id === 'STF-01') {
      showToast('Cannot delete the logged-in Executive Chef profile!', 'error');
      return;
    }
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaff(prev => prev.filter(member => member.id !== id));
      showToast('Staff member removed.');
    }
  };

  // Joinee Approval Workflow
  const handleApproveJoinee = (joinee: JoineeRequest) => {
    const newId = `STF-${String(staff.length + 1).padStart(2, '0')}`;
    const newChef: KitchenStaff = {
      id: newId,
      name: joinee.name,
      role: joinee.role,
      status: 'off-duty',
      station: '-',
      shift: '6:00 AM - 2:00 PM',
      ordersCompleted: 0,
      avgPrepTime: '15 min',
      rating: 4.5,
      avatar: joinee.avatar || '',
      phone: joinee.phone,
      email: joinee.email,
    };

    setStaff(prev => [...prev, newChef]);
    setJoinees(prev => prev.filter(j => j.id !== joinee.id));
    showToast(`Approved! ${joinee.name} added to Roster as ${joinee.role}.`);
  };

  // Joinee Rejection Workflow
  const handleRejectJoinee = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to reject the application of ${name}?`)) {
      setJoinees(prev => prev.filter(j => j.id !== id));
      showToast(`Application of ${name} rejected.`);
    }
  };

  // Avatar selector inside Add/Edit Modal
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = (croppedBase64: string) => {
    if (editingStaff) {
      setEditAvatar(croppedBase64);
    } else {
      setNewAvatar(croppedBase64);
    }
    setCropperOpen(false);
    setTempImageSrc('');
  };

  // Add staff submission handler
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    const nextId = `STF-${String(staff.length + 1).padStart(2, '0')}`;
    const newChef: KitchenStaff = {
      id: nextId,
      name: newName,
      role: newRole,
      status: newStatus,
      station: newStation,
      shift: newShift,
      ordersCompleted: 0,
      avgPrepTime: '15 min',
      rating: 4.5,
      avatar: newAvatar,
      phone: newPhone,
      email: newEmail,
    };

    setStaff(prev => [...prev, newChef]);

    // Reset Form
    setNewName('');
    setNewRole(ROLE_OPTIONS[3]);
    setNewStatus('on-duty');
    setNewStation('-');
    setNewShift('6:00 AM - 2:00 PM');
    setNewPhone('');
    setNewEmail('');
    setNewAvatar('');
    setAddModalOpen(false);

    showToast('New staff member added successfully!');
  };

  // Edit staff submission handler
  const handleEditStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingStaff) return;
    if (!editName.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    // Update staff list state
    setStaff(prev =>
      prev.map(member => {
        if (member.id === editingStaff.id) {
          return {
            ...member,
            name: editName,
            role: editRole,
            status: editStatus,
            station: editStation,
            shift: editShift,
            avatar: editAvatar,
            phone: editPhone,
            email: editEmail,
          };
        }
        return member;
      })
    );

    // If editing the logged-in chef Arjun (STF-01), sync to layout store
    if (editingStaff.id === 'STF-01') {
      updateProfile({
        name: editName,
        role: editRole,
        status: editStatus,
        station: editStation,
        shift: editShift,
        avatar: editAvatar,
        phone: editPhone,
        email: editEmail,
      });
    }

    setEditingStaff(null);
    showToast('Staff member details updated!');
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'SH';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Stats (calculated from merged roster list)
  const totalChefs = mergedStaff.length;
  const onDutyCount = mergedStaff.filter(s => s.status === 'on-duty').length;
  const onBreakCount = mergedStaff.filter(s => s.status === 'on-break').length;

  const pendingJoineesCount = joinees.filter(j => j.status === 'pending').length;

  const statusBg = {
    'on-duty': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50',
    'on-break': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955 dark:text-amber-400 dark:border-amber-900/50',
    'off-duty': 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  const statusDot = {
    'on-duty': 'bg-green-500',
    'on-break': 'bg-amber-500',
    'off-duty': 'bg-slate-400',
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto font-sans bg-slate-50 dark:bg-slate-950/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Staff Management</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-0.5">Manage chef duties, shift hours, station allocations, and performance</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/10 flex items-center gap-2 transition-all active:scale-[0.98] self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Staff Member
        </button>
      </div>

      {/* Roster Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-3 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Staff Rostered</p>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{totalChefs}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 p-3 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Currently On Duty</p>
            <h3 className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-0.5">{onDutyCount}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-3 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">pause_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">On Break</p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{onBreakCount}</h3>
          </div>
        </div>
      </div>

      {/* Main View Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 font-bold text-sm font-sans relative transition-colors ${
            activeTab === 'roster'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Staff Roster ({totalChefs})
        </button>
        <button
          onClick={() => setActiveTab('joinees')}
          className={`pb-3 font-bold text-sm font-sans relative transition-colors flex items-center gap-2 ${
            activeTab === 'joinees'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Joinee Requests
          {pendingJoineesCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
              {pendingJoineesCount}
            </span>
          )}
        </button>
      </div>

      {/* Roster View Tab Content */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Shift/Duty Status Filters */}
          <div className="flex gap-1.5">
            {(['all', 'on-duty', 'on-break', 'off-duty'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                  statusFilter === filter
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-855'
                }`}
              >
                {filter === 'all' ? 'All Staff' : filter.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Roster Table Layout */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-visible shadow-sm">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Staff Member</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Station Allocation</th>
                    <th className="px-6 py-4">Shift Timing</th>
                    <th className="px-6 py-4 text-center">Prep Speed</th>
                    <th className="px-6 py-4 text-center">Completed</th>
                    <th className="px-6 py-4 text-center">Rating</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStaff.map(member => {
                    const initials = getInitials(member.name);
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        {/* Staff */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold text-sm border border-orange-200/55 dark:border-orange-900/40">
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate">{member.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">{member.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-655 dark:text-slate-300">
                          {member.role}
                        </td>

                        {/* Station */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-sans ${
                            member.station === '-'
                              ? 'bg-slate-100 text-slate-450 dark:bg-slate-800 dark:text-slate-500'
                              : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-950'
                          }`}>
                            {member.station}
                          </span>
                        </td>

                        {/* Shift */}
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400">
                          {member.shift}
                        </td>

                        {/* Prep Speed */}
                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-700 dark:text-slate-300">
                          {member.avgPrepTime}
                        </td>

                        {/* Completed */}
                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-700 dark:text-slate-300">
                          {member.ordersCompleted}
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                            <span className="text-amber-500 text-sm">★</span>
                            <span>{member.rating}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase inline-flex items-center gap-1.5 ${statusBg[member.status]}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot[member.status]}`} />
                            <span>{member.status.replace('-', ' ')}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right relative overflow-visible">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusCycle(member.id)}
                              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                              title="Toggle Shift Status"
                            >
                              Shift Status
                            </button>
                            <button
                              onClick={() => handleAssignStation(member.id)}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all"
                              title="Assign Next Station"
                            >
                              Assign Station
                            </button>

                            {/* Dropdown Action Wrapper */}
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setActiveDropdownId(activeDropdownId === member.id ? null : member.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
                                title="More Actions"
                              >
                                <span className="material-symbols-outlined text-[18px] block">more_vert</span>
                              </button>

                              {activeDropdownId === member.id && (
                                <>
                                  <button
                                    type="button"
                                    aria-label="Close action menu"
                                    className="fixed inset-0 z-40 bg-transparent border-none outline-none cursor-default"
                                    onClick={() => setActiveDropdownId(null)}
                                  />
                                  <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1 animate-fadeIn">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingStaff(member);
                                        setEditName(member.name);
                                        setEditRole(member.role);
                                        setEditStatus(member.status);
                                        setEditStation(member.station);
                                        setEditShift(member.shift);
                                        setEditPhone(member.phone || '');
                                        setEditEmail(member.email || '');
                                        setEditAvatar(member.avatar || '');
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-xs font-semibold font-sans text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-slate-450 dark:text-slate-400">edit</span>
                                      View & Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleRemoveStaff(member.id);
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-xs font-semibold font-sans text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 mt-1 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-red-450 dark:text-red-400">delete</span>
                                      Delete Staff
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold font-sans">
                        No rostered staff matches your filters or search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Joinee Requests Tab Content */}
      {activeTab === 'joinees' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Applied Role</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredJoinees.map(joinee => {
                    const initials = getInitials(joinee.name);
                    return (
                      <tr key={joinee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        {/* Applicant */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-200/50 dark:border-purple-900/40">
                              {joinee.avatar ? (
                                <img src={joinee.avatar} alt={joinee.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{joinee.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{joinee.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Applied Role */}
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-655 dark:text-slate-300">
                          {joinee.role}
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <p className="font-semibold text-slate-600 dark:text-slate-400">{joinee.email}</p>
                          <p className="text-slate-400 font-medium mt-0.5">{joinee.phone}</p>
                        </td>

                        {/* Applied Date */}
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400">
                          {joinee.appliedDate}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                            {joinee.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRejectJoinee(joinee.id, joinee.name)}
                              className="px-3 py-1.5 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveJoinee(joinee)}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Approve & Roster
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredJoinees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-550 font-semibold font-sans">
                        No pending applicant requests match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success/Error Feedback Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-[200] flex items-center gap-2 border text-sm font-semibold font-sans animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-900 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ADD STAFF MEMBER MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg font-sans text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">person_add</span>
                Add Roster Staff Member
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddStaffSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Profile Image Row */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-450 border border-orange-200 dark:border-orange-900 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  {newAvatar ? (
                    <img src={newAvatar} alt="New avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{newName ? getInitials(newName) : 'SH'}</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-750 hover:bg-white dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                    Upload & Crop Photo
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium font-sans">JPG, PNG, or GIF. Max size 2MB.</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="modal-chef-name" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Full Name
                </label>
                <input
                  id="modal-chef-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Chef Rohan"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  required
                />
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-chef-role" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Role
                  </label>
                  <select
                    id="modal-chef-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-chef-status" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Status
                  </label>
                  <select
                    id="modal-chef-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as KitchenStaff['status'])}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  >
                    <option value="on-duty">On Duty</option>
                    <option value="on-break">On Break</option>
                    <option value="off-duty">Off Duty</option>
                  </select>
                </div>
              </div>

              {/* Station & Shift */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-chef-station" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Station Allocation
                  </label>
                  <select
                    id="modal-chef-station"
                    value={newStation}
                    onChange={(e) => setNewStation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  >
                    {STATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-chef-shift" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Shift Hours
                  </label>
                  <input
                    id="modal-chef-shift"
                    type="text"
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    placeholder="e.g. 6:00 AM - 2:00 PM"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-chef-phone" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Contact Phone
                  </label>
                  <input
                    id="modal-chef-phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +91 99999 88888"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="modal-chef-email" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Email Address
                  </label>
                  <input
                    id="modal-chef-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. chef@flavoroast.com"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>
              </div>

              {/* Modal Buttons Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold font-sans transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all font-sans flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
                >
                  <span className="material-symbols-outlined text-[16px]">done</span>
                  Save to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* EDIT STAFF MEMBER MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg font-sans text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">edit_square</span>
                Edit Staff Member Details
              </h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleEditStaffSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Profile Image Row */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-450 border border-orange-200 dark:border-orange-900 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  {editAvatar ? (
                    <img src={editAvatar} alt="Edit avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{editName ? getInitials(editName) : 'SH'}</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-750 hover:bg-white dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                    Upload & Crop Photo
                  </button>
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar('')}
                      className="ml-2 px-3 py-1.5 text-xs text-red-500 font-bold border border-transparent hover:border-red-200 dark:hover:border-red-900/50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="edit-chef-name" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Full Name
                </label>
                <input
                  id="edit-chef-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  required
                />
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-chef-role" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Role
                  </label>
                  <select
                    id="edit-chef-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-chef-status" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Status
                  </label>
                  <select
                    id="edit-chef-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as KitchenStaff['status'])}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  >
                    <option value="on-duty">On Duty</option>
                    <option value="on-break">On Break</option>
                    <option value="off-duty">Off Duty</option>
                  </select>
                </div>
              </div>

              {/* Station & Shift */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-chef-station" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Station Allocation
                  </label>
                  <select
                    id="edit-chef-station"
                    value={editStation}
                    onChange={(e) => setEditStation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  >
                    {STATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-chef-shift" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Shift Hours
                  </label>
                  <input
                    id="edit-chef-shift"
                    type="text"
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-chef-phone" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Contact Phone
                  </label>
                  <input
                    id="edit-chef-phone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="edit-chef-email" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Email Address
                  </label>
                  <input
                    id="edit-chef-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>
              </div>

              {/* Modal Buttons Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold font-sans transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all font-sans flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
                >
                  <span className="material-symbols-outlined text-[16px]">done</span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal for Add/Edit Staff form */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={tempImageSrc}
        onClose={() => setCropperOpen(false)}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}

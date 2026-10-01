import React, { useState, useEffect } from 'react';
import { useCleaning } from '../hooks/usecleaning';
import { useNotifications } from '../hooks/useNotifications';
import { useCleaningSearch } from '../components/dashboard/CleaningSearchContext';
import { cleaningStore, CleaningRequest, CleaningStaffMember } from '../store/cleaning.store';
import { useToast } from '../components/dashboard/Toast';
/* eslint-disable @typescript-eslint/no-unused-vars */

interface HygieneTask {
  id: string;
  name: string;
  lastDone: string;
  icon: string;
  colorClass: string;
  textColor: string;
  completed: boolean;
}

interface TableTask {
  id: string;
  rawId?: string;
  rawStatus?: 'PENDING' | 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  rawPriority?: 'High' | 'Medium' | 'Low';
  progress?: number;
  waiting?: string;
  tableNumber?: string;
  seats?: number;
  area?: string;
  section?: string;
  floor?: number;
}

export default function CleaningDashboard() {
  const { searchQuery } = useCleaningSearch();
  const { showToast } = useToast();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [requests, setRequests] = useState(cleaningStore.requests);
  const [newRequestTable, setNewRequestTable] = useState('');
  const [newRequestPriority, setNewRequestPriority] = useState('Medium');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CleaningRequest | null>(null);
  const [tables, setTables] = useState(cleaningStore.tables);

  // Staff Management State
  const [staffList, setStaffList] = useState<CleaningStaffMember[]>(cleaningStore.staffMembers);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Cleaning Staff');
  const [newStaffArea, setNewStaffArea] = useState('Dining Area A');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  useEffect(() => {
    const unsubscribe = cleaningStore.subscribe(() => {
      setTables([...cleaningStore.tables]);
      setStaffList([...cleaningStore.staffMembers]);
    });
    return () => { unsubscribe(); };
  }, []);

  const { unreadCount, addNotification } = useNotifications();
  useEffect(() => {
    const unsubscribe = cleaningStore.subscribe(() => {
      setRequests([...cleaningStore.requests]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const { urgentTasks, startTask, completeTask, verifyTask, reportIssue } = useCleaning();
  const allRequests = cleaningStore.requests;

  const safeTasks = (urgentTasks || []) as unknown as TableTask[];
  const requestCount =
    (urgentTasks as unknown as TableTask[])?.filter((t) => t.rawStatus === 'REQUESTED').length || 0;

  const tablesToClean = tables
    .filter((t) => t.status === 'Needs Cleaning' || t.status === 'Cleaning Requested')
    .map((t) => ({
      id: t.id,
      seats: t.seats,
      timeAgo: t.timeAgo,
      priority: t.priority,
      priorityClass: t.priority === 'High' ? 'bg-red-50 text-red-650' : 'bg-orange-50 text-orange-600',
      iconColor: t.priority === 'High' ? 'text-red-500' : 'text-orange-500',
      rawId: t.id,
      section: t.section || 'Indoor',
      floor: t.floor || 1,
    }));

  const inProgress = tables
    .filter((t) => t.status === 'In Progress')
    .map((t) => ({
      id: t.id,
      progress: t.progress || 45,
      timeAgo: t.timeAgo,
      rawId: t.id,
      section: t.section || 'Indoor',
      floor: t.floor || 1,
    }));

  const completedToday = safeTasks
    .filter((t) => t.rawStatus === 'COMPLETED' || t.rawStatus === 'VERIFIED')
    .map((t) => {
      const tableLabel = t.tableNumber || t.id;
      return {
        id: tableLabel,
        time: t.rawStatus === 'VERIFIED' ? '10:30 AM' : 'Just Now',
        seats: t.seats || (tableLabel === 'T03' ? 6 : tableLabel === 'T12' ? 2 : tableLabel === 'T15' ? 3 : 4),
        rawStatus: t.rawStatus,
        rawId: t.id,
        section: t.section || t.area || 'Indoor',
        floor: t.floor || 1,
      };
    });

  // Maintain original static array context for Hygiene checklist items
  const [hygieneTasks, setHygieneTasks] = useState<HygieneTask[]>([
    {
      id: '1',
      name: 'Restroom Sanitization',
      lastDone: '09:15 AM',
      icon: 'sanitizer',
      colorClass: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-600',
      completed: false,
    },
    {
      id: '2',
      name: 'Waste Bin Check',
      lastDone: '09:20 AM',
      icon: 'delete',
      colorClass: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-600',
      completed: false,
    },
    {
      id: '3',
      name: 'Floor Sanitization',
      lastDone: '09:25 AM',
      icon: 'mop',
      colorClass: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-600',
      completed: false,
    },
  ]);

  // Operational pipeline click interceptors wrapping original layout events
  const handleStartCleaning = (table: TableTask) => {
    startTask(table.rawId || '');
  };

  const handleContinue = (item: TableTask) => {
    completeTask(item.rawId || '');
  };

  const handleToggleHygieneTask = (id: string) => {
    setHygieneTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          return {
            ...t,
            completed,
            lastDone: completed ? `Completed at ${timeStr}` : '09:15 AM',
          };
        }
        return t;
      })
    );
  };

 const handleCreateRequest = (e: React.FormEvent) => {
  e.preventDefault();
  if (!newRequestTable.trim()) return;
  const tableId = newRequestTable.toUpperCase().startsWith('T')
    ? newRequestTable.toUpperCase()
    : `T${newRequestTable}`;

    cleaningStore.addCleaningRequest({
      id: `CR-2026-${Math.floor(Math.random() * 999)}`,
      type: 'Cleaning Request',
      icon: 'table_restaurant',
      iconColor: 'text-orange-500',
      location: `Table ${tableId}`,
      requestedBy: {
        name: 'Staff',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuANsaeL1qIrdjS8VjlskxOHt17ofWL0mQA8HTEyUyGUmb0WZEoFeVIhAYDxByw8LuxWxFKIdV270hwAPBmZFNJdIOoLB7X4CRStTLzQ66uJ709k9Kvpbt3yDChYZmi0IOgzaKGIARmUFWTp8fiuOG-poilaUus94iK5MEMaPofwxQGipJFvuis9fWEp53IS84fln5N1GSiP7xWII9WnJi1qTw5gFY4eKQQgrXVlslMwV6TbZi4nnm2vGRG3hjoOoFQyNc23SGR4j9U',
      },
      priority: 'High',
      status: 'Pending',
      requestedOn: new Date().toLocaleDateString(),
      requestedTime: new Date().toLocaleTimeString(),
    });
    cleaningStore.addTable({
    id: tableId,
    area: 'Dining Area A',
    seats: 4,
    status: 'Needs Cleaning',
    priority: 'High',
    timeAgo: 'Just Now',
    assignedTo: null
  });

    window.dispatchEvent(
      new CustomEvent('new-cleaning-request', {
        detail: {
          id: Date.now(),
          title: `New Request: ${tableId}`,
          message: 'Table requires immediate cleaning.',
          read: false,
        },
      })
    );

    setNewRequestTable('');
    setShowRequestModal(false);
  };

  const filteredTablesToClean = tablesToClean.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.priority.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInProgress = inProgress.filter((i) =>
    i.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompleted = completedToday.filter((c) =>
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredHygiene = hygieneTasks.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats Counters driven cleanly by store array lengths
  const totalTablesToClean = tablesToClean.length;
  const totalInProgress = inProgress.length;
  const totalCleanedToday = completedToday.length;
  const hygieneScore = '98%';

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn cleaning-panel">
      {/* Top Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-sd-surface-container p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined text-[24px]">table_restaurant</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {totalTablesToClean}
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-sans">
              Tables to Clean
            </p>
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mt-0.5 inline-block">
              Pending
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {totalInProgress}
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-sans">In Progress</p>
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mt-0.5 inline-block">
              Cleaning
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center text-green-600 dark:text-green-455 shrink-0">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {totalCleanedToday}
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-sans">
              Cleaned Today
            </p>
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mt-0.5 inline-block font-sans">
              Completed
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {hygieneScore}
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-sans">
              Hygiene Score
            </p>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-455 uppercase tracking-wider mt-0.5 inline-block font-sans">
              Excellent
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Tables to Clean */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-150 font-sans tracking-tight">
                  Tables to Clean
                </h2>
                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {filteredTablesToClean.length}
                </span>
              </div>
            </div>

            {filteredTablesToClean.length === 0 ? (
              <div className="bg-white dark:bg-sd-surface-container border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-700">
                  playlist_add_check
                </span>
                <p className="text-xs font-semibold">No pending tables to clean matching search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredTablesToClean.map((table) => (
                  <div
                    key={table.rawId}
                    className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-orange-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${table.iconColor}`}>
                            table_restaurant
                          </span>
                          <span className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                            {table.id}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${table.priorityClass}`}
                        >
                          {table.priority} Priority
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mb-3 font-sans font-bold">
                        <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">location_on</span>
                        <span>{table.section} · Floor {table.floor}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-450 dark:text-slate-400 text-[10px] mb-4 font-sans font-semibold">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">groups</span>
                          {table.seats} Seats
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {table.timeAgo}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartCleaning(table)}
                      className="w-full py-2 bg-transparent border border-orange-500 text-orange-500 rounded-xl text-xs font-bold hover:bg-orange-500 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Start Cleaning
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Today List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-150 font-sans tracking-tight">
                  Completed Today
                </h2>
                <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {filteredCompleted.length}
                </span>
              </div>
            </div>

            {filteredCompleted.length === 0 ? (
              <div className="bg-white dark:bg-sd-surface-container border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400">
                <p className="text-xs">No completed tables to show.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCompleted.map((item) => (
                  <div
                    key={item.rawId}
                    className="flex items-center justify-between p-4 font-sans text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="material-symbols-outlined text-green-500"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.id}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        ({item.section} · Floor {item.floor})
                      </span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">
                      {item.seats} Seats
                    </span>
                    <span className="text-slate-450 dark:text-slate-400 font-bold">
                      {item.rawStatus === 'COMPLETED' ? (
                        <button
                         onClick={() => {
       cleaningStore.verifyInspection(item.rawId);
    }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-150 active:scale-95 cursor-pointer"
                        >
                          Verify Audit
                        </button>
                      ) : (
                        item.time
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: In Progress & Features */}
        <div className="col-span-12 lg:col-span-5 space-y-6 md:space-y-8">
          {/* In Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-150 font-sans tracking-tight">
                  In Progress
                </h2>
                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {filteredInProgress.length}
                </span>
              </div>
            </div>

            {filteredInProgress.length === 0 ? (
              <div className="bg-white dark:bg-sd-surface-container border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400">
                <p className="text-xs">No active cleaning tasks in progress.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredInProgress.map((item) => (
                  <div
                    key={item.rawId}
                    className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center"
                  >
                    <div className="relative w-16 h-16 mb-3">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          className="text-slate-100 dark:text-slate-800"
                          cx="32"
                          cy="32"
                          fill="transparent"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        />
                        <circle
                          className="text-orange-500"
                          cx="32"
                          cy="32"
                          fill="transparent"
                          r="26"
                          stroke="currentColor"
                          strokeDasharray="163.3"
                          strokeDashoffset={163.3 - (163.3 * item.progress) / 100}
                          strokeWidth="3.5"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-xs font-sans text-slate-850 dark:text-slate-200">
                        {item.progress}%
                      </div>
                    </div>

                    <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-0.5">
                      {item.id}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-sans font-semibold">
                      {item.section} · Floor {item.floor}
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3 font-sans font-semibold">
                      {item.timeAgo}
                    </p>
                    <button
                      onClick={() => handleContinue(item)}
                      className="w-full py-1.5 bg-orange-500 text-white rounded-xl text-[11px] font-bold hover:bg-orange-600 transition-all duration-200 active:scale-95 shadow-sm shadow-orange-500/20 cursor-pointer"
                    >
                      {item.progress >= 90 ? 'Complete' : 'Continue'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-150 font-sans tracking-tight">
              Cleaning Request Features
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center hover:scale-[1.02] transition-transform flex flex-col items-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 mb-3 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">add_task</span>
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                  New Request
                </span>
                <span className="text-[9px] text-slate-400 leading-tight">
                  Request cleaning for any table.
                </span>
              </button>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center hover:scale-[1.02] transition-transform flex flex-col items-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                  Request History
                </span>
                <span className="text-[9px] text-slate-400 leading-tight">
                  View all your past requests.
                </span>
              </button>

              <button
                onClick={() => setShowSpecialModal(true)}
                className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center hover:scale-[1.02] transition-transform flex flex-col items-center group cursor-pointer col-span-2"
              >
                {/* Baki code waisa hi rehne do */}
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">stars</span>
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                  Special Request
                </span>
                <span className="text-[9px] text-slate-400 leading-tight">
                  Add notes for special cleaning.
                </span>
              </button>
            </div>
          </div>

          {/* Branding Card */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 rounded-2xl relative overflow-hidden text-white shadow-md shadow-orange-500/10">
            <div className="absolute -right-4 -bottom-4 opacity-15 transform rotate-12 shrink-0">
              <span className="material-symbols-outlined text-[100px]">cleaning_services</span>
            </div>
            <h3 className="text-sm font-extrabold mb-1 font-sans">Keep It Clean, Keep It Safe</h3>
            <p className="text-[11px] opacity-90 mb-4 relative z-10 font-sans leading-relaxed">
              Your efforts make our space better for everyone. Thank you for your dedication!
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-white">verified</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
                Daily Hygiene Champion
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hygiene Tasks Footer */}
      <section className="space-y-4 pb-8">
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-150 font-sans tracking-tight">
          Hygiene Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {filteredHygiene.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 font-sans">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.colorClass}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{task.icon}</span>
                </div>
                <div>
                  <p
                    className={`font-bold text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}
                  >
                    {task.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">{task.lastDone}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleHygieneTask(task.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border font-sans transition-all active:scale-95 shrink-0 ${
                  task.completed
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    : 'bg-orange-500 text-white border-transparent hover:bg-orange-600'
                }`}
              >
                {task.completed ? 'Completed' : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* New Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">
              Create Cleaning Request
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-4 font-sans leading-relaxed">
              Raise a manual cleaning request for any table station.
            </p>
            <form onSubmit={handleCreateRequest} className="space-y-4 font-sans text-xs">
              <div>
                <label
                  htmlFor="new-request-table"
                  className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Table Number
                </label>
                <input
                  id="new-request-table"
                  type="text"
                  placeholder="e.g. T08, T14"
                  value={newRequestTable}
                  onChange={(e) => setNewRequestTable(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Priority
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['High', 'Medium', 'Low'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewRequestPriority(p)}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        newRequestPriority === p
                          ? 'border-orange-500 bg-orange-500/10 text-orange-500 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-640 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95"
                >
                  Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Request History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-sans">
                Request History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                type="button"
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <button
                    type="button"
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {req.location}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {req.requestedOn} • {req.requestedTime}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-100 dark:bg-orange-950/30 px-2 py-1 rounded-full">
                      {req.status}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-sans text-center">
                  Koi request history nahi mili.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Special Request Modal - Ye history modal ke bahar hai */}
      {showSpecialModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">
              Special Cleaning Request
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-4 font-sans leading-relaxed">
              Enter your special cleaning notes below.
            </p>

            <textarea
              placeholder="e.g., Deep clean the sofa, check for stains..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-4 h-24"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowSpecialModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  cleaningStore.addCleaningRequest({
                    id: `CR-2026-${Math.floor(Math.random() * 999)}`,
                    type: 'Special Request',
                    icon: 'stars',
                    iconColor: 'text-orange-600',
                    location: 'Special Note',
                    requestedBy: {
                      name: 'Staff',
                      avatar:
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuANsaeL1qIrdjS8VjlskxOHt17ofWL0mQA8HTEyUyGUmb0WZEoFeVIhAYDxByw8LuxWxFKIdV270hwAPBmZFNJdIOoLB7X4CRStTLzQ66uJ709k9Kvpbt3yDChYZmi0IOgzaKGIARmUFWTp8fiuOG-poilaUus94iK5MEMaPofwxQGipJFvuis9fWEp53IS84fln5N1GSiP7xWII9WnJi1qTw5gFY4eKQQgrXVlslMwV6TbZi4nnm2vGRG3hjoOoFQyNc23SGR4j9U',
                    },
                    priority: 'Medium',
                    status: 'Pending',
                    requestedOn: new Date().toLocaleDateString(),
                    requestedTime: new Date().toLocaleTimeString(),
                    notes: specialNotes,
                  });

                  window.dispatchEvent(
                    new CustomEvent('new-cleaning-request', {
                      detail: {
                        id: Date.now(),
                        title: `Special Request Added`,
                        message: 'Note submitted.',
                        read: false,
                      },
                    })
                  );
                  setSpecialNotes('');
                  setShowSpecialModal(false);
                }}
                className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold text-xs"
              >
                Submit Note
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Details Modal - Note dekhne ke liye */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-2 font-sans">
              Request Details
            </h3>
            <p className="text-[11px] text-slate-400 mb-2">Note content:</p>
            <div className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-4 min-h-[80px]">
              {selectedRequest.notes || 'No special notes provided.'}
            </div>
            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* ===== Cleaning Staff Management Panel ===== */}
      <section className="bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-sans">Cleaning Staff</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-455 mt-0.5 font-sans">
              {staffList.length} team member{staffList.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={() => { setNewStaffName(''); setNewStaffPhone(''); setShowAddStaffModal(true); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Add Staff
          </button>
        </div>

        {staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <span className="material-symbols-outlined text-4xl">group_off</span>
            <p className="text-xs font-semibold">No staff added yet. Click "Add Staff" to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {staffList.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
              >
                <img
                  src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f97316&color=fff&bold=true`}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{member.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-455 truncate">{member.role} · {member.area}</p>
                </div>
                <button
                  onClick={() => {
                    cleaningStore.removeStaffMember(member.id);
                    showToast(`${member.name} removed from staff.`, 'info');
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                  title="Remove staff member"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">Add Cleaning Staff</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-455 mb-4 font-sans">Register a new team member to assign to tables.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStaffName.trim()) return;
                const newMember: CleaningStaffMember = {
                  id: `STF-${Date.now()}`,
                  name: newStaffName.trim(),
                  role: newStaffRole,
                  area: newStaffArea,
                  phone: newStaffPhone,
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStaffName)}&background=f97316&color=fff&bold=true`,
                };
                cleaningStore.addStaffMember(newMember);
                showToast(`${newMember.name} added to staff!`, 'success');
                setShowAddStaffModal(false);
              }}
              className="space-y-3 font-sans text-xs"
            >
              <div>
                <label htmlFor="staff-name" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Full Name</label>
                <input
                  id="staff-name"
                  type="text"
                  placeholder="e.g. Sunil Kumar"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="staff-role" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Role</label>
                  <select
                    id="staff-role"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Cleaning Staff">Cleaning Staff</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Senior Cleaner">Senior Cleaner</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Supervisor">Supervisor</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Janitor">Janitor</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="staff-area" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Area</label>
                  <select
                    id="staff-area"
                    value={newStaffArea}
                    onChange={(e) => setNewStaffArea(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area A">Dining Area A</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area B">Dining Area B</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Terrace Area">Terrace Area</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Floor 1">Floor 1</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Restroom">Restroom</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="staff-phone" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Phone (optional)</label>
                <input
                  id="staff-phone"
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

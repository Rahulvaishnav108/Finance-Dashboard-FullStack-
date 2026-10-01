import React, { useState, useRef, useEffect } from 'react';
import { useCleaning } from '../hooks/usecleaning';
import { useCleaningSearch } from '../components/dashboard/CleaningSearchContext';
import { cleaningStore, CleaningStaffMember, RoutineChore } from '../store/cleaning.store';
import { useToast } from '../components/dashboard/Toast';
/* eslint-disable @typescript-eslint/no-unused-vars */

interface CleanTask {
  id: string;
  name: string;
  location: string;
  type: string;
  icon: string;
  iconColor: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueTime: string;
  overdue: boolean;
  borderClass: string;
  rawId: string;
  assignedTo?: string;
  lastDone?: string;
}

interface TableTask {
  id: string;
  status:
    | 'Needs Cleaning'
    | 'Cleaning Requested'
    | 'In Progress'
    | 'Ready for Inspection'
    | 'Available';
  priority: 'High' | 'Medium' | 'Low';
  timeAgo?: string;
  progress?: number;
  notes?: string;
}

export default function CleaningTasksPage() {
  const { searchQuery } = useCleaningSearch();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [areaFilter, setAreaFilter] = useState('All Area');
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<CleanTask | null>(null);

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskLocation, setNewRequestLocation] = useState('Dining Area A');
  const [newTaskType, setNewTaskType] = useState('Table Cleaning');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Custom Drop-up layout tracker for bottom rows limit selector only
  const [isRowsOpen, setIsRowsOpen] = useState(false);
  const rowsRef = useRef<HTMLDivElement>(null);

  // Pagination Engine States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // New chore modal state
  const [newChoreName, setNewChoreName] = useState('');
  const [newChoreArea, setNewChoreArea] = useState('Dining Area A');
  const [newChoreFrequency, setNewChoreFrequency] = useState('Hourly');
  const [newChoreAssigned, setNewChoreAssigned] = useState('');

  const [choresList, setChoresList] = useState<RoutineChore[]>(cleaningStore.chores);
  const [staffList, setStaffList] = useState<CleaningStaffMember[]>(cleaningStore.staffMembers);

  useEffect(() => {
    const unsubscribe = cleaningStore.subscribe(() => {
      setChoresList([...cleaningStore.chores]);
      setStaffList([...cleaningStore.staffMembers]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rowsRef.current && !rowsRef.current.contains(event.target as Node)) {
        setIsRowsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tasks: CleanTask[] = choresList.map((c) => {
    let icon = 'assignment';
    let iconColor = 'text-orange-500';
    let type = 'Routine Chore';

    if (c.name.toLowerCase().includes('trash') || c.name.toLowerCase().includes('waste')) {
      icon = 'delete_outline';
      iconColor = 'text-red-500';
      type = 'Waste Management';
    } else if (c.name.toLowerCase().includes('sanitize') || c.name.toLowerCase().includes('restroom')) {
      icon = 'sanitizer';
      iconColor = 'text-purple-500';
      type = 'Sanitization';
    } else if (c.name.toLowerCase().includes('sweep') || c.name.toLowerCase().includes('mop') || c.name.toLowerCase().includes('clean')) {
      icon = 'cleaning_bucket';
      iconColor = 'text-cyan-500';
      type = 'Deep Cleaning';
    } else if (c.name.toLowerCase().includes('restock') || c.name.toLowerCase().includes('refill')) {
      icon = 'inventory';
      iconColor = 'text-indigo-500';
      type = 'Restocking';
    }

    const isHigh = c.name.toLowerCase().includes('sanitize') || c.name.toLowerCase().includes('restroom');

    return {
      id: c.id,
      name: c.name,
      location: c.area,
      type: type,
      icon: icon,
      iconColor: iconColor,
      priority: isHigh ? 'High' : 'Medium',
      status: c.status,
      dueTime: c.frequency,
      assignedTo: c.assignedTo,
      lastDone: c.lastDone,
      borderClass: isHigh ? 'border-l-red-500' : 'border-l-orange-500',
      overdue: isHigh && c.status === 'Pending',
      rawId: c.id,
    };
  });

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const overdueCount = tasks.filter((t) => t.status === 'Pending' && t.priority === 'High').length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreName.trim()) return;
    const newChore: RoutineChore = {
      id: `CHR-0${100 + choresList.length + 1}`,
      name: newChoreName.trim(),
      area: newChoreArea,
      frequency: newChoreFrequency,
      assignedTo: newChoreAssigned || 'Unassigned',
      status: 'Pending',
    };
    cleaningStore.addChore(newChore);
    showToast(`Task "${newChore.name}" added to checklist.`, 'success');
    setNewChoreName('');
    setShowAddModal(false);
  };

  const handleToggleTaskStatus = (id: string, currentStatus: string) => {
    if (currentStatus === 'Pending') {
      cleaningStore.updateChoreStatus(id, 'In Progress');
      showToast('Task is now In Progress.', 'success');
    } else if (currentStatus === 'In Progress') {
      cleaningStore.updateChoreStatus(id, 'Completed');
      showToast('Task completed successfully!', 'success');
    } else if (currentStatus === 'Completed') {
      cleaningStore.updateChoreStatus(id, 'Pending');
      showToast('Task status reset to Pending.', 'info');
    }
  };

  const handleViewTaskDetailsLog = (row: CleanTask) => {
    setSelectedTask(row);
  };

  const handleActionClick = (row: CleanTask, action: 'start' | 'complete' | 'delete') => {
    if (action === 'start') {
      cleaningStore.updateChoreStatus(row.id, 'In Progress');
      showToast('Task is now In Progress.', 'success');
    } else if (action === 'complete') {
      cleaningStore.updateChoreStatus(row.id, 'Completed');
      showToast('Task completed successfully!', 'success');
    } else if (action === 'delete') {
      cleaningStore.deleteChore(row.id);
      showToast('Task deleted.', 'warning');
    }
    setOpenMenuId(null);
  };

  const handleExportTasksCSV = () => {
    if (filteredTasks.length === 0) {
      showToast('No tasks to export.', 'warning');
      return;
    }
    const headers = [
      'Task ID',
      'Task Name',
      'Location / Table',
      'Type',
      'Priority',
      'Status',
      'Due Window',
    ];
    const rows = filteredTasks.map((t) => [
      t.id,
      `"${t.name}"`,
      t.location,
      t.type,
      t.priority,
      t.status,
      t.dueTime,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const linkAnchor = document.createElement('a');
    linkAnchor.setAttribute('href', encodedUri);
    linkAnchor.setAttribute(
      'download',
      `CleanServe_Operational_Tasks_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(linkAnchor);
    linkAnchor.click();
    document.body.removeChild(linkAnchor);
  };

  const handleResetFiltersToggle = () => {
    setStatusFilter('All Status');
    setPriorityFilter('All Priority');
    setAreaFilter('All Area');
    setCurrentPage(1);
    showToast('Filters cleared.', 'info');
  };

  // Filter conditions
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All Status' || t.status === statusFilter;

    const matchesPriority = priorityFilter === 'All Priority' || t.priority === priorityFilter;
    const matchesArea = areaFilter === 'All Area' || t.location.includes(areaFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesArea;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPaginatedTasks = filteredTasks.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn cleaning-panel">
      {/* Header Info Action Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Task
        </button>
        {/* 🔥 Connected onClick Trigger for Export button */}
        <button
          onClick={handleExportTasksCSV}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-all active:scale-95 text-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export
        </button>
      </div>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined text-[20px]">assignment</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-150 leading-none">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-sans font-semibold">
              Total Tasks
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-150 leading-none">
              {pendingCount}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-sans font-semibold">
              Pending
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-150 leading-none">
              {inProgressCount}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-sans font-semibold">
              In Progress
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-150 leading-none">
              {completedCount}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-sans font-semibold">
              Completed
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">error</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-150 leading-none">
              {overdueCount}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-sans font-semibold">
              Overdue
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar & Filter Bar Grid - Original Teeno Select elements untouched! */}
      <section className="bg-white dark:bg-sd-surface-container p-4 rounded-t-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans py-2 px-3 focus:ring-2 focus:ring-orange-500 font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">All Status</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Pending">Pending</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="In Progress">In Progress</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans py-2 px-3 focus:ring-2 focus:ring-orange-500 font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">All Priority</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="High">High</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Medium">Medium</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Low">Low</option>
          </select>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans py-2 px-3 focus:ring-2 focus:ring-orange-500 font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">All Area</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area">Dining Area</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Restroom">Restroom</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Pantry">Pantry Area</option>
            <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Conference">Conference Room</option>
          </select>

          {/* 🔥 Connected onClick Trigger for Filter action button */}
          <button
            onClick={handleResetFiltersToggle}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-sans font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:border-orange-500 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt</span>
            Filter
          </button>
        </div>

        <div className="ml-auto text-[10px] text-slate-455 dark:text-slate-400 font-sans font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">autorenew</span>
          Last updated: Just now
        </div>
      </section>

      {/* Tasks Table Section */}
      <section className="bg-white dark:bg-sd-surface-container rounded-b-2xl border-x border-b border-slate-150 dark:border-slate-800/60 shadow-sm overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-550 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Table / Location</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Time</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentPaginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No hygiene tasks found.
                  </td>
                </tr>
              ) : (
                currentPaginatedTasks.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-l-4 ${row.borderClass} transition-colors group`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-orange-500">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-455 font-semibold">
                      {row.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-355">
                        <span className={`material-symbols-outlined text-[16px] ${row.iconColor}`}>
                          {row.icon}
                        </span>
                        {row.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.priority === 'High'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                            : row.priority === 'Medium'
                              ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400'
                              : 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                        }`}
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleTaskStatus(row.rawId!, row.status)}
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                          row.status === 'Completed'
                            ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                            : row.status === 'In Progress'
                              ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30'
                              : 'bg-orange-500/10 text-orange-500 border-orange-200 dark:bg-slate-800 dark:text-orange-400'
                        }`}
                      >
                        {row.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap leading-relaxed">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {row.dueTime}
                      </div>
                      {row.overdue && row.status !== 'Completed' && (
                        <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-tighter">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <div className="flex justify-center gap-2">
                        {/* 👁️ Eye details action */}
                        <button
                          onClick={() => handleViewTaskDetailsLog(row)}
                          className="p-1 text-orange-500 hover:bg-orange-500/10 rounded transition-colors cursor-pointer"
                          title="View Task Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {/* 💬 More Actions menu */}
                        <button
                          onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                          className="p-1 text-slate-400 hover:text-orange-500 rounded transition-colors cursor-pointer"
                          title="Task Quick Config"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {openMenuId === row.id && (
                        <div className="absolute right-0 top-12 w-44 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-2xl z-[999] p-1 font-sans">
                          <button
                            onClick={() => handleActionClick(row, 'start')}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg"
                          >
                            Start Task
                          </button>
                          <button
                            onClick={() => handleActionClick(row, 'complete')}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleActionClick(row, 'delete')}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                          >
                            Delete Task
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/*  FIXED: Bottom Pagination layout container blended seamlessly (Silver line cleared!) */}
        <div className="px-6 py-4 bg-white dark:bg-sd-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 relative z-30">
          <p className="text-slate-400 dark:text-slate-455 font-bold">
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredTasks.length)} of{' '}
            {totalCount} tasks
          </p>
          <div className="flex items-center gap-6">
            {/* 💥 Custom HTML Rows Per Page Menu Block (No System Blue Highlight) */}
            <div className="flex items-center gap-2" ref={rowsRef}>
              <span className="text-slate-400 dark:text-slate-455 font-bold">Rows per page</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRowsOpen(!isRowsOpen)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2.5 font-bold text-slate-700 dark:text-slate-355 flex items-center gap-1 outline-none hover:border-orange-500 cursor-pointer"
                >
                  <span>{rowsPerPage}</span>
                  <span className="material-symbols-outlined text-xs text-slate-400">
                    keyboard_arrow_down
                  </span>
                </button>
                {isRowsOpen && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden flex flex-col font-sans text-xs z-50">
                    {[5, 10, 25].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setRowsPerPage(size);
                          setCurrentPage(1);
                          setIsRowsOpen(false);
                        }}
                        className={`w-full text-center py-1.5 font-bold transition-colors cursor-pointer ${
                          rowsPerPage === size
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-orange-500/10 hover:text-orange-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/*  Custom HTML Pagination Active Page Layout Controls (Pages 1 & 2 fully click-reactive!) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.max(1, Math.ceil(filteredTasks.length / rowsPerPage)) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 font-bold rounded-lg transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-355'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.max(1, Math.ceil(filteredTasks.length / rowsPerPage))))}
                disabled={currentPage >= Math.max(1, Math.ceil(filteredTasks.length / rowsPerPage))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Widget Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
        <div className="lg:col-span-2 bg-white dark:bg-sd-surface-container p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-4 font-sans">
            Weekly Cleaning Efficiency
          </h3>
          <div className="flex items-end gap-3 h-32 pl-4 border-l border-slate-100 dark:border-slate-800">
            {[
              { day: 'MON', height: 'h-[60%]', pct: '60%' },
              { day: 'TUE', height: 'h-[45%]', pct: '45%' },
              { day: 'WED', height: 'h-[85%]', pct: '85%' },
              { day: 'THU', height: 'h-[30%]', pct: '30%' },
              { day: 'FRI', height: 'h-[70%]', pct: '70%' },
            ].map((col) => (
              <div
                key={col.day}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
              >
                <div
                  className={`w-full bg-orange-500/20 dark:bg-orange-500/10 group-hover:bg-orange-500/40 rounded-t-lg ${col.height} transition-all relative`}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {col.pct}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold font-sans">
                  {col.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-700 p-6 rounded-2xl text-white shadow-sm flex flex-col justify-between relative overflow-hidden shadow-orange-500/10">
          <div className="relative z-10 font-sans">
            <h3 className="font-extrabold text-sm mb-2">Efficiency Tip</h3>
            <p className="text-xs opacity-90 leading-relaxed">
              Focus on &quot;High Priority&quot; tasks in Dining Area A first to maintain peak
              service hygiene during peak dining rush hours.
            </p>
          </div>
          <div className="mt-4 relative z-10">
            <button className="bg-white/25 hover:bg-white/35 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95">
              View Efficiency Report
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full blur-2xl shrink-0" />
        </div>
      </section>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">
              Assign New Cleaning Task
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-455 mb-4 font-sans leading-relaxed">
              Log a manual cleanup, deep scrubbing, or supply replenishment duty.
            </p>
            <form onSubmit={handleAddTask} className="space-y-4 font-sans text-xs">
              <div>
                <label
                  htmlFor="new-chore-name"
                  className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Chore Description
                </label>
                <input
                  id="new-chore-name"
                  type="text"
                  placeholder="e.g. Empty trash bins, Wipe kitchen floor"
                  value={newChoreName}
                  onChange={(e) => setNewChoreName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="new-chore-area"
                    className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Chore Area
                  </label>
                  <select
                    id="new-chore-area"
                    value={newChoreArea}
                    onChange={(e) => setNewChoreArea(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area A">Dining Area A</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area B">Dining Area B</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Terrace Area">Terrace Area</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Floor 1">Floor 1</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Restroom">Restroom</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="new-chore-freq"
                    className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Frequency
                  </label>
                  <select
                    id="new-chore-freq"
                    value={newChoreFrequency}
                    onChange={(e) => setNewChoreFrequency(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Hourly">Hourly</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Every 2 Hours">Every 2 Hours</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Every 4 Hours">Every 4 Hours</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Daily">Daily</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Shift Handover">Shift Handover</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-chore-staff"
                  className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Assign Staff
                </label>
                <select
                  id="new-chore-staff"
                  value={newChoreAssigned}
                  onChange={(e) => setNewChoreAssigned(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="">Unassigned</option>
                  {staffList.map((member) => (
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" key={member.id} value={member.name}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm border dark:border-slate-800 shadow-2xl font-sans">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4">
              Task Details
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <strong>Task:</strong> {selectedTask.name}
              </p>
              <p>
                <strong>Location:</strong> {selectedTask.location}
              </p>
              <p>
                <strong>Type:</strong> {selectedTask.type}
              </p>
              <p>
                <strong>Priority:</strong> {selectedTask.priority}
              </p>
              <p>
                <strong>Status:</strong> {selectedTask.status}
              </p>
              <p>
                <strong>Frequency:</strong> {selectedTask.dueTime}
              </p>
              <p>
                <strong>Assigned Staff:</strong> {selectedTask.assignedTo || 'Unassigned'}
              </p>
              {selectedTask.lastDone && (
                <p>
                  <strong>Last Completed At:</strong> {selectedTask.lastDone}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="mt-6 w-full py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

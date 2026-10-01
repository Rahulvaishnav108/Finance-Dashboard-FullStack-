import React, { useState, useRef, useEffect } from 'react';
import { useCleaning } from '../hooks/usecleaning';
import { useCleaningSearch } from '../components/dashboard/CleaningSearchContext';
import { cleaningStore, CleaningStaffMember } from '../store/cleaning.store';
import { useToast } from '../components/dashboard/Toast';
/* eslint-disable @typescript-eslint/no-unused-vars */

interface TableRow {
  id: string;
  area: string;
  seats: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Done' | '--';
  priority: 'High' | 'Medium' | 'Low';
  lastCleaned: string;
  assignedTo: { name: string; avatar: string } | null;
  rawId: string;
}

interface TableTask {
  id: string;
  rawId: string;
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

export default function CleaningTablesPage() {
  const { searchQuery } = useCleaningSearch();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableArea, setNewTableArea] = useState('Dining Area A');
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [newTablePriority, setNewTablePriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Edit/Delete/Assign state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableRow | null>(null);
  const [editTableArea, setEditTableArea] = useState('Dining Area A');
  const [editTableSeats, setEditTableSeats] = useState(4);
  const [editTablePriority, setEditTablePriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTableId, setAssigningTableId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<CleaningStaffMember[]>(cleaningStore.staffMembers);

  const [tableList, setTableList] = useState(cleaningStore.tables);
  useEffect(() => {
    const unsubscribe = cleaningStore.subscribe(() => {
      setTableList([...cleaningStore.tables]);
      setStaffList([...cleaningStore.staffMembers]);
    });
    return () => { unsubscribe(); };
  }, []);

  const handleViewTableDetails = (row: TableRow) => {
    setSelectedTable(row);
  };
  const [selectedTable, setSelectedTable] = useState<TableRow | null>(null);

  const handleActionClick = (row: TableRow, action: 'start' | 'complete' | 'verify') => {
    const id = row.rawId;
    if (action === 'start') cleaningStore.startCleaning(id);
    if (action === 'complete') cleaningStore.completeInspection(id);
    if (action === 'verify') cleaningStore.verifyInspection(id);
  };

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isRowsOpen, setIsRowsOpen] = useState(false); //
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  const { urgentTasks, startTask, completeTask, verifyTask } = useCleaning();
  const safeTasks: TableTask[] = (urgentTasks || []) as unknown as TableTask[];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node))
        setIsStatusOpen(false);
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node))
        setIsPriorityOpen(false);
      if (rowsRef.current && !rowsRef.current.contains(event.target as Node)) setIsRowsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tables: TableRow[] = tableList.map((t) => {
    let displayStatus: 'Pending' | 'In Progress' | 'Completed' | 'Done' | '--' = 'Pending';
    if (t.status === 'Needs Cleaning' || t.status === 'Cleaning Requested') displayStatus = 'Pending';
    if (t.status === 'In Progress') displayStatus = 'In Progress';
    if (t.status === 'Ready for Inspection') displayStatus = 'Completed';
    if (t.status === 'Done') displayStatus = 'Done';
    if (t.status === '--') displayStatus = '--';

    return {
      id: t.id,
      area: t.area,
      seats: t.seats,
      status: displayStatus,
      priority: t.priority,
      lastCleaned: t.timeAgo,
      assignedTo: t.assignedTo || null,
      rawId: t.id,
    };
  });

  // Real stats — no fake offsets
  const totalTables = tables.length;
  const totalInProgress = tables.filter((t) => t.status === 'In Progress').length;
  const totalCleanedToday = tables.filter((t) => t.status === 'Completed' || t.status === 'Done').length;
  const totalHighPriority = tables.filter((t) => t.priority === 'High').length;

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;

    cleaningStore.addTable({
      id: newTableNumber.toUpperCase().startsWith('T')
        ? newTableNumber.toUpperCase()
        : `T${newTableNumber}`,
      area: newTableArea,
      seats: newTableSeats,
      status: 'Needs Cleaning',
      priority: newTablePriority,
      timeAgo: 'Just Now',
      assignedTo: null,
    });

    // Reset form and close modal
    setNewTableNumber('');
    setNewTableArea('Dining Area A');
    setNewTableSeats(4);
    setNewTablePriority('Medium');
    setShowAddModal(false);
  };

  const handleToggleStatus = (rawId: string, currentStatus: string) => {
    if (currentStatus === 'Pending') {
      cleaningStore.startCleaning(rawId);
      showToast(`Started cleaning Table ${rawId}.`, 'success');
    } else if (currentStatus === 'In Progress') {
      cleaningStore.updateProgress(rawId);
      showToast(`Progress updated for Table ${rawId}.`, 'info');
    } else if (currentStatus === 'Completed') {
      cleaningStore.completeInspection(rawId);
      showToast(`Table ${rawId} inspection complete.`, 'success');
    }
  };

  const handleOpenEditModal = (row: TableRow) => {
    setEditingTable(row);
    setEditTableArea(row.area);
    setEditTableSeats(row.seats);
    setEditTablePriority(row.priority);
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    cleaningStore.editTable(editingTable.rawId, {
      area: editTableArea,
      seats: editTableSeats,
      priority: editTablePriority,
    });
    showToast(`Table ${editingTable.id} updated.`, 'success');
    setShowEditModal(false);
    setEditingTable(null);
  };

  const handleDeleteTable = (id: string) => {
    cleaningStore.deleteTable(id);
    showToast(`Table ${id} removed.`, 'warning');
    setDeleteConfirmId(null);
    setOpenMenuId(null);
  };

  const handleAssignStaff = (member: CleaningStaffMember) => {
    if (!assigningTableId) return;
    cleaningStore.assignTableStaff(assigningTableId, { name: member.name, avatar: member.avatar });
    showToast(`${member.name} assigned to Table ${assigningTableId}.`, 'success');
    setShowAssignModal(false);
    setAssigningTableId(null);
    setOpenMenuId(null);
  };

  const handleUnassignStaff = (tableId: string) => {
    cleaningStore.assignTableStaff(tableId, null);
    showToast(`Staff unassigned from Table ${tableId}.`, 'info');
    setOpenMenuId(null);
  };

  const handleExportData = () => {
    const csvRows = [
      [
        'Table ID',
        'Area / Zone',
        'Seats Configuration',
        'Operational Status',
        'Priority Vector',
        'Last Cleaned Time',
      ],
      ...filteredTables.map((t) => [t.id, t.area, t.seats, t.status, t.priority, t.lastCleaned]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute(
      'download',
      `CleanServe_Tables_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Filter conditions
  const filteredTables = tables.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All Priority' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate dynamic paginated slices matching user action indexes safely
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPaginatedRows = filteredTables.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="space-y-6 animate-fadeIn cleaning-panel">
      {/* Summary Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined">table_restaurant</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {totalTables}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-sans">
              Total Tables
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined">cleaning_bucket</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {totalInProgress}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-sans">In Progress</p>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {totalCleanedToday}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-sans">
              Cleaned Today
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-sd-surface-container p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {totalHighPriority}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-sans">
              High Priority
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar & Data Table Section */}
      <section className="bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-sd-surface-container relative z-40">
          <div className="flex flex-wrap items-center gap-3 flex-grow max-w-3xl">
            <div className="relative md:hidden flex-grow max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-sans text-slate-800 dark:text-slate-200"
                placeholder="Search tables..."
                type="text"
                value={searchQuery}
                readOnly
              />
            </div>

            {/* Custom Status Dropdown Menu (No System Blue Highlighting) */}
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsPriorityOpen(false);
                  setIsRowsOpen(false);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans py-2 px-3 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 outline-none hover:border-orange-500 transition-colors cursor-pointer"
              >
                <span>{statusFilter}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">
                  keyboard_arrow_down
                </span>
              </button>
              {isStatusOpen && (
                <div className="absolute left-0 mt-1.5 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden flex flex-col font-sans text-xs">
                  {['All Status', 'Pending', 'In Progress', 'Completed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setIsStatusOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 font-bold transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-orange-500/10 hover:text-orange-500'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Priority Dropdown Menu (No System Blue Highlighting) */}
            <div className="relative" ref={priorityRef}>
              <button
                type="button"
                onClick={() => {
                  setIsPriorityOpen(!isPriorityOpen);
                  setIsStatusOpen(false);
                  setIsRowsOpen(false);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans py-2 px-3 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 outline-none hover:border-orange-500 transition-colors cursor-pointer"
              >
                <span>{priorityFilter}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">
                  keyboard_arrow_down
                </span>
              </button>
              {isPriorityOpen && (
                <div className="absolute left-0 mt-1.5 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden flex flex-col font-sans text-xs">
                  {['All Priority', 'High', 'Medium', 'Low'].map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => {
                        setPriorityFilter(pr);
                        setIsPriorityOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 font-bold transition-colors cursor-pointer ${
                        priorityFilter === pr
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-orange-500/10 hover:text-orange-500'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-sans font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-500/10 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Table
            </button>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Table ID</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Area</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Seats</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Last Cleaned</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentPaginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No tables found matching selection parameters.
                  </td>
                </tr>
              ) : (
                currentPaginatedRows.map((row) => (
                  <tr
                    key={row.rawId}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`material-symbols-outlined ${
                            row.status === 'Completed'
                              ? 'text-green-500 dark:text-green-400'
                              : 'text-orange-500'
                          }`}
                        >
                          table_bar
                        </span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                          {row.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-450 font-semibold">
                      {row.area}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-850 dark:text-slate-300">
                      {row.seats}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(row.rawId, row.status)}
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border cursor-pointer transition-colors duration-150 ${
                          row.status === 'Completed' || row.status === 'Done'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                            : row.status === 'In Progress'
                              ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30'
                              : row.status === '--'
                                ? 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                : 'bg-orange-500/10 text-orange-500 border-orange-200 dark:bg-slate-800 dark:text-orange-400'
                        }`}
                      >
                        {row.status}
                      </button>
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
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-455 font-semibold">
                      {row.lastCleaned}
                    </td>
                    <td className="px-6 py-4">
                      {row.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <img
                            alt={row.assignedTo.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            src={row.assignedTo.avatar}
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {row.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewTableDetails(row)}
                          className="p-1 text-slate-450 hover:text-orange-500 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>

                        <button
                          onClick={() => setOpenMenuId(openMenuId === row.rawId ? null : row.rawId)}
                          className="p-1 text-slate-400 hover:text-orange-500 rounded transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {openMenuId === row.rawId && (
                        <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-2xl z-[999] p-1 font-sans">
                          <button
                            onClick={() => { handleToggleStatus(row.rawId, row.status); setOpenMenuId(null); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                            {row.status === 'Pending' ? 'Start Cleaning' : row.status === 'In Progress' ? 'Update Progress' : 'Mark Complete'}
                          </button>
                          <button
                            onClick={() => { setAssigningTableId(row.rawId); setOpenMenuId(null); setShowAssignModal(true); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[15px]">person_add</span>
                            Assign Staff
                          </button>
                          {row.assignedTo && (
                            <button
                              onClick={() => handleUnassignStaff(row.rawId)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[15px]">person_remove</span>
                              Unassign Staff
                            </button>
                          )}
                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                          <button
                            onClick={() => handleOpenEditModal(row)}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                            Edit Table
                          </button>
                          <button
                            onClick={() => { setDeleteConfirmId(row.rawId); setOpenMenuId(null); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                            Delete Table
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

        {/* Table Footer / Pagination Panels */}
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-sd-surface-container border-t border-slate-100 dark:border-slate-800 relative z-30">
          <p className="text-slate-400 dark:text-slate-455 font-bold">
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredTables.length)} of{' '}
            {totalTables} tables
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {/* 💥 Custom HTML Pagination Active Layout Links Control Block */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.max(1, Math.ceil(filteredTables.length / rowsPerPage)) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 font-bold rounded-lg transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.max(1, Math.ceil(filteredTables.length / rowsPerPage))))}
                disabled={currentPage >= Math.max(1, Math.ceil(filteredTables.length / rowsPerPage))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            {/* 💥 FIXED: Custom dropup layout list component for rows menu logic (Orange theme highlight applied!) */}
            <div className="flex items-center gap-2" ref={rowsRef}>
              <span className="text-slate-400 dark:text-slate-455 font-bold">Rows per page:</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsRowsOpen(!isRowsOpen);
                    setIsStatusOpen(false);
                    setIsPriorityOpen(false);
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2.5 font-bold text-slate-700 dark:text-slate-355 flex items-center gap-1 outline-none hover:border-orange-500 cursor-pointer"
                >
                  <span>{rowsPerPage}</span>
                  <span className="material-symbols-outlined text-xs text-slate-400">
                    keyboard_arrow_down
                  </span>
                </button>
                {isRowsOpen && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden flex flex-col font-sans text-xs">
                    {[10, 25, 50].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setRowsPerPage(size);
                          setCurrentPage(1);
                          setIsRowsOpen(false);
                        }}
                        className={`w-full text-center px-3 py-1.5 font-bold transition-colors cursor-pointer ${
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
          </div>
        </div>
      </section>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">
              Add New Dining Table
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-455 mb-4 font-sans leading-relaxed">
              Create a new table record in the database floor outline.
            </p>
            <form onSubmit={handleAddTable} className="space-y-4 font-sans text-xs">
              <div>
                <label
                  htmlFor="new-table-id"
                  className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Table ID
                </label>
                <input
                  id="new-table-id"
                  type="text"
                  placeholder="e.g. T25, T32"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="new-table-area"
                  className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Dining Area / Zone
                </label>
                <select
                  id="new-table-area"
                  value={newTableArea}
                  onChange={(e) => setNewTableArea(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area A">Dining Area A</option>
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area B">Dining Area B</option>
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Terrace Area">Terrace Area</option>
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Floor 1">Floor 1</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="new-table-seats"
                    className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Seats Count
                  </label>
                  <input
                    id="new-table-seats"
                    type="number"
                    min="1"
                    max="12"
                    value={newTableSeats}
                    onChange={(e) => setNewTableSeats(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-table-priority"
                    className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Initial Priority
                  </label>
                  <select
                    id="new-table-priority"
                    value={newTablePriority}
                    onChange={(e) =>
                      setNewTablePriority(e.target.value as 'High' | 'Medium' | 'Low')
                    }
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="High">High</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Medium">Medium</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Low">Low</option>
                  </select>
                </div>
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
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedTable && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4">
              Table {selectedTable.id} Info
            </h2>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <strong>Zone:</strong> {selectedTable.area}
              </p>
              <p>
                <strong>Seats:</strong> {selectedTable.seats}
              </p>
              <p>
                <strong>Current Status:</strong>{' '}
                <span className="font-bold text-orange-500">{selectedTable.status}</span>
              </p>
              <p>
                <strong>Priority:</strong> {selectedTable.priority}
              </p>
              <p>
                <strong>Last Cleaned:</strong> {selectedTable.lastCleaned || 'N/A'}
              </p>
              <p>
                <strong>Assigned To:</strong> {selectedTable.assignedTo?.name || 'No one'}
              </p>
            </div>
            <button
              onClick={() => setSelectedTable(null)}
              className="mt-6 w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== Edit Table Modal ===== */}
      {showEditModal && editingTable && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm font-sans">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1">Edit Table {editingTable.id}</h3>
            <p className="text-[11px] text-slate-400 mb-4">Update the table details below.</p>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="edit-area" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Dining Area / Zone</label>
                <select
                  id="edit-area"
                  value={editTableArea}
                  onChange={(e) => setEditTableArea(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area A">Dining Area A</option>
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Dining Area B">Dining Area B</option>
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Terrace Area">Terrace Area</option>
                  <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Floor 1">Floor 1</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-seats" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Seats</label>
                  <input
                    id="edit-seats"
                    type="number"
                    min="1"
                    max="12"
                    value={editTableSeats}
                    onChange={(e) => setEditTableSeats(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-priority" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Priority</label>
                  <select
                    id="edit-priority"
                    value={editTablePriority}
                    onChange={(e) => setEditTablePriority(e.target.value as 'High' | 'Medium' | 'Low')}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="High">High</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Medium">Medium</option>
                    <option className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100" value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Dialog ===== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-xs font-sans text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1">Delete Table {deleteConfirmId}?</h3>
            <p className="text-[11px] text-slate-400 mb-5">This action cannot be undone. The table will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all text-xs">Cancel</button>
              <button onClick={() => handleDeleteTable(deleteConfirmId)} className="flex-1 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Assign Staff Modal ===== */}
      {showAssignModal && assigningTableId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm font-sans">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1">Assign Staff to Table {assigningTableId}</h3>
            <p className="text-[11px] text-slate-400 mb-4">Select a team member to assign to this table.</p>
            {staffList.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2 block">group_off</span>
                <p className="text-xs font-semibold">No staff available. Add staff from the Dashboard.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {staffList.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleAssignStaff(member)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all cursor-pointer text-left"
                  >
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f97316&color=fff&bold=true`}
                      alt={member.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-orange-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{member.role} · {member.area}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => { setShowAssignModal(false); setAssigningTableId(null); }} className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

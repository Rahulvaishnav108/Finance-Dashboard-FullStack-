// src/features/cleaning/store/cleaning.store.ts

export type TableStatus =
  | 'Needs Cleaning'
  | 'Cleaning Requested'
  | 'In Progress'
  | 'Ready for Inspection'
  | 'Available'
  | 'Done'
  | '--';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface CleaningStaffMember {
  id: string;
  name: string;
  role: string;
  area: string;
  phone: string;
  avatar: string;
}

export interface RoutineChore {
  id: string;
  name: string;
  area: string;
  frequency: string;
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  lastDone?: string;
}

export interface TableItem {
  id: string;
  area: string;
  seats: number;
  status: TableStatus;
  priority: PriorityLevel;
  timeAgo: string; // Time elapsed since vacant
  assignedTo: { name: string; avatar: string } | null;
  progress?: number; // Only for In Progress tables
  notes?: string;
  maintenanceIssue?: string;
  taskType?: string;
  taskName?: string;
  floor?: number;
  section?: string;
  taskId?: string;
}

export interface CleaningRequest {
  id: string;
  type: string;
  icon: string;
  iconColor: string;
  location: string;
  requestedBy: { name: string; avatar: string };
  priority: PriorityLevel;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Scheduled';
  requestedOn: string;
  requestedTime: string;
  notes?: string;
  assignedTo?: { name: string; avatar: string } | null;
  rawId?: string;
}

export interface StaffProfile {
  name: string;
  id: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinedOn: string;
  status: string;
  avatar: string;
  preferredArea: string;
  preferredShift: string;
  daysAvailable: string;
  breakPreference: string;
  preferredTaskTypes: string;
}

class CleaningStore {
  private static instance: CleaningStore;

  public profile: StaffProfile = this.loadProfile();

  private loadProfile(): StaffProfile {
    const defaultProfile: StaffProfile = {
      name: 'Priya Sharma',
      id: 'CS-1024',
      email: 'priya.sharma@cleanserve.com',
      phone: '+91 98765 43210',
      role: 'Cleaning Staff',
      department: 'Housekeeping',
      joinedOn: 'Feb 12, 2024',
      status: 'Active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa2YAJKAFQ_1YcbCXr9gWlXaoH1A_IQEjTEvJow9XOiXzf7N3kKDctQGwB_KXYqfHi5PGPLS2I4O9fkKOEGiWdsildQg5Vfmz05wcp_WiN4rZKyxzhEspK03vL9BZsmY_SdVZj9jBt5lCmAfSkMUlzuHsIslYMMEX5Q0WjP3tzo_dJkKtNCBmGtgdDixcta81A9KxtOnzWftBuUDgJv8HOjUm_KQMlyHP7JMggbPxQp6Ewa-AVQYMO3uYRKs2vlrtM8QQdTQx4QhY',
      preferredArea: 'Dining Area A',
      preferredShift: 'Morning (6 AM - 2 PM)',
      daysAvailable: 'Mon, Tue, Wed, Thu, Fri, Sat',
      breakPreference: '1:00 PM - 1:30 PM',
      preferredTaskTypes: 'Table Cleaning, Restroom Cleaning, Floor Cleaning'
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanserve-profile');
      if (saved) {
        try {
          return { ...defaultProfile, ...JSON.parse(saved) };
        } catch (e) {
          return defaultProfile;
        }
      }
    }
    return defaultProfile;
  }

  public updateProfile(updated: Partial<StaffProfile>) {
    this.profile = { ...this.profile, ...updated };
    if (typeof window !== 'undefined') {
      localStorage.setItem('cleanserve-profile', JSON.stringify(this.profile));
    }
    this.notify();
  }

  // Hardcoded real state templates matching our dashboard mocks
  public tables: TableItem[] = [
    {
      id: 'T07',
      area: 'Dining Area A',
      seats: 4,
      status: 'Needs Cleaning',
      priority: 'High',
      timeAgo: 'Just Now',
      assignedTo: null,
    },
    {
      id: 'T12',
      area: 'Dining Area A',
      seats: 2,
      status: 'In Progress',
      priority: 'Medium',
      timeAgo: '2 min ago',
      assignedTo: {
        name: 'Ramesh K.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ1EeclPIzb65zLML4Z-Ep8QnCj_Ey68uOYKOfFtZuK_k5ILmHPwi-DSDwYreE9ju4D4Z79Hp6UeAKZXSwBOURkmGSQ7hNQ8-lDeQGBfmjcHltnwofvxh67WrZSDukcUkwZiuZjqYa74AhkTFTcLWqysc21n_T9l3J9vkmkj_lFhXuaPU189ige8Tlb5foWMvGnW27LhowBJk4dHeUfzWcmeRluinE4acRYrVtfGNEr0sYCTnJ1sdGsg1NYN3HFCrqzkH0-TJrClE',
      },
      progress: 45,
    },
    {
      id: 'T03',
      area: 'Dining Area A',
      seats: 6,
      status: 'Cleaning Requested',
      priority: 'High',
      timeAgo: '4 min ago',
      assignedTo: null,
    },
    {
      id: 'T15',
      area: 'Terrace Area',
      seats: 3,
      status: 'Needs Cleaning',
      priority: 'Low',
      timeAgo: '5 min ago',
      assignedTo: {
        name: 'Vikram P.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA--L3CSbZtR0isayAQeKWVqEYUnJm50z5jjO9pkKQN7ksNy8Vgt62aZwgUrLRnYBtnpNDDk4IRK7ognEaSVtSVSsdI0zIDiq4N90jHPW5P1ONLpdO51I3sP-vvCRQnQTsfxs1Via1HEmQcJeHVGQ6-nNWKCActOegeFVwkpjBzRiXJlzDX15TkbA-90HDUzdz54FoQmsFcObFCGuXAmvK2KTyMt9nyMhl5nHPEV0d4sIjpe9An60OytiSZxSfYVdBG1nSHlTyW1aA',
      },
    },
    {
      id: 'T01',
      area: 'Dining Area A',
      seats: 4,
      status: 'Available',
      priority: 'Medium',
      timeAgo: '10:30 AM',
      assignedTo: {
        name: 'Anita S.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuANsaeL1qIrdjS8VjlskxOHt17ofWL0mQA8HTEyUyGUmb0WZEoFeVIhAYDxByw8LuxWxFKIdV270hwAPBmZFNJdIOoLB7X4CRStTLzQ66uJ709k9Kvpbt3yDChYZmi0IOgzaKGIARmUFWTp8fiuOG-poilaUus94iK5MEMaPofwxQGipJFvuis9fWEp53IS84fln5N1GSiP7xWII9WnJi1qTw5gFY4eKQQgrXVlslMwV6TbZi4nnm2vGRG3hjoOoFQyNc23SGR4j9U',
      },
    },
    {
      id: 'T02',
      area: 'Dining Area A',
      seats: 2,
      status: 'Available',
      priority: 'Medium',
      timeAgo: '10:18 AM',
      assignedTo: {
        name: 'Anita S.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuANsaeL1qIrdjS8VjlskxOHt17ofWL0mQA8HTEyUyGUmb0WZEoFeVIhAYDxByw8LuxWxFKIdV270hwAPBmZFNJdIOoLB7X4CRStTLzQ66uJ709k9Kvpbt3yDChYZmi0IOgzaKGIARmUFWTp8fiuOG-poilaUus94iK5MEMaPofwxQGipJFvuis9fWEp53IS84fln5N1GSiP7xWII9WnJi1qTw5gFY4eKQQgrXVlslMwV6TbZi4nnm2vGRG3hjoOoFQyNc23SGR4j9U',
      },
    },
  ];

  public requests: CleaningRequest[] = [
    {
      id: 'CR-2024-036',
      type: 'Spill Cleanup',
      icon: 'water_drop',
      iconColor: 'text-blue-500',
      location: 'Dining Area A',
      requestedBy: {
        name: 'Ramesh K.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ1EeclPIzb65zLML4Z-Ep8QnCj_Ey68uOYKOfFtZuK_k5ILmHPwi-DSDwYreE9ju4D4Z79Hp6UeAKZXSwBOURkmGSQ7hNQ8-lDeQGBfmjcHltnwofvxh67WrZSDukcUkwZiuZjqYa74AhkTFTcLWqysc21n_T9l3J9vkmkj_lFhXuaPU189ige8Tlb5foWMvGnW27LhowBJk4dHeUfzWcmeRluinE4acRYrVtfGNEr0sYCTnJ1sdGsg1NYN3HFCrqzkH0-TJrClE',
      },
      priority: 'High',
      status: 'In Progress',
      requestedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      requestedTime: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'CR-2024-035',
      type: 'Restroom Cleaning',
      icon: 'wc',
      iconColor: 'text-orange-500',
      location: 'Restroom - 2F',
      requestedBy: {
        name: 'Neha P.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCCqr4e8byTqYVEco_pDW4qhZEqlgAUl1EJtja5E7M0DsWBRQksSrV2cNSmUST_fov_CV2hnYcM50GF3AkdkQA9DyJZde8ZspYRdgShSSD26dFTuWIwAbzdIvstrRk30fD9pPGgoU4JRWaj2g0d1aG1CmfFRSuMEMHwaoYzmGlVXVxFevi1v5yCQ_IVcPyjTPBGHOwAap0atLBs5Dqs-X7eruzqijqYj8_pwZ-YMwRFz1A3UCbOAr_6HFTQ-k2FKDAEh88YYdGpaFU',
      },
      priority: 'Medium',
      status: 'In Progress',
      requestedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      requestedTime: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  public chores: RoutineChore[] = this.loadChores();

  private loadChores(): RoutineChore[] {
    const defaultChores: RoutineChore[] = [
      {
        id: 'CHR-001',
        name: 'Empty Trash Bins',
        area: 'Dining Area A',
        frequency: 'Every 2 Hours',
        assignedTo: 'Ramesh K.',
        status: 'Pending',
      },
      {
        id: 'CHR-002',
        name: 'Sanitize Restrooms',
        area: 'Restroom',
        frequency: 'Hourly',
        assignedTo: 'Anita S.',
        status: 'In Progress',
      },
      {
        id: 'CHR-003',
        name: 'Restock Tissues & Napkins',
        area: 'Dining Area B',
        frequency: 'Shift Handover',
        assignedTo: 'Anita S.',
        status: 'Completed',
        lastDone: '10:30 AM',
      },
      {
        id: 'CHR-004',
        name: 'Sweep & Mop Floor',
        area: 'Terrace Area',
        frequency: 'Every 4 Hours',
        assignedTo: 'Vikram P.',
        status: 'Pending',
      },
      {
        id: 'CHR-005',
        name: 'Clean Coffee Machine',
        area: 'Floor 1',
        frequency: 'Daily',
        assignedTo: 'Ramesh K.',
        status: 'Completed',
        lastDone: '09:15 AM',
      }
    ];

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanserve-chores');
      if (saved) {
        try { return JSON.parse(saved); } catch { return defaultChores; }
      }
    }
    return defaultChores;
  }

  public addChore(newChore: RoutineChore) {
    this.chores = [newChore, ...this.chores];
    this.saveChoresToLocalStorage();
    this.notify();
  }

  public updateChoreStatus(id: string, status: 'Pending' | 'In Progress' | 'Completed') {
    this.chores = this.chores.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            lastDone: status === 'Completed' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : c.lastDone,
          }
        : c
    );
    this.saveChoresToLocalStorage();
    this.notify();
  }

  public deleteChore(id: string) {
    this.chores = this.chores.filter((c) => c.id !== id);
    this.saveChoresToLocalStorage();
    this.notify();
  }

  private saveChoresToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cleanserve-chores', JSON.stringify(this.chores));
    }
  }

  public addCleaningRequest(newRequest: CleaningRequest) {
    this.requests = [newRequest, ...this.requests];
    this.notify();
  }

  public staffMembers: CleaningStaffMember[] = this.loadStaff();

  private loadStaff(): CleaningStaffMember[] {
    const defaultStaff: CleaningStaffMember[] = [
      {
        id: 'STF-001',
        name: 'Ramesh K.',
        role: 'Cleaning Staff',
        area: 'Dining Area A',
        phone: '+91 98001 11111',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ1EeclPIzb65zLML4Z-Ep8QnCj_Ey68uOYKOfFtZuK_k5ILmHPwi-DSDwYreE9ju4D4Z79Hp6UeAKZXSwBOURkmGSQ7hNQ8-lDeQGBfmjcHltnwofvxh67WrZSDukcUkwZiuZjqYa74AhkTFTcLWqysc21n_T9l3J9vkmkj_lFhXuaPU189ige8Tlb5foWMvGnW27LhowBJk4dHeUfzWcmeRluinE4acRYrVtfGNEr0sYCTnJ1sdGsg1NYN3HFCrqzkH0-TJrClE',
      },
      {
        id: 'STF-002',
        name: 'Vikram P.',
        role: 'Senior Cleaner',
        area: 'Terrace Area',
        phone: '+91 98001 22222',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA--L3CSbZtR0isayAQeKWVqEYUnJm50z5jjO9pkKQN7ksNy8Vgt62aZwgUrLRnYBtnpNDDk4IRK7ognEaSVtSVSsdI0zIDiq4N90jHPW5P1ONLpdO51I3sP-vvCRQnQTsfxs1Via1HEmQcJeHVGQ6-nNWKCActOegeFVwkpjBzRiXJlzDX15TkbA-90HDUzdz54FoQmsFcObFCGuXAmvK2KTyMt9nyMhl5nHPEV0d4sIjpe9An60OytiSZxSfYVdBG1nSHlTyW1aA',
      },
      {
        id: 'STF-003',
        name: 'Anita S.',
        role: 'Cleaning Staff',
        area: 'Dining Area B',
        phone: '+91 98001 33333',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANsaeL1qIrdjS8VjlskxOHt17ofWL0mQA8HTEyUyGUmb0WZEoFeVIhAYDxByw8LuxWxFKIdV270hwAPBmZFNJdIOoLB7X4CRStTLzQ66uJ709k9Kvpbt3yDChYZmi0IOgzaKGIARmUFWTp8fiuOG-poilaUus94iK5MEMaPofwxQGipJFvuis9fWEp53IS84fln5N1GSiP7xWII9WnJi1qTw5gFY4eKQQgrXVlslMwV6TbZi4nnm2vGRG3hjoOoFQyNc23SGR4j9U',
      },
    ];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanserve-staff');
      if (saved) {
        try { return JSON.parse(saved); } catch { return defaultStaff; }
      }
    }
    return defaultStaff;
  }

  public addStaffMember(member: CleaningStaffMember) {
    this.staffMembers = [...this.staffMembers, member];
    if (typeof window !== 'undefined') {
      localStorage.setItem('cleanserve-staff', JSON.stringify(this.staffMembers));
    }
    this.notify();
  }

  public removeStaffMember(id: string) {
    this.staffMembers = this.staffMembers.filter((s) => s.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cleanserve-staff', JSON.stringify(this.staffMembers));
    }
    this.notify();
  }

  public assignTableStaff(tableId: string, member: { name: string; avatar: string } | null) {
    this.tables = this.tables.map((t) =>
      t.id === tableId ? { ...t, assignedTo: member } : t
    );
    this.notify();
  }

  public editTable(id: string, updates: Partial<TableItem>) {
    this.tables = this.tables.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.notify();
  }

  public deleteTable(id: string) {
    this.tables = this.tables.filter((t) => t.id !== id);
    this.notify();
  }

  public syncTasks(backendTasks: any[]) {
    this.tables = backendTasks.map((t: any) => {
      let priority: PriorityLevel = 'Medium';
      if (t.priority === 'HIGH') priority = 'High';
      if (t.priority === 'LOW') priority = 'Low';

      let status: TableStatus = 'Needs Cleaning';
      if (t.status === 'IN_PROGRESS') status = 'In Progress';
      else if (t.status === 'COMPLETED') status = 'Ready for Inspection';
      else if (t.status === 'VERIFIED') status = 'Available';

      const tableObj = t.tableDetails as any;
      const tableLabel = tableObj?.tableNumber || 'T00';

      return {
        id: tableLabel,
        taskId: t._id || t.id,
        area: tableObj?.section || 'Dining Area A',
        seats: tableObj?.capacity || 4,
        floor: tableObj?.floor || 1,
        section: tableObj?.section || 'Main',
        status,
        priority,
        timeAgo: 'Just Now',
        assignedTo: t.startedBy ? { name: 'Staff Member', avatar: '' } : null,
        notes: t.notes || '',
      };
    });
    this.notify();
  }
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (CleaningStore.instance) {
      return CleaningStore.instance;
    }
    CleaningStore.instance = this;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public startCleaning(id: string) {
    this.tables = this.tables.map((t) => {
      if (t.id === id) {
        this.requests = this.requests.map((r) =>
          r.location.includes(id) ? { ...r, status: 'In Progress' } : r
        );
        return { ...t, status: 'In Progress', progress: 10, timeAgo: 'Started Just Now' };
      }
      return t;
    });
    this.notify();
  }
  public updateProgress(id: string) {
    this.tables = this.tables.map((t) => {
      if (t.id === id && t.status === 'In Progress') {
        const currentProgress = t.progress || 0;
        if (currentProgress >= 90) {
          return { ...t, status: 'Ready for Inspection', progress: 100, timeAgo: 'Just Now' };
        }
        return { ...t, progress: currentProgress + 20, timeAgo: 'Updated Just Now' };
      }
      return t;
    });
    this.notify();
  }

  public completeInspection(id: string) {
    this.tables = this.tables.map((t) => {
      if (t.id === id) {
        return { ...t, status: 'Ready for Inspection', progress: 100, timeAgo: 'Just Now' };
      }
      return t;
    });
    this.notify();
  }

  public reportMaintenance(id: string, issue: string) {
    this.tables = this.tables.map((t) => {
      if (t.id === id) {
        return { ...t, maintenanceIssue: issue, status: 'Needs Cleaning', priority: 'High' };
      }
      return t;
    });
    this.notify();
  }

  public addTable(newTable: TableItem) {
    this.tables = [...this.tables, newTable];
    this.notify();
  }
  public completeRequest(id: string) {
    const req = this.requests.find((r) => r.id === id);
    if (req && req.rawId) {
      this.tables = this.tables.map((t) => {
        if (t.id === req.rawId) {
          return { ...t, status: 'Done' as TableStatus };
        }
        return t;
      });
    }
    this.requests = this.requests.map((r) => (r.id === id ? { ...r, status: 'Completed' as const } : r));
    this.notify();
  }
  public verifyInspection(id: string) {
    this.tables = this.tables.filter((t) => t.id !== id);
    this.notify();
  }
  public updateRequestStatus(
    id: string,
    newStatus: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Scheduled'
  ) {
    this.requests = this.requests.map((r) => {
      if (r.id === id) {
        if (r.rawId) {
          this.tables = this.tables.map((t) => {
            if (t.id === r.rawId) {
              let tableStatus: TableStatus = 'Available';
              if (newStatus === 'In Progress') {
                tableStatus = 'In Progress';
              } else if (newStatus === 'Completed') {
                tableStatus = 'Done';
              }
              return { ...t, status: tableStatus };
            }
            return t;
          });
        }
        return { ...r, status: newStatus };
      }
      return r;
    });
    this.notify();
  }
  public verifyRequest(id: string) {
    const req = this.requests.find((r) => r.id === id);
    if (req && req.rawId) {
      this.tables = this.tables.map((t) => {
        if (t.id === req.rawId) {
          return { ...t, status: '--' as TableStatus };
        }
        return t;
      });
    }
    this.requests = this.requests.filter((r) => r.id !== id);
    this.notify();
  }
}

export const cleaningStore = new CleaningStore();

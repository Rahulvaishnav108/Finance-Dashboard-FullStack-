import { useCallback, useEffect, useState } from 'react';
import { cleaningStore, type StaffProfile } from '../store/cleaning.store';
import { cleaningAPI, type CleaningMetric, type UrgentTask } from '../api/cleaning.api';

// Hum yahan temporary interface bana rahe hain taaki TypeScript error na de
interface ProcessedTask extends UrgentTask {
  rawStatus: string;
  rawPriority: string;
  seats?: number;
  area?: string;
  section?: string;
  floor?: number;
}

export function useCleaning() {
  const [metrics, setMetrics] = useState<CleaningMetric[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const [profile, setProfile] = useState(() => cleaningStore.profile);

  useEffect(() => {
    const unsubscribe = cleaningStore.subscribe(() => {
      setProfile(cleaningStore.profile);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const processAndSyncData = useCallback(() => {
    const storeTables = cleaningStore.tables || [];

    const needsCleaningCount = storeTables.filter((t) => t.status === 'Needs Cleaning').length;
    const cleaningRequestedCount = storeTables.filter((t) => t.status === 'Cleaning Requested').length;
    const inProgressCount = storeTables.filter((t) => t.status === 'In Progress').length;
    const readyForInspectionCount = storeTables.filter((t) => t.status === 'Ready for Inspection').length;
    const availableCount = storeTables.filter((t) => t.status === 'Available').length;

    setMetrics([
      { label: 'Needs Cleaning', value: `${needsCleaningCount + cleaningRequestedCount}`, color: 'bg-amber-150/10 text-amber-500' },
      { label: 'In Progress', value: `${inProgressCount}`, color: 'bg-orange-500/10 text-orange-500' },
      { label: 'Completed Today', value: `${availableCount + readyForInspectionCount}`, color: 'bg-emerald-500/10 text-green-500' },
      { label: 'Service Rating', value: '4.9/5', color: 'bg-purple-500/10 text-purple-500' },
    ]);

    const processedTasks: ProcessedTask[] = storeTables.map((task) => {
      let displayStatus = 'Needs Cleaning';
      let badgeColor = '#f59e0b';
      let badgeBg = 'rgba(245,158,11,0.15)';
      let rawStatus = 'PENDING';

      if (task.status === 'Needs Cleaning') {
        displayStatus = 'Needs Cleaning';
        badgeColor = '#f59e0b';
        rawStatus = 'PENDING';
      } else if (task.status === 'Cleaning Requested') {
        displayStatus = 'Cleaning Requested';
        badgeColor = '#ef4444';
        badgeBg = 'rgba(239,68,68,0.15)';
        rawStatus = 'REQUESTED';
      } else if (task.status === 'In Progress') {
        displayStatus = 'In Progress';
        badgeColor = '#f97316';
        badgeBg = 'rgba(249,115,22,0.15)';
        rawStatus = 'IN_PROGRESS';
      } else if (task.status === 'Ready for Inspection') {
        displayStatus = 'Ready for Inspection';
        badgeColor = '#a855f7';
        badgeBg = 'rgba(168,85,247,0.15)';
        rawStatus = 'COMPLETED';
      } else if (task.status === 'Available') {
        displayStatus = 'Available';
        badgeColor = '#22c55e';
        badgeBg = 'rgba(34,197,94,0.15)';

        rawStatus = 'VERIFIED';
      }

      return {
        id: (task as any).taskId || task.id,
        tableNumber: task.id,
        title: `Table ${task.id}`,
        subtitle: task.notes ? task.notes : 'Routine turnover strategy sequence',
        priority: displayStatus,
        badgeColor,
        badgeBg,
        waiting: task.timeAgo || 'Just Now',
        rawPriority: task.priority || 'Medium',
        rawStatus: rawStatus,
        progress: task.progress || 0,
        seats: task.seats,
        area: task.area,
        section: task.section,
        floor: task.floor,
      } as ProcessedTask;
    });

    const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

    const sortedTasks = [...processedTasks].sort((a: ProcessedTask, b: ProcessedTask) => {
      if (a.rawStatus === 'REQUESTED' && b.rawStatus !== 'REQUESTED') return -1;
      if (a.rawStatus !== 'REQUESTED' && b.rawStatus === 'REQUESTED') return 1;
      return (priorityWeight[b.rawPriority] || 0) - (priorityWeight[a.rawPriority] || 0);
    });

    setUrgentTasks(sortedTasks);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cleaningAPI.getTasks();
      if (res.success && res.data?.tasks) {
        cleaningStore.syncTasks(res.data.tasks);
      }
    } catch (err) {
      console.warn('[CleanServe Hook] Sync operational.', err);
    } finally {
      setLoading(false);
    }
  }, []);


// Pehla Effect
  useEffect(() => {
    const timer = setTimeout(() => processAndSyncData(), 0);
    const unsubscribe = cleaningStore.subscribe(() => {
      processAndSyncData();
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [processAndSyncData]); // <--- Yahan 'processAndSyncData' daal diya

  // Dusra Effect
  useEffect(() => {
    const timer = setTimeout(() => loadDashboard(), 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]); // <--- Yahan 'loadDashboard' daal diya

  return {
    metrics,
    floorTables: [],
    diningTables: [],
    kitchenTables: [],
    washrooms: [],
    kitchenWashrooms: [],
    urgentTasks,
    staffMembers: [],
    activeJobs: [],
    recentActivity: [],
    weeklyRequests: [],
    jobStatus: [],
    loading,
    error,
    profile,
    updateProfile: (updated: Partial<StaffProfile>) => cleaningStore.updateProfile(updated),
    assignTask: async (taskId: string) => {
      await cleaningAPI.startTask(taskId);
      await loadDashboard();
    },
    startTask: async (taskId: string) => {
      await cleaningAPI.startTask(taskId);
      await loadDashboard();
    },
    completeTask: async (taskId: string) => {
      await cleaningAPI.completeTask(taskId);
      await loadDashboard();
    },
    verifyTask: async (taskId: string) => {
      await cleaningAPI.verifyTask(taskId);
      await loadDashboard();
    },
    reportIssue: (taskId: string, issue: string) => cleaningStore.reportMaintenance(taskId, issue),
    refresh: loadDashboard,
  };
}
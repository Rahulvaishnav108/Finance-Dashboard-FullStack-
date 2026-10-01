export type LogType = 'Admin' | 'Restaurant' | 'Subscription';

export interface LogItem {
  id: string;
  type: LogType;
  action: string;
  performedBy: string;
  target: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export const initialLogs: LogItem[] = [
  {
    id: '1',
    type: 'Admin',
    action: 'Updated Commission Rate',
    performedBy: 'Super Admin',
    target: 'Platform Settings',
    details: 'Changed commission rate from 8% to 10%',
    ipAddress: '192.168.1.100',
    timestamp: '2026-06-13 10:30',
  },
  {
    id: '2',
    type: 'Restaurant',
    action: 'Restaurant Onboarded',
    performedBy: 'Admin User',
    target: 'Taste of India',
    details: 'New restaurant added with Premium plan',
    ipAddress: '192.168.1.101',
    timestamp: '2026-06-13 09:15',
  },
  {
    id: '3',
    type: 'Subscription',
    action: 'Plan Upgraded',
    performedBy: 'System Auto',
    target: 'Urban Bites',
    details: 'Auto-upgraded from Standard to Premium due...',
    ipAddress: 'System',
    timestamp: '2026-06-12 16:45',
  },
  {
    id: '4',
    type: 'Restaurant',
    action: 'Status Changed',
    performedBy: 'Super Admin',
    target: 'Ocean Delights',
    details: 'Restaurant status changed from Active to Inactive',
    ipAddress: '192.168.1.100',
    timestamp: '2026-06-12 14:20',
  },
  {
    id: '5',
    type: 'Admin',
    action: 'API Key Regenerated',
    performedBy: 'Admin User',
    target: 'Payment Gateway',
    details: 'Regenerated primary Stripe API key',
    ipAddress: '192.168.1.120',
    timestamp: '2026-06-11 11:00',
  },
  {
    id: '6',
    type: 'Restaurant',
    action: 'Menu Updated',
    performedBy: 'Restaurant Owner',
    target: 'Green Garden',
    details: 'Added 5 new summer items to the menu',
    ipAddress: '203.0.113.42',
    timestamp: '2026-06-11 09:35',
  },
  {
    id: '7',
    type: 'Subscription',
    action: 'Payment Failed',
    performedBy: 'System Auto',
    target: 'Burger Corner',
    details: 'Monthly subscription charge failed, retry in 24h',
    ipAddress: 'System',
    timestamp: '2026-06-10 15:20',
  },
  {
    id: '8',
    type: 'Admin',
    action: 'User Role Assigned',
    performedBy: 'Super Admin',
    target: 'Support Team',
    details: 'Assigned Moderator role to user support@food.com',
    ipAddress: '192.168.1.100',
    timestamp: '2026-06-10 13:10',
  },
  {
    id: '9',
    type: 'Restaurant',
    action: 'Restaurant Deleted',
    performedBy: 'Admin User',
    target: 'Spicy Wok',
    details: 'Permanently removed terminated restaurant',
    ipAddress: '192.168.1.105',
    timestamp: '2026-06-09 16:45',
  },
  {
    id: '10',
    type: 'Subscription',
    action: 'Plan Downgraded',
    performedBy: 'Restaurant Owner',
    target: 'Pizza Palace',
    details: 'Switched from Premium to Standard plan',
    ipAddress: '198.51.100.23',
    timestamp: '2026-06-09 14:00',
  },
  {
    id: '11',
    type: 'Admin',
    action: 'System Backup',
    performedBy: 'System Auto',
    target: 'Database',
    details: 'Scheduled weekly automated backup completed successfully',
    ipAddress: 'System',
    timestamp: '2026-06-08 02:00',
  },
];
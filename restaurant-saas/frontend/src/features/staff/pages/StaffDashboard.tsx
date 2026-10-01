import React from 'react';
import { Link } from 'react-router-dom';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';
import { useStaffDashboard } from '../hooks/useStaffDashboard';

export default function StaffDashboard() {
  const { query } = useStaffSearch();
  const { orders, readyItems, requests } = useStaffDashboard();

  const pendingRequestsCount = requests.filter(r => r.status !== 'Resolved').length;
  const readyFoodCount = readyItems.length;
  const activeOrdersCount = orders.filter(o => ['Pending', 'Preparing', 'Ready', 'Served'].includes(o.status)).length;

  const stats = [
    { label: 'Active Tables', value: '6/8', icon: 'table_restaurant', color: 'text-dine-orange bg-orange-50 dark:bg-orange-950/40', link: '/staff/tables' },
    { label: 'Pending Requests', value: `${pendingRequestsCount}`, icon: 'notifications_active', color: 'text-red-500 bg-red-50 dark:bg-red-950/45', link: '/staff/requests', badge: pendingRequestsCount > 0 ? 'Action Required' : undefined },
    { label: 'Food Ready', value: `${readyFoodCount} Item${readyFoodCount !== 1 ? 's' : ''}`, icon: 'restaurant', color: 'text-green-500 bg-green-50 dark:bg-green-950/40', link: '/staff/food-ready' },
    { label: "Today's Orders", value: `${orders.length}`, icon: 'receipt_long', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40', link: '/staff/orders' },
    { label: 'Bill Requests', value: '2', icon: 'payments', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40', link: '/staff/orders' },
    { label: 'Walk-in Queue', value: '4 Groups', icon: 'groups', color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40', link: '/staff/reservations' },
  ];

  const activeTables = [
    { id: 1, name: 'Table 1', guests: 2, status: 'Occupied', bill: '₹1,240', elapsed: '45 mins', action: 'Order' },
    { id: 2, name: 'Table 2', guests: 4, status: 'Bill Requested', bill: '₹3,450', elapsed: '1h 15m', action: 'Pay' },
    { id: 3, name: 'Table 3', guests: 3, status: 'Food Served', bill: '₹2,100', elapsed: '30 mins', action: 'Service' },
    { id: 4, name: 'Table 4', guests: 2, status: 'Cleaning', bill: '₹0', elapsed: '5 mins', action: 'Clean' },
  ];

  const pendingRequests = requests.filter(r => r.status !== 'Resolved').slice(0, 3);
  const readyFood = readyItems.slice(0, 3);

  // Filtering based on search query
  const filteredTables = activeTables.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.status.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRequests = pendingRequests.filter(r =>
    r.table.toLowerCase().includes(query.toLowerCase()) ||
    r.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Hello, Rahul! 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-455 mt-1">
            Here is what&apos;s happening in your section (Zone A) today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingRequestsCount > 0 && (
            <Link
              to="/staff/requests"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-650 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md shadow-red-500/10 transition-all animate-pulse"
            >
              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              {pendingRequestsCount} Urgent Request{pendingRequestsCount !== 1 ? 's' : ''}
            </Link>
          )}
          <Link
            to="/staff/food-ready"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-650 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md shadow-green-500/10 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">restaurant</span>
            Food Ready {readyFoodCount > 0 ? `(${readyFoodCount})` : ''}
          </Link>
        </div>
      </div>

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-soft hover:-translate-y-0.5 transition-all flex flex-col justify-between h-32 group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.color} transition-colors`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              {stat.badge && (
                <span className="text-[8px] uppercase bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded-full">
                  {stat.badge}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-sans truncate">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-sans mt-0.5">{stat.value}</p>
            </div>
            <div className="absolute right-0 bottom-0 w-8 h-8 bg-gradient-to-tr from-dine-orange/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Tables Overview (2/3 width on large screens) */}
        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-dine-orange">table_restaurant</span>
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 font-sans">Active Tables</h2>
            </div>
            <Link to="/staff/tables" className="text-xs font-semibold text-dine-orange hover:underline">
              View Floor Map
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <th className="py-3">Table</th>
                  <th className="py-3">Guests</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Bill Amount</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-sd-surface-variant">
                {filteredTables.length > 0 ? (
                  filteredTables.map((table) => (
                    <tr key={table.id} className="hover:bg-slate-55 dark:hover:bg-sd-surface-variant/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200 text-sm font-sans">{table.name}</td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 text-xs font-sans">{table.guests} Pax</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          table.status === 'Occupied' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                          table.status === 'Bill Requested' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 animate-pulse' :
                          table.status === 'Food Served' ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400' :
                          'bg-orange-50 text-dine-orange dark:bg-orange-950/40 dark:text-orange-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            table.status === 'Occupied' ? 'bg-blue-500' :
                            table.status === 'Bill Requested' ? 'bg-purple-500' :
                            table.status === 'Food Served' ? 'bg-green-500' :
                            'bg-dine-orange'
                          }`} />
                          {table.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-350 text-xs font-sans">{table.bill}</td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={table.status === 'Bill Requested' ? '/staff/orders' : '/staff/orders'}
                          className="inline-flex items-center justify-center gap-1 text-[11px] font-extrabold text-dine-orange hover:bg-dine-light-orange dark:hover:bg-orange-950/30 px-3 py-1.5 rounded-lg transition-all"
                        >
                          {table.action === 'Clean' ? 'Mark Clean' : 'Manage'}
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                      No matching tables found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Feeds Column */}
        <div className="space-y-6">
          {/* Pending Requests */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">notifications_active</span>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 font-sans">Pending Requests</h2>
              </div>
              <Link to="/staff/requests" className="text-xs font-semibold text-dine-orange hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between hover:border-red-200 dark:hover:border-red-900/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 font-sans">{req.table}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          req.severity === 'high' ? 'bg-red-100 text-red-650 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-500'
                        }`}>{req.type}</span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-sans mt-0.5">{req.time}</p>
                    </div>
                    <Link
                      to="/staff/requests"
                      className="bg-white hover:bg-dine-light-orange dark:hover:bg-orange-950/30 text-dine-orange font-bold text-[10px] py-1.5 px-3 rounded-lg border border-slate-200 transition-all shadow-sm"
                    >
                      Attend
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-450 text-center py-4">No active requests.</p>
              )}
            </div>
          </div>

          {/* Food Ready Panel Widget */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">restaurant</span>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 font-sans">Food Ready (Kitchen)</h2>
              </div>
              <Link to="/staff/food-ready" className="text-xs font-semibold text-dine-orange hover:underline">
                See List
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {readyFood.length > 0 ? (
                readyFood.map((food) => (
                  <div
                    key={food.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 font-sans">{food.item}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-450">
                        <span className="font-bold text-dine-orange">{food.table}</span>
                        <span>•</span>
                        <span>Qty: {food.qty}</span>
                        <span>•</span>
                        <span>{food.readySince}</span>
                      </div>
                    </div>
                    <Link
                      to="/staff/food-ready"
                      className="bg-dine-orange hover:bg-dine-orange/90 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg shadow-md shadow-dine-orange/10 transition-all"
                    >
                      Serve
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-450 text-center py-4">No pending pickups.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-sans mb-4">Quick Shift Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/staff/reservations"
              className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-dine-orange transition-all group flex flex-col items-center justify-center text-center"
            >
              <span className="material-symbols-outlined text-dine-orange text-[26px] group-hover:scale-110 transition-transform">add_circle</span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2 font-sans">Add Walk-in</span>
            </Link>
            <Link
              to="/staff/menu"
              className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-dine-orange transition-all group flex flex-col items-center justify-center text-center"
            >
              <span className="material-symbols-outlined text-dine-orange text-[26px] group-hover:scale-110 transition-transform">menu_book</span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2 font-sans">Browse Menu</span>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-sans mb-2">My Shift Progress</h3>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
              <span>Shift Ends at 11:00 PM</span>
              <span>75% Done</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-dine-orange h-full rounded-full transition-all duration-500" style={{ width: '75%' }} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-455 font-sans font-semibold">Today&apos;s Tips Earned:</span>
            <span className="font-extrabold text-green-600 dark:text-green-450 font-sans text-sm">₹1,450</span>
          </div>
        </div>
      </div>
    </div>
  );
}

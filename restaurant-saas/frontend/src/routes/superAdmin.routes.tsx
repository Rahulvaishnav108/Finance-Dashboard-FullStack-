import type { RouteObject } from "react-router-dom";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import SuperAdminDashboard from "../features/superAdmin/pages/SuperadminDashboard";
import Restaurants from "../features/superAdmin/pages/Restaurants";
import Analytics from "../features/superAdmin/pages/Analytics";
import Subscriptions from "../features/superAdmin/pages/Subscriptions";
import Transactions from "../features/superAdmin/pages/Transactions";
import Alerts from "../features/superAdmin/pages/Alerts";
import AuditLogs from "../features/superAdmin/pages/AuditLogs";
import EditProfile from "../features/superAdmin/pages/EditProfile";
import Settings from "../features/superAdmin/pages/Settings";

export const superAdminRoutes: RouteObject[] = [
  {
    path: "/superadmin",
    element: <SuperAdminLayout />,
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: "restaurants", element: <Restaurants /> },
      { path: "analytics", element: <Analytics /> },
      { path: "subscriptions", element: <Subscriptions /> },
      { path: "transactions", element: <Transactions /> },
      { path: "alerts", element: <Alerts /> },
      { path: "audit-logs", element: <AuditLogs /> },
      {path: 'edit-profile',element: <EditProfile />,},
      {path: 'settings',element:     <  Settings />,},
    ],
  },
];
import { apiClient } from "../../../shared/services/apiClient";
import type { RestaurantRequest } from "../store/RestaurantRequests";

export const superAdminRestaurantRequestEndpoints = {
  list: "/superadmin/restaurant-requests",
  approve: (id: string) => `/superadmin/restaurant-requests/${id}/approve`,
  deny: (id: string) => `/superadmin/restaurant-requests/${id}/deny`,
};

export const placeholderRestaurantRequests: RestaurantRequest[] = [
  {
    id: "REQ-101",
    name: "The Curry Leaf",
    owner: "Ananya Mehta",
    email: "ananya@curryleaf.in",
    phone: "+91 99001 22001",
    location: "Hyderabad, Telangana",
    plan: "Standard",
    requestedAt: "Today, 10:24 AM",
    message: "Looking to automate table orders, kitchen tickets, and billing.",
  },
  {
    id: "REQ-102",
    name: "Noodle Street",
    owner: "Rohan Das",
    email: "rohan@noodlestreet.in",
    phone: "+91 99001 22002",
    location: "Kolkata, West Bengal",
    plan: "Basic",
    requestedAt: "Today, 09:58 AM",
    message: "Needs onboarding for QR ordering across one high-footfall outlet.",
  },
  {
    id: "REQ-103",
    name: "Bake & Brew",
    owner: "Meera Iyer",
    email: "meera@bakebrew.in",
    phone: "+91 99001 22003",
    location: "Bangalore, Karnataka",
    plan: "Premium",
    requestedAt: "Yesterday, 06:35 PM",
    message: "Wants staff dashboards, analytics, and multi-branch reporting.",
  },
];

const USE_PLACEHOLDER_RESTAURANT_REQUESTS = true;

export const superAdminRestaurantRequestsApi = {
  async getRequests(): Promise<RestaurantRequest[]> {
    if (USE_PLACEHOLDER_RESTAURANT_REQUESTS) {
      return Promise.resolve(placeholderRestaurantRequests);
    }

    const response = await apiClient.get<RestaurantRequest[]>(
      superAdminRestaurantRequestEndpoints.list
    );
    return response.data;
  },

  async approveRequest(id: string): Promise<void> {
    if (USE_PLACEHOLDER_RESTAURANT_REQUESTS) {
      return Promise.resolve();
    }

    await apiClient.post(superAdminRestaurantRequestEndpoints.approve(id));
  },

  async denyRequest(id: string): Promise<void> {
    if (USE_PLACEHOLDER_RESTAURANT_REQUESTS) {
      return Promise.resolve();
    }

    await apiClient.post(superAdminRestaurantRequestEndpoints.deny(id));
  },
};

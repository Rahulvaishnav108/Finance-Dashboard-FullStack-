import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  placeholderRestaurantRequests,
  superAdminRestaurantRequestsApi,
} from "../api/superAdmin.api";
import { restaurantData } from "./Restaurants";
import type { RestaurantsRow } from "../components/Restaurants/Restauranttypes";

export interface RestaurantRequest {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  location: string;
  plan: "Premium" | "Standard" | "Basic";
  requestedAt: string;
  message: string;
}

interface RestaurantRequestsState {
  restaurants: RestaurantsRow[];
  requests: RestaurantRequest[];
  approveRequest: (id: string) => void;
  denyRequest: (id: string) => void;
  addRestaurant: (restaurant: RestaurantsRow) => void;
  updateRestaurantStatus: (
    id: string,
    status: "Active" | "Trial" | "Inactive"
  ) => void;
  updateRestaurantPlan: (
    id: string,
    plan: "Premium" | "Standard" | "Basic"
  ) => void;
  deleteRestaurant: (id: string) => void;
}

const requestToRestaurant = (request: RestaurantRequest): RestaurantsRow => ({
  id: `RST-${request.id.replace("REQ-", "")}`,
  name: request.name,
  owner: request.owner,
  email: request.email,
  phone: request.phone,
  location: request.location,
  plan: request.plan,
  status: "Trial",
  revenue: "Rs. 0",
  branches: 1,
});

export const useRestaurantRequestsStore = create<RestaurantRequestsState>()(
  persist(
    (set) => ({
      restaurants: restaurantData,
      requests: placeholderRestaurantRequests,
      approveRequest: (id) =>
        set((state) => {
          const request = state.requests.find((item) => item.id === id);
          if (!request) return state;

          void superAdminRestaurantRequestsApi.approveRequest(id);

          const restaurant = requestToRestaurant(request);
          const alreadyAdded = state.restaurants.some(
            (item) => item.id === restaurant.id || item.name === restaurant.name
          );

          return {
            restaurants: alreadyAdded
              ? state.restaurants
              : [restaurant, ...state.restaurants],
            requests: state.requests.filter((item) => item.id !== id),
          };
        }),
      denyRequest: (id) =>
        set((state) => {
          void superAdminRestaurantRequestsApi.denyRequest(id);

          return {
            requests: state.requests.filter((item) => item.id !== id),
          };
        }),
      addRestaurant: (restaurant) =>
        set((state) => ({ restaurants: [restaurant, ...state.restaurants] })),
      updateRestaurantStatus: (id, status) =>
        set((state) => ({
          restaurants: state.restaurants.map((restaurant) =>
            restaurant.id === id ? { ...restaurant, status } : restaurant
          ),
        })),
      updateRestaurantPlan: (id, plan) =>
        set((state) => ({
          restaurants: state.restaurants.map((restaurant) =>
            restaurant.id === id ? { ...restaurant, plan } : restaurant
          ),
        })),
      deleteRestaurant: (id) =>
        set((state) => ({
          restaurants: state.restaurants.filter((restaurant) => restaurant.id !== id),
        })),
    }),
    { name: "superadmin-restaurant-requests" }
  )
);

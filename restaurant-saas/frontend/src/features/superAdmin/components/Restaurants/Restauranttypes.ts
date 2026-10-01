// types/RestaurantTypes.ts

export type StatusFilter = "All" | "Active" | "Trial" | "Inactive";

export interface RestaurantsRow {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  location: string;
  plan: "Premium" | "Standard" | "Basic";
  status: "Active" | "Trial" | "Inactive";
  revenue: string;
  branches: number;
}

export interface NewRestaurantForm {
  name: string;
  owner: string;
  email: string;
  phone: string;
  location: string;
  plan: "Premium" | "Standard" | "Basic";
  status: "Active" | "Trial" | "Inactive";
  revenue: string;
  branches: number;
}
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

export const restaurantData: RestaurantsRow[] = [
  {
    id: "R001",
    name: "Spice Paradise",
    owner: "Rajesh Kumar",
    email: "rajesh@spiceparadise.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    plan: "Premium",
    status: "Active",
    revenue: "₹128,450",
    branches: 3,
  },
  {
    id: "R002",
    name: "Urban Bites",
    owner: "Priya Sharma",
    email: "priya@urbanbites.com",
    phone: "+91 98765 43211",
    location: "Delhi, NCR",
    plan: "Standard",
    status: "Active",
    revenue: "₹115,280",
    branches: 2,
  },
  {
    id: "R003",
    name: "Gourmet Haven",
    owner: "Amit Patel",
    email: "amit@gourmethaven.com",
    phone: "+91 98765 43212",
    location: "Bangalore, Karnataka",
    plan: "Premium",
    status: "Trial",
    revenue: "₹98,760",
    branches: 1,
  },
  {
    id: "R004",
    name: "Fusion Kitchen",
    owner: "Neha Singh",
    email: "neha@fusionkitchen.com",
    phone: "+91 98765 43213",
    location: "Pune, Maharashtra",
    plan: "Basic",
    status: "Active",
    revenue: "₹89,450",
    branches: 2,
  },
  {
    id: "R005",
    name: "Ocean Delights",
    owner: "Vikram Reddy",
    email: "vikram@oceandelights.com",
    phone: "+91 98765 43214",
    location: "Chennai, Tamil Nadu",
    plan: "Standard",
    status: "Inactive",
    revenue: "₹82,340",
    branches: 1,
  },
];
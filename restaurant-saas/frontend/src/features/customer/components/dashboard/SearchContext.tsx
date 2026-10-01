import React, { createContext, useContext, useState, useMemo } from 'react';

// ── Menu data (shared across pages) ──────────────────────────
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: string;
  isVeg?: boolean;
  isSpicy?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    price: 229,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYb2-VbtsIQSwf2j0m8Dti6DsxSryM6aCxHu3wqIKIIyrZfz9HxcuopTHZ1x-GBX279YOkoo0dJbtg1_hZEFJBcziVdbk--CLHKqRTDrRaBjw8Qnl8KlKULxwwoBC7Nq6T5HmQc9uIOPm4NdwH-29qZ1Bhso9i6KCIcQYGfKNTZ_daeDEjm_KukodOLxX56T71u5ef1KaM1y7Eow0uvSVtG72fAPBbEfSeZN43xE27p7YJ7maE_rNHwwD9zei_J47F9cbugSlfw_k',
    description: 'Cottage cheese marinated in aromatic spices and grilled to perfection.',
    category: 'Starters',
    rating: 4.6,
    reviews: 128,
    badge: 'Bestseller',
    isVeg: true,
  },
  {
    id: 'hyderabadi-biryani',
    name: 'Hyderabadi Biryani',
    price: 249,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOHYem6bkKsSZov-pTPsayutJFRKZuUM8qKFDCGwhacfJDN9LO1HuKjD48AQgc2MAA3H7xJbRfye2qAF4wTpjGxvSRvmBqg6cUwbsvjztrgk0CxsVrzwcofrJhsoahw4gbYp7ftTyjGqmiyXqiJm7bt4MgBPZIRcEBRxfSQ4GyY-Ev7S0zT82vZ43vW5PRncMmRup3lvMnKjaVnK2Ks5QxqV6trdVHz7IWkBDOyp0kaIwnUxW2EHqnxnvxaaigxPAXnEGtT97OKh4',
    description: 'Aromatic basmati rice cooked with perfection and exotic spices, served with Mirchi Ka Salan.',
    category: 'Biryani',
    rating: 4.6,
    reviews: 230,
    badge: 'Bestseller',
    isSpicy: true,
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    price: 229,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg0gCUG1WXOEL41PSVwQYummflfHXXjJxTFKvTEXlAqYbGypD3aJXmIanbsOtEgWJioGz1cNkr_YruzDd9ibI9wzd73xWO8Dnu94QPXBBBf9sEPl8H3DKm2tvCkzEr7zg8XIiPeY1sgDW-jgHbWhEoRzAkJ1y4-0kBL8LwuYtewqHG3L87RVFG3iUrG30eT9Sx-zXRd7ga8EunXWev5dyShj2F5VEtbATELbhQaAXKHQmyIBkIHZFE2TVIi3uqhG-wzCRjd4P6mQk',
    description: 'Creamy tomato gravy with tender chicken chunks, slow-cooked with real butter and spices.',
    category: 'Main',
    rating: 4.5,
    reviews: 186,
  },
  {
    id: 'veg-biryani',
    name: 'Veg Biryani',
    price: 249,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4gbLIIoBHLPYhfQufxaP8DlurhAIhEySEYBJPsDONlkA_I43umD6qW8l_o0LnG8z6Y6i-O5Y0YWO4wwvWrOpJy3wPn2OmEQu2tOVJZWPmTguVZn3SPXr6IAhCHTrsUirpDAzNlCbrjcfaC-ApJPaR94D6RLnbsF4eN7NK8pBU_TA_YYemf8d1XEKwa52LO6I1pzZWaTm5JwfXgieKBX9sycG2O-GnvPVoXLiXTNNI-9AFlHP6W5sEQ246suhHKMJ_4fXiHua66f8',
    description: 'Fragrant basmati rice cooked with mixed vegetables and traditional spices.',
    category: 'Biryani',
    rating: 4.5,
    reviews: 186,
    badge: 'Bestseller',
    isVeg: true,
  },
  {
    id: 'veg-pizza',
    name: 'Veg Pizza',
    price: 199,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUOF37R2ahmAB-jWu5buxDhfWGiZpSOyH8UM3ubR5nr24yskI9OKXgtTPObkeZO91bnmmuUvR_MZUEtEiiQDtK7sUFVxA6lw6VwldWl_RZV76bC61zN86gvMxD-3JouVOsJzLLap9O3SlRAm3gCTCfd-woRkFoivAKKYxNK68LmLWfAGGWoFcZgFRNfpKMIPTvmGdGFLfZjKqmdTAVMEx0DcbLZyvgZTy9JBDx1-9aON1o97ZwuFoIvrZnjt1kQXcU0gEIKfNI7cg',
    description: 'Loaded with garden fresh veggies, premium mozzarella, and our signature slow-simmered sauce.',
    category: 'Pizza',
    rating: 4.4,
    reviews: 162,
    isVeg: true,
  },
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    price: 299,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8O0tH2gWTYrBFO68_gcHI-hpcs2EU3t7PbyhHoImfL3u86VeDVJrW52Hrzwn6w-H0QAn9XA6L7iyFC3N1zYUPPA1kL2w9lh8UidL5o-NtGMzhLBsmEj7FQ-FYjj4t6GkxZNwmXTpzxFLGl3ree46mG0NJs9SbfkHmkZVHDRgESfmF5Mx37l1Rjg7n4qZzOVYuCccalxHwTTXuHFhAdV7Ql8sky0shDPQpIubFCnQHkpJI-0NvJn-9v7wWG2mSnzuJQrOeafLMFbw',
    description: 'Classic delight with 100% mozzarella cheese, tomatoes and fresh basil.',
    category: 'Pizza',
    rating: 4.6,
    reviews: 210,
    isVeg: true,
  },
  {
    id: 'veg-manchurian',
    name: 'Veg Manchurian',
    price: 199,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3Tf5Iy3o4LOZS-MGEwRiQoJofm-D2bMh_JLA2DNKFJ6irCVahNRZAGaS_czu5qJnIIrs5uPYfBrdMmFoAta1FBuwTPSkJS78z5vy15YYgU3XfS7gQhDIHtJL6qWb0yxzlIvjPKMAbWbS57AxYzE_Rfu1kbTcUIBUQnXvbX158unYQj3NV6xrXg7QP8qelpuIqj5kQViUbaewbpwhwTSvJSnRBMW66gSKHoQeV7A-qvoMAgfRtrFsENQnskRPt9XpUJC7AtdkmlCk',
    description: 'Crispy vegetable balls tossed in a flavorful Indo-Chinese sauce.',
    category: 'Starters',
    rating: 4.4,
    reviews: 98,
    isVeg: true,
  },
  {
    id: 'veg-burger',
    name: 'Veg Burger',
    price: 179,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK5YQMyaDuuApBnE-TNX_xfOLIaHxHNoLyOwn0BQwujksfm7UMeQ6F8R-mDrP6S_ZeMUmvZFzUdt1A-YOpY6pk4BznT6V-gjAysNdN-xol_geE6V6lxyWYp6IcA1LbUJ7jLS6SwDO1K-767ga6gFxIokxcbbY5GIDcSP6otSIGv-_jW1DLQsguBTdMb4iAMwXDd_1pdm-S63M2O0b5q4kVbkFo5zaBYYD3GoLnmNE9QDexE9y2bcIC88uEnCavU4P6wPBKO0ue87c',
    description: 'Crispy veg patty with lettuce, tomato, onion & special sauce.',
    category: 'Burgers',
    rating: 4.3,
    reviews: 124,
    isVeg: true,
  },
  {
    id: 'penne-arrabbiata',
    name: 'Penne Arrabbiata',
    price: 199,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1f0e1Ax6wimKL0yEZdbG1Zf2GrPI12YpCqifqekdXLw2SVuhjNu5SYa6X5XXGgyHnia1Pk6dheuYlohh0Ry91vyJAlOhpYjXta0qrWKu6dOcJsq5BizUyNHSTeMUvASaTOtHc5hLigQDyuP-2Tt_xam_L3W_8RuMcmdJU0n0BzfZO8MSgMREY58wxavALPbeqe_Ilsj11jUwGE49oBVQcH1F0Tmr8uTxEDYJqkZVN7NPH83GSIYCZ8wZck1oW74BDC76xZnh9SNg',
    description: 'Penne pasta tossed in spicy tomato sauce with herbs & parmesan.',
    category: 'Main',
    rating: 4.4,
    reviews: 156,
    isVeg: true,
    isSpicy: true,
  },
  {
    id: 'chocolate-lava-cake',
    name: 'Chocolate Lava Cake',
    price: 149,
    image: '',
    description: 'Rich, warm chocolate cake with a molten center.',
    category: 'Desserts',
    rating: 4.7,
    reviews: 200,
    isVeg: true,
  },
  {
    id: 'mango-lassi',
    name: 'Mango Lassi',
    price: 89,
    image: '',
    description: 'Creamy yogurt-based mango drink, refreshingly cool.',
    category: 'Drinks',
    rating: 4.5,
    reviews: 140,
    isVeg: true,
  },
  {
    id: 'garlic-naan',
    name: 'Garlic Naan',
    price: 49,
    image: '',
    description: 'Leavened bread topped with melted butter and fresh garlic.',
    category: 'Main',
    rating: 4.3,
    reviews: 300,
    isVeg: true,
  },
];

export const CATEGORIES = [
  { name: 'All', icon: 'grid_view' },
  { name: 'Biryani', icon: 'soup_kitchen' },
  { name: 'Pizza', icon: 'local_pizza' },
  { name: 'Burgers', icon: 'lunch_dining' },
  { name: 'Desserts', icon: 'cake' },
  { name: 'Drinks', icon: 'local_bar' },
  { name: 'Starters', icon: 'skillet' },
  { name: 'Main', icon: 'dinner_dining' },
];

// ── Search / Filter context ──────────────────────────────────
interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  vegOnly: boolean;
  setVegOnly: (v: boolean) => void;
  spicyOnly: boolean;
  setSpicyOnly: (s: boolean) => void;
  filteredItems: MenuItem[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);

  const filteredItems = useMemo(() => {
    let result = [...MENU_ITEMS];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((item) => item.category === activeCategory);
    }

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Veg filter
    if (vegOnly) {
      result = result.filter((item) => item.isVeg);
    }

    // Spicy filter
    if (spicyOnly) {
      result = result.filter((item) => item.isSpicy);
    }

    // Sort
    if (sortBy === 'Popularity') {
      result.sort((a, b) => b.reviews - a.reviews);
    } else if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [query, activeCategory, sortBy, vegOnly, spicyOnly]);

  const value = useMemo(
    () => ({ query, setQuery, activeCategory, setActiveCategory, sortBy, setSortBy, vegOnly, setVegOnly, spicyOnly, setSpicyOnly, filteredItems }),
    [query, activeCategory, sortBy, vegOnly, spicyOnly, filteredItems]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}

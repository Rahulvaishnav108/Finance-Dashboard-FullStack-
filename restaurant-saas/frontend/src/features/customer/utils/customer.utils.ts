import type { CustomerCartItem, CustomerMenuItem } from '../store/customer.store';

export const formatRupees = (value: number) => `₹${value}`;

export const getRecommendedItems = (
  menuItems: CustomerMenuItem[],
  favourites: number[],
  cart: CustomerCartItem[],
) => {
  const favouriteCategories = new Set(
    menuItems.filter((item) => favourites.includes(item.id)).map((item) => item.cat),
  );
  const cartCategories = new Set(
    menuItems.filter((item) => cart.some((cartItem) => cartItem.id === item.id)).map((item) => item.cat),
  );

  return [...menuItems]
    .sort((a, b) => {
      const aScore = Number(favouriteCategories.has(a.cat)) + Number(cartCategories.has(a.cat)) + a.rating;
      const bScore = Number(favouriteCategories.has(b.cat)) + Number(cartCategories.has(b.cat)) + b.rating;
      return bScore - aScore;
    })
    .slice(0, 4);
};

export const getOrderProgress = (status: string) => {
  if (status === 'Placed') return 25;
  if (status === 'Preparing') return 60;
  if (status === 'Served') return 85;
  return 100;
};

export const generateTableCode = () => {
  const tableNumber = Math.floor(Math.random() * 40) + 1;
  return `T${String(tableNumber).padStart(2, '0')}`;
};

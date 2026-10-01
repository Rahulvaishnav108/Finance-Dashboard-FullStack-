import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMenuStore } from '../../store/menu.store';

const items = [
  { name: 'Grilled Salmon',   category: 'Main Course', orders: 124, revenue: '₹37,200', trend: '+12%' },
  { name: 'Margherita Pizza', category: 'Pizza',       orders: 98,  revenue: '₹24,500', trend: '+8%'  },
  { name: 'Tiramisu',         category: 'Dessert',     orders: 87,  revenue: '₹13,050', trend: '+5%'  },
  { name: 'Caesar Salad',     category: 'Salad',       orders: 76,  revenue: '₹11,400', trend: '-2%'  },
  { name: 'Chicken Alfredo',  category: 'Pasta',       orders: 65,  revenue: '₹19,500', trend: '+3%'  },
];

export function TopMenuItems(): JSX.Element {
  const navigate = useNavigate();
  const { setSortOption, setActiveCategory, setActiveFilter } = useMenuStore();

  function handleViewAll() {
    setActiveCategory('all');
    setActiveFilter('Available');
    setSortOption('Price High-Low');
    navigate('/admin/menu');
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Top Menu Items</h3>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-2.5 sm:space-y-3">
        {items.map((item, i) => (
          <button
            key={item.name}
            onClick={handleViewAll}
            className="w-full text-left flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-xl px-1 py-0.5 transition-colors"
          >
            <span className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-500 dark:text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{item.category} · {item.orders} orders</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.revenue}</p>
              <p className={`text-xs font-medium ${item.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {item.trend}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
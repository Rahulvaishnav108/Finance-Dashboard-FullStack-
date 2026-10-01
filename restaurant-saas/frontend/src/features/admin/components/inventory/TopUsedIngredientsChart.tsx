import React from 'react';
import { X, BarChart3 } from 'lucide-react';
import { useInventoryStore } from '../../store/inventory.store';

function IngredientsModal() {
  const { topUsedIngredients, showIngredientsModal, setShowIngredientsModal } = useInventoryStore();
  if (!showIngredientsModal) return null;

  const maxVal = Math.max(...topUsedIngredients.map((d) => d.value));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
        onClick={() => setShowIngredientsModal(false)}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Top Used Ingredients</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowIngredientsModal(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Usage this month (units consumed)</p>

        <div className="space-y-3">
          {topUsedIngredients.map((d, i) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-4 text-right">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{d.label}</span>
                  <span className="text-xs font-bold text-orange-500">{d.value}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(d.value / maxVal) * 100}%`,
                      backgroundColor: `rgba(249, 115, 22, ${0.9 - i * 0.1})`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowIngredientsModal(false)}
          className="w-full mt-6 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function TopUsedIngredientsChart() {
  const { topUsedIngredients, setShowIngredientsModal } = useInventoryStore();

  const maxVal = Math.max(...topUsedIngredients.map((d) => d.value));
  const W = 260, H = 80;
  const BAR_W = 32, GAP = 8, PAD_LEFT = 28, PAD_BOTTOM = 20, PAD_TOP = 8;
  const innerH = H - PAD_BOTTOM - PAD_TOP;
  const totalBarsW = topUsedIngredients.length * (BAR_W + GAP) - GAP;
  const startX = (W - PAD_LEFT - totalBarsW) / 2 + PAD_LEFT;

  return (
    <>
      <IngredientsModal />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Used Ingredients</h3>
          <button
            type="button"
            onClick={() => setShowIngredientsModal(true)}
            className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 font-medium transition-colors"
          >
            View all
          </button>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {[0, 50, 100].map((t) => {
            const y = PAD_TOP + innerH - (t / 100) * innerH;
            return (
              <g key={t}>
                <line
                  x1={PAD_LEFT} x2={W} y1={y} y2={y}
                  stroke="currentColor" strokeWidth="0.5"
                  className="text-gray-100 dark:text-gray-800"
                />
                <text
                  x={PAD_LEFT - 3} y={y + 3} textAnchor="end" fontSize="7"
                  fill="currentColor" className="text-gray-400 dark:text-gray-500"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {topUsedIngredients.map((d, i) => {
            const barH = (d.value / maxVal) * innerH;
            const x    = startX + i * (BAR_W + GAP);
            const y    = PAD_TOP + innerH - barH;
            const shortLabel = d.label.split(' ')[0];
            return (
              <g key={d.label}>
                <rect
                  x={x} y={y} width={BAR_W} height={barH}
                  rx="4" fill="#f97316"
                  fillOpacity={Math.max(0.2, 0.85 - i * 0.08)}
                />
                <text
                  x={x + BAR_W / 2} y={H - 4} textAnchor="middle" fontSize="7"
                  fill="currentColor" className="text-gray-400 dark:text-gray-500"
                >
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
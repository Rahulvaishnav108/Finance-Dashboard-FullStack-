import React from 'react';
import { useTablesStore } from '../../store/tables.store';
import type { Table, TableStatus } from '../../store/tables.store';

// ── Helpers ────────────────────────────────────────────────────────────────

const statusColors: Record<TableStatus, { fill: string; stroke: string; text: string }> = {
  Available: { fill: '#dcfce7', stroke: '#22c55e', text: '#15803d' },
  Occupied:  { fill: '#ffedd5', stroke: '#f97316', text: '#c2410c' },
  Reserved:  { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' },
  Cleaning:  { fill: '#fef9c3', stroke: '#eab308', text: '#a16207' },
  Blocked:   { fill: '#f3f4f6', stroke: '#9ca3af', text: '#6b7280' },
};

const darkStatusColors: Record<TableStatus, { fill: string; stroke: string; text: string }> = {
  Available: { fill: 'rgba(34,197,94,0.15)',   stroke: '#22c55e', text: '#4ade80' },
  Occupied:  { fill: 'rgba(249,115,22,0.15)',  stroke: '#f97316', text: '#fb923c' },
  Reserved:  { fill: 'rgba(59,130,246,0.15)',  stroke: '#3b82f6', text: '#60a5fa' },
  Cleaning:  { fill: 'rgba(234,179,8,0.15)',   stroke: '#eab308', text: '#facc15' },
  Blocked:   { fill: 'rgba(107,114,128,0.12)', stroke: '#6b7280', text: '#9ca3af' },
};

function TableShape({
  table,
  isSelected,
  isDark,
  isDragging,
}: {
  table: Table;
  isSelected: boolean;
  isDark: boolean;
  isDragging: boolean;
}) {
  const colors = isDark ? darkStatusColors[table.status] : statusColors[table.status];
  const w  = table.shape === 'Rectangle' ? 88 : table.shape === 'Square' ? 64 : 56;
  const h  = table.shape === 'Rectangle' ? 52 : table.shape === 'Square' ? 64 : 56;
  const rx = table.shape === 'Round' ? 28 : 8;

  return (
    <g>
      <rect
        x={0} y={0} width={w} height={h} rx={rx}
        fill={colors.fill}
        stroke={isSelected ? '#f97316' : colors.stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{
          filter: isDragging
            ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))'
            : isSelected
            ? 'drop-shadow(0 0 6px rgba(249,115,22,0.4))'
            : undefined,
        }}
      />
      <text x={w / 2} y={h / 2 - 6} textAnchor="middle" fill={colors.text} fontSize={10} fontWeight="700">
        {table.label}
      </text>
      <text x={w / 2} y={h / 2 + 7} textAnchor="middle" fill={colors.text} fontSize={9} opacity={0.8}>
        {table.seats} seats
      </text>
    </g>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────

const legend: { status: TableStatus; dot: string }[] = [
  { status: 'Available', dot: 'bg-green-500' },
  { status: 'Occupied',  dot: 'bg-orange-500' },
  { status: 'Reserved',  dot: 'bg-blue-500' },
  { status: 'Cleaning',  dot: 'bg-yellow-500' },
  { status: 'Blocked',   dot: 'bg-gray-400' },
];

// ── Main Component ─────────────────────────────────────────────────────────

export function FloorMap(): JSX.Element {
  const { tables, selectedTableId, selectedFloor, selectTable, updateTable } = useTablesStore();

  const [isDark, setIsDark] = React.useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  React.useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{
    tableId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragPos, setDragPos] = React.useState<{ x: number; y: number } | null>(null);

  const floorTables = tables.filter((t) => t.floor === selectedFloor);

  const getContainerPct = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(4, Math.min(96, x)),
      y: Math.max(4, Math.min(96, y)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent, table: Table) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragRef.current = {
      tableId: table.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: table.x,
      startY: table.y,
    };
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { tableId, startClientX, startClientY, startX, startY } = dragRef.current;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = ((e.clientX - startClientX) / rect.width) * 100;
      const dy = ((e.clientY - startClientY) / rect.height) * 100;
      const newX = Math.max(4, Math.min(96, startX + dx));
      const newY = Math.max(4, Math.min(96, startY + dy));
      const distPx = Math.hypot(e.clientX - startClientX, e.clientY - startClientY);
      if (distPx > 4) {
        setDraggingId(tableId);
        setDragPos({ x: newX, y: newY });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { tableId, startClientX, startClientY } = dragRef.current;
      const distPx = Math.hypot(e.clientX - startClientX, e.clientY - startClientY);
      if (distPx <= 4) {
        selectTable(selectedTableId === tableId ? null : tableId);
      } else {
        const pos = getContainerPct(e.clientX, e.clientY);
        if (pos) updateTable(tableId, { x: pos.x, y: pos.y });
      }
      dragRef.current = null;
      setDraggingId(null);
      setDragPos(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [selectedTableId, selectTable, updateTable]);

  const handleTouchStart = (e: React.TouchEvent, table: Table) => {
    const touch = e.touches[0];
    dragRef.current = {
      tableId: table.id,
      startClientX: touch.clientX,
      startClientY: touch.clientY,
      startX: table.x,
      startY: table.y,
    };
  };

  React.useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current) return;
      const touch = e.touches[0];
      const { tableId, startClientX, startClientY, startX, startY } = dragRef.current;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = ((touch.clientX - startClientX) / rect.width) * 100;
      const dy = ((touch.clientY - startClientY) / rect.height) * 100;
      const newX = Math.max(4, Math.min(96, startX + dx));
      const newY = Math.max(4, Math.min(96, startY + dy));
      const distPx = Math.hypot(touch.clientX - startClientX, touch.clientY - startClientY);
      if (distPx > 6) {
        e.preventDefault();
        setDraggingId(tableId);
        setDragPos({ x: newX, y: newY });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!dragRef.current) return;
      const { tableId, startClientX, startClientY } = dragRef.current;
      const touch = e.changedTouches[0];
      const distPx = Math.hypot(touch.clientX - startClientX, touch.clientY - startClientY);
      if (distPx <= 6) {
        selectTable(selectedTableId === tableId ? null : tableId);
      } else {
        const pos = getContainerPct(touch.clientX, touch.clientY);
        if (pos) updateTable(tableId, { x: pos.x, y: pos.y });
      }
      dragRef.current = null;
      setDraggingId(null);
      setDragPos(null);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [selectedTableId, selectTable, updateTable]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-wrap">
        {legend.map(({ status, dot }) => (
          <span key={status} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {status}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-gray-400 italic hidden sm:inline">
          Click to manage · Drag to reposition
        </span>
        <span className="ml-auto text-[11px] text-gray-400 italic sm:hidden">
          Tap to manage · Hold &amp; drag to move
        </span>
      </div>

      {/* Map area */}
      <div className="relative w-full" style={{ paddingBottom: '56%', minHeight: 280 }}>
        <div className="absolute inset-0 p-3 sm:p-4">
          <div className="absolute top-3 left-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {selectedFloor === 1 ? 'Floor 1' : 'Floor 2 – Private'}
          </div>

          <div
            ref={containerRef}
            className="relative w-full h-full"
            style={{ cursor: draggingId ? 'grabbing' : 'default' }}
          >
            {floorTables.map((table) => {
              const w  = table.shape === 'Rectangle' ? 88 : table.shape === 'Square' ? 64 : 56;
              const h  = table.shape === 'Rectangle' ? 52 : table.shape === 'Square' ? 64 : 56;
              const isSelected = table.id === selectedTableId;
              const isDragging = table.id === draggingId;

              const posX = isDragging && dragPos ? dragPos.x : table.x;
              const posY = isDragging && dragPos ? dragPos.y : table.y;

              return (
                <div
                  key={table.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select table ${table.label}`}
                  onMouseDown={(e) => handleMouseDown(e, table)}
                  onTouchStart={(e) => handleTouchStart(e, table)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectTable(selectedTableId === table.id ? null : table.id);
                    }
                  }}
                  title={`${table.label} • ${table.status} • ${table.seats} seats`}
                  className="absolute"
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: isDragging ? 10 : isSelected ? 5 : 1,
                    transition: isDragging ? 'none' : 'left 0.15s ease, top 0.15s ease',
                    userSelect: 'none',
                    touchAction: 'none',
                  }}
                >
                  <svg
                    width={w}
                    height={h}
                    viewBox={`0 0 ${w} ${h}`}
                    overflow="visible"
                    style={{ display: 'block' }}
                  >
                    <TableShape
                      table={table}
                      isSelected={isSelected}
                      isDark={isDark}
                      isDragging={isDragging}
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
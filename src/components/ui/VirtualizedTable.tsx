import { type ReactNode } from 'react';
import { List } from 'react-window';

export interface Column<T> {
  key: string;
  label: string;
  width: number;
  render: (row: T) => ReactNode;
}

interface VirtualizedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowHeight?: number;
  maxHeight?: number;
  emptyMessage?: string;
}

export function VirtualizedTable<T>({
  columns,
  data,
  rowHeight = 52,
  maxHeight = 600,
  emptyMessage = 'No data',
}: VirtualizedTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex bg-slate-50 dark:bg-[#1a1a1a]/50 border-b border-slate-100 dark:border-[#1a1a1a]">
        {columns.map((col) => (
          <div
            key={col.key}
            style={{ width: col.width, minWidth: col.width }}
            className="px-4 py-3 text-left font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]"
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <List
        height={Math.min(data.length * rowHeight, maxHeight)}
        itemCount={data.length}
        itemSize={rowHeight}
        width="100%"
        itemData={{ data, columns }}
        rowProps={{}}
      >
        {({ index, style, data: renderData }) => {
          const row = renderData.data[index];
          return (
            <div
              style={style}
              className="flex items-center border-b border-slate-100 dark:border-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50"
            >
              {renderData.columns.map((col: Column<T>) => (
                <div
                  key={col.key}
                  style={{ width: col.width, minWidth: col.width }}
                  className="px-4 py-2 truncate text-sm"
                >
                  {col.render(row)}
                </div>
              ))}
            </div>
          );
        }}
      </List>
    </div>
  );
}

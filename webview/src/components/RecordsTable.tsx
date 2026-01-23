import React, { useEffect, useRef, useMemo } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '../styles/Table.css';

interface RecordsTableProps {
  records: any[];
  header: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterColumn: string;
  onFilterColumnChange: (column: string) => void;
}

const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  header,
  searchTerm,
  onSearchChange,
  filterColumn,
  onFilterColumnChange,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);
  const tableReadyRef = useRef<boolean>(false);

  const columns = useMemo(() => {
    return header.map((col) => ({
      title: col,
      field: col,
      headerFilter: "input" as const,
      headerFilterPlaceholder: `Filter ${col}...`,
      minWidth: 100,
      maxWidth: 300,
      resizable: true,
      headerSort: true,
      tooltip: true,
      formatter: 'textarea' as const,
      formatterParams: {
        verticalAlignment: true,
        maxHeight: 100,
      },
    }));
  }, [header]);

  useEffect(() => {
    if (tableRef.current && records.length > 0) {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
      }

      tabulatorRef.current = new Tabulator(tableRef.current, {
        height: '100%',
        layout: 'fitColumns',
        responsiveLayout: 'hide',
        pagination: true,
        paginationSize: 50,
        paginationSizeSelector: [25, 50, 100, 200],
        movableColumns: true,
        resizableRows: true,
        selectableRows: true,
        data: records,
        columns,
        langs: {
          en: {
            pagination: {
              first: 'First',
              last: 'Last',
              prev: 'Prev',
              next: 'Next',
              page_size: 'Page Size',
            },
          },
        },
      });

      // Mark table as ready after it's built
      tabulatorRef.current.on('tableBuilt', () => {
        tableReadyRef.current = true;
      });

      // Register event handlers after table is created
      tabulatorRef.current.on('rowClick', (_e: UIEvent, row: any) => {
        const data = row.getData();
        console.log('Row clicked:', data);
      });

      tabulatorRef.current.on('rowContext', (_e: UIEvent, row: any) => {
        const data = row.getData();
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      });
    }

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
        tableReadyRef.current = false;
      }
    };
  }, [records, columns]);

  useEffect(() => {
    // Only apply filters after table is ready
    if (tabulatorRef.current && tableReadyRef.current) {
      if (searchTerm) {
        tabulatorRef.current.setFilter((row: any) => {
          if (filterColumn === 'all') {
            return Object.values(row).some((val: any) =>
              String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return String(row[filterColumn] || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });
      } else {
        tabulatorRef.current.clearFilter(true);
      }
    }
  }, [searchTerm, filterColumn]);

  if (!records || records.length === 0) {
    return (
      <div className="records-table empty">
        <p>No records available</p>
      </div>
    );
  }

  return (
    <div className="records-table">
      <div className="table-header">
        <h2>📊 Records</h2>
        <div className="table-controls">
          <select
            className="filter-select"
            value={filterColumn}
            onChange={(e) => onFilterColumnChange(e.target.value)}
          >
            <option value="all">All Columns</option>
            {header.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <span className="record-count">
            {records.length.toLocaleString()} records
          </span>
        </div>
      </div>

      <div ref={tableRef} className="tabulator-container"></div>
    </div>
  );
};

export default RecordsTable;

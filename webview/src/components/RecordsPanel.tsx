import React, { useState, useMemo } from 'react';
import {
  Icon,
  InputGroup,
  HTMLSelect,
  Tag,
  Section,
  SectionCard,
  Button,
  ButtonGroup,
  Text,
} from '@blueprintjs/core';
import { Table, Column, Cell, ColumnHeaderCell, RowHeaderCell, Regions, RegionCardinality, type Region } from '@blueprintjs/table';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-json';

interface RecordsPanelProps {
  records: any[];
  header: string[];
  filteredRecords: any[];
}

export const RecordsPanel: React.FC<RecordsPanelProps> = ({
  records,
  header,
  filteredRecords,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [preview, setPreview] = useState<{
    rowNumber: number;
    columnKey: string;
    value: string;
    isJson: boolean;
  } | null>(null);
  const [previewHeight, setPreviewHeight] = useState(160);
  const [isResizingPreview, setIsResizingPreview] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Apply column filters to filteredRecords
  const fullyFilteredRecords = useMemo(() => {
    let result = filteredRecords;

    // Apply column-specific filters
    Object.entries(columnFilters).forEach(([col, filterValue]) => {
      if (filterValue.trim()) {
        const lowerFilter = filterValue.toLowerCase();
        result = result.filter((row) =>
          String(row[col] ?? '')
            .toLowerCase()
            .includes(lowerFilter)
        );
      }
    });

    return result;
  }, [filteredRecords, columnFilters]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, filteredRecords]);

  React.useEffect(() => {
    if (!isResizingPreview) return;
    const handleMove = (e: MouseEvent) => {
      const delta = e.movementY;
      setPreviewHeight((prev) => {
        const next = prev - delta;
        if (next < 80) return 80;
        if (next > 400) return 400;
        return next;
      });
    };
    const handleUp = () => {
      setIsResizingPreview(false);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isResizingPreview]);

  React.useEffect(() => {
    if (isPreviewOpen && preview) {
      Prism.highlightAll();
    }
  }, [isPreviewOpen, preview]);

  // Apply sorting
  const sortedRecords = useMemo(() => {
    if (!sortColumn) return fullyFilteredRecords;

    return [...fullyFilteredRecords].sort((a, b) => {
      const aVal = a[sortColumn] ?? '';
      const bVal = b[sortColumn] ?? '';

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [fullyFilteredRecords, sortColumn, sortDirection]);

  // Apply pagination
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRecords.slice(startIndex, startIndex + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleColumnFilterChange = (column: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return undefined;
    return sortDirection === 'asc' ? 'caret-up' : 'caret-down';
  };

  const renderCell = (rowIndex: number, columnKey: string) => {
    const value = paginatedRecords[rowIndex]?.[columnKey];
    const isOdd = rowIndex % 2 !== 0;
    const displayValue = formatCellValue(value);
    return (
      <Cell className={isOdd ? 'odd-row' : ''}>
        <div className="cell-content">
          <span className="cell-text" title={displayValue}>
            {displayValue}
          </span>
        </div>
      </Cell>
    );
  };

  const handleSelection = (selectedRegions: Region[]) => {
    if (!selectedRegions || selectedRegions.length === 0) return;
    const region = selectedRegions[selectedRegions.length - 1];
    const numRows = paginatedRecords.length;
    const numCols = header.length;
    if (numRows === 0 || numCols === 0) return;
    const cellRegion = Regions.getCellRegionFromRegion(region, numRows, numCols);
    const rowIndex = cellRegion.rows[0];
    const colIndex = cellRegion.cols[0];
    const columnKey = header[colIndex];
    if (columnKey === undefined) return;
    const value = paginatedRecords[rowIndex]?.[columnKey];
    const rowNumber = (currentPage - 1) * pageSize + rowIndex + 1;
    setPreview({
      rowNumber,
      columnKey,
      value: formatPreviewValue(value),
      isJson: value !== null && typeof value === 'object',
    });
  };

  const renderColumnHeader = (columnName: string) => {
    return (
      <ColumnHeaderCell
        name={columnName.toUpperCase()}
        nameRenderer={(name) => (
          <div className="th-content" onClick={() => handleSort(columnName)}>
            <span>{name}</span>
            {getSortIcon(columnName) && (
              <Icon icon={getSortIcon(columnName)} size={12} />
            )}
          </div>
        )}
      >
        <div className="filter-container">
          <InputGroup
            small
            placeholder={`Filter ${columnName}...`}
            value={columnFilters[columnName] || ''}
            onChange={(e) =>
              handleColumnFilterChange(columnName, e.target.value)
            }
          />
        </div>
      </ColumnHeaderCell>
    );
  };

  return (
    <Section
      title="Records"
      icon={<Icon icon="th" size={14} />}
      className="panel records-section-container"
      rightElement={
        <div className="header-right-tools">
          <Button
            minimal
            icon={isPreviewOpen ? 'eye-open' : 'eye-off'}
            title={isPreviewOpen ? 'Hide preview' : 'Show preview'}
            onClick={() => setIsPreviewOpen((prev) => !prev)}
          />
          <Tag round intent="primary">
            {sortedRecords.length} / {records.length} records
          </Tag>
        </div>
      }
    >
      <SectionCard
        padded={false}
        className="panel-card records-section-card"
      >
        <div className="table-wrapper">
          <Table
            numRows={paginatedRecords.length}
            enableRowHeader={true}
            rowHeaderCellRenderer={(rowIndex) => (
              <RowHeaderCell name={String((currentPage - 1) * pageSize + rowIndex + 1)} />
            )}
            cellRendererDependencies={[paginatedRecords, currentPage, pageSize]}
            //  enableGhostCells={true}
            enableFocusedCell={true}
            defaultRowHeight={30}
            defaultColumnWidth={150}
            minColumnWidth={100}
            enableColumnResizing={true}
            selectionModes={[RegionCardinality.CELLS]}
            onSelection={handleSelection}
          >
            {header.map((h) => (
              <Column
                key={h}
                name={h}
                cellRenderer={(rowIndex) => renderCell(rowIndex, h)}
                columnHeaderCellRenderer={() => renderColumnHeader(h)}
              />
            ))}
          </Table>
        </div>
        {isPreviewOpen && (
          <>
            <div
              className={`record-preview-resizer ${
                isResizingPreview ? 'is-resizing' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizingPreview(true);
              }}
            />
            <div className="record-preview">
              <div
                className="record-preview-inner"
                style={{ height: previewHeight }}
              >
                <div className="record-preview-header">
                  <div className="record-preview-title">
                    <Icon icon="eye-open" size={12} />
                    <Text>Preview</Text>
                    {preview && (
                      <Tag minimal>
                        Row {preview.rowNumber} - {preview.columnKey}
                      </Tag>
                    )}
                  </div>
                  <Button
                    minimal
                    small
                    icon="cross"
                    onClick={() => setIsPreviewOpen(false)}
                  />
                </div>
                <div className="record-preview-body">
                  {preview ? (
                    <pre className="record-preview-content">
                      <code
                        className={
                          preview.isJson ? 'language-json' : 'language-none'
                        }
                      >
                        {preview.value}
                      </code>
                    </pre>
                  ) : (
                    <pre className="record-preview-content">
                      <code className="language-none">
                        Select a cell to preview its value.
                      </code>
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      <div className="panel-footer pagination" style={{ flexShrink: 0 }}>
        <div className="pagination-left">
          <Text className="page-size-label">Page Size</Text>
          <HTMLSelect
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            options={[10, 25, 50, 100, 500]}
            minimal
          />
        </div>

        <div className="pagination-center">
          <ButtonGroup minimal>
            <Button
              icon="double-chevron-left"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              title="First Page"
            >First</Button>
            <Button
              icon="chevron-left"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >Prev</Button>

            <Button active intent="primary">{currentPage}</Button>

            <Button
              rightIcon="chevron-right"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >Next</Button>
            <Button
              rightIcon="double-chevron-right"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(totalPages)}
              title="Last Page"
            >Last</Button>
          </ButtonGroup>
        </div>

        <div className="pagination-right">
          <Tag className="pagination-total">
            Total: {sortedRecords.length} records ({totalPages} pages)
          </Tag>
          <Tag className="pagination-total-compact">
            {sortedRecords.length}({totalPages})
          </Tag>
        </div>
      </div>
    </Section>
  );
};

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return safeStringify(value);
  }
  return String(value);
};

const formatPreviewValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return safeStringify(value, 2);
  }
  return String(value);
};

const safeStringify = (value: unknown, space?: number): string => {
  try {
    return JSON.stringify(
      value,
      (_key, val) => (typeof val === 'bigint' ? val.toString() : val),
      space
    );
  } catch {
    return String(value);
  }
};

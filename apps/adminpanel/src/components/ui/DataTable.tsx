import { useQueryState } from "@/hooks/ui/useQueryState";
import debounce from "@/utils/debounce";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Dropdown } from "./Dropdown";
import { FormControl } from "./FormControl";
import { Pagination } from "./Pagination";
import { Table } from "./Table";

// Types
export type TColumn<T, K extends keyof T = keyof T> = {
  name: string;
  field: K;
  isSortable?: boolean;
  isSearchable?: boolean;
  head?: (info: {
    head: TColumn<T, K>;
  }) => React.ReactNode | string | number | null | undefined;
  cell?: (info: {
    cell: T[K];
    row: T;
    index: number;
  }) => React.ReactNode | string | number | null | undefined;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: "start" | "center" | "end";
  style?: React.CSSProperties;
  className?: string;
};

export type TState = {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  total?: number;
  setSearch?: (search: string) => void;
  setSort?: (sort: string) => void;
  setPage?: (page: number) => void;
  setLimit?: (limit: number) => void;
};

export type TConfig = {
  isSearchProcessed?: boolean;
  isSortProcessed?: boolean;
  isPaginationProcessed?: boolean;
  isViewSearch?: boolean;
  isViewSort?: boolean;
  isViewPagination?: boolean;
};

export type TDataTableProps<T> = {
  title?: string;
  slot?: React.ReactNode | string | number | null | undefined;
  status?: "loading" | "error" | "success" | string;
  columns: TColumn<T>[];
  data: T[];
  config?: TConfig;
  state?: TState;
};

type CellContentProps<T, K extends keyof T = keyof T> = {
  index: number;
  row: T;
  cell: T[K];
  formatter?: (info: {
    index: number;
    row: T;
    cell: T[K];
  }) => React.ReactNode | string | number | null | undefined;
};

type SkeletonTableRowsProps = {
  rows: number;
  cells: number;
};

// Columns Hook - Logic corrected!
const useColumns = <T extends Record<string, unknown>>(
  initialColumns: TColumn<T>[],
) => {
  const [selected, setSelected] = useState<string[]>(
    initialColumns?.map((c) => c?.name.toString()) || [],
  );

  const toggler = (column: TColumn<T>) => {
    setSelected((prev) =>
      prev.includes(column.name.toString())
        ? prev.filter((c) => c !== column.name.toString())
        : [...prev, column.name.toString()],
    );
  };

  const processedColumns = useMemo(() => {
    if (!(selected?.length > 0)) {
      return [];
    }
    return initialColumns?.filter((column) =>
      selected.includes(column.name.toString()),
    );
  }, [initialColumns, selected]);

  return { columns: processedColumns, selected, setSelected, toggler };
};

// Searching Hook - Logic corrected!
const useSearching = <T extends Record<string, unknown>>(
  data: T[],
  columns: TColumn<T>[],
  search?: string,
  isSearchProcessed: boolean = false,
) => {
  const filteredData = useMemo(() => {
    if (isSearchProcessed) {
      return data;
    }

    if (!search || search.trim() === "") {
      return data;
    }

    const checkIsSearchable = (field: keyof T) => {
      return columns.some(
        (column) => column.field === field && column.isSearchable,
      );
    };

    const searchLower = search.toLowerCase();

    return data.filter((item) => {
      return Object.entries(item).some(([key, value]) => {
        if (
          (typeof value === "string" || typeof value === "number") &&
          checkIsSearchable(key as keyof T)
        ) {
          return value.toString().toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }, [data, columns, search, isSearchProcessed]);

  return filteredData;
};

// Pagination Hook - Logic corrected!
const usePagination = <T extends Record<string, unknown>>(
  data: T[],
  page: number,
  limit: number,
  isPaginationProcessed: boolean = false,
) => {
  const paginatedData = useMemo(() => {
    if (isPaginationProcessed) {
      return data;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const slicedData = data.slice(startIndex, endIndex);

    return slicedData;
  }, [data, page, limit, isPaginationProcessed]);

  return paginatedData;
};

// Sorting Hook - Logic corrected!
const useSorting = <T extends Record<string, unknown>>(
  data: T[],
  sort?: string,
  isSortProcessed: boolean = false,
): T[] => {
  const sortedData = useMemo(() => {
    if (isSortProcessed) {
      return data;
    }

    if (!sort || sort === "") {
      return data;
    }

    // Handle client-side sorting
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const isDescending = sort.startsWith("-");

    return [...data].sort((a, b) => {
      const aValue = a[sortField as keyof T];
      const bValue = b[sortField as keyof T];

      if (aValue === bValue) return 0;

      let comparison = 0;

      // Handle different data types
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return isDescending ? -comparison : comparison;
    });
  }, [data, sort, isSortProcessed]);

  return sortedData;
};

const getSortIcon = (field: string, sort?: string) => {
  if (sort === field) {
    return <ChevronUp className="h-4 w-4" />;
  } else if (sort === `-${field}`) {
    return <ChevronDown className="h-4 w-4" />;
  }
  return <ChevronsUpDown className="h-4 w-4" />;
};

const SkeletonTableRows = ({ rows, cells }: SkeletonTableRowsProps) => {
  const skeletonRows = useMemo(() => {
    return Array.from({ length: rows }, (_, rowIndex) => (
      <Table.Row key={`skeleton-${rowIndex}`}>
        {Array.from({ length: cells || 1 }, (_, cellIndex) => (
          <Table.Cell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
          </Table.Cell>
        ))}
      </Table.Row>
    ));
  }, [rows, cells]);

  return <>{skeletonRows}</>;
};

// Cell Content Component
export const CellContent = <T extends Record<string, unknown>>({
  index,
  row,
  cell,
  formatter,
}: CellContentProps<T>) => {
  const renderValue = (val: unknown): React.ReactNode => {
    if (React.isValidElement(val)) return val;

    if (val === null || val === undefined) return "";

    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean"
    ) {
      return String(val);
    }

    if (Array.isArray(val)) {
      if (
        val.every(
          (item) => typeof item === "string" || typeof item === "number",
        )
      ) {
        return (val as (string | number)[]).join(", ");
      }
      return JSON.stringify(val);
    }

    if (typeof val === "object") {
      return JSON.stringify(val);
    }

    return String(val);
  };

  if (formatter) {
    return <>{formatter({ cell: cell, row, index: index })}</>;
  }

  return <>{renderValue(cell)}</>;
};

// DataTable Component
const DataTable = <T extends Record<string, unknown>>({
  title,
  slot,
  columns,
  data,
  config,
  state,
  status,
}: TDataTableProps<T>) => {
  const {
    isSearchProcessed = false,
    isSortProcessed = false,
    isPaginationProcessed = false,
    isViewSearch = true,
    isViewSort = true,
    isViewPagination = true,
  } = config || {};

  const {
    search,
    sort,
    page,
    limit,
    onSearchChange,
    onSortChange,
    onPageChange,
    onLimitChange,
  } = useQueryState({
    search: state?.search,
    sort: state?.sort,
    page: state?.page,
    limit: state?.limit,
    onSearchChange: state?.setSearch,
    onSortChange: state?.setSort,
    onPageChange: state?.setPage,
    onLimitChange: state?.setLimit,
  });

  // Calculate pagination values
  const currentSearch = search || "";
  const currentSort = sort || "";
  const currentPage = page || 1;
  const currentLimit = limit || 10;

  //  Apply searching
  const searchedData = useSearching(
    data,
    columns,
    currentSearch,
    isSearchProcessed,
  );

  // Apply sorting
  const sortedData = useSorting(searchedData, currentSort, isSortProcessed);

  // Determine total count based on processing type
  const totalCount = useMemo(() => {
    if (isPaginationProcessed && typeof state?.total === "number") {
      return state?.total;
    } else {
      return sortedData.length;
    }
  }, [isPaginationProcessed, state?.total, sortedData.length]);

  // Apply pagination
  const paginatedData = usePagination(
    sortedData,
    currentPage,
    currentLimit,
    isPaginationProcessed,
  );

  const getFieldValue = useCallback((row: T, field: keyof T): T[keyof T] => {
    return row?.[field];
  }, []);

  // Sort handler
  const handleSortClick = useCallback(
    (field: string) => {
      let newSort: string;

      if (currentSort === field) {
        newSort = `-${field}`;
      } else if (currentSort === `-${field}`) {
        newSort = "";
      } else {
        newSort = field;
      }
      onSortChange(newSort);
    },
    [currentSort, onSortChange],
  );

  // Search handler
  const handleSearchChange = debounce((value: string | null) => {
    onSearchChange(value || "");
  }, 500);

  // Page handler
  const handlePageChange = useCallback(
    (page: number) => {
      onPageChange(page);
    },
    [onPageChange],
  );

  // Limit handler
  const handleLimitChange = useCallback(
    (limit: number) => {
      onLimitChange(limit);
    },
    [onLimitChange],
  );

  const { columns: processedColumns, selected, toggler } = useColumns(columns);

  return (
    <div className="w-full space-y-4">
      <div className="flex w-full flex-col flex-wrap gap-4 lg:flex-row lg:items-center lg:justify-between">
        {title && (
          <div className="flex flex-1 items-center">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        )}
        <div className="flex w-full flex-1 items-center gap-4">
          {isViewSearch && (
            <div className="flex-1">
              <FormControl
                className="w-full min-w-12"
                as="input"
                type="search"
                onChange={(e) => handleSearchChange(e.target.value || null)}
                defaultValue={currentSearch}
                placeholder="Search"
              />
            </div>
          )}

          <Dropdown side={"end"}>
            <Dropdown.Trigger className="" variant={"outline"}>
              <span>Columns</span>
            </Dropdown.Trigger>
            <Dropdown.Content className="top-full right-0 mt-1 min-w-40">
              <div className="bg-card text-card-foreground py-1">
                <ul>
                  {columns?.map((column) => (
                    <li
                      className="hover:bg-muted cursor-pointer rounded p-2 py-1"
                      key={column.name}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggler(column);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          className="accent-accent size-4 cursor-pointer"
                          placeholder="column"
                          type="checkbox"
                          checked={selected?.includes(column?.name.toString())}
                          onChange={() => {}} // Controlled by onClick above
                          onClick={(e) => e.stopPropagation()}
                          readOnly
                        />
                        {column.name}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Dropdown.Content>
          </Dropdown>

          {slot && <>{slot}</>}
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border px-4">
        <Table className="w-full">
          <Table.Header>
            <Table.Row>
              {processedColumns?.map((head, index) => (
                <Table.Head
                  key={`header-${head.field as string}-${index}`}
                  style={head.style}
                >
                  {head.isSortable && isViewSort ? (
                    <button
                      className="flex items-center gap-2"
                      onClick={() => handleSortClick(head.field as string)}
                      type="button"
                      disabled={status === "loading"}
                    >
                      <div>
                        {head.head ? head.head({ head: head }) : head.name}
                      </div>
                      {status !== "loading" &&
                        getSortIcon(head.field as string, currentSort)}
                    </button>
                  ) : (
                    <>{head.head ? head.head({ head: head }) : head.name}</>
                  )}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {status === "loading" ? (
              // Loading skeleton
              <SkeletonTableRows
                rows={currentLimit}
                cells={processedColumns?.length || 1}
              />
            ) : status === "error" ? (
              // Error state
              <Table.Row>
                <Table.Cell
                  colSpan={processedColumns.length}
                  className="text-destructive py-8 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span>Failed to load data</span>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : paginatedData.length === 0 ? (
              // Empty state
              <Table.Row>
                <Table.Cell
                  colSpan={processedColumns.length}
                  className="text-muted-foreground py-8 text-center"
                >
                  No data available
                </Table.Cell>
              </Table.Row>
            ) : (
              // Normal data
              paginatedData.map((row, rowIndex) => (
                <Table.Row key={`row-${rowIndex}`}>
                  {processedColumns.map((head, cellIndex) => (
                    <Table.Cell
                      key={`cell-${rowIndex}-${cellIndex}`}
                      style={head.style}
                    >
                      <CellContent
                        index={rowIndex}
                        row={row}
                        cell={getFieldValue(row, head.field)}
                        formatter={head.cell}
                      />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {isViewPagination && totalCount > 0 && (
        <Pagination
          total={totalCount}
          limit={currentLimit}
          page={currentPage}
          setLimit={handleLimitChange}
          setPage={handlePageChange}
        />
      )}
    </div>
  );
};

export default DataTable;

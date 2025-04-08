"use client";

import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableProps, Payment } from "./types";
import { useState, useEffect } from "react";
import PaymentForm from "./form";
import axios from "axios";
import DatePicker from "react-datepicker";
import { addMonths } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
  const value = row.getValue(columnId);
  return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
};

interface ExtendedDataTableProps<TData, TValue>
  extends DataTableProps<TData, TValue> {
  onDataChange: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  onDataChange,
}: ExtendedDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters: selectedDate
        ? [
            ...columnFilters,
            {
              id: "data",
              value: selectedDate,
            },
          ]
        : columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      dateFilter: (row, columnId, filterValue) => {
        const rowDate = new Date(row.getValue(columnId));
        const filterDate = new Date(filterValue);
        rowDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        return rowDate.getTime() === filterDate.getTime();
      },
    },
  });

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      setSelectedPayment(e.detail);
      setShowUpdateModal(true);
    };

    const handleDelete = (e: CustomEvent) => {
      setSelectedPayment(e.detail);
      setShowDeleteModal(true);
    };

    window.addEventListener("updatePayment", handleUpdate as EventListener);
    window.addEventListener("deletePayment", handleDelete as EventListener);

    return () => {
      window.removeEventListener(
        "updatePayment",
        handleUpdate as EventListener
      );
      window.removeEventListener(
        "deletePayment",
        handleDelete as EventListener
      );
    };
  }, []);

  const handleUpdateSubmit = async (updatedData: Payment) => {
    try {
      await axios.put(
        `https://esthetiquebasilixbackend.onrender.com/tasks/${updatedData._id}`,
        updatedData
      );
      setShowUpdateModal(false);
      onDataChange();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update payment");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedPayment?._id) {
      try {
        await axios.delete(
          `https://esthetiquebasilixbackend.onrender.com/tasks/${selectedPayment._id}`
        );
        if (onDataChange) onDataChange();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete payment");
      }
    }
  };

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0;
  };

  const dataToString = (data: Date | null | string): string => {
    if (!data) return "";
    const date = typeof data === "string" ? new Date(data) : data;
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search ..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-full"
        />
      </div>
      <div className="flex items-center pb-4 gap-2">
        <DatePicker
          selected={selectedDate ? new Date(selectedDate) : null}
          onChange={(date: Date | null) => setSelectedDate(dataToString(date))}
          filterDate={isWeekday}
          minDate={new Date()}
          maxDate={addMonths(new Date(), 2)}
          className="form-control border rounded-md !w-full h-10 !m-0"
          placeholderText="Select Date"
          dateFormat="yyyy-MM-dd"
        />
        <Button onClick={() => setSelectedDate(null)}>Toutes</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <PaymentForm
              data={data as Payment[]}
              initialData={selectedPayment}
              onSubmitSuccess={() => handleUpdateSubmit} // Pass the function directly
            />
            <Button onClick={() => setShowUpdateModal(false)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Sigur doriți să ștergeți această înregistrare?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

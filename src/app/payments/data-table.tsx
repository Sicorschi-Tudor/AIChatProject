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
import { parseDateFromString, formatDateToNewFormat, formatDateToOldFormat } from "@/lib/dateUtils";

// Filtru global
const globalFilterFn = (row: { getValue: (columnId: string) => unknown }, columnId: string, filterValue: string): boolean => {
  const value = row.getValue(columnId);
  return value?.toString().toLowerCase().includes(filterValue.toLowerCase()) ?? false;
};

interface ExtendedDataTableProps<TData, TValue> extends DataTableProps<TData, TValue> {
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

  // --- React Table ---
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
            ...columnFilters.filter((f) => f.id !== "data"),
            { id: "data", value: selectedDate },
          ]
        : columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      dateFilter: (row, columnId, filterValue) => {
        const rowDate = parseDateFromString(row.getValue(columnId) as string);
        const filterDate = parseDateFromString(filterValue as string);
        if (!rowDate || !filterDate) return false;
        rowDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        return rowDate.getTime() === filterDate.getTime();
      },
    },
  });

  // --- Listenere pentru update/delete ---
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
      window.removeEventListener("updatePayment", handleUpdate as EventListener);
      window.removeEventListener("deletePayment", handleDelete as EventListener);
    };
  }, []);

  // --- Handlere ---
  const handleUpdateSubmit = async (updatedData: Payment) => {
    try {
      await axios.put(
        `https://esthetiquebasilixbackend.onrender.com/tasks/${updatedData._id}`,
        { ...updatedData, data: formatDateToOldFormat(updatedData.data) }
      );

      await axios.get(
        "https://esthetiquebasilixbackend.onrender.com/sentemail",
        {
          params: {
            data: formatDateToOldFormat(updatedData.data),
            email: updatedData.email,
            name: updatedData.name,
            service: updatedData.service,
            surname: updatedData.surname,
            tel: updatedData.tel,
            time: updatedData.time,
          },
        }
      );

      setShowUpdateModal(false);
      onDataChange();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update payment");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment?._id) return;
    try {
      await axios.delete(
        `https://esthetiquebasilixbackend.onrender.com/tasks/${selectedPayment._id}`
      );
      await axios.get(
        "https://esthetiquebasilixbackend.onrender.com/sentemailDelete",
        {
          params: {
              data: formatDateToOldFormat(selectedPayment.data),
              email: selectedPayment.email,
              name: selectedPayment.name,
              service: selectedPayment.service,
              surname: selectedPayment.surname,
              tel: selectedPayment.tel,
              time: selectedPayment.time,
},
        }
      );
      setShowDeleteModal(false);
      onDataChange();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete payment");
    }
  };

  const isWeekday = (date: Date) => date.getDay() !== 0;

  return (
    <div>
      {/* Search */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search ..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-full"
        />
      </div>

      {/* Filter by date */}
      <div className="flex items-center pb-4 gap-2">
        <DatePicker
          selected={selectedDate ? parseDateFromString(selectedDate) : null}
          onChange={(date: Date | null) => setSelectedDate(formatDateToNewFormat(date))}
          filterDate={isWeekday}
          minDate={new Date()}
          maxDate={addMonths(new Date(), 2)}
          className="form-control border rounded-md !w-full h-10 !m-0"
          placeholderText="Select Date"
          dateFormat="dd-MM-yyyy"
        />
        <Button onClick={() => setSelectedDate(null)}>Toutes</Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {cell.column.id === "data"
                        ? formatDateToNewFormat(cell.getValue() as string)
                        : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>First</Button>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last</Button>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <PaymentForm
              data={data as Payment[]}
              initialData={selectedPayment}
              onSubmitSuccess={() => handleUpdateSubmit(selectedPayment)}
            />
            <Button onClick={() => setShowUpdateModal(false)} className="mt-4">Close</Button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Sigur doriți să ștergeți această înregistrare?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

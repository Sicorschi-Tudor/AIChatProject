"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Payment } from "./types";

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "surname",
    header: "Surname",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "tel",
    header: "Phone",
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "data",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    id: "update",
    header: "Update",
    cell: ({ row }) => (
      <Button
        variant="outline"
        onClick={() => {
          const updateEvent = new CustomEvent("updatePayment", {
            detail: row.original,
          });
          window.dispatchEvent(updateEvent);
        }}
      >
        Update
      </Button>
    ),
  },
  {
    id: "delete",
    header: "Delete",
    cell: ({ row }) => (
      <Button
        variant="destructive"
        onClick={() => {
          const deleteEvent = new CustomEvent("deletePayment", {
            detail: row.original,
          });
          window.dispatchEvent(deleteEvent);
        }}
      >
        Delete
      </Button>
    ),
  },
];

"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "../api/payments_list";
import { columns } from "../payments/columns";
import { DataTable } from "../payments/data-table";
import PaymentForm from "../payments/form";

export default function PaymentsPage() {
  const { isLoading, data, isError, error, refetch } = useQuery({
    queryKey: ["payments"],
    queryFn: () => getData(),
  });

  if (isLoading || isError) {
    return (
      <div className="flex items-center justify-center h-screen text-4xl font-bold">
        {isLoading ? "Loading..." : `Error: ${error && error.message}`}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5 px-4">
      <PaymentForm data={data} />
      <DataTable columns={columns} data={data} />
    </div>
  );
}

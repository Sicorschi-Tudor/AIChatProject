"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getData } from "../api/payments_list";
import { columns } from "../payments/columns";
import { DataTable } from "../payments/data-table";
import PaymentForm from "../payments/form";

export default function PaymentsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const {
    isLoading,
    data = [],
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: () => getData(),
    enabled: isLoggedIn,
  });

  const handleLogin = () => {
    if (login === "esthetiquebasilix" && password === "Esba1103") {
      setIsLoggedIn(true);
    } else {
      alert("nu ati introdus login sau parola corect");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Intrati
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || isError) {
    return (
      <div className="flex items-center justify-center h-screen text-4xl font-bold">
        {isLoading
          ? "Loading..."
          : `Error: ${error?.message || "An error occurred"}`}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5 px-4">
      <PaymentForm data={data} onSubmitSuccess={() => refetch()} />
      <DataTable columns={columns} data={data} onDataChange={() => refetch()} />
    </div>
  );
}

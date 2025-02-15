"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/ui/navbar";
import HomePage from "./pages";
import PaymentsPage from "./pages/payments";
import { Routes, Route } from "react-router-dom";

const Router = dynamic(
  () => import("react-router-dom").then((mod) => mod.BrowserRouter),
  { ssr: false }
);

function Home() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </Router>
  );
}

export default Home;

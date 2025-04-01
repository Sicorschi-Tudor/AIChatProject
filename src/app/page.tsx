"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/ui/navbar";
import PaymentsPage from "./pages/payments";
import { Routes, Route } from "react-router-dom";

const Router = dynamic(() =>
  import("react-router-dom").then((mod) => mod.BrowserRouter)
);

function Home() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PaymentsPage />} />
      </Routes>
    </Router>
  );
}

export default Home;

"use client";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import HomePage from "./pages";
import PaymentsPage from "./pages/payments";

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

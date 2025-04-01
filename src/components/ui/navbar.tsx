"use client";

import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex justify-around">
        <li>
          <Link to="/" className="text-white hover:text-gray-300 transition">
            Esthetiquebasilix Admin Page
          </Link>
        </li>
      </ul>
    </nav>
  );
}

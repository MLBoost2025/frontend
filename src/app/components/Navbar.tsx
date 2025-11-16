"use client";

import { useState } from "react";

interface NavbarProps {
  onLogout?: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({
  onLogout,
  isSidebarOpen = true,
}: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.log("Logout clicked");
      // TODO: Add logout API call here
    }
  };

  return (
    <nav
      className={`h-16 bg-white border-b border-gray-200 fixed top-0 right-0 z-10 px-6 flex items-center justify-end transition-all duration-300 ${
        isSidebarOpen ? "left-60" : "left-0"
      }`}
    >
      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          aria-label="Notifications"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            A
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

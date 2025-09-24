import React from "react";
import { NavLink } from "react-router-dom";

const navLinks = [
  { path: "/", name: "Chunks" },
  { path: "/rag-console", name: "RagConsole" },
  { path: "/rag-master", name: "Master"},
  { path: "/ingestion-engine", name: "Ingestion Engine"}
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <nav
      className={`bg-white transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-56" : "w-16"
      } p-4 flex flex-col items-center shadow-lg`}
    >
      <div className="flex items-center w-full gap-4 justify-between">
        
        {isSidebarOpen && <p className="text-lg font-bold">RagLab</p>}
        <button
          onClick={toggleSidebar}
          className="rounded-lg text-gray-700 hover:bg-gray-200 focus:outline-none"
        >
          {isSidebarOpen ? (
            <div className="pt-1 px-1">
              <span className="material-symbols-outlined">
                chevron_backward
              </span>
            </div>
          ) : (
            <div className="pt-1 px-1">
              <span className="material-symbols-outlined">chevron_forward</span>
            </div>
          )}
        </button>
      </div>

      {isSidebarOpen && (
        <ul className="mt-4 w-full space-y-2">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `block p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200 text-gray-700"
                  } text-sm`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Sidebar;

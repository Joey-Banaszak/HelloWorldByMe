import React from "react";
import Sidebar from "./Sidebar"; // ✅ Ensure Sidebar is imported
import "./styles.css";

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />  {/* Sidebar will always be visible */}
      <div className="main-content">
        {children}  {/* This will show the page content */}
      </div>
    </div>
  );
};

export default Layout;

import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block z-20">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6 md:p-8 relative z-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden z-20">
        <Sidebar mobile />
      </div>
    </div>
  );
};

export default Layout;

import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 dark:bg-background transition-colors duration-200">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/20 blur-3xl dark:bg-orange-900/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-900/10" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ToastProvider } from '../common/Toast';

export const Layout: React.FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-20 pt-4 px-4 safe-area-top">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
};
import React from 'react';
import { Home, Package, ClipboardList, Calculator } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <Home className="w-6 h-6" /> },
  { path: '/materials', label: 'Materials', icon: <Package className="w-6 h-6" /> },
  { path: '/products', label: 'Products', icon: <ClipboardList className="w-6 h-6" /> },
  { path: '/calculator', label: 'Calculator', icon: <Calculator className="w-6 h-6" /> },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2.5 transition-colors touch-manipulation ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className={isActive ? 'text-primary-600' : 'text-gray-400'}>{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
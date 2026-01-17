import React from 'react';
import { Store, ShoppingBag, Scan, User } from 'lucide-react';
import { NavItem } from '../types';

interface BottomNavProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeItem, onNavigate }) => {
  const navClass = (item: NavItem) => 
    `flex flex-col items-center justify-center w-full h-full p-2 transition-colors duration-200 ${
      activeItem === item ? 'text-[#FF4522] scale-110' : 'text-gray-400 hover:text-[#FF4522]/60'
    }`;

  return (
    <nav className="bg-white border-t border-gray-100 h-20 flex justify-between items-center px-4 pb-safe z-30 relative shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      <button onClick={() => onNavigate(NavItem.HOME)} className={navClass(NavItem.HOME)}>
        <Store className="w-6 h-6" strokeWidth={activeItem === NavItem.HOME ? 2.5 : 2} />
        <span className="text-[10px] font-bold mt-1">Data</span>
      </button>
      <button onClick={() => onNavigate(NavItem.MARKET)} className={navClass(NavItem.MARKET)}>
        <ShoppingBag className="w-6 h-6" strokeWidth={activeItem === NavItem.MARKET ? 2.5 : 2} />
        <span className="text-[10px] font-bold mt-1">Shop</span>
      </button>
      
      {/* Floating Center Button Style for Scan */}
      <button onClick={() => onNavigate(NavItem.SCAN)} className="relative -top-5">
         <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${activeItem === NavItem.SCAN ? 'bg-[#FF4522] text-white ring-4 ring-orange-100' : 'bg-black text-white'}`}>
            <Scan className="w-7 h-7" strokeWidth={2.5} />
         </div>
         <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold ${activeItem === NavItem.SCAN ? 'text-[#FF4522]' : 'text-gray-400'}`}>Pay</span>
      </button>

      <button onClick={() => onNavigate(NavItem.PROFILE)} className={navClass(NavItem.PROFILE)}>
        <User className="w-6 h-6" strokeWidth={activeItem === NavItem.PROFILE ? 2.5 : 2} />
        <span className="text-[10px] font-bold mt-1">Profile</span>
      </button>
    </nav>
  );
};
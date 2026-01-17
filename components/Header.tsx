import React, { useState } from 'react';
import { Store, Bell, Gift, ShoppingCart, MapPin, Star, Settings, Server, LogOut, History, User, Wallet, ChevronDown, Check, X } from 'lucide-react';
import { User as UserType, Notification, CartItem } from '../types';

interface HeaderProps {
  user: UserType;
  notifications: Notification[];
  cart: CartItem[];
  onLogout: () => void;
  onOpenCart: () => void;
  onClearNotifications: () => void;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, notifications, cart, onLogout, onOpenCart, onClearNotifications, onToggleLanguage 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm z-40 sticky top-0 transition-all duration-300">
      {/* Brand & Wallet */}
      <div className="flex items-center gap-2">
        <div className="bg-[#FF4522] p-1.5 rounded-lg text-white shadow-lg shadow-orange-200">
            <Store className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
            <h1 className="text-[#FF4522] text-lg font-black tracking-tighter">
            Atangana<span className="text-black">Shop</span>
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 rounded-full w-fit mt-0.5">
                <Wallet className="w-3 h-3" />
                <span>{user.balance.toLocaleString()} FCFA</span>
            </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-500 hover:text-[#FF4522] transition relative bg-gray-50 rounded-full hover:bg-orange-50">
            <MapPin className="w-5 h-5" />
        </button>
        
        <button onClick={onOpenCart} className="p-2 text-gray-500 hover:text-[#FF4522] transition relative bg-gray-50 rounded-full hover:bg-orange-50">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4522] text-white text-[9px] flex items-center justify-center rounded-full font-bold animate-bounce">
                    {cart.length}
                </span>
            )}
        </button>
        
        {/* Notifications */}
        <div className="relative">
            <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }} 
                className="p-2 text-gray-500 hover:text-[#FF4522] transition bg-gray-50 rounded-full hover:bg-orange-50 relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            
            {showNotifications && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Notifications</h4>
                        <button onClick={onClearNotifications} className="text-[10px] text-[#FF4522] font-bold hover:underline">CLEAR ALL</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-xs">No new notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="flex gap-3 items-start p-3 border-b border-gray-50 hover:bg-gray-50 transition">
                                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{n.title}</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed">{n.message}</p>
                                        <p className="text-[9px] text-gray-300 mt-1">{n.date.toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Settings Dropdown */}
        <div className="relative">
            <button onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }} className="p-1 rounded-full hover:bg-gray-100 transition">
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
            </button>
            
            {showSettings && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in zoom-in-95 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{user.name || 'User'}</p>
                            <p className="text-[10px] text-gray-400">{user.mobile}</p>
                        </div>
                    </div>
                    <div className="p-1 space-y-1">
                        <button onClick={onToggleLanguage} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition">
                            <div className="flex items-center gap-3"><GlobeIcon className="w-4 h-4 text-blue-500" /> Language</div>
                            <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded uppercase">{user.language}</span>
                        </button>
                         <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition">
                            <History className="w-4 h-4 text-purple-500" /> Transactions
                        </button>
                        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition">
                            <div className="flex items-center gap-3"><Server className="w-4 h-4 text-green-500" /> Server Status</div>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition font-medium">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

const GlobeIcon = ({className}: {className?: string}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
);
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Dumbbell, ShoppingBag, MessageSquare, Calendar, LogOut, Trophy } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-serif text-xl text-navy font-bold tracking-wide">COREKAYA</span>
          <span className="ml-2 text-xs text-orange font-bold uppercase tracking-widest">Admin</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link href="/admin/overview" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-navy hover:bg-gray-50">
            <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
            Overview
          </Link>
          <Link href="/admin/workouts" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-navy hover:bg-gray-50">
            <Dumbbell className="mr-3 h-5 w-5 text-gray-400" />
            Workouts
          </Link>
          <Link href="/admin/products" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-navy hover:bg-gray-50">
            <ShoppingBag className="mr-3 h-5 w-5 text-gray-400" />
            Products
          </Link>
          <Link href="/admin/quotes" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-navy hover:bg-gray-50">
            <MessageSquare className="mr-3 h-5 w-5 text-gray-400" />
            Quotes
          </Link>
          <Link href="/admin/schedule" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-navy hover:bg-gray-50">
            <Calendar className="mr-3 h-5 w-5 text-gray-400" />
            Schedule
          </Link>
          <Link href="/admin/gamification" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-navy hover:bg-gray-50">
            <Trophy className="mr-3 h-5 w-5 text-gray-400" />
            Gamification
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
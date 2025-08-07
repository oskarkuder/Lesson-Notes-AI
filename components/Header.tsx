import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';

const BrainIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.25 2 7 4.25 7 7C7 8.67 7.84 10.13 9 11V12.5C9 13.05 8.55 13.5 8 13.5C7.45 13.5 7 13.05 7 12.5V11.23C5.73 10.5 5 9.19 5 7.7C5 6.77 5.37 5.92 6 5.26V4.5C6 3.67 6.67 3 7.5 3S9 3.67 9 4.5V5.23C10.27 5.94 11.13 7.23 11.13 8.7C11.13 9.77 10.76 10.74 10.13 11.5L10.93 12.3C11.56 11.67 12 10.88 12 10C12 8.33 10.67 7 9 7C7.33 7 6 8.33 6 10C6 10.88 6.44 11.67 7.07 12.3L6.27 13.1C5.64 12.47 5.13 11.68 5.13 10.8C5.13 9.13 6.46 7.8 8.13 7.8C9.8 7.8 11.13 9.13 11.13 10.8V12.5C11.13 14.16 9.81 15.5 8.13 15.5C6.46 15.5 5.13 14.16 5.13 12.5V12C5.13 11.95 5.14 11.9 5.14 11.85C4.43 12.33 4 13.12 4 14C4 15.66 5.34 17 7 17C8.66 17 10 15.66 10 14V12.5C10 12.22 10.22 12 10.5 12H13.5C13.78 12 14 12.22 14 12.5V14C14 15.66 15.34 17 17 17C18.66 17 20 15.66 20 14C20 13.12 19.57 12.33 18.86 11.85C18.86 11.9 18.87 11.95 18.87 12V12.5C18.87 14.16 17.54 15.5 15.87 15.5C14.19 15.5 12.87 14.16 12.87 12.5V10.8C12.87 9.13 14.2 7.8 15.87 7.8C17.54 7.8 18.87 9.13 18.87 10.8C18.87 11.68 18.36 12.47 17.73 13.1L16.93 12.3C17.56 11.67 18 10.88 18 10C18 8.33 16.67 7 15 7C13.33 7 12 8.33 12 10C12 10.88 12.44 11.67 13.07 12.3L13.87 11.5C13.24 10.74 12.87 9.77 12.87 8.7C12.87 7.23 13.73 5.94 15 5.23V4.5C15 3.67 15.67 3 16.5 3S18 3.67 18 4.5V5.26C18.63 5.92 19 6.77 19 7.7C19 9.19 18.27 10.5 17 11.23V12.5C17 13.05 16.55 13.5 16 13.5C15.45 13.5 15 13.05 15 12.5V11C13.84 10.13 13 8.67 13 7C13 4.25 14.75 2 12 2Z" />
  </svg>
);

const BurgerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface HeaderProps {
    onShowHistory: () => void;
    onLogout: () => void;
    user: User | null;
    onShowPricing: () => void;
    onLoginRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowHistory, onLogout, user, onShowPricing, onLoginRequest }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleMenuClick = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    }

  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 border-b border-slate-200 dark:border-slate-800 relative z-40">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <BrainIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lesson Notes <span className="text-blue-500">AI</span>
          </h1>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {user ? (
                <>
                    {user.plan === 'free' && (
                        <button 
                            onClick={onShowPricing} 
                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                        >
                            Upgrade to Pro
                        </button>
                    )}
                    <button 
                        onClick={onShowHistory} 
                        className="font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md text-sm"
                    >
                        Session History
                    </button>
                     <button 
                        onClick={onLogout} 
                        className="font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md text-sm"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <button 
                        onClick={onShowPricing}
                        className="font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md text-sm"
                    >
                        Pricing
                    </button>
                    <button 
                        onClick={onLoginRequest} 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                    >
                        Login / Sign Up
                    </button>
                </>
            )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open menu"
            >
               <BurgerIcon className="w-6 h-6" />
            </button>
        </div>
      </div>

       {/* Overlay */}
       <div 
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Mobile Side Menu */}
        <div 
            ref={menuRef}
            className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-slate-600 dark:text-slate-300">
                        {user ? <>Welcome, <span className="font-bold">{user.username}</span></> : 'Menu'}
                    </span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                       <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {user ? (
                    <>
                        <nav className="flex flex-col space-y-3">
                            {user.plan === 'free' && (
                                <button onClick={() => handleMenuClick(onShowPricing)} className="w-full text-left bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-4 rounded-lg transition-colors duration-200 animate-pulse">
                                    Upgrade to Pro
                                </button>
                            )}
                            <button onClick={() => handleMenuClick(onShowHistory)} className="w-full text-left bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-lg transition-colors duration-200">
                                Session History
                            </button>
                        </nav>

                        <div className="mt-auto">
                             <button onClick={() => handleMenuClick(onLogout)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200">
                               Logout
                             </button>
                        </div>
                    </>
                ) : (
                    <nav className="flex flex-col space-y-3">
                        <button onClick={() => handleMenuClick(onLoginRequest)} className="w-full text-left bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200">
                            Login / Sign Up
                        </button>
                        <button onClick={() => handleMenuClick(onShowPricing)} className="w-full text-left bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-lg transition-colors duration-200">
                            View Pricing
                        </button>
                    </nav>
                )}
            </div>
        </div>
    </header>
  );
};
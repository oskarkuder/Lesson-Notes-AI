import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import * as auth from '../services/authService';

// Add type declaration for the global `google` object
declare global {
  interface Window {
    google: any;
  }
}

// --- PLACEHOLDERS: Replace with your actual credentials ---
const GOOGLE_CLIENT_ID = '285721156413-o9p4c9vvgemvnm6q28s6m8823vc0k80n.apps.googleusercontent.com';

const CloseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
  onClose: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isGoogleSignInConfigured = !GOOGLE_CLIENT_ID.startsWith('YOUR_');

  const handleGoogleCallback = async (response: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const user = await auth.handleGoogleSignIn(payload);
        onLoginSuccess(user);
      } catch (err) {
        console.error("Google Sign-In Error:", err);
        setError("Google sign-in failed. Please try again.");
        setIsLoading(false);
      }
  };
  
  const handleGoogleSignInClick = () => {
      if (!isGoogleSignInConfigured) return;
      try {
          if (window.google) {
              window.google.accounts.id.prompt();
          } else {
               throw new Error("Google API not loaded");
          }
      } catch(e) {
          console.error("Google Sign In prompt error", e);
          setError("Could not start Google Sign-In. Please try again.");
      }
  };
  
  useEffect(() => {
    if (isGoogleSignInConfigured && window.google) {
      try {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
        });
      } catch(e) { console.error("Google Sign In initialization error", e); }
    }
  }, [isGoogleSignInConfigured]);


  return (
    <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8">
      <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <CloseIcon className="w-6 h-6" />
      </button>

      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200 mb-2">
        Get Started
      </h2>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
        Sign in to save notes and access your session history.
      </p>

        {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="space-y-3 mb-6">
            <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isLoading || !isGoogleSignInConfigured}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700/20 hover:bg-slate-50 dark:hover:bg-slate-700/40 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                title={!isGoogleSignInConfigured ? 'Google Sign-In is not configured by the developer.' : 'Sign in with Google'}
            >
                <GoogleIcon className="w-5 h-5" />
                Sign in with Google
            </button>
             {!isGoogleSignInConfigured && (
                <div className="text-xs text-center text-orange-600 dark:text-orange-400 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                    <strong>Developer Note:</strong> Social sign-in is disabled. A developer must provide a valid Google Client ID to enable it.
                </div>
            )}
        </div>

      <div className="mt-6 p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-center text-xs text-yellow-800 dark:text-yellow-300">
        <strong>Disclaimer:</strong> This is a demo application. User data is stored locally in your browser and is not secured for production use.
      </div>
    </div>
  );
};
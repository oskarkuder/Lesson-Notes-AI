
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center bg-white dark:bg-slate-800/50 rounded-xl shadow-lg">
      <div className="w-12 h-12 border-4 border-t-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
        {message}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Please don't close this window.
      </p>
    </div>
  );
};

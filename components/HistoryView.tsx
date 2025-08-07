
import React from 'react';
import type { NoteData } from '../types';

interface HistoryViewProps {
  notes: NoteData[];
  onLoadNote: (id: number) => void;
  onDeleteNote: (id: number) => void;
  onBack: () => void;
}

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const HistoryView: React.FC<HistoryViewProps> = ({ notes, onLoadNote, onDeleteNote, onBack }) => {
  return (
    <div className="w-full max-w-4xl bg-white dark:bg-slate-800/50 rounded-xl shadow-2xl p-6 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
          <HistoryIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
          Session History
        </h2>
        <button onClick={onBack} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex-shrink-0">
          New Session
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">
          You have no saved recordings yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {notes.map(note => (
            <li key={note.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg sm:text-xl text-blue-600 dark:text-blue-400">{note.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                <button 
                  onClick={() => onLoadNote(note.id!)}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 sm:px-4 rounded-md transition-colors duration-200 text-sm sm:text-base"
                >
                  View
                </button>
                <button 
                  onClick={() => onDeleteNote(note.id!)} 
                  aria-label="Delete note"
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <TrashIcon className="w-6 h-6"/>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

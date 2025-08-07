
import React, { useState, useEffect } from 'react';
import type { NoteData, User } from '../types';
import jsPDF from 'jspdf';

interface NotesDisplayProps {
  note: NoteData;
  onReset: () => void;
  audioBlob: Blob | null;
  onSave: (note: NoteData) => void;
  onUpdateNote: (note: NoteData) => void;
  isSaved: boolean;
  userPlan: User['plan'];
  onUpgradeRequest: () => void;
  isLoggedIn: boolean;
  onRequestLogin: () => void;
}

// Icons
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);
const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);


export const NotesDisplay: React.FC<NotesDisplayProps> = ({ note, onReset, audioBlob, onSave, onUpdateNote, isSaved, userPlan, onUpgradeRequest, isLoggedIn, onRequestLogin }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(note.title);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditableTitle(note.title);
  }, [note.title]);

  useEffect(() => {
      if (isEditingTitle && titleInputRef.current) {
          titleInputRef.current.focus();
          titleInputRef.current.select();
      }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
      setIsEditingTitle(false);
      if (editableTitle.trim() && editableTitle !== note.title) {
          onUpdateNote({ ...note, title: editableTitle.trim() });
      } else {
          setEditableTitle(note.title);
      }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleTitleBlur();
      } else if (e.key === 'Escape') {
          setEditableTitle(note.title);
          setIsEditingTitle(false);
      }
  };

  const handleDownloadAudio = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const safeTitle = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `recording_${safeTitle || 'audio'}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const handleDownloadPdf = () => {
    if (!isLoggedIn) {
        onRequestLogin();
        return;
    }
    if (userPlan === 'free') {
        onUpgradeRequest();
        return;
    }
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.width;
    const margin = 15;
    const maxWidth = pageW - margin * 2;
    let y = 20;

    const addWrappedText = (text: string, options: { x: number, y: number, size: number, style: string, isListItem?: boolean, lineSpacing?: number }) => {
        doc.setFontSize(options.size);
        doc.setFont('helvetica', options.style);
        const lines = doc.splitTextToSize(text, options.isListItem ? maxWidth - 5 : maxWidth);
        lines.forEach((line: string, index: number) => {
            if (y > doc.internal.pageSize.height - 20) {
                doc.addPage();
                y = 20;
            }
            let lineToPrint = line;
            if (options.isListItem && index === 0) {
              doc.text('\u2022', options.x, y); // Bullet point
              lineToPrint = ` ${line}`;
            }
            doc.text(lineToPrint, options.isListItem ? options.x + 3 : options.x, y);
            y += options.lineSpacing || 7;
        });
        return y;
    };
    
    y = addWrappedText(note.title, { x: margin, y, size: 24, style: 'bold', lineSpacing: 10});
    y += 5;

    // Summary
    y = addWrappedText('Summary', { x: margin, y, size: 18, style: 'bold', lineSpacing: 8});
    y = addWrappedText(note.summary, { x: margin, y, size: 12, style: 'normal' });
    y += 10;

    // Key Topics
    y = addWrappedText('Key Topics', { x: margin, y, size: 18, style: 'bold', lineSpacing: 8});
    note.keyTopics.forEach(topic => {
      y = addWrappedText(topic.topic, { x: margin, y, size: 14, style: 'bold' });
      topic.points.forEach(point => {
        y = addWrappedText(point, { x: margin, y, size: 12, style: 'normal', isListItem: true });
      });
      y += 5;
    });

    // Transcription
    if (y > 20) doc.addPage();
    y=20;
    y = addWrappedText('Full Transcription', { x: margin, y, size: 18, style: 'bold', lineSpacing: 8});
    addWrappedText(note.transcription, { x: margin, y, size: 10, style: 'normal', lineSpacing: 5 });

    const safeTitle = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`notes_${safeTitle || 'generated'}.pdf`);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800/50 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 xl:p-12 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 gap-4">
        <div className="flex-grow w-full">
          {isEditingTitle ? (
            <input 
              ref={titleInputRef}
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
            />
          ) : (
            <div className="group flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{note.title}</h2>
                <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-blue-500 flex-shrink-0">
                    <EditIcon className="w-6 h-6"/>
                </button>
            </div>
          )}
          <p className="text-green-600 dark:text-green-400 flex items-center gap-2 mt-2 font-medium text-base sm:text-lg">
            <CheckCircleIcon className="w-6 h-6" />
            Notes Generated Successfully
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full mt-4 md:mt-0 md:w-auto md:flex-shrink-0">
          <button onClick={() => onSave(note)} disabled={isSaved} className="bg-green-500 hover:bg-green-600 disabled:bg-green-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            {isSaved ? 'Saved' : 'Save to History'}
          </button>
          {audioBlob && (
              <button onClick={handleDownloadAudio} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                <DownloadIcon className="w-5 h-5" /> Audio
              </button>
          )}
          <button 
            onClick={handleDownloadPdf}
            className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            title={userPlan === 'free' ? 'Upgrade to Pro to download as PDF' : 'Download as PDF'}
          >
            <DownloadIcon className="w-5 h-5" /> PDF
            {userPlan === 'free' && <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">PRO</span>}
          </button>
          <button onClick={onReset} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
            Start New Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
        {/* Transcription Column */}
        <div className="flex flex-col">
            <h3 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
                <DocumentTextIcon className="w-7 h-7" />
                Transcription
            </h3>
            <div className="flex-grow h-[50vh] lg:h-[70vh] overflow-y-auto p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-700 text-base">
                {note.transcription || "No transcription available."}
            </div>
        </div>

        {/* Notes Column */}
        <div className="space-y-8 mt-8 lg:mt-0">
          <div>
            <h3 className="text-2xl font-semibold mb-3 text-slate-700 dark:text-slate-300">Summary</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-lg">{note.summary}</p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Key Topics</h3>
            <div className="space-y-4">
              {note.keyTopics.map((topic, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg">
                  <h4 className="font-semibold text-xl text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <BookOpenIcon className="w-6 h-6"/>
                      {topic.topic}
                  </h4>
                  <ul className="list-disc list-inside mt-3 space-y-2 pl-2 text-slate-600 dark:text-slate-400 text-base">
                    {topic.points.map((point, pIndex) => (
                      <li key={pIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

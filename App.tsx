
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { RecorderControl } from './components/RecorderControl';
import { NotesDisplay } from './components/NotesDisplay';
import { Loader } from './components/Loader';
import { HistoryView } from './components/HistoryView';
import { AuthView } from './components/AuthView';
import { PricingView } from './components/PricingView';
import { PaymentView } from './components/PaymentView';
import { generateNotesFromAudio } from './services/geminiService';
import * as db from './services/dbService';
import * as auth from './services/authService';
import type { NoteData, User } from './types';
import { Status, AppState } from './types';
import { IntroContent } from './components/IntroContent';
import { RecordingOptions } from './components/RecordingOptions';

export const languages = [
    { value: 'auto', label: 'Automatic Recognition' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'it-IT', label: 'Italian' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'ko-KR', label: 'Korean' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' },
    { value: 'ru-RU', label: 'Russian' },
    { value: 'zh-CN', label: 'Mandarin (Simplified)' },
    { value: 'sl-SI', label: 'Slovenian' },
    { value: 'nl-NL', label: 'Dutch' },
    { value: 'hi-IN', label: 'Hindi' },
    { value: 'ar-EG', label: 'Arabic (Egypt)' },
    { value: 'zh-TW', label: 'Mandarin (Traditional)' }
];

export const recordingDurations = [
    { value: 300, label: '5 Minutes' },
    { value: 600, label: '10 Minutes' },
    { value: 1800, label: '30 Minutes' },
    { value: 0, label: 'Unlimited' },
];


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ status: Status.LOADING });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isCurrentSessionSaved, setIsCurrentSessionSaved] = useState(false);
  const [history, setHistory] = useState<NoteData[]>([]);
  const [language, setLanguage] = useState<string>('auto');
  const [recordingLimit, setRecordingLimit] = useState<number>(300);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const initialize = async () => {
        await db.initDB();
        const sessionUser = auth.getCurrentUserSession();
        if (sessionUser) {
            handleLoginSuccess(sessionUser, false); // Don't show modal on initial load
        }
        setAppState({ status: Status.IDLE });
    };
    initialize();
  }, []);

  const requestLogin = () => {
    if (appState.status === Status.SUCCESS && !isCurrentSessionSaved) {
      if (!window.confirm("To save notes, you need an account. Continue to sign in? Your current unsaved notes will be lost.")) {
        return;
      }
    }
    setShowAuthModal(true);
  };

  const handleLoginSuccess = async (user: User, closeModal = true) => {
    setCurrentUser(user);
    auth.setCurrentUserSession(user);
    const userNotes = await db.getAllNotes(user.id);
    setHistory(userNotes);
    if(closeModal) setShowAuthModal(false);
    
    // If user was trying to access something, they can now.
    // We can go to idle state to present a fresh screen.
    if(appState.status !== Status.IDLE) {
        handleReset(true); // Force reset without confirm dialog
    }
  };
  
  const handleLogout = () => {
    auth.clearCurrentUserSession();
    setCurrentUser(null);
    setHistory([]);
    handleReset(true); // Reset to main screen
  };

  const handleStopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setIsCurrentSessionSaved(false);
    if (appState.status === Status.RECORDING) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setAppState({ status: Status.GENERATING });
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);

        try {
          // A guest user has a dummy userId of 0, which won't be saved.
          const userId = currentUser ? currentUser.id : 0;
          const partialNotes = await generateNotesFromAudio(blob, language);
          const completeNote: NoteData = { ...partialNotes, userId };
          setAppState({ status: Status.SUCCESS, note: completeNote });
          setIsCurrentSessionSaved(false);
        } catch (err) {
          console.error("Error generating notes:", err);
          setError("Sorry, I couldn't generate the notes. The recording might be too short or an error occurred.");
          setAppState({ status: Status.ERROR });
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setAppState({ status: Status.RECORDING });
      setElapsedTime(0);

      timerRef.current = window.setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          if (recordingLimit > 0 && newTime >= recordingLimit) {
            handleStopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access was denied. Please enable it in your browser settings to use this feature.");
      setAppState({ status: Status.ERROR });
    }
  }, [appState.status, handleStopRecording, currentUser, language, recordingLimit]);

  const handleReset = (force = false) => {
    if (!force && appState.status === Status.SUCCESS && !isCurrentSessionSaved) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to start a new session? Your current notes will be lost.")) {
            return;
        }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setAppState({ status: Status.IDLE });
    setError(null);
    audioChunksRef.current = [];
    setAudioBlob(null);
    setElapsedTime(0);
    setIsCurrentSessionSaved(false);
  };

  const handleSave = async (noteToSave: NoteData) => {
    if (!currentUser) {
        requestLogin();
        return;
    }
    if (!audioBlob) return;
    try {
        const saved = await db.saveNote({...noteToSave, userId: currentUser.id}, audioBlob);
        setAppState({ status: Status.SUCCESS, note: saved });
        setIsCurrentSessionSaved(true);
        const notes = await db.getAllNotes(currentUser.id);
        setHistory(notes);
    } catch(err) {
        console.error("Failed to save note", err);
        setError("Could not save the note to history.");
    }
  }

  const handleUpdateNote = (updatedNote: NoteData) => {
    if (appState.status === Status.SUCCESS) {
      setAppState({ status: Status.SUCCESS, note: updatedNote });
      setIsCurrentSessionSaved(false);
    }
  };

  const handleShowHistory = async () => {
    if (!currentUser) {
      requestLogin();
      return;
    }
    if (appState.status === Status.SUCCESS && !isCurrentSessionSaved) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to view history? Your current notes will be lost.")) {
            return;
        }
    }
    const notes = await db.getAllNotes(currentUser.id);
    setHistory(notes);
    setAppState({ status: Status.HISTORY });
  };
  
  const handleLoadNote = async (id: number) => {
    if (!currentUser) {
      requestLogin();
      return;
    }
    try {
        const { note, audioBlob } = await db.getNoteWithAudio(id, currentUser.id);
        setAppState({ status: Status.SUCCESS, note });
        setAudioBlob(audioBlob);
        setIsCurrentSessionSaved(true);
    } catch (err) {
        console.error("Failed to load note", err);
        setError("Could not load the selected note.");
        setAppState({ status: Status.ERROR });
    }
  };
  
  const handleDeleteNote = async (id: number) => {
      if (!currentUser) return;
      if (window.confirm("Are you sure you want to permanently delete this note?")) {
          try {
              await db.deleteNote(id, currentUser.id);
              setHistory(prevHistory => prevHistory.filter(note => note.id !== id));
          } catch(err) {
              console.error("Failed to delete note", err);
              setError("Could not delete the note.");
          }
      }
  };

  const handleShowPricing = () => setAppState({ status: Status.PRICING });

  const handleProceedToCheckout = () => {
      if (!currentUser) {
        requestLogin();
        return;
      }
      setAppState({ status: Status.CHECKOUT });
  };
  
  const handlePaymentSuccess = async () => {
      if (!currentUser) {
          setError("An authentication error occurred. Please log in again.");
          setAppState({ status: Status.IDLE });
          requestLogin();
          return;
      }
      try {
          const updatedUser = await auth.updateUserPlan(currentUser.id, 'pro');
          setCurrentUser(updatedUser);
          setAppState({ status: Status.IDLE });
          alert("Congratulations! You've been upgraded to the Pro plan.");
      } catch (err) {
          setError("There was an error upgrading your plan. Please try again.");
          console.error(err);
      }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const renderContent = () => {
    switch (appState.status) {
      case Status.LOADING:
        return <Loader message="Loading application..." />;
      case Status.GENERATING:
        return <Loader message="Analyzing audio and crafting your notes... This might take a moment." />;
      case Status.SUCCESS:
        return (
          <NotesDisplay 
            note={appState.note} 
            onReset={() => handleReset()}
            audioBlob={audioBlob}
            onSave={handleSave}
            onUpdateNote={handleUpdateNote}
            isSaved={isCurrentSessionSaved}
            userPlan={currentUser?.plan || 'free'}
            onUpgradeRequest={handleShowPricing}
            isLoggedIn={!!currentUser}
            onRequestLogin={requestLogin}
          />
        );
      case Status.HISTORY:
        return (
            <HistoryView 
                notes={history}
                onLoadNote={handleLoadNote}
                onDeleteNote={handleDeleteNote}
                onBack={() => handleReset()}
            />
        );
      case Status.PRICING:
        return <PricingView onProceedToCheckout={handleProceedToCheckout} onBack={() => handleReset()} />;
      case Status.CHECKOUT:
        return <PaymentView onPaymentSuccess={handlePaymentSuccess} onBack={() => setAppState({ status: Status.PRICING })} />;
      case Status.ERROR:
      case Status.IDLE:
      case Status.RECORDING:
      default:
        return (
          <div className="text-center w-full">
            {error && <div className="mb-4 text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg max-w-lg mx-auto">{error}</div>}
            
            <RecorderControl
              status={appState.status}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              elapsedTime={elapsedTime}
              maxDuration={recordingLimit}
            />

            <RecordingOptions 
              language={language}
              recordingLimit={recordingLimit}
              onLanguageChange={setLanguage}
              onRecordingLimitChange={setRecordingLimit}
              isDisabled={appState.status === Status.RECORDING}
            />

            {appState.status === Status.IDLE && <IntroContent />}
          </div>
        );
    }
  };

  const containerMaxWidth = appState.status === Status.SUCCESS || appState.status === Status.HISTORY || appState.status === Status.PRICING || appState.status === Status.CHECKOUT ? 'max-w-screen-2xl' : 'max-w-7xl';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header 
        onShowHistory={handleShowHistory} 
        onLogout={handleLogout} 
        user={currentUser} 
        onShowPricing={handleShowPricing}
        onLoginRequest={requestLogin}
      />
      <main className={`container mx-auto ${containerMaxWidth} p-4 sm:p-6 md:p-8 transition-all duration-300`}>
        <div className="flex flex-col items-center justify-center">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-slate-400 dark:text-slate-600">
        <p>Lesson Notes AI - Powered by Google Gemini</p>
      </footer>
       {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAuthModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <AuthView onLoginSuccess={handleLoginSuccess} onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
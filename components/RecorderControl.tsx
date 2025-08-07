
import React from 'react';
import { Status } from '../types';

interface RecorderControlProps {
  status: Status;
  onStart: () => void;
  onStop: () => void;
  elapsedTime: number;
  maxDuration: number;
}

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"></path>
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z"></path>
  </svg>
);

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const RecorderControl: React.FC<RecorderControlProps> = ({ status, onStart, onStop, elapsedTime, maxDuration }) => {
  const isRecording = status === Status.RECORDING;
  const hasLimit = maxDuration > 0;
  const progressPercentage = hasLimit ? (elapsedTime / maxDuration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 my-8">
      <button
        onClick={isRecording ? onStop : onStart}
        className={`relative flex items-center justify-center w-40 h-40 sm:w-52 sm:h-52 rounded-full transition-all duration-300 ease-in-out shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-75
          ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400'
              : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'
          }
        `}
        aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        disabled={status === Status.GENERATING}
      >
        {isRecording && <span className="absolute animate-ping h-full w-full rounded-full bg-red-400 opacity-75"></span>}
        
        {isRecording ? (
          <StopIcon className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
        ) : (
          <MicrophoneIcon className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
        )}
      </button>
      <div className="text-center w-full max-w-sm px-4">
        <p className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-300">
          {isRecording ? 'Recording in Progress...' : 'Ready to Record'}
        </p>
        
        {isRecording ? (
            <div className="mt-4">
                <div className="flex justify-between text-base font-mono text-slate-500 dark:text-slate-400">
                    <span>{formatTime(elapsedTime)}</span>
                    {hasLimit && <span>{formatTime(maxDuration)}</span>}
                </div>
                {hasLimit && (
                  <>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-1">
                        <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 linear" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {`Recording will stop automatically at ${formatTime(maxDuration)}`}
                     </p>
                  </>
                )}
            </div>
        ) : (
            <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
                Click the button to start recording your lesson
            </p>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { languages, recordingDurations } from '../App';

type Option = {
    value: string | number;
    label: string;
};

// --- ICONS ---
const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.758 11a4.992 4.992 0 016.484 0M11 6a4 4 0 11-8 0 4 4 0 018 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);


interface CustomDropdownProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  icon: React.ReactNode;
  isDisabled: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, icon, isDisabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectedLabel = options.find(opt => opt.value === value)?.label;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleSelect = (newValue: string | number) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDisabled}
                className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="flex items-center gap-3">
                    {icon}
                    <span className="text-slate-800 dark:text-slate-200">{selectedLabel}</span>
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <ul
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-60"
                    role="listbox"
                >
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className="text-slate-900 dark:text-slate-200 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-100 dark:hover:bg-slate-700"
                            role="option"
                            aria-selected={value === option.value}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-normal'}`}>
                                {option.label}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


interface RecordingOptionsProps {
    language: string;
    onLanguageChange: (lang: string) => void;
    recordingLimit: number;
    onRecordingLimitChange: (limit: number) => void;
    isDisabled: boolean;
}

export const RecordingOptions: React.FC<RecordingOptionsProps> = ({
    language,
    onLanguageChange,
    recordingLimit,
    onRecordingLimitChange,
    isDisabled,
}) => {
    return (
        <div className="mt-8 max-w-lg mx-auto grid grid-cols-2 gap-4">
            <CustomDropdown
                options={languages.map(l => ({ value: l.value, label: l.label }))}
                value={language}
                onChange={(val) => onLanguageChange(val as string)}
                icon={<GlobeIcon className="w-6 h-6 text-slate-500 dark:text-slate-400"/>}
                isDisabled={isDisabled}
            />
             <CustomDropdown
                options={recordingDurations.map(d => ({ value: d.value, label: d.label }))}
                value={recordingLimit}
                onChange={(val) => onRecordingLimitChange(val as number)}
                icon={<ClockIcon className="w-6 h-6 text-slate-500 dark:text-slate-400"/>}
                isDisabled={isDisabled}
            />
        </div>
    );
}

import React from 'react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-500 mb-4">
            {icon}
        </div>
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{title}</h3>
        <p className="text-base text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);


export const IntroContent: React.FC = () => {
    return (
        <div className="mt-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200">How it Works</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
                Focus on your lecture, not on taking notes. Let our AI do the heavy lifting for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <FeatureCard 
                    icon={<MicIcon />} 
                    title="1. Record Audio" 
                    description="Click the big button to start recording your lecture, meeting, or thoughts."
                />
                <FeatureCard 
                    icon={<SparklesIcon />} 
                    title="2. AI Processing" 
                    description="Our Gemini-powered AI transcribes and analyzes the audio to understand key concepts."
                />
                <FeatureCard 
                    icon={<DocumentTextIcon />} 
                    title="3. Get Notes" 
                    description="Receive perfectly structured notes with titles, summaries, and key topics."
                />
            </div>
        </div>
    )
}

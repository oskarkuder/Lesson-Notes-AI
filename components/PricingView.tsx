import React from 'react';

interface PricingViewProps {
  onProceedToCheckout: () => void;
  onBack: () => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export const PricingView: React.FC<PricingViewProps> = ({ onProceedToCheckout, onBack }) => {
  return (
    <div className="w-full max-w-5xl animate-fade-in">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white">Find the Perfect Plan</h1>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Start for free, then unlock powerful features with Pro to supercharge your productivity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Free</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">For casual note-takers</p>
                    <div className="mt-6 text-5xl font-extrabold text-slate-800 dark:text-white">
                        $0
                        <span className="text-lg font-medium text-slate-500 dark:text-slate-400">/ month</span>
                    </div>
                </div>
                <div className="flex-grow">
                    <ul className="mt-10 space-y-4 text-slate-600 dark:text-slate-300">
                        <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span>AI-powered note generation</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span>Save and view session history</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span>Download audio recording</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span><span className="font-semibold">60 minutes</span> of recording per month</span>
                        </li>
                    </ul>
                </div>
                <button disabled className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-6 rounded-lg mt-10 cursor-default">
                    Your Current Plan
                </button>
            </div>

            {/* Pro Plan */}
            <div className="relative border-2 border-blue-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900 rounded-xl p-8 flex flex-col shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/50">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-lg">
                        MOST POPULAR
                    </span>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-blue-500">Pro</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">For power users & professionals</p>
                    <div className="mt-6 text-5xl font-extrabold text-slate-800 dark:text-white">
                        $19
                        <span className="text-lg font-medium text-slate-500 dark:text-slate-400">/ month</span>
                    </div>
                </div>
                <div className="flex-grow">
                    <ul className="mt-10 space-y-4 text-slate-600 dark:text-slate-300">
                         <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                            <span className="font-semibold">Everything in Free, plus:</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                            <span><span className="font-semibold">3,000 minutes</span> of recording per month (50 hours)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                            <span>Download notes as PDF</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                            <span>Unlimited session recording length</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                            <span>Priority support</span>
                        </li>
                    </ul>
                </div>
                <button onClick={onProceedToCheckout} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 mt-10 shadow-lg hover:shadow-xl hover:scale-105 transform">
                    Go Pro & Unlock All Features
                </button>
            </div>
        </div>
         <div className="text-center mt-12">
            <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-blue-500 font-medium">
                &larr; Go back
            </button>
        </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';

// --- PLACEHOLDERS: Replace with your actual credentials ---
// Note: For security, never expose secret keys on the client-side.
// These public/client IDs are safe to be in frontend code.
const STRIPE_PUBLIC_KEY = 'YOUR_STRIPE_PUBLIC_KEY';
const PAYPAL_CLIENT_ID = 'YOUR_PAYPAL_CLIENT_ID';

// Add type declaration for the global `paypal` and `Stripe` objects
declare global {
  interface Window {
    paypal: any;
    Stripe: any;
  }
}

interface PaymentViewProps {
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3.75m-3.75 2.25h16.5m-16.5-16.5h16.5c1.125 0 2.063.938 2.063 2.063v11.874c0 1.125-.938 2.063-2.063 2.063H2.25C1.125 20.25 0 19.313 0 18.188V5.813C0 4.688.938 3.75 2.25 3.75Z" />
    </svg>
);

const PayPalIcon = ({ className }: { className?: string }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.348 22.14a.73.73 0 0 1-.722-.533L4.256 9.81a.994.994 0 0 1 .982-1.154h3.54L9 8.261c.106-.71.722-1.258 1.45-1.258h2.552c3.54 0 5.487 2.01 4.935 5.613-.39 2.58-2.227 4.19-4.82 4.19h-1.896c-.63 0-1.153.427-1.258 1.043l-.71 4.545a.69.69 0 0 1-.685.536H7.348z" fill="#003087"/>
        <path d="M8.82 8.657l-.213 1.365a.994.994 0 0 0 .983 1.154h.426c.722 0 1.338-.533 1.45-1.258l.21-1.365c.106-.723-.51-1.259-1.24-1.259H9.957c-.686 0-1.24.536-1.137 1.259z" fill="#009cde"/>
        <path d="M8.82 8.657l-.426 2.72a.994.994 0 0 0 .983 1.154h.426c.722 0 1.338-.533 1.45-1.258l.427-2.72c.106-.723-.51-1.259-1.24-1.259H9.957c-.686 0-1.24.536-1.137 1.259z" fill="#002f86"/>
    </svg>
);


export const PaymentView: React.FC<PaymentViewProps> = ({ onPaymentSuccess, onBack }) => {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const paypalButtonsRendered = useRef(false);

    const isStripeConfigured = STRIPE_PUBLIC_KEY && !STRIPE_PUBLIC_KEY.startsWith('YOUR_');
    const isPaypalConfigured = PAYPAL_CLIENT_ID && !PAYPAL_CLIENT_ID.startsWith('YOUR_');

    const handleStripeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // --- In a real application, you would do the following: ---
        // 1. Create a PaymentIntent on your backend server.
        //    const response = await fetch('/your-backend/create-payment-intent', { method: 'POST', ... });
        //    const { clientSecret } = await response.json();
        // 2. Use Stripe.js to confirm the payment on the client side with the clientSecret.
        //    const stripe = window.Stripe(STRIPE_PUBLIC_KEY);
        //    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, { ... });
        // 3. If there's an error, show it. If successful, call onPaymentSuccess.
        
        // ---> BACKEND-CALL SIMULATION
        console.log("Simulating Stripe payment processing...");
        setTimeout(() => {
            console.log("Stripe payment successful (simulated).");
            onPaymentSuccess();
            setIsLoading(false);
        }, 2000);
    };

    useEffect(() => {
        if (paymentMethod === 'paypal' && isPaypalConfigured && window.paypal && !paypalButtonsRendered.current) {
            paypalButtonsRendered.current = true;
            try {
                window.paypal.Buttons({
                    // ---> BACKEND-CALL
                    // In a real app, this should call your server to create an order
                    createOrder: (data: any, actions: any) => {
                        console.log("Creating PayPal order (simulated client-side)");
                        return actions.order.create({
                            purchase_units: [{
                                amount: { value: '19.00', currency_code: 'USD' }
                            }]
                        });
                    },
                    // ---> BACKEND-CALL
                    // In a real app, this should call your server to finalize the transaction
                    onApprove: (data: any, actions: any) => {
                        console.log("PayPal payment approved (simulated). Order details:", data);
                        setIsLoading(true);
                        return new Promise(resolve => {
                             setTimeout(() => {
                                onPaymentSuccess();
                                setIsLoading(false);
                                resolve(undefined);
                            }, 1000);
                        })
                    },
                    onError: (err: any) => {
                        console.error("PayPal button error:", err);
                        setError("An error occurred with PayPal. Please try again or use a different payment method.");
                    }
                }).render("#paypal-button-container");
            } catch (err) {
                 console.error("Failed to render PayPal buttons:", err);
                 setError("Could not load the PayPal payment option. Please refresh and try again.");
            }
        }
    }, [paymentMethod, isPaypalConfigured, onPaymentSuccess]);
    
    return (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800/50 rounded-xl shadow-2xl p-6 md:p-8 animate-fade-in">
             <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Complete Your Upgrade</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">You're upgrading to the <span className="font-bold text-blue-500">Pro Plan</span> for $19/month.</p>
            </div>
            
            <div className="mt-8">
                 {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-3 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 border-b-2 transition-colors ${paymentMethod === 'card' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <CreditCardIcon className="w-5 h-5"/> Credit/Debit Card
                    </button>
                    <button onClick={() => setPaymentMethod('paypal')} className={`flex-1 py-3 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 border-b-2 transition-colors ${paymentMethod === 'paypal' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <PayPalIcon className="w-5 h-5" /> PayPal
                    </button>
                </div>

                <div className="mt-8">
                     {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    {/* Card Payment Form */}
                    <div style={{ display: paymentMethod === 'card' ? 'block' : 'none' }}>
                        {!isStripeConfigured ? (
                             <div className="text-center text-orange-600 dark:text-orange-400 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                                <strong>Developer Note:</strong> Card payments are disabled. A developer must provide a valid Stripe Public Key to enable this form.
                            </div>
                        ) : (
                            <form onSubmit={handleStripeSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="card-number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Card Number</label>
                                    <input type="text" id="card-number" placeholder="0000 0000 0000 0000" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="expiry-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date</label>
                                        <input type="text" id="expiry-date" placeholder="MM / YY" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                     <div>
                                        <label htmlFor="cvc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">CVC</label>
                                        <input type="text" id="cvc" placeholder="123" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                    {isLoading ? 'Processing...' : 'Pay $19.00'}
                                </button>
                            </form>
                        )}
                    </div>
                    
                    {/* PayPal Payment Section */}
                    <div style={{ display: paymentMethod === 'paypal' ? 'block' : 'none' }}>
                        {!isPaypalConfigured ? (
                             <div className="text-center text-orange-600 dark:text-orange-400 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                                <strong>Developer Note:</strong> PayPal is disabled. A developer must provide a valid PayPal Client ID to enable these buttons.
                            </div>
                        ) : (
                             isLoading ? (
                                <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                                  <div className="w-10 h-10 border-4 border-t-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                                  <p className="font-medium text-slate-700 dark:text-slate-300">Finalizing payment...</p>
                                </div>
                            ) : (
                                <div id="paypal-button-container" className="min-h-[100px]"></div>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mt-8">
                <button onClick={onBack} disabled={isLoading} className="text-slate-500 dark:text-slate-400 hover:text-blue-500 font-medium disabled:opacity-50">
                    &larr; Go back to pricing
                </button>
            </div>
        </div>
    );
};

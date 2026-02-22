"use client";

import { useState } from "react";
import { PhoneIcon, GlobeAltIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export function TestCallWidget() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isCalling, setIsCalling] = useState(false);
    const [callStatus, setCallStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

    const handleCall = async () => {
        if (!phoneNumber) return;
        setIsCalling(true);
        setCallStatus(null);

        try {
            const res = await fetch('/api/call/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });
            const data = await res.json();

            if (res.ok) {
                setCallStatus({ type: 'success', message: 'Call dispatched! Your phone should ring shortly.' });
            } else {
                setCallStatus({ type: 'error', message: data.error });
            }
        } catch (e) {
            setCallStatus({ type: 'error', message: 'Network error occurred trying to connect to the backend.' });
        } finally {
            setIsCalling(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 w-80 bg-white dark:bg-[var(--color-surface-dark)] border border-[var(--color-primary)]/30 rounded-2xl shadow-[0_20px_50px_rgba(43,108,238,0.2)] overflow-hidden z-50">
            <div className="p-4 bg-[var(--color-primary)]/10 border-b border-[var(--color-primary)]/20 flex items-center gap-3">
                <div className="size-8 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                    <PhoneIcon className="size-5" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Instant Test Call</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Validate script and voice quality</p>
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Your Phone Number</label>
                    <div className="relative">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#0a0f18] border border-gray-200 dark:border-[var(--color-border-dark)] rounded-lg pl-3 pr-10 py-2.5 text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-slate-900 dark:text-white"
                            placeholder="+1 (555) 000-0000"
                        />
                        <GlobeAltIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    </div>
                </div>

                {callStatus && (
                    <div className={`p-3 rounded-lg text-xs leading-relaxed border ${callStatus.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                        {callStatus.message}
                    </div>
                )}

                <button
                    onClick={handleCall}
                    disabled={isCalling}
                    className="w-full bg-[var(--color-primary)] hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-bold transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                >
                    {isCalling ? "Dialing..." : "Launch Demo Call"}
                    {!isCalling && <ArrowRightIcon className="size-4" />}
                </button>
                <p className="text-center text-[10px] text-slate-500">
                    Powered by ElevenLabs & Twilio. Demo calls are free during the trial.
                </p>
            </div>
        </div>
    );
}

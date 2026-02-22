"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { db } from "@/lib/firebase";
import {
    collection, onSnapshot, query,
    orderBy, doc, updateDoc, deleteDoc
} from "firebase/firestore";
import {
    PhoneIcon,
    PhoneXMarkIcon,
    TrashIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

type CallStatus = "pending" | "calling" | "completed" | "failed";

interface QueuedLead {
    id: string;
    name: string;
    email: string;
    company: string;
    title: string;
    phone: string | null;
    status: CallStatus;
    addedAt: any;
    calledAt?: string;
    twilioCallSid?: string;
    phoneNumber?: string;
}

const statusConfig: Record<CallStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: ClockIcon },
    calling: { label: "Calling...", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: ArrowPathIcon },
    completed: { label: "Completed", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircleIcon },
    failed: { label: "Failed", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircleIcon },
};

export default function CallsPage() {
    const [queue, setQueue] = useState<QueuedLead[]>([]);
    const [calling, setCalling] = useState<string | null>(null);
    const [phoneInputs, setPhoneInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        const q = query(collection(db, "callQueue"), orderBy("addedAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as QueuedLead[];
            setQueue(data);
        });
        return () => unsub();
    }, []);

    const initiateCall = async (lead: QueuedLead) => {
        const phone = phoneInputs[lead.id] || lead.phone;
        if (!phone) {
            alert("Please enter a phone number for this lead.");
            return;
        }

        setCalling(lead.id);
        try {
            const res = await fetch("/api/call/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    queueId: lead.id,
                    phoneNumber: phone,
                    name: lead.name,
                    company: lead.company,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
        } catch (err: any) {
            alert(`Call failed: ${err.message}`);
            await updateDoc(doc(db, "callQueue", lead.id), { status: "failed" });
        } finally {
            setCalling(null);
        }
    };

    const markComplete = async (id: string) => {
        await updateDoc(doc(db, "callQueue", id), { status: "completed" });
    };

    const removeFromQueue = async (id: string) => {
        await deleteDoc(doc(db, "callQueue", id));
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background-dark)]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-[var(--color-border-dark)] flex items-center justify-between px-8 bg-[var(--color-surface-dark)]/50 shrink-0">
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Call Queue</h1>
                        <p className="text-xs text-slate-400">{queue.filter(l => l.status === "pending").length} leads pending · {queue.filter(l => l.status === "completed").length} completed</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-emerald-400">AMIRA Active</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {queue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                            <div className="size-20 rounded-2xl bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] flex items-center justify-center">
                                <PhoneIcon className="size-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white">No leads in queue</h3>
                            <p className="text-slate-400 max-w-sm">Go to <strong>Find Leads</strong> to discover prospects and add them to your call queue.</p>
                            <a href="/discovery" className="mt-2 bg-[var(--color-primary)] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-600 transition-all">
                                Find Leads →
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3 max-w-4xl mx-auto">
                            {queue.map((lead) => {
                                const cfg = statusConfig[lead.status] ?? statusConfig.pending;
                                const StatusIcon = cfg.icon;
                                const isCalling = calling === lead.id || lead.status === "calling";

                                return (
                                    <div key={lead.id} className="bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-2xl p-5 flex items-center gap-5 hover:border-[var(--color-primary)]/30 transition-all">
                                        {/* Avatar */}
                                        <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-[var(--color-primary)] text-sm shrink-0">
                                            {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-white text-sm">{lead.name}</p>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                                                    <StatusIcon className={`size-3 ${lead.status === 'calling' ? 'animate-spin' : ''}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{lead.title} · {lead.company}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{lead.email}</p>
                                        </div>

                                        {/* Phone input if no phone on record */}
                                        {!lead.phone && lead.status === "pending" && (
                                            <input
                                                type="tel"
                                                placeholder="+1 555 000 0000"
                                                value={phoneInputs[lead.id] ?? ""}
                                                onChange={e => setPhoneInputs(p => ({ ...p, [lead.id]: e.target.value }))}
                                                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none w-44"
                                            />
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {lead.status === "pending" && (
                                                <button
                                                    onClick={() => initiateCall(lead)}
                                                    disabled={isCalling}
                                                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <PhoneIcon className="size-4" />
                                                    {isCalling ? "Calling..." : "Call Now"}
                                                </button>
                                            )}
                                            {lead.status === "calling" && (
                                                <button
                                                    onClick={() => markComplete(lead.id)}
                                                    className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-xl text-sm transition-all border border-emerald-500/20"
                                                >
                                                    <CheckCircleIcon className="size-4" />
                                                    Mark Done
                                                </button>
                                            )}
                                            {(lead.status === "completed" || lead.status === "failed") && (
                                                <button
                                                    onClick={() => removeFromQueue(lead.id)}
                                                    className="size-9 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-all"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

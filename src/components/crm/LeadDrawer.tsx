"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, PhoneIcon, GlobeAltIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon, ArrowPathIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import type { Lead } from "@/app/crm/page";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

interface CallRecord {
    id: string;
    calledAt: string;
    status: string;
    twilioCallSid?: string;
    phoneNumber?: string;
}

interface LeadDrawerProps {
    lead: Lead | null;
    onClose: () => void;
    onUpdate: (updatedLead: Lead) => void;
    onAddNote: (leadId: string, note: string) => void;
}

export function LeadDrawer({ lead, onClose, onUpdate, onAddNote }: LeadDrawerProps) {
    const [noteText, setNoteText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedStatus, setEditedStatus] = useState<Lead["status"] | "">(lead?.status || "");
    const [editedScore, setEditedScore] = useState<number>(lead?.score || 0);
    const [callHistory, setCallHistory] = useState<CallRecord[]>([]);

    // Subscribe to call history for this lead from the callQueue collection
    useEffect(() => {
        if (!lead) return;
        const q = query(
            collection(db, "callQueue"),
            orderBy("addedAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
            const calls = snap.docs
                .filter(d => d.data().email === lead.email)
                .map(d => ({ id: d.id, ...d.data() })) as CallRecord[];
            setCallHistory(calls);
        });
        return () => unsub();
    }, [lead?.id]);

    if (!lead) return null;

    const handleUpdate = () => {
        if (!editedStatus) return;
        onUpdate({
            ...lead,
            status: editedStatus as Lead["status"],
            score: editedScore,
            lastActivity: "Just now"
        });
        setIsEditing(false);
    };

    const handleSaveNote = () => {
        if (!noteText.trim()) return;
        onAddNote(lead.id, noteText);
        setNoteText("");
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-[450px] bg-[var(--color-surface-dark)] border-l border-[var(--color-border-dark)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${lead ? "translate-x-0" : "translate-x-full"}`}>
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border-dark)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xl text-[var(--color-primary)]">
                        {lead.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">{lead.name}</h2>
                        <p className="text-slate-400 text-sm">{lead.company}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                >
                    <XMarkIcon className="size-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                {/* Quick Stats / Edit Mode */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Lead Score</p>
                        {isEditing ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={editedScore}
                                onChange={(e) => setEditedScore(parseInt(e.target.value) || 0)}
                                className="bg-slate-900 border border-slate-700 text-[var(--color-primary)] font-black text-xl w-full rounded px-2 outline-none"
                            />
                        ) : (
                            <p className="text-2xl font-black text-[var(--color-primary)]">{lead.score}</p>
                        )}
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Status</p>
                        {isEditing ? (
                            <select
                                value={editedStatus}
                                onChange={(e) => setEditedStatus(e.target.value as Lead["status"])}
                                className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-1 py-1 w-full outline-none"
                            >
                                <option value="Qualified">Qualified</option>
                                <option value="Interested">Interested</option>
                                <option value="Lead">Lead</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Nurture">Nurture</option>
                            </select>
                        ) : (
                            <Badge variant={lead.status === "Qualified" ? "default" : lead.status === "Interested" ? "success" : "secondary"}>
                                {lead.status}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Note Entry */}
                <section className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Note</label>
                    <div className="relative">
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a thought or follow-up bit..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-[var(--color-primary)] resize-none h-24 transition-all"
                        />
                        {noteText && (
                            <button
                                onClick={handleSaveNote}
                                className="absolute bottom-3 right-3 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-[var(--color-primary)]/80 transition-all uppercase"
                            >
                                Save Note
                            </button>
                        )}
                    </div>
                </section>

                {/* Contact Information */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">Contact Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-pointer group">
                            <EnvelopeIcon className="size-5 text-slate-500 group-hover:text-[var(--color-primary)]" />
                            <span className="text-sm">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-pointer group">
                            <PhoneIcon className="size-5 text-slate-500 group-hover:text-[var(--color-primary)]" />
                            <span className="text-sm">{lead.phone || "No phone added"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-pointer group">
                            <GlobeAltIcon className="size-5 text-slate-500 group-hover:text-[var(--color-primary)]" />
                            <span className="text-sm">{lead.website || "No website"}</span>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">About</h3>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-sm leading-relaxed italic whitespace-pre-wrap">
                            {lead.notes || "No notes available for this lead."}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        <div>
                            <p className="text-slate-500 mb-0.5">Industry</p>
                            <p className="text-slate-200 font-medium">{lead.industry || "Not set"}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 mb-0.5">Company Size</p>
                            <p className="text-slate-200 font-medium">50-200 employees</p>
                        </div>
                    </div>
                </section>

                {/* Call History — Live from Firestore */}
                <section className="space-y-4 pb-8">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Call History</h3>
                        <span className="text-[10px] text-slate-500">{callHistory.length} call{callHistory.length !== 1 ? 's' : ''}</span>
                    </div>

                    {callHistory.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                            <PhoneIcon className="size-5 text-slate-600 shrink-0" />
                            <p className="text-sm text-slate-500 italic">No calls made yet. Add to Call Queue to get started.</p>
                        </div>
                    ) : (
                        <div className="relative space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                            {callHistory.map((call) => (
                                <div key={call.id} className="relative pl-8">
                                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full outline outline-4 outline-[var(--color-surface-dark)] ${call.status === 'completed' ? 'bg-emerald-500' :
                                            call.status === 'calling' ? 'bg-blue-500' :
                                                call.status === 'failed' ? 'bg-red-500' :
                                                    'bg-amber-500'
                                        }`}></div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-white px-2 py-0.5 bg-slate-700 rounded uppercase tracking-tighter">
                                            AI Call
                                        </span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${call.status === 'completed' ? 'text-emerald-400 bg-emerald-400/10' :
                                                call.status === 'failed' ? 'text-red-400 bg-red-400/10' :
                                                    'text-amber-400 bg-amber-400/10'
                                            }`}>{call.status}</span>
                                        {call.calledAt && (
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(call.calledAt).toLocaleDateString()} {new Date(call.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300">
                                        AMIRA called <span className="text-white font-medium">{call.phoneNumber ?? 'unknown number'}</span>
                                        {call.twilioCallSid && (
                                            <span className="text-[10px] text-slate-600 ml-2 font-mono">SID: {call.twilioCallSid.slice(0, 12)}…</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[var(--color-border-dark)] bg-slate-800/50 flex gap-3">
                {!isEditing ? (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ChatBubbleBottomCenterTextIcon className="size-5" />
                            Edit Lead
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ArrowPathIcon className="size-5" />
                            Close
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Save Changes
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

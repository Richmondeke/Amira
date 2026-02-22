"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NewLeadModalProps {
    onClose: () => void;
}

export function NewLeadModal({ onClose }: NewLeadModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        industry: "SaaS",
        score: 50,
        status: "Lead" as const,
        phone: "",
        website: "",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "leads"), {
                ...formData,
                lastActivity: "Lead created",
                createdAt: new Date().toISOString()
            });
            onClose();
        } catch (error) {
            console.error("Error creating lead:", error);
            alert("Failed to create lead. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] shadow-2xl rounded-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[var(--color-border-dark)] flex items-center justify-between bg-slate-800/50">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Create New Lead</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                        <XMarkIcon className="size-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Lead Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Company</label>
                            <input
                                required
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Industry</label>
                            <select
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all appearance-none"
                            >
                                <option>SaaS</option>
                                <option>Fintech</option>
                                <option>Cloud Infrastructure</option>
                                <option>Healthtech</option>
                                <option>Artificial Intelligence</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Initial Score</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all resize-none h-24"
                            placeholder="Initial discovery notes..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-sm transition-all active:scale-95 border border-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? "Creating..." : "Create Lead"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface CRMFiltersProps {
    filters: {
        status: string[];
        minScore: number;
        maxScore: number;
        industry: string;
    };
    onApply: (filters: {
        status: string[];
        minScore: number;
        maxScore: number;
        industry: string;
    }) => void;
    onClose: () => void;
}

export function CRMFilters({ filters, onApply, onClose }: CRMFiltersProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const toggleStatus = (status: string) => {
        setLocalFilters(prev => ({
            ...prev,
            status: prev.status.includes(status)
                ? prev.status.filter(s => s !== status)
                : [...prev.status, status]
        }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        const cleared = {
            status: [],
            minScore: 0,
            maxScore: 100,
            industry: "All Industries"
        };
        setLocalFilters(cleared);
        onApply(cleared);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/40 backdrop-blur-sm">
            <div
                className="absolute inset-0"
                onClick={onClose}
            ></div>
            <div className="relative w-80 h-full bg-[var(--color-surface-dark)] border-l border-[var(--color-border-dark)] shadow-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Filters</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XMarkIcon className="size-6" />
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    {/* Status Filter */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lead Status</p>
                        <div className="space-y-2">
                            {["Qualified", "Interested", "Lead", "Contacted", "Nurture"].map((status) => (
                                <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.status.includes(status)}
                                            onChange={() => toggleStatus(status)}
                                            className="peer appearance-none w-5 h-5 border border-slate-700 rounded bg-slate-800 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Score Range */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lead Score Range</p>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                placeholder="Min"
                                value={localFilters.minScore}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            />
                            <div className="h-0.5 w-4 bg-slate-700"></div>
                            <input
                                type="number"
                                placeholder="Max"
                                value={localFilters.maxScore}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            />
                        </div>
                    </div>

                    {/* Industry Filter */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry</p>
                        <div className="relative">
                            <select
                                value={localFilters.industry}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, industry: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white appearance-none focus:ring-1 focus:ring-[var(--color-primary)] outline-none cursor-pointer"
                            >
                                <option>All Industries</option>
                                <option>SaaS</option>
                                <option>Fintech</option>
                                <option>Cloud Infrastructure</option>
                                <option>Healthtech</option>
                                <option>Artificial Intelligence</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-700 space-y-3">
                    <button
                        onClick={handleApply}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg shadow-[var(--color-primary)]/10 active:scale-95"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleClear}
                        className="w-full text-slate-400 hover:text-white text-sm font-medium py-1 transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            </div>
        </div>
    );
}

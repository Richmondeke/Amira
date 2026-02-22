"use client";

import { useState } from "react";
import { EllipsisHorizontalIcon, BuildingOffice2Icon, RocketLaunchIcon, CloudIcon, Square3Stack3DIcon, PhoneIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Map strings returned from API to actual Heroicons components
const iconMap: Record<string, React.ElementType> = {
    'BuildingOffice2Icon': BuildingOffice2Icon,
    'RocketLaunchIcon': RocketLaunchIcon,
    'CloudIcon': CloudIcon,
    'Square3Stack3DIcon': Square3Stack3DIcon
};

export function LeadTable({ leads = [], isLoading = false }: { leads: any[], isLoading?: boolean }) {
    const [queued, setQueued] = useState<Set<string>>(new Set());
    const [adding, setAdding] = useState<string | null>(null);

    const addToCallQueue = async (lead: any) => {
        if (queued.has(lead.id)) return;
        setAdding(lead.id);
        try {
            await addDoc(collection(db, "callQueue"), {
                leadId: lead.id,
                name: lead.name,
                email: lead.email,
                company: lead.company,
                title: lead.title,
                phone: lead.phone || null,
                status: "pending",
                addedAt: serverTimestamp(),
            });
            setQueued(prev => new Set([...prev, lead.id]));
        } catch (err) {
            console.error("Failed to add to call queue:", err);
        } finally {
            setAdding(null);
        }
    };

    return (
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-[var(--color-background-dark)] border-b border-slate-200 dark:border-[var(--color-border-dark)] z-[1]">
                    <tr className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-8 py-4 w-12">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-[var(--color-border-dark)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent" />
                        </th>
                        <th className="px-4 py-4">Lead Name</th>
                        <th className="px-4 py-4">Company</th>
                        <th className="px-4 py-4">Title</th>
                        <th className="px-4 py-4">Location</th>
                        <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[var(--color-primary)]/5">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                            <tr key={`skeleton-${idx}`}>
                                <td className="px-8 py-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div></td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                                            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div></td>
                                <td className="px-4 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div></td>
                                <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div></td>
                                <td className="px-8 py-4"></td>
                            </tr>
                        ))
                    ) : leads.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-8 py-12 text-center text-slate-500 dark:text-slate-400">
                                No leads found. Try a different search query.
                            </td>
                        </tr>
                    ) : (
                        leads.map((lead) => {
                            const IconComponent = iconMap[lead.iconName] || BuildingOffice2Icon;
                            const isQueued = queued.has(lead.id);
                            const isAdding = adding === lead.id;

                            return (
                                <tr key={lead.id} className="hover:bg-[var(--color-primary)]/5 transition-colors group">
                                    <td className="px-8 py-4">
                                        <input type="checkbox" className="rounded border-slate-300 dark:border-[var(--color-border-dark)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-9 rounded-full flex items-center justify-center font-bold text-xs ring-2 ${lead.color}`}>
                                                {lead.initials}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-primary)] transition-colors">
                                                    {lead.name}
                                                </p>
                                                <p className="text-xs text-slate-500">{lead.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 bg-slate-200 dark:bg-[var(--color-primary)]/20 rounded flex items-center justify-center">
                                                <IconComponent className="size-3 text-slate-500 dark:text-[var(--color-primary)]" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{lead.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{lead.title}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 max-w-[120px] truncate block" title={lead.location}>{lead.location}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button
                                            onClick={() => addToCallQueue(lead)}
                                            disabled={isQueued || isAdding}
                                            className={`flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isQueued
                                                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 cursor-default"
                                                    : "border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent"
                                                }`}
                                        >
                                            {isQueued ? (
                                                <><CheckCircleIcon className="size-4" /> Queued</>
                                            ) : isAdding ? (
                                                "Adding..."
                                            ) : (
                                                <><PhoneIcon className="size-4" /> Call Queue</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

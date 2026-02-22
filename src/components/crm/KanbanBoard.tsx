"use client";

import { useState } from "react";
import type { Lead } from "@/app/crm/page";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { PlusIcon, PhoneIcon, EnvelopeIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

const COLUMNS: {
    status: Lead["status"];
    label: string;
    accent: string;
    glow: string;
    dot: string;
    bg: string;
    count_bg: string;
}[] = [
        {
            status: "Lead",
            label: "New Lead",
            accent: "border-t-slate-400",
            glow: "ring-slate-400/30",
            dot: "bg-slate-400",
            bg: "from-slate-400/5 to-transparent",
            count_bg: "bg-slate-700 text-slate-300",
        },
        {
            status: "Contacted",
            label: "Contacted",
            accent: "border-t-blue-500",
            glow: "ring-blue-500/30",
            dot: "bg-blue-500",
            bg: "from-blue-500/5 to-transparent",
            count_bg: "bg-blue-900/50 text-blue-300",
        },
        {
            status: "Interested",
            label: "Interested",
            accent: "border-t-amber-500",
            glow: "ring-amber-500/30",
            dot: "bg-amber-500",
            bg: "from-amber-500/5 to-transparent",
            count_bg: "bg-amber-900/50 text-amber-300",
        },
        {
            status: "Nurture",
            label: "Nurturing",
            accent: "border-t-purple-500",
            glow: "ring-purple-500/30",
            dot: "bg-purple-500",
            bg: "from-purple-500/5 to-transparent",
            count_bg: "bg-purple-900/50 text-purple-300",
        },
        {
            status: "Qualified",
            label: "Qualified",
            accent: "border-t-emerald-500",
            glow: "ring-emerald-500/30",
            dot: "bg-emerald-500",
            bg: "from-emerald-500/5 to-transparent",
            count_bg: "bg-emerald-900/50 text-emerald-300",
        },
    ];

interface KanbanBoardProps {
    leads: Lead[];
    onSelectLead: (lead: Lead) => void;
    onNewLead: () => void;
}

export function KanbanBoard({ leads, onSelectLead, onNewLead }: KanbanBoardProps) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<Lead["status"] | null>(null);

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        setDraggingId(leadId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, status: Lead["status"]) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverStatus(status);
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: Lead["status"]) => {
        e.preventDefault();
        if (!draggingId) return;
        const lead = leads.find(l => l.id === draggingId);
        if (!lead || lead.status === targetStatus) {
            setDraggingId(null);
            setDragOverStatus(null);
            return;
        }
        try {
            await updateDoc(doc(db, "leads", draggingId), {
                status: targetStatus,
                lastActivity: `Moved to ${targetStatus}`,
            });
        } catch (err) {
            console.error("Failed to update lead status:", err);
        }
        setDraggingId(null);
        setDragOverStatus(null);
    };

    return (
        <div className="flex-1 overflow-x-auto p-5 pb-0">
            <div className="flex gap-3 h-full" style={{ minWidth: `${COLUMNS.length * 272}px` }}>
                {COLUMNS.map((col) => {
                    const colLeads = leads.filter(l => l.status === col.status);
                    const isOver = dragOverStatus === col.status;

                    return (
                        <div
                            key={col.status}
                            onDragOver={(e) => handleDragOver(e, col.status)}
                            onDrop={(e) => handleDrop(e, col.status)}
                            onDragLeave={() => setDragOverStatus(null)}
                            className={`flex flex-col w-64 shrink-0 rounded-xl border-t-2 transition-all duration-200 ${col.accent} ${isOver
                                    ? `bg-gradient-to-b ${col.bg} ring-2 ${col.glow} shadow-lg`
                                    : "bg-[var(--color-surface-dark)]"
                                }`}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                                    <span className="text-sm font-black text-white">{col.label}</span>
                                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${col.count_bg}`}>
                                        {colLeads.length}
                                    </span>
                                </div>
                                <button
                                    onClick={onNewLead}
                                    title="Add lead"
                                    className="size-6 rounded-md hover:bg-white/10 text-slate-500 hover:text-white transition-all flex items-center justify-center"
                                >
                                    <PlusIcon className="size-3.5" />
                                </button>
                            </div>

                            {/* Cards area */}
                            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2.5 custom-scrollbar min-h-0">
                                {/* Drop zone when column is empty */}
                                {colLeads.length === 0 && (
                                    <div
                                        className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed transition-all gap-2 ${isOver
                                                ? "border-[var(--color-primary)]/60 bg-[var(--color-primary)]/5"
                                                : "border-slate-700/50 bg-slate-800/20"
                                            }`}
                                    >
                                        {isOver ? (
                                            <p className="text-xs font-bold text-[var(--color-primary)]">Release to move here</p>
                                        ) : (
                                            <p className="text-xs text-slate-600">Drag leads here</p>
                                        )}
                                    </div>
                                )}

                                {colLeads.map((lead) => {
                                    const isDragging = draggingId === lead.id;
                                    const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                    const score = lead.score ?? 0;

                                    return (
                                        <div
                                            key={lead.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, lead.id)}
                                            onDragEnd={() => { setDraggingId(null); setDragOverStatus(null); }}
                                            onClick={() => onSelectLead(lead)}
                                            className={`group relative bg-[var(--color-background-dark)] border rounded-xl p-4 cursor-pointer transition-all duration-150 select-none ${isDragging
                                                    ? "opacity-30 scale-95 border-[var(--color-primary)]/50 shadow-none"
                                                    : "border-[var(--color-border-dark)] hover:border-[var(--color-primary)]/50 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
                                                }`}
                                        >
                                            {/* Drag handle indicator */}
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                                                </svg>
                                            </div>

                                            {/* Avatar + Name */}
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className={`size-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 bg-gradient-to-br ${score >= 80 ? "from-emerald-500/20 to-emerald-500/5 text-emerald-400" :
                                                        score >= 60 ? "from-blue-500/20 to-blue-500/5 text-blue-400" :
                                                            "from-slate-500/20 to-slate-500/5 text-slate-400"
                                                    }`}>
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white leading-tight truncate group-hover:text-[var(--color-primary)] transition-colors">
                                                        {lead.name}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <BuildingOffice2Icon className="size-3 text-slate-600 shrink-0" />
                                                        <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            {lead.email && (
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <EnvelopeIcon className="size-3 text-slate-600 shrink-0" />
                                                    <p className="text-[11px] text-slate-500 truncate">{lead.email}</p>
                                                </div>
                                            )}

                                            {/* Divider */}
                                            <div className="border-t border-slate-800 mb-3" />

                                            {/* Score bar + Call indicator */}
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] text-slate-600 font-medium">Score</span>
                                                        <span className={`text-[10px] font-black ${score >= 80 ? "text-emerald-400" :
                                                                score >= 60 ? "text-blue-400" : "text-slate-400"
                                                            }`}>{score}</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${score >= 80 ? "bg-emerald-500" :
                                                                    score >= 60 ? "bg-blue-500" : "bg-slate-500"
                                                                }`}
                                                            style={{ width: `${score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                {lead.phone && (
                                                    <div className="size-7 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
                                                        <PhoneIcon className="size-3.5 text-[var(--color-primary)]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Drop zone below existing cards */}
                                {colLeads.length > 0 && isOver && (
                                    <div className="h-12 rounded-xl border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 flex items-center justify-center">
                                        <p className="text-xs font-bold text-[var(--color-primary)]">Release here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

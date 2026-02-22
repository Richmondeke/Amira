"use client";

import { useEffect, useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Badge";
import {
    MagnifyingGlassIcon,
    BellIcon,
    PlusIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ChevronRightIcon,
    ChevronUpDownIcon
} from "@heroicons/react/24/outline";
import { LeadDrawer } from "@/components/crm/LeadDrawer";
import { CRMFilters } from "@/components/crm/CRMFilters";
import { NewLeadModal } from "@/components/crm/NewLeadModal";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { Squares2X2Icon, TableCellsIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";

export interface Lead {
    id: string;
    name: string;
    email: string;
    company: string;
    score: number;
    status: "Qualified" | "Interested" | "Lead" | "Contacted" | "Nurture";
    lastActivity: string;
    industry?: string;
    phone?: string;
    website?: string;
    notes?: string;
}

export default function CRMPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [sortField, setSortField] = useState<keyof Lead>("score");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [showNewLeadModal, setShowNewLeadModal] = useState(false);

    // Sync with Firestore
    useEffect(() => {
        const q = query(collection(db, "leads"), orderBy("score", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Lead[];
            setLeads(leadsData);
            setLoading(false);
        }, (error) => {
            console.error("Firestore sync error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter state
    const [activeFilters, setActiveFilters] = useState({
        status: [] as string[],
        minScore: 0,
        maxScore: 100,
        industry: "All Industries"
    });

    const filteredAndSortedLeads = useMemo(() => {
        return leads
            .filter(lead => {
                const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.email.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(lead.status);
                const matchesScore = lead.score >= activeFilters.minScore && lead.score <= activeFilters.maxScore;
                const matchesIndustry = activeFilters.industry === "All Industries" || lead.industry === activeFilters.industry;

                return matchesSearch && matchesStatus && matchesScore && matchesIndustry;
            })
            .sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];
                if (aValue === undefined || bValue === undefined) return 0;
                if (sortDirection === "asc") {
                    return aValue > bValue ? 1 : -1;
                }
                return aValue < bValue ? 1 : -1;
            });
    }, [leads, searchQuery, sortField, sortDirection, activeFilters]);

    const handleSort = (field: keyof Lead) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const handleUpdateLead = async (updatedLead: Lead) => {
        try {
            const leadRef = doc(db, "leads", updatedLead.id);
            await updateDoc(leadRef, {
                status: updatedLead.status,
                score: updatedLead.score,
                lastActivity: "Just now"
            });
        } catch (error) {
            console.error("Error updating lead:", error);
        }
    };

    const handleAddNote = async (leadId: string, note: string) => {
        try {
            const leadRef = doc(db, "leads", leadId);
            const lead = leads.find(l => l.id === leadId);
            const newNotes = lead?.notes ? `${lead.notes}\n${note}` : note;
            await updateDoc(leadRef, {
                notes: newNotes,
                lastActivity: "Note added"
            });
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[var(--color-background-dark)]">
                <header className="h-16 border-b border-[var(--color-border-dark)] flex items-center justify-between px-8 bg-[var(--color-surface-dark)]/50">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="text"
                                placeholder="Search leads, companies, or tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--color-border-dark)] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] text-slate-100 placeholder-slate-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <BellIcon className="size-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
                        </button>
                        <button
                            onClick={() => setShowNewLeadModal(true)}
                            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-95"
                        >
                            <PlusIcon className="size-5" />
                            New Lead
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-8 pb-4 flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-white">Lead Management</h2>
                            <p className="text-slate-400 mt-1">Showing {filteredAndSortedLeads.length} total potential customers</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "table"
                                            ? "bg-[var(--color-primary)] text-white shadow"
                                            : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    <TableCellsIcon className="size-4" />
                                    Table
                                </button>
                                <button
                                    onClick={() => setViewMode("kanban")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "kanban"
                                            ? "bg-[var(--color-primary)] text-white shadow"
                                            : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    <Squares2X2Icon className="size-4" />
                                    Kanban
                                </button>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 border px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters
                                    ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]"
                                    : "bg-[var(--color-surface-dark)] border-[var(--color-border-dark)] hover:bg-[var(--color-border-dark)] text-white"
                                    }`}
                            >
                                <FunnelIcon className="size-5" />
                                Filter
                            </button>
                            <button className="flex items-center gap-2 bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-border-dark)] transition-colors text-white">
                                <ArrowDownTrayIcon className="size-5" />
                                Export
                            </button>
                        </div>
                    </div>

                    {viewMode === "kanban" ? (
                        <KanbanBoard
                            leads={filteredAndSortedLeads}
                            onSelectLead={setSelectedLead}
                            onNewLead={() => setShowNewLeadModal(true)}
                        />
                    ) : (
                        <div className="flex-1 overflow-auto custom-scrollbar px-8">
                            <table className="w-full text-left border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3 font-semibold">Lead Name</th>
                                        <th className="px-4 py-3 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("company")}>
                                            <div className="flex items-center gap-1">
                                                Company
                                                <ChevronUpDownIcon className="size-4" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("score")}>
                                            <div className="flex items-center gap-1">
                                                Lead Score
                                                <ChevronUpDownIcon className="size-4" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Last Activity</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredAndSortedLeads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                            className={`rounded-lg group transition-all cursor-pointer ${selectedLead?.id === lead.id
                                                ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30"
                                                : "bg-[var(--color-surface-dark)] hover:bg-[var(--color-border-dark)]/50 border border-transparent"
                                                }`}
                                        >
                                            <td className="px-4 py-4 rounded-l-lg border-y border-l border-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${selectedLead?.id === lead.id ? "bg-slate-700 text-[var(--color-primary)]" : "bg-slate-800 text-slate-400"
                                                        }`}>
                                                        {lead.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{lead.name}</div>
                                                        <div className="text-xs text-slate-400">{lead.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 border-y border-transparent">
                                                <span className="text-slate-200">{lead.company}</span>
                                            </td>
                                            <td className="px-4 py-4 border-y border-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 w-24 bg-[var(--color-border-dark)] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] transition-all duration-1000"
                                                            style={{ width: `${lead.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-bold text-[var(--color-primary)]">{lead.score}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 border-y border-transparent">
                                                <Badge variant={lead.status === "Qualified" ? "default" : lead.status === "Interested" ? "success" : "secondary"}>
                                                    {lead.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 border-y border-transparent text-slate-400 italic">{lead.lastActivity}</td>
                                            <td className="px-4 py-4 rounded-r-lg border-y border-r border-transparent text-right">
                                                <ChevronRightIcon className={`size-5 transition-all ml-auto ${selectedLead?.id === lead.id ? "text-[var(--color-primary)] translate-x-1" : "text-slate-400 group-hover:text-[var(--color-primary)]"
                                                    }`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <LeadDrawer
                key={selectedLead?.id}
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdate={handleUpdateLead}
                onAddNote={handleAddNote}
            />
            {showFilters && (
                <CRMFilters
                    filters={activeFilters}
                    onApply={setActiveFilters}
                    onClose={() => setShowFilters(false)}
                />
            )}
            {showNewLeadModal && (
                <NewLeadModal onClose={() => setShowNewLeadModal(false)} />
            )}
        </div>
    );
}

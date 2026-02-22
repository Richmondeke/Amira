"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { FilterSidebar } from "@/components/discovery/FilterSidebar";
import { LeadTable } from "@/components/discovery/LeadTable";
import { DiscoveryStart } from "@/components/discovery/DiscoveryStart";
import { CpuChipIcon } from "@heroicons/react/24/outline";

export default function DiscoveryPage() {
    const [showResults, setShowResults] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setShowResults(true);
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            if (!response.ok) throw new Error("Failed to fetch leads");
            const data = await response.json();
            setLeads(data.leads || []);
        } catch (error) {
            console.error("Error fetching leads:", error);
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-[var(--color-border-dark)] flex items-center justify-between px-8 bg-[var(--color-surface-dark)]/50 shrink-0">
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Find Leads</h1>
                        <p className="text-xs text-slate-400">Powered by Apify · AI-enriched</p>
                    </div>
                    {showResults && (
                        <button
                            onClick={() => { setShowResults(false); setLeads([]); }}
                            className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                            ← New Search
                        </button>
                    )}
                </header>

                {showResults ? (
                    <div className="flex-1 flex overflow-hidden">
                        <FilterSidebar />
                        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[var(--color-background-dark)]/20">
                            {/* Bulk Actions Bar */}
                            <div className="px-8 py-3 bg-white dark:bg-[var(--color-background-dark)] border-b border-slate-200 dark:border-[var(--color-border-dark)] flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {isLoading ? "Searching..." : `${leads.length} leads found`}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    AI confidence threshold: <span className="text-emerald-500 font-bold">85%+</span>
                                </p>
                            </div>

                            {/* Table */}
                            <LeadTable leads={leads} isLoading={isLoading} />
                        </div>
                    </div>
                ) : (
                    <DiscoveryStart onSearch={handleSearch} />
                )}
            </main>
        </div>
    );
}

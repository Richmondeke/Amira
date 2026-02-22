import { MagnifyingGlassIcon, ArrowRightIcon, CurrencyDollarIcon, CircleStackIcon, BoltIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

export function DiscoveryStart({ onSearch }: { onSearch: (query: string) => void }) {
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[var(--color-background-dark)]/20 relative overflow-hidden">
            {/* Background Blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-primary)]/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-3xl px-8 z-10 text-center">
                <div className="mb-10 space-y-4">
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Find your next high-value lead
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Harness AI to discover companies and decision-makers in seconds.
                    </p>
                </div>

                {/* Search Box */}
                <div className="relative group mb-16">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)]/50 to-purple-500/50 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center bg-white dark:bg-[var(--color-background-dark)] border border-slate-200 dark:border-[var(--color-primary)]/30 rounded-xl shadow-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)]/50">
                        <MagnifyingGlassIcon className="ml-6 text-slate-400 size-8" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-4 pr-6 py-6 bg-transparent border-none text-xl focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium text-slate-900 dark:text-white outline-none"
                            placeholder="Search leads by company, industry, or keyword (e.g. SaaS companies in Austin)"
                        />
                        <button onClick={handleSearch} className="mr-4 px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer">
                            <span>Search</span>
                            <ArrowRightIcon className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Templates */}
                <div className="text-left">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-[var(--color-primary)] mb-6 text-center">
                        Quick Start Templates
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card
                            onClick={() => { setQuery("Recently funded companies"); onSearch("Recently funded companies"); }}
                            className="hover:border-[var(--color-primary)]/50 transition-all group hover:shadow-xl dark:hover:shadow-blue-500/5 cursor-pointer"
                        >
                            <div className="size-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <CurrencyDollarIcon className="size-7" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Recently Funded</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Companies that closed a round in the last 30 days.
                            </p>
                        </Card>

                        <Card
                            onClick={() => { setQuery("Companies using AWS and React"); onSearch("Companies using AWS and React"); }}
                            className="hover:border-[var(--color-primary)]/50 transition-all group hover:shadow-xl dark:hover:shadow-blue-500/5 cursor-pointer"
                        >
                            <div className="size-12 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <CircleStackIcon className="size-7" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tech-Stack Matching</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Find leads using specific technologies like AWS, HubSpot, or React.
                            </p>
                        </Card>

                        <Card
                            onClick={() => { setQuery("High intent enterprise leads"); onSearch("High intent enterprise leads"); }}
                            className="hover:border-[var(--color-primary)]/50 transition-all group hover:shadow-xl dark:hover:shadow-blue-500/5 cursor-pointer"
                        >
                            <div className="size-12 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BoltIcon className="size-7" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">High Intent Leads</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Companies showing surging interest in your category.
                            </p>
                        </Card>
                    </div>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm text-slate-500">Try searching for:</span>
                    {["Fintech startups in London", "Series A Healthcare in NY", "VP of Sales at SaaS companies"].map((term) => (
                        <button
                            key={term}
                            onClick={() => { setQuery(term); onSearch(term); }}
                            className="px-3 py-1 rounded-full border border-slate-200 dark:border-[var(--color-primary)]/20 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[var(--color-primary)]/10 transition-colors"
                        >
                            "{term}"
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

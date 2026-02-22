import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function FilterSidebar() {
    return (
        <aside className="w-72 border-r border-slate-200 dark:border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-background-dark)]/30 p-6 overflow-y-auto custom-scrollbar shrink-0 hidden lg:block">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                    Filters
                </h2>
                <button className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
                    Clear All
                </button>
            </div>

            <div className="space-y-6">
                {/* Industry Filter */}
                <div>
                    <button className="flex items-center justify-between w-full text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">
                        Industry
                        <ChevronDownIcon className="size-4" />
                    </button>
                    <div className="space-y-2">
                        {["Technology", "Healthcare", "Fintech", "E-commerce"].map((industry) => (
                            <label key={industry} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    defaultChecked={["Technology", "Fintech"].includes(industry)}
                                    className="rounded border-slate-300 dark:border-[var(--color-border-dark)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-[var(--color-primary)] transition-colors">
                                    {industry}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-[var(--color-border-dark)]"></div>

                {/* Company Size */}
                <div>
                    <button className="flex items-center justify-between w-full text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">
                        Company Size
                        <ChevronDownIcon className="size-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        {["1-10", "11-50", "51-200", "201-500"].map((size) => (
                            <button
                                key={size}
                                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${size === "11-50"
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                        : "border-slate-200 dark:border-[var(--color-border-dark)] text-slate-600 dark:text-slate-400 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)]"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-[var(--color-border-dark)]"></div>

                {/* Funding Stage */}
                <div>
                    <button className="flex items-center justify-between w-full text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">
                        Funding Stage
                        <ChevronDownIcon className="size-4" />
                    </button>
                    <div className="space-y-2">
                        {["Seed / Series A", "Series B / C", "IPO / Public"].map((stage) => (
                            <label key={stage} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="funding"
                                    className="text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent border-slate-300 dark:border-[var(--color-border-dark)]"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                    {stage}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}

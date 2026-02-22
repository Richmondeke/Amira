import { MagnifyingGlassIcon, BellIcon, BookmarkIcon } from "@heroicons/react/24/outline";

export function Header() {
    return (
        <header className="h-16 border-b border-slate-200 dark:border-[var(--color-border-dark)] bg-white/50 dark:bg-[var(--color-background-dark)]/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                    <input
                        type="text"
                        placeholder="Search leads, companies, or keywords..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-[var(--color-surface-dark)] border-none rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-sm placeholder:text-slate-500 text-slate-900 dark:text-white outline-none transition-all"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-[var(--color-surface-dark)] p-1 rounded-lg">
                    <span className="text-xs font-semibold px-2 text-slate-500 dark:text-slate-400">
                        Live Updates
                    </span>
                    <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-[var(--color-primary)] transition-colors focus:outline-none ring-offset-2">
                        <span className="translate-x-4 inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm"></span>
                    </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                    <BookmarkIcon className="size-4" />
                    Save Search
                </button>
                <div className="h-8 w-px bg-slate-200 dark:bg-[var(--color-border-dark)] mx-2"></div>
                <button className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[var(--color-surface-dark)] relative transition-colors">
                    <BellIcon className="size-6 text-slate-600 dark:text-slate-400" />
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[var(--color-background-dark)]"></span>
                </button>
            </div>
        </header>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import clsx from "clsx";
import {
    Square3Stack3DIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Square3Stack3DIcon },
    { name: "Find Leads", href: "/discovery", icon: MagnifyingGlassIcon },
    { name: "Call Queue", href: "/calls", icon: PhoneIcon },
    { name: "CRM", href: "/crm", icon: UserGroupIcon },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className="w-64 border-r border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-background-dark)] flex flex-col h-screen shrink-0">
            <div className="p-6 flex items-center gap-3">
                <div className="flex items-center justify-center">
                    <img src="/logo-dark.png" alt="AMIRA Logo" className="h-10 w-auto object-contain" />
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                isActive
                                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[var(--color-primary)]/10"
                            )}
                        >
                            <item.icon className="size-5" />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-[var(--color-border-dark)]">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-[var(--color-surface-dark)]">
                    <div className="size-10 rounded-lg bg-gray-300 dark:bg-gray-700 overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-[var(--color-primary)]">
                                {user?.displayName?.[0] ?? "A"}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate dark:text-white">{user?.displayName ?? "AMIRA User"}</p>
                        <button
                            onClick={signOut}
                            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

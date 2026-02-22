"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
    MagnifyingGlassIcon,
    PhoneIcon,
    CheckCircleIcon,
    UserGroupIcon,
    ArrowRightIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

interface Stats {
    totalLeads: number;
    callsPending: number;
    callsCompleted: number;
    crmLeads: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({ totalLeads: 0, callsPending: 0, callsCompleted: 0, crmLeads: 0 });

    useEffect(() => {
        const unsubQueue = onSnapshot(collection(db, "callQueue"), (snap) => {
            const docs = snap.docs.map(d => d.data());
            setStats(prev => ({
                ...prev,
                totalLeads: snap.size,
                callsPending: docs.filter(d => d.status === "pending").length,
                callsCompleted: docs.filter(d => d.status === "completed").length,
            }));
        });

        const unsubCRM = onSnapshot(collection(db, "leads"), (snap) => {
            setStats(prev => ({ ...prev, crmLeads: snap.size }));
        });

        return () => { unsubQueue(); unsubCRM(); };
    }, []);

    const firstName = user?.displayName?.split(" ")[0] ?? "there";

    const statCards = [
        { label: "In Call Queue", value: stats.totalLeads, icon: MagnifyingGlassIcon, color: "text-blue-400 bg-blue-400/10" },
        { label: "Pending Calls", value: stats.callsPending, icon: PhoneIcon, color: "text-amber-400 bg-amber-400/10" },
        { label: "Calls Completed", value: stats.callsCompleted, icon: CheckCircleIcon, color: "text-emerald-400 bg-emerald-400/10" },
        { label: "CRM Contacts", value: stats.crmLeads, icon: UserGroupIcon, color: "text-purple-400 bg-purple-400/10" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background-dark)]">
            <style>{`
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-32px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .slide-in {
                    animation: slideInLeft 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
            `}</style>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="h-20 border-b border-[var(--color-border-dark)] flex items-center justify-between px-8 bg-[var(--color-background-dark)]/50 backdrop-blur-md shrink-0">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            Good morning, {firstName} 👋
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">Your AMIRA pipeline, live.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-xl px-4 py-2">
                        <SparklesIcon className="size-4 text-[var(--color-primary)]" />
                        <span className="text-sm font-medium text-white">AMIRA is active</span>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </div>
                </header>

                <div className="flex-1 p-8 space-y-8">
                    {/* Live Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        {statCards.map((card, i) => (
                            <div
                                key={card.label}
                                className="slide-in bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-2xl p-5"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                <div className={`size-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                                    <card.icon className="size-5" />
                                </div>
                                <p className="text-3xl font-black text-white">{card.value}</p>
                                <p className="text-sm text-slate-400 mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Primary CTAs */}
                    <div className="slide-in" style={{ animationDelay: '360ms' }}>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Start Here</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href="/discovery"
                                className="group relative bg-[var(--color-primary)] hover:bg-blue-600 rounded-2xl p-6 transition-all flex items-center justify-between overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                <div>
                                    <p className="text-white font-black text-xl">Find Leads</p>
                                    <p className="text-blue-100 text-sm mt-1">Search and discover high-value prospects</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
                                        <MagnifyingGlassIcon className="size-6 text-white" />
                                    </div>
                                    <ArrowRightIcon className="size-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            <Link
                                href="/calls"
                                className="group bg-[var(--color-surface-dark)] hover:bg-[var(--color-border-dark)] border border-[var(--color-border-dark)] hover:border-[var(--color-primary)]/50 rounded-2xl p-6 transition-all flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-white font-black text-xl">Call Queue</p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {stats.callsPending > 0
                                            ? `${stats.callsPending} lead${stats.callsPending > 1 ? 's' : ''} waiting for a call`
                                            : "No pending calls — add leads from Discovery"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                                        <PhoneIcon className="size-6 text-[var(--color-primary)]" />
                                    </div>
                                    <ArrowRightIcon className="size-5 text-slate-500 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Pipeline Visual */}
                    <div className="slide-in bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-2xl p-6" style={{ animationDelay: '460ms' }}>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Your Pipeline</h2>
                        <div className="flex items-center gap-0">
                            {[
                                { step: "1", label: "Discover", sublabel: "Find via Apify", href: "/discovery", done: stats.totalLeads > 0 },
                                { step: "2", label: "Queue", sublabel: "Add to calls", href: "/calls", done: stats.callsPending > 0 || stats.callsCompleted > 0 },
                                { step: "3", label: "Call", sublabel: "AI talks to them", href: "/calls", done: stats.callsCompleted > 0 },
                                { step: "4", label: "CRM", sublabel: "Log & follow up", href: "/crm", done: stats.crmLeads > 0 },
                            ].map((s, i) => (
                                <div key={s.step} className="flex items-center flex-1">
                                    <Link href={s.href} className="flex flex-col items-center gap-2 flex-1 group">
                                        <div className={`size-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${s.done
                                            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                                            : "border-slate-700 text-slate-500 group-hover:border-[var(--color-primary)]/50"
                                            }`}>
                                            {s.done ? <CheckCircleIcon className="size-5" /> : s.step}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-bold ${s.done ? "text-white" : "text-slate-500"}`}>{s.label}</p>
                                            <p className="text-[10px] text-slate-600">{s.sublabel}</p>
                                        </div>
                                    </Link>
                                    {i < 3 && (
                                        <div className={`h-0.5 w-12 mx-1 rounded-full transition-colors ${s.done ? "bg-[var(--color-primary)]/50" : "bg-slate-800"}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

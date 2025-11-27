"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cookie, Database, Activity, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Cookies", href: "/cookies", icon: Cookie },
    { name: "Datalayer", href: "/datalayer", icon: Database },
    { name: "GA4 Collection", href: "/ga4-collection", icon: Activity },
    { name: "Schedule", href: "/schedule", icon: Calendar },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-glass-200 bg-glass-100 backdrop-blur-xl h-screen sticky top-0 flex flex-col p-4 z-50">
            <div className="mb-8 flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    Data on Duty
                </span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group",
                                isActive
                                    ? "text-white shadow-lg shadow-primary/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-white/10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon className={cn("h-5 w-5 relative z-10", isActive ? "text-primary" : "group-hover:text-white transition-colors")} />
                            <span className="relative z-10">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/5">
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}

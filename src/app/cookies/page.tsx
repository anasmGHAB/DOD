"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Cookie, Play, Loader2, AlertCircle, Shield, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { saveScan, getScan, clearScan } from "@/utils/storage";

interface CookieData {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
    category: string;
}

export default function CookiesPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [cookies, setCookies] = useState<CookieData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState("https://www.nespresso.com/fr/fr");
    const [filter, setFilter] = useState<string>("All");

    // Load from localStorage on mount
    useEffect(() => {
        const saved = getScan('cookies');
        if (saved) {
            setCookies(saved.data);
            setUrl(saved.url);
        }
    }, []);

    const handleScan = async () => {
        setIsLoading(true);
        setError(null);
        setCookies([]);

        try {
            const response = await fetch("/api/scan-cookies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            const result = await response.json();

            if (result.success) {
                setCookies(result.data);
                // Save to localStorage
                saveScan('cookies', url, result.data);
            } else {
                setError(result.error || "Failed to scan");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setCookies([]);
        clearScan('cookies');
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Necessary":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "Analytics":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "Marketing":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "Preferences":
                return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            default:
                return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Necessary":
                return <ShieldCheck className="h-4 w-4" />;
            case "Analytics":
                return <Shield className="h-4 w-4" />;
            case "Marketing":
                return <ShieldAlert className="h-4 w-4" />;
            default:
                return <Cookie className="h-4 w-4" />;
        }
    };

    const filteredCookies = filter === "All" ? cookies : cookies.filter((c) => c.category === filter);

    const categories = ["All", "Necessary", "Analytics", "Marketing", "Preferences"];

    return (
        <div>
            <PageHeader
                title="Cookies Management"
                description="Monitor and manage cookie compliance across your digital assets."
            />

            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                    filter === cat
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {cat}
                                {cat !== "All" && cookies.filter((c) => c.category === cat).length > 0 && (
                                    <span className="ml-2 text-xs opacity-70">
                                        ({cookies.filter((c) => c.category === cat).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Cookie Cards */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-64 text-slate-400"
                                >
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                    <p>Scanning Cookies...</p>
                                    <p className="text-xs text-slate-500 mt-2">This may take a few seconds</p>
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-64 text-rose-400"
                                >
                                    <AlertCircle className="h-8 w-8 mb-4" />
                                    <p>{error}</p>
                                </motion.div>
                            ) : filteredCookies.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-64 text-slate-500"
                                >
                                    <p>Click "Start Scan" to analyze cookies</p>
                                </motion.div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {filteredCookies.map((cookie, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="glass-card p-4 group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(cookie.category)}
                                                    <h4 className="font-semibold text-white text-sm truncate max-w-[200px]">
                                                        {cookie.name}
                                                    </h4>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
                                                        getCategoryColor(cookie.category)
                                                    )}
                                                >
                                                    {cookie.category}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Domain:</span>
                                                    <span className="text-slate-300 truncate max-w-[180px]">{cookie.domain}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Expires:</span>
                                                    <span className="text-slate-300">
                                                        {cookie.expires === -1
                                                            ? "Session"
                                                            : new Date(cookie.expires * 1000).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    {cookie.httpOnly && (
                                                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px]">
                                                            HttpOnly
                                                        </span>
                                                    )}
                                                    {cookie.secure && (
                                                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px]">
                                                            Secure
                                                        </span>
                                                    )}
                                                    {cookie.sameSite && (
                                                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px]">
                                                            {cookie.sameSite}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                        <button
                            onClick={handleScan}
                            disabled={isLoading}
                            className={cn(
                                "w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl text-white font-medium transition-all shadow-lg shadow-primary/20",
                                isLoading
                                    ? "bg-slate-700 cursor-not-allowed"
                                    : "bg-gradient-to-r from-primary to-accent hover:shadow-primary/40 hover:scale-[1.02]"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Play className="h-5 w-5 fill-current" />
                                    Start Scan
                                </>
                            )}
                        </button>

                        {cookies.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 mt-3"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear Results
                            </button>
                        )}

                        <div className="mt-6 space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h4 className="text-sm font-medium text-slate-300 mb-3">Target URL</h4>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            {cookies.length > 0 && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <h4 className="text-sm font-medium text-slate-300 mb-2">Summary</h4>
                                    <div className="text-2xl font-bold text-white">{cookies.length}</div>
                                    <div className="text-xs text-slate-400">Total Cookies</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

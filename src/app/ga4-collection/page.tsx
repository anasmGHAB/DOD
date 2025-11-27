"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Activity, Play, Loader2, AlertCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { saveScan, getScan, clearScan } from "@/utils/storage";

interface GA4Hit {
    timestamp: string;
    url: string;
    eventName: string;
    parameters: Record<string, string>;
}

export default function GA4Page() {
    const [isLoading, setIsLoading] = useState(false);
    const [hits, setHits] = useState<GA4Hit[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState("https://www.nespresso.com/fr/fr");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = getScan('ga4');
        if (saved) {
            setHits(saved.data);
            setUrl(saved.url);
        }
    }, []);

    const handleScan = async () => {
        setIsLoading(true);
        setError(null);
        setHits([]);

        try {
            const response = await fetch("/api/scan-ga4", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            const result = await response.json();

            if (result.success) {
                setHits(result.data);
                // Save to localStorage
                saveScan('ga4', url, result.data);
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
        setHits([]);
        setExpandedIndex(null);
        clearScan('ga4');
    };

    const getEventColor = (eventName: string) => {
        if (eventName.includes("page_view")) return "from-blue-400 to-cyan-400";
        if (eventName.includes("scroll")) return "from-purple-400 to-pink-400";
        if (eventName.includes("click")) return "from-orange-400 to-red-400";
        if (eventName.includes("user_engagement")) return "from-emerald-400 to-teal-400";
        if (eventName.includes("session")) return "from-yellow-400 to-amber-400";
        return "from-slate-400 to-slate-500";
    };

    const isServiceWorkerHit = (hit: GA4Hit) => {
        return hit.url.includes("sw.js") || hit.parameters.initiator?.includes("sw.js");
    };

    const eventTypes = [...new Set(hits.map((h) => h.eventName))];

    return (
        <div>
            <PageHeader
                title="GA4 Collection"
                description="Track and analyze Google Analytics 4 hits in real-time."
            />

            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-6">
                    {/* Stats */}
                    {hits.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass-panel rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{hits.length}</div>
                                <div className="text-xs text-slate-400">Total Hits</div>
                            </div>
                            <div className="glass-panel rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{eventTypes.length}</div>
                                <div className="text-xs text-slate-400">Event Types</div>
                            </div>
                            <div className="glass-panel rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">
                                    {hits.filter((h) => h.eventName.includes("page_view")).length}
                                </div>
                                <div className="text-xs text-slate-400">Page Views</div>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="glass-panel rounded-2xl p-6 min-h-[500px]">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Event Timeline
                        </h3>

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
                                        <p>Tracking GA4 Hits...</p>
                                        <p className="text-xs text-slate-500 mt-2">Scrolling to bottom and capturing events...</p>
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
                                ) : hits.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-64 text-slate-500"
                                    >
                                        <p>Click "Start Tracking" to capture GA4 hits</p>
                                    </motion.div>
                                ) : (
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent" />

                                        {hits.map((hit, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="relative pl-16 pb-8"
                                            >
                                                {/* Timeline dot */}
                                                <div
                                                    className={cn(
                                                        "absolute left-4 top-2 h-5 w-5 rounded-full border-4 border-background shadow-lg",
                                                        `bg-gradient-to-br ${getEventColor(hit.eventName)}`
                                                    )}
                                                />

                                                {/* Event card */}
                                                <div
                                                    className="glass-card p-4 group cursor-pointer"
                                                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                <span
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg",
                                                                        `bg-gradient-to-r ${getEventColor(hit.eventName)}`
                                                                    )}
                                                                >
                                                                    {hit.eventName}
                                                                </span>
                                                                {isServiceWorkerHit(hit) && (
                                                                    <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-200 border border-yellow-500/30">
                                                                        ⚙️ SW
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-slate-300 font-medium">
                                                                    {new Date(hit.timestamp).toLocaleTimeString()}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-200 mt-2 bg-black/40 p-2 rounded font-mono">
                                                                <span className="truncate block max-w-[500px]">
                                                                    {hit.parameters.page_location || hit.parameters.dl || "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button className="text-slate-300 hover:text-white transition-colors">
                                                            {expandedIndex === i ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Expanded parameters */}
                                                    <AnimatePresence>
                                                        {expandedIndex === i && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                                                            >
                                                                <div className="space-y-2 text-xs font-mono bg-black/40 p-3 rounded-lg">
                                                                    {Object.entries(hit.parameters)
                                                                        .slice(0, 15)
                                                                        .map(([key, value]) => (
                                                                            <div
                                                                                key={key}
                                                                                className="flex justify-between gap-4 py-1 border-b border-white/5 last:border-0"
                                                                            >
                                                                                <span className="text-slate-300 font-semibold">{key}:</span>
                                                                                <span className="text-slate-100 truncate max-w-[300px]">{value}</span>
                                                                            </div>
                                                                        ))}
                                                                    {Object.keys(hit.parameters).length > 15 && (
                                                                        <div className="text-slate-400 text-center pt-2 text-[10px]">
                                                                            +{Object.keys(hit.parameters).length - 15} more parameters
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
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
                                    Tracking...
                                </>
                            ) : (
                                <>
                                    <Play className="h-5 w-5 fill-current" />
                                    Start Tracking
                                </>
                            )}
                        </button>

                        {hits.length > 0 && (
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
                        </div>
                    </div>

                    {/* Event types legend */}
                    {eventTypes.length > 0 && (
                        <div className="glass-panel rounded-2xl p-6">
                            <h4 className="text-sm font-medium text-slate-300 mb-3">Event Types</h4>
                            <div className="space-y-2">
                                {eventTypes.map((type) => (
                                    <div key={type} className="flex items-center gap-2 text-xs">
                                        <div className={cn("h-3 w-3 rounded-full bg-gradient-to-r", getEventColor(type))} />
                                        <span className="text-slate-300">{type}</span>
                                        <span className="ml-auto text-slate-400">
                                            {hits.filter((h) => h.eventName === type).length}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Code2, Play, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { saveScan, getScan, clearScan } from "@/utils/storage";

export default function DatalayerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState("https://www.nespresso.com/fr/fr");

    // Load from localStorage on mount
    useEffect(() => {
        const saved = getScan('datalayer');
        if (saved) {
            setData(saved.data);
            setUrl(saved.url);
        }
    }, []);

    const handleScan = async () => {
        setIsLoading(true);
        setError(null);
        setData([]);

        try {
            const response = await fetch("/api/scan-datalayer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                // Save to localStorage
                saveScan('datalayer', url, result.data);
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
        setData([]);
        clearScan('datalayer');
    };

    return (
        <div>
            <PageHeader
                title="Datalayer Inspector"
                description="Real-time visualization of your data layer events."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel rounded-2xl p-6 min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                Event Stream
                            </h3>
                            {data.length > 0 && (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                    {data.length} Events Found
                                </span>
                            )}
                        </div>

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
                                        <p>Scanning DataLayer...</p>
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
                                ) : data.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-64 text-slate-500"
                                    >
                                        <p>Click "Start Scan" to analyze the DataLayer</p>
                                    </motion.div>
                                ) : (
                                    data.map((event, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="group bg-black/40 rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-all font-mono text-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                                                <span className="font-semibold text-slate-300">Event #{i + 1}</span>
                                                <span>{event.event || "Unknown Event"}</span>
                                            </div>
                                            <pre className="text-emerald-400 overflow-x-auto custom-scrollbar">
                                                {JSON.stringify(event, null, 2)}
                                            </pre>
                                        </motion.div>
                                    ))
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
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Play className="h-5 w-5 fill-current" />
                                    Start Scan
                                </>
                            )}
                        </button>

                        {data.length > 0 && (
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
                </div>
            </div>
        </div>
    );
}

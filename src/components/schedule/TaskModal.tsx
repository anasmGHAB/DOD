"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Repeat, Globe } from "lucide-react";
import { ScheduledTask } from "@/utils/scheduler";
import { cn } from "@/lib/utils";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<ScheduledTask, 'id' | 'createdAt' | 'status'>) => void;
    editTask?: ScheduledTask | null;
}

export function TaskModal({ isOpen, onClose, onSave, editTask }: TaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [scanType, setScanType] = useState<'cookies' | 'datalayer' | 'ga4'>('cookies');
    const [url, setUrl] = useState("https://www.nespresso.com/fr/fr");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("10:00");
    const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

    useEffect(() => {
        if (editTask) {
            setTitle(editTask.title);
            setDescription(editTask.description);
            setScanType(editTask.scanType);
            setUrl(editTask.url);
            setScheduledDate(editTask.scheduledDate);
            setScheduledTime(editTask.scheduledTime);
            setRecurrence(editTask.recurrence);
        } else {
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduledDate(tomorrow.toISOString().split('T')[0]);
        }
    }, [editTask, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !scheduledDate) return;

        onSave({
            title,
            description,
            scanType,
            url,
            scheduledDate,
            scheduledTime,
            recurrence,
        });

        handleClose();
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setScanType('cookies');
        setUrl("https://www.nespresso.com/fr/fr");
        setScheduledDate("");
        setScheduledTime("10:00");
        setRecurrence('none');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {editTask ? 'Edit Task' : 'New Scheduled Task'}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Task Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Weekly Data Audit"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe what this task does..."
                                        rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                                    />
                                </div>

                                {/* Scan Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Scan Type *
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['cookies', 'datalayer', 'ga4'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setScanType(type)}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl text-sm font-medium transition-all capitalize",
                                                    scanType === type
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                                )}
                                            >
                                                {type === 'ga4' ? 'GA4' : type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* URL */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Target URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Recurrence */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <Repeat className="h-4 w-4" />
                                        Recurrence
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {(['none', 'daily', 'weekly', 'monthly'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setRecurrence(type)}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl text-sm font-medium transition-all capitalize",
                                                    recurrence === type
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                    >
                                        {editTask ? 'Update Task' : 'Create Task'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

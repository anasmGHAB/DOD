"use client";

import { motion } from "framer-motion";
import { Cookie, Database, Activity, Clock, Repeat, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { ScheduledTask } from "@/utils/scheduler";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: ScheduledTask;
    onEdit: (task: ScheduledTask) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
    const getScanIcon = () => {
        switch (task.scanType) {
            case 'cookies': return Cookie;
            case 'datalayer': return Database;
            case 'ga4': return Activity;
        }
    };

    const getScanColor = () => {
        switch (task.scanType) {
            case 'cookies': return 'from-orange-400 to-red-400';
            case 'datalayer': return 'from-blue-400 to-cyan-400';
            case 'ga4': return 'from-purple-400 to-pink-400';
        }
    };

    const getStatusColor = () => {
        switch (task.status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'completed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30';
        }
    };

    const Icon = getScanIcon();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 group"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                    "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                    getScanColor()
                )}>
                    <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm mb-1 truncate">
                                {task.title}
                            </h4>
                            {task.description && (
                                <p className="text-slate-400 text-xs line-clamp-2">
                                    {task.description}
                                </p>
                            )}
                        </div>
                        <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-medium border flex-shrink-0",
                            getStatusColor()
                        )}>
                            {task.status}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.scheduledTime}</span>
                        </div>
                        {task.recurrence !== 'none' && (
                            <div className="flex items-center gap-1">
                                <Repeat className="h-3 w-3" />
                                <span className="capitalize">{task.recurrence}</span>
                            </div>
                        )}
                        <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-white/5">
                            {task.scanType === 'ga4' ? 'GA4' : task.scanType}
                        </span>
                    </div>

                    {/* URL */}
                    <div className="text-xs text-slate-500 font-mono truncate mb-3">
                        {task.url}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onToggleStatus(task.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                task.status === 'completed'
                                    ? "bg-white/5 text-slate-400 hover:bg-white/10"
                                    : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            )}
                        >
                            <CheckCircle2 className="h-3 w-3" />
                            {task.status === 'completed' ? 'Completed' : 'Mark Done'}
                        </button>
                        <button
                            onClick={() => onEdit(task)}
                            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        >
                            <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-all"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    change?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-glass-100 p-6 border border-glass-200 backdrop-blur-md transition-all duration-300 hover:bg-glass-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
                </div>
                <div className="rounded-xl bg-white/5 p-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>

            {change && (
                <div className="mt-4 flex items-center gap-2">
                    <span
                        className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            trend === "up"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : trend === "down"
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-slate-500/10 text-slate-400"
                        )}
                    >
                        {change}
                    </span>
                    <span className="text-xs text-slate-500">vs last month</span>
                </div>
            )}
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    tasksByDate: Map<string, any[]>;
}

export function Calendar({ selectedDate, onSelectDate, tasksByDate }: CalendarProps) {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const today = new Date();
    const isToday = (day: number) => {
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        return (
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear()
        );
    };

    const getTaskCount = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasksByDate.get(dateStr)?.length || 0;
    };

    const handlePrevMonth = () => {
        const newDate = new Date(currentYear, currentMonth - 1, 1);
        onSelectDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentYear, currentMonth + 1, 1);
        onSelectDate(newDate);
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        onSelectDate(newDate);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-20" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const taskCount = getTaskCount(day);
        days.push(
            <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDayClick(day)}
                className={cn(
                    "h-20 rounded-xl border transition-all relative group",
                    isSelected(day)
                        ? "bg-primary border-primary shadow-lg shadow-primary/20"
                        : isToday(day)
                            ? "bg-white/10 border-white/20"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
            >
                <div className="flex flex-col items-center justify-center h-full">
                    <span
                        className={cn(
                            "text-lg font-semibold",
                            isSelected(day) ? "text-white" : isToday(day) ? "text-primary" : "text-slate-300"
                        )}
                    >
                        {day}
                    </span>
                    {taskCount > 0 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        isSelected(day) ? "bg-white" : "bg-primary"
                                    )}
                                />
                            ))}
                            {taskCount > 3 && (
                                <span className="text-[10px] text-slate-400 ml-1">+{taskCount - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </motion.button>
        );
    }

    return (
        <div className="glass-panel rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                    {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((name) => (
                    <div key={name} className="text-center text-xs font-medium text-slate-400 py-2">
                        {name}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2">{days}</div>
        </div>
    );
}

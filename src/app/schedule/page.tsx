"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Calendar } from "@/components/schedule/Calendar";
import { TaskModal } from "@/components/schedule/TaskModal";
import { TaskCard } from "@/components/schedule/TaskCard";
import { Plus, CalendarDays, ListTodo, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    ScheduledTask,
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksForDate,
    getTasksForMonth,
    getUpcomingTasks,
    getTaskStats,
} from "@/utils/scheduler";

type ViewMode = 'calendar' | 'list' | 'upcoming';

export default function SchedulePage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
    const [tasks, setTasks] = useState<ScheduledTask[]>([]);
    const [tasksByDate, setTasksByDate] = useState<Map<string, ScheduledTask[]>>(new Map());

    useEffect(() => {
        loadTasks();
    }, [selectedDate]);

    const loadTasks = () => {
        setTasks(getAllTasks());
        const monthTasks = getTasksForMonth(selectedDate.getFullYear(), selectedDate.getMonth());
        setTasksByDate(monthTasks);
    };

    const handleCreateTask = (taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'status'>) => {
        if (editingTask) {
            updateTask(editingTask.id, taskData);
            setEditingTask(null);
        } else {
            createTask(taskData);
        }
        loadTasks();
    };

    const handleEditTask = (task: ScheduledTask) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleDeleteTask = (id: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(id);
            loadTasks();
        }
    };

    const handleToggleStatus = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            updateTask(id, {
                status: task.status === 'completed' ? 'pending' : 'completed'
            });
            loadTasks();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const selectedDateTasks = getTasksForDate(selectedDateStr);
    const upcomingTasks = getUpcomingTasks(10);
    const stats = getTaskStats();

    return (
        <div>
            <PageHeader
                title="Schedule"
                description="Manage your data collection tasks and audits."
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="glass-panel rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-slate-400">Total Tasks</div>
                </div>
                <div className="glass-panel rounded-xl p-4">
                    <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                    <div className="text-xs text-slate-400">Pending</div>
                </div>
                <div className="glass-panel rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
                    <div className="text-xs text-slate-400">Completed</div>
                </div>
                <div className="glass-panel rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.recurring}</div>
                    <div className="text-xs text-slate-400">Recurring</div>
                </div>
            </div>

            {/* View Mode Toggle & New Task Button */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    {([
                        { mode: 'calendar' as ViewMode, icon: CalendarDays, label: 'Calendar' },
                        { mode: 'list' as ViewMode, icon: ListTodo, label: 'List' },
                        { mode: 'upcoming' as ViewMode, icon: TrendingUp, label: 'Upcoming' },
                    ]).map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                viewMode === mode
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    New Task
                </button>
            </div>

            {/* Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <>
                        <div className="lg:col-span-2">
                            <Calendar
                                selectedDate={selectedDate}
                                onSelectDate={setSelectedDate}
                                tasksByDate={tasksByDate}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    {selectedDate.toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </h3>

                                <AnimatePresence mode="popLayout">
                                    {selectedDateTasks.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedDateTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onEdit={handleEditTask}
                                                    onDelete={handleDeleteTask}
                                                    onToggleStatus={handleToggleStatus}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12 text-slate-500"
                                        >
                                            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">No tasks scheduled</p>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="text-primary text-sm hover:underline mt-2"
                                            >
                                                Create one →
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="lg:col-span-3">
                        <div className="glass-panel rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">All Tasks</h3>
                            <AnimatePresence mode="popLayout">
                                {tasks.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {tasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onEdit={handleEditTask}
                                                onDelete={handleDeleteTask}
                                                onToggleStatus={handleToggleStatus}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12 text-slate-500"
                                    >
                                        <ListTodo className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg mb-2">No tasks yet</p>
                                        <p className="text-sm mb-4">Create your first scheduled task</p>
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
                                        >
                                            Create Task
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Upcoming View */}
                {viewMode === 'upcoming' && (
                    <div className="lg:col-span-3">
                        <div className="glass-panel rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
                            <AnimatePresence mode="popLayout">
                                {upcomingTasks.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {upcomingTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onEdit={handleEditTask}
                                                onDelete={handleDeleteTask}
                                                onToggleStatus={handleToggleStatus}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12 text-slate-500"
                                    >
                                        <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg mb-2">No upcoming tasks</p>
                                        <p className="text-sm mb-4">Schedule a task for the future</p>
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
                                        >
                                            Create Task
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleCreateTask}
                editTask={editingTask}
            />
        </div>
    );
}

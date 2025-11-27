export interface ScheduledTask {
    id: string;
    title: string;
    description: string;
    scanType: 'cookies' | 'datalayer' | 'ga4';
    url: string;
    scheduledDate: string; // YYYY-MM-DD
    scheduledTime: string; // HH:MM
    recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

const STORAGE_KEY = 'dod_scheduled_tasks';

// Get all tasks
export function getAllTasks(): ScheduledTask[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save all tasks
function saveTasks(tasks: ScheduledTask[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Create a new task
export function createTask(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'status'>): ScheduledTask {
    const newTask: ScheduledTask = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    const tasks = getAllTasks();
    tasks.push(newTask);
    saveTasks(tasks);

    return newTask;
}

// Update a task
export function updateTask(id: string, updates: Partial<ScheduledTask>): ScheduledTask | null {
    const tasks = getAllTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) return null;

    tasks[index] = { ...tasks[index], ...updates };
    saveTasks(tasks);

    return tasks[index];
}

// Delete a task
export function deleteTask(id: string): boolean {
    const tasks = getAllTasks();
    const filtered = tasks.filter(t => t.id !== id);

    if (filtered.length === tasks.length) return false;

    saveTasks(filtered);
    return true;
}

// Get tasks for a specific date
export function getTasksForDate(date: string): ScheduledTask[] {
    const tasks = getAllTasks();
    return tasks.filter(task => {
        if (task.scheduledDate === date) return true;

        // Handle recurring tasks
        if (task.recurrence !== 'none') {
            const taskDate = new Date(task.scheduledDate);
            const checkDate = new Date(date);

            if (checkDate < taskDate) return false;

            if (task.recurrence === 'daily') {
                return true;
            } else if (task.recurrence === 'weekly') {
                const daysDiff = Math.floor((checkDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff % 7 === 0;
            } else if (task.recurrence === 'monthly') {
                return taskDate.getDate() === checkDate.getDate();
            }
        }

        return false;
    });
}

// Get tasks for a month
export function getTasksForMonth(year: number, month: number): Map<string, ScheduledTask[]> {
    const tasks = getAllTasks();
    const tasksByDate = new Map<string, ScheduledTask[]>();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTasks = getTasksForDate(date);
        if (dayTasks.length > 0) {
            tasksByDate.set(date, dayTasks);
        }
    }

    return tasksByDate;
}

// Get upcoming tasks
export function getUpcomingTasks(limit: number = 10): ScheduledTask[] {
    const tasks = getAllTasks();
    const today = new Date().toISOString().split('T')[0];

    return tasks
        .filter(task => task.scheduledDate >= today && task.status === 'pending')
        .sort((a, b) => {
            const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
            if (dateCompare !== 0) return dateCompare;
            return a.scheduledTime.localeCompare(b.scheduledTime);
        })
        .slice(0, limit);
}

// Get task statistics
export function getTaskStats() {
    const tasks = getAllTasks();
    return {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        recurring: tasks.filter(t => t.recurrence !== 'none').length,
    };
}

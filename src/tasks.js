export const STORAGE_KEY = 'daylist.tasks.v1';

export function readTasks(storage) {
  try {
    const tasks = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task && typeof task.id === 'string' &&
      typeof task.text === 'string' && task.text.trim() && typeof task.completed === 'boolean');
  } catch {
    return [];
  }
}

export function visibleTasks(tasks, filter) {
  return tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));
}

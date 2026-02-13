const BASE = '/api';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getTasks: (status?: string) => request(status ? `/tasks?status=${status}` : '/tasks'),
  getTask: (id: string) => request(`/tasks/${id}`),
  createTask: (data: any) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),
  reorderTasks: (updates: any[]) => request('/tasks/reorder', { method: 'POST', body: JSON.stringify({ updates }) }),
  getActivity: (limit = 50) => request(`/activity?limit=${limit}`),
};

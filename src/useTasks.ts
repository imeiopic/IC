import { ref } from "vue";
import { getAuth } from "firebase/auth";

export function useTasks() {
  const tasks = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isCreating = ref(false);

  // Helper to get auth headers
  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const auth = getAuth();
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchTasks = async () => {
    loading.value = true;
    error.value = null;
    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/tasks", { headers });
      if (!response.ok) throw new Error("Failed to load tasks");
      const result = await response.json();
      tasks.value = result.data || [];
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (title: string, projectId: string | null) => {
    isCreating.value = true;
    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers,
        body: JSON.stringify({ title, isCompleted: false, projectId }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      await fetchTasks();
    } finally {
      isCreating.value = false;
    }
  };

  const toggleTaskCompletion = async (task: any) => {
    const originalStatus = task.isCompleted;
    task.isCompleted = !originalStatus; // Optimistic update

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/tasks/${task.uniqueId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isCompleted: task.isCompleted }),
      });
      if (!response.ok) throw new Error("Failed to update task");
    } catch (e) {
      task.isCompleted = originalStatus; // Revert on failure
      throw e;
    }
  };

  const deleteTask = async (taskId: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) throw new Error("Failed to delete task");

    // Update local state without needing a re-fetch
    tasks.value = tasks.value.filter((t) => t.uniqueId !== taskId);
  };

  return {
    tasks,
    loading,
    error,
    isCreating,
    fetchTasks,
    createTask,
    toggleTaskCompletion,
    deleteTask,
  };
}

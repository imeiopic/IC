import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTasks } from "./useTasks";
import { getAuth } from "firebase/auth";

// 1. Mock the firebase/auth module
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
}));

describe("useTasks composable", () => {
  const mockGetIdToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // 2. Setup the global fetch mock using Vitest's stub utility
    vi.stubGlobal("fetch", vi.fn());

    // 3. Setup the Firebase Auth mock implementation
    (getAuth as any).mockReturnValue({
      currentUser: {
        getIdToken: mockGetIdToken.mockResolvedValue("mock-jwt-token"),
      },
    });
  });

  it("should initialize with correct default state", () => {
    const { tasks, loading, error, isCreating } = useTasks();

    expect(tasks.value).toEqual([]);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(isCreating.value).toBe(false);
  });

  it("should successfully fetch tasks and update state", async () => {
    const mockTasks = [
      { uniqueId: "1", title: "Test Task 1", isCompleted: false },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockTasks }),
    });

    const { fetchTasks, tasks, loading, error } = useTasks();

    const fetchPromise = fetchTasks();

    // Loading should be true while fetching
    expect(loading.value).toBe(true);

    await fetchPromise;

    // Verify the API was called with the correct headers
    expect(fetch).toHaveBeenCalledWith("/api/tasks", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-jwt-token",
      },
    });

    // Verify state updates
    expect(tasks.value).toEqual(mockTasks);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it("should handle fetch errors gracefully", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    });

    const { fetchTasks, tasks, error } = useTasks();

    await fetchTasks();

    expect(tasks.value).toEqual([]);
    expect(error.value).toBe("Failed to load tasks");
  });

  it("should perform optimistic updates on toggleTaskCompletion", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true });

    const { toggleTaskCompletion } = useTasks();
    const task = { uniqueId: "1", title: "Task", isCompleted: false };

    await toggleTaskCompletion(task);

    // The task object itself should be mutated optimistically
    expect(task.isCompleted).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "/api/tasks/1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ isCompleted: true }),
      }),
    );
  });

  it("should remove the task from local state upon deletion", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true });

    const { deleteTask, tasks } = useTasks();

    // Pre-populate tasks state
    tasks.value = [
      { uniqueId: "1", title: "Task 1" },
      { uniqueId: "2", title: "Task 2" },
    ];

    await deleteTask("1");

    expect(tasks.value).toEqual([{ uniqueId: "2", title: "Task 2" }]);
  });
});

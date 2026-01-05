"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Check, Edit } from "lucide-react"; // ✅ removed unused Plus

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading" || !session?.user?.email) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/tasks", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch tasks");
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      alert(err?.message || "Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newTaskItem = {
      id: tempId,
      title: newTask,
      description: newDescription,
      completed: false,
      userId: session?.user?.email || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTaskItem]);
    setNewTask("");
    setNewDescription("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskItem.title,
          description: newTaskItem.description,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add task");
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === tempId ? { ...data, userId: session?.user?.email || "" } : t,
        ),
      );
    } catch (err: any) {
      console.error("Add task error:", err);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      alert(err?.message || "Failed to add task. Please try again.");
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    if (!task?.id) return;

    const taskId = task.id;
    const previousTasks = [...tasks];
    const updatedTask = { ...task, completed: !task.completed };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    setUpdatingTaskIds((prev) => [...prev, taskId]);

    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: updatedTask.completed,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update task");
      }

      const data = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
      );
    } catch (err: any) {
      console.error("Toggle failed, reverting:", err);
      setTasks(previousTasks);
      alert(err?.message || "Failed to update task. Please try again.");
    } finally {
      setUpdatingTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const deleteTask = async (id: string) => {
    if (!id) return;

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setUpdatingTaskIds((prev) => [...prev, id]);

    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete task");
      }
    } catch (err: any) {
      console.error("Delete failed, reverting:", err);
      setTasks(previousTasks);
      alert(err?.message || "Failed to delete task. Please try again.");
    } finally {
      setUpdatingTaskIds((prev) => prev.filter((taskId) => taskId !== id));
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            disabled={updatingTaskIds.length > 0}
          />
          <button
            onClick={addTask}
            disabled={!newTask.trim() || updatingTaskIds.length > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updatingTaskIds.length > 0 ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Add"
            )}
          </button>
        </div>
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          rows={2}
          disabled={updatingTaskIds.length > 0}
        />
      </div>

      <motion.ul className="space-y-3">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.li
              className="text-center py-10 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? "Loading tasks..." : "No tasks yet. Add one above!"}
            </motion.li>
          ) : (
            tasks.map((task) => (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-4 rounded-lg border ${
                  task.completed
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskCompletion(task)}
                    disabled={updatingTaskIds.includes(task.id)}
                    className={`p-1.5 rounded-full mt-0.5 transition-colors ${
                      task.completed
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                        : "border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {updatingTaskIds.includes(task.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : task.completed ? (
                      <Check size={16} />
                    ) : null}
                  </button>

                  <div
                    className={`flex-1 min-w-0 cursor-pointer ${
                      task.completed ? "opacity-75" : ""
                    }`}
                    onClick={() => router.push(`/tasks/edit/${task.id}`)}
                  >
                    <h3
                      className={`text-lg font-medium ${
                        task.completed
                          ? "line-through text-gray-500"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {task.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Updated: {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tasks/edit/${task.id}`);
                      }}
                      disabled={updatingTaskIds.includes(task.id)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                      title="Edit task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      disabled={updatingTaskIds.includes(task.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="Delete task"
                    >
                      {updatingTaskIds.includes(task.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

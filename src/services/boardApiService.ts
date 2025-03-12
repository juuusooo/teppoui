import { Board } from "@/types/Board";
import { Column } from "@/types/Column";
import { Task } from "@/types/Task";
import { refreshAccessToken } from "./userApiService";

const API_URL = "http://localhost:8080/api/boards";

// Utility function for handling API requests
const request = async <T>(url: string, options: RequestInit = {}) => {
  try {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");
    // Add Authorization header if token exists
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Merge custom headers
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    if (response.status == 401) {
      // token expired, get a new one
      await refreshAccessToken();
      return request(url, options);
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 🏗️ Fetch all boards
export const getBoards = async (): Promise<Board[]> => {
  return request<Board[]>(API_URL);
};

// 📌 Create a new board
export const createBoard = async (title: string): Promise<Board> => {
  return request<Board>(API_URL, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
};

// 📌 Create a new board
export const shareBoard = async (boardId: string, email: string): Promise<void> => {
  return request(`${API_URL}/${boardId}/share`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

// 🚮 Delete a board
export const deleteBoard = async (boardId: string): Promise<void> => {
  return request(`${API_URL}/${boardId}`, { method: "DELETE" });
};

// ➕ Add a column to a board
export const addColumn = async (boardId: string, columnTitle: string): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/columns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ columnTitle }),
  });
};

// ✏️ Update a column title
export const updateColumn = async (boardId: string, columnId: string, columnTitle: string): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/columns/${columnId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ columnTitle }),
  });
};

// ✏️ Update a column title
export const moveColumn = async (boardId: string, columnId: string, newIndex: number): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/columns/${columnId}/move`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newIndex }),
  });
};

// 🗑️ Delete a column
export const deleteColumn = async (boardId: string, columnId: string): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/columns/${columnId}`, { method: "DELETE" });
};

// 📝 Add a task to a column
export const addTask = async (boardId: string, columnId: string, taskData: Partial<Task>): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/columns/${columnId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
};

// Add comment to task
export const addCommentToTask = async (boardId: string, columnId: string, taskId: string, comment: string): Promise<Task> => {
  return request<Task>(`${API_URL}/${boardId}/columns/${columnId}/tasks/${taskId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({"comment": comment}),
  });
};

// Add like to task
export const addLike = async (boardId: string, columnId: string, taskId: string): Promise<Task> => {
  return request<Task>(`${API_URL}/${boardId}/columns/${columnId}/tasks/${taskId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

// Remove like from task
export const removeLike = async (boardId: string, columnId: string, taskId: string): Promise<Task> => {
  return request<Task>(`${API_URL}/${boardId}/columns/${columnId}/tasks/${taskId}/like`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
};

// Add dislike to task
export const addDislike = async (boardId: string, columnId: string, taskId: string): Promise<Task> => {
  return request<Task>(`${API_URL}/${boardId}/columns/${columnId}/tasks/${taskId}/dislike`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

// Remove dislike from task
export const removeDislike = async (boardId: string, columnId: string, taskId: string): Promise<Task> => {
  return request<Task>(`${API_URL}/${boardId}/columns/${columnId}/tasks/${taskId}/dislike`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
};

// ✏️ Update a task
export const updateTask = async (boardId: string, task: Task): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/columns/${task.columnId}/tasks/${task._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
};

export const moveTask = async (boardId: string, taskId: string, sourceColumnId: string, destinationColumnId: string): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/tasks/${taskId}/move`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceColumnId, destinationColumnId }),
  });
};

export const reorderTasks = async (boardId: string, columnId: string, newOrder: Task[]): Promise<Column> => {
  return request<Column>(`${API_URL}/${boardId}/columns/${columnId}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newOrder }),
  });
};

// 🚮 Delete a task
export const deleteTask = async (boardId: string, columnId: string, taskId: string): Promise<Board> => {
  return request<Board>(`${API_URL}/${boardId}/columns/${columnId}/tasks/${taskId}`, { method: "DELETE" });
};

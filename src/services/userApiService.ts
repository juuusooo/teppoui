import { User } from "@/types/User";

const API_URL = "http://localhost:8080/api/users";

// A general purpose request function that handles authentication automatically.
// This is good because there is less boilerplate in the other functions and saves space.
const request = async (url: string, options: RequestInit = {}) => {
  try {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: { ...headers, ...(options.headers || {}) },
    });

    // token expired
    if (response.status === 401) {
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

const publicEndpointRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`${data.message}`);
    }

    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/users/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data.token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }
};

export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Register new user
export const registerUser = async (email: string, username: string,  password: string) => {
  const userData = await publicEndpointRequest(`${API_URL}/register`, {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

  // Store JWT token in localStorage
  localStorage.setItem("token", userData.token);
  return userData;
};

// Log in
export const loginUser = async (email: string, password: string) => {
  const userData = await publicEndpointRequest(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Store JWT token in localStorage
  localStorage.setItem("token", userData.token);
  localStorage.setItem("userId", userData._id);
  return userData;
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  const userData = await request(`${API_URL}/profile`);
  localStorage.setItem("userId", userData._id);
  return userData;
};

// Update user profile
export const updateUserProfile = async (username: string, email: string) => {
  return request(`${API_URL}/profile`, {
    method: "PUT",
    body: JSON.stringify({ username, email }),
  });
};

// Log out user (clears token)
export const logoutUser = () => {
  localStorage.removeItem("token");
};

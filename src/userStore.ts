import { getUserProfile } from "@/services/userApiService";
import { User } from "@/types/User";

// This file contains a store for user to get data like user._id

let currentUser: User | null = null;

// Fetch user data and store it globally
export const fetchUser = async () => {
  try {
    const user = await getUserProfile();
    currentUser = user;
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Get the current user (without fetching)
export const getUser = () => currentUser;

// Set user manually if needed (e.g., after login)
export const setUser = (user: User | null) => {
  currentUser = user;
};

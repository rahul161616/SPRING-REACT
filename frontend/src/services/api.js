// API base URL from environment variables with fallback
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";
export const AUTH_URL =
  process.env.REACT_APP_AUTH_URL || "http://localhost:8080/api/auth";

// Helper function for API requests with authentication
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

// Event-related API calls
export const eventService = {
  getAll: () => fetchWithAuth("/events"),
  getById: (id) => fetchWithAuth(`/events/${id}`),
  create: (event) =>
    fetchWithAuth("/events", {
      method: "POST",
      body: JSON.stringify(event),
    }),
  update: (id, event) =>
    fetchWithAuth(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    }),
  delete: (id) => fetchWithAuth(`/events/${id}`, { method: "DELETE" }),
  toggleComplete: (id, completed) =>
    fetchWithAuth(`/events/${id}/complete`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    }),

  // Task-related endpoints
  addTask: (eventId, task) =>
    fetchWithAuth(`/events/${eventId}/tasks`, {
      method: "POST",
      body: JSON.stringify(task),
    }),
  updateTask: (eventId, taskId, task) =>
    fetchWithAuth(`/events/${eventId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),
  deleteTask: (eventId, taskId) =>
    fetchWithAuth(`/events/${eventId}/tasks/${taskId}`, {
      method: "DELETE",
    }),
};

// Auth-related API calls
export const authService = {
  login: (credentials) => {
    return fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Login failed");
        });
      }
      return response.json();
    });
  },
  register: (userData) => {
    return fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Registration failed");
        });
      }
      return response.json();
    });
  },
  validateToken: () => {
    const token = localStorage.getItem("token");
    if (!token) return Promise.reject("No token found");

    return fetch(`${AUTH_URL}/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Invalid token");
      }
      return response.json();
    });
  },
};

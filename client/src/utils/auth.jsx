const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api' || "/api";

// Helper to store auth data in localStorage
const saveAuthData = (token, user) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
};

export const authUtils = {
  // Signup student or admin
  signup: async ({ username, email, password, userType, studentId, name, dsaProfile }) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, userType, studentId, name, dsaProfile })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    saveAuthData(data.token, data.user);
    return data;
  },

  // Login student or admin
  login: async ({ username, password, userType }) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, userType })
    });

    const data = await res.json();
    if (!res.ok) {
      // Prefer the server-provided blockedReason when present so UI can display it
      const reason = data.blockedReason ? ` Reason: ${data.blockedReason}` : '';
      const msg = (data.message || 'Login failed') + reason;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    saveAuthData(data.token, data.user);
    return data;
  },

  // Get currently logged in user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }
};

// No-op now, kept for backwards compatibility if imported elsewhere
export const initializeDemoUsers = () => {};
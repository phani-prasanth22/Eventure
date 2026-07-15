const API_BASE = 'http://127.0.0.1:8000/api';

export const authService = {
  async login(email, password) {
    // Django SimpleJWT uses username, but your login page currently sends email.
    // For now, we will treat the email input as the username input.
    const response = await fetch(`${API_BASE}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Invalid credentials');
    }

    const accessToken = data.access;
    const refreshToken = data.refresh;

    // decode user id from JWT payload
    const payload = JSON.parse(atob(accessToken.split('.')[1]));

    // temporary user object until we build a proper profile API
    const user = {
      id: payload.user_id,
      email: email,
      role: email === 'eventure' ? 'admin' : 'user',
    };

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token: accessToken };
  },

  async register(userData) {
    const response = await fetch(`${API_BASE}/users/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.email,
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.detail || 'Registration failed');
    }

    return { message: data.message };
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    return { success: true };
  },

  async getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  async updateProfile(userData) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updated = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  isAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === 'admin';
  },

  onAuthStateChange(callback) {
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};

export default authService;
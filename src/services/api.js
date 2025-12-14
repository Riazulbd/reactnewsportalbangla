// API service for communicating with backend
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Get auth token
const getToken = () => localStorage.getItem('authToken');

// Common headers
const getHeaders = (includeAuth = true) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (includeAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};

// Handle response
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }
    return response.json();
};

// Articles API
export const articlesApi = {
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/articles${queryString ? '?' + queryString : ''}`, {
            headers: getHeaders(false),
        });
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE}/articles/${id}`, {
            headers: getHeaders(false),
        });
        return handleResponse(response);
    },

    create: async (article) => {
        const response = await fetch(`${API_BASE}/articles`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(article),
        });
        return handleResponse(response);
    },

    update: async (id, article) => {
        const response = await fetch(`${API_BASE}/articles/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(article),
        });
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE}/articles/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// Categories API
export const categoriesApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE}/categories`, {
            headers: getHeaders(false),
        });
        return handleResponse(response);
    },

    create: async (category) => {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(category),
        });
        return handleResponse(response);
    },

    update: async (id, category) => {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(category),
        });
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    reorder: async (order) => {
        const response = await fetch(`${API_BASE}/categories/reorder`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ order }),
        });
        return handleResponse(response);
    },
};

// Auth API
export const authApi = {
    login: async (username, password) => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ username, password }),
        });
        const data = await handleResponse(response);
        if (data.success && data.token) {
            localStorage.setItem('authToken', data.token);
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('authToken');
    },

    getCurrentUser: async () => {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getUsers: async () => {
        const response = await fetch(`${API_BASE}/auth/users`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    createUser: async (user) => {
        const response = await fetch(`${API_BASE}/auth/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(user),
        });
        return handleResponse(response);
    },

    updateUser: async (id, user) => {
        const response = await fetch(`${API_BASE}/auth/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(user),
        });
        return handleResponse(response);
    },

    deleteUser: async (id) => {
        const response = await fetch(`${API_BASE}/auth/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// Settings API
export const settingsApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE}/settings`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    save: async (settings) => {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(settings),
        });
        return handleResponse(response);
    },

    generateApiKey: async () => {
        const response = await fetch(`${API_BASE}/settings/generate-api-key`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// Health check
export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE}/health`);
        return response.ok;
    } catch {
        return false;
    }
};

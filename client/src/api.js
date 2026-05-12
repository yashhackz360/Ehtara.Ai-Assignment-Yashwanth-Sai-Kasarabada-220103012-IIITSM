const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  getToken() {
    return localStorage.getItem('taskflow_token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Auth
  signup(body) {
    return this.request('/auth/signup', { method: 'POST', body: JSON.stringify(body) });
  }

  login(body) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Projects
  getProjects() {
    return this.request('/projects');
  }

  createProject(body) {
    return this.request('/projects', { method: 'POST', body: JSON.stringify(body) });
  }

  getProject(id) {
    return this.request(`/projects/${id}`);
  }

  updateProject(id, body) {
    return this.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  deleteProject(id) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  addMember(projectId, body) {
    return this.request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(body) });
  }

  removeMember(projectId, userId) {
    return this.request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
  }

  // Tasks
  getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  createTask(body) {
    return this.request('/tasks', { method: 'POST', body: JSON.stringify(body) });
  }

  updateTask(id, body) {
    return this.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  deleteTask(id) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  }

  // Dashboard
  getDashboard() {
    return this.request('/dashboard');
  }
}

const api = new ApiClient();
export default api;

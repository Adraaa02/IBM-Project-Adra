import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const usersAPI = {
  getAll: (role) => api.get('/users', { params: role ? { role } : {} }),
  getMe: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats/summary'),
};

export const matchesAPI = {
  getAll: () => api.get('/matches'),
  create: (data) => api.post('/matches', data),
  autoMatch: () => api.post('/matches/auto'),
  update: (id, data) => api.put(`/matches/${id}`, data),
  delete: (id) => api.delete(`/matches/${id}`),
};

export const messagesAPI = {
  getByMatch: (matchId) => api.get(`/messages/${matchId}`),
  send: (matchId, content) => api.post(`/messages/${matchId}`, { content }),
};

export const progressAPI = {
  getAll: () => api.get('/progress'),
  getByMatch: (matchId) => api.get(`/progress/${matchId}`),
  update: (matchId, data) => api.put(`/progress/${matchId}`, data),
};

export const evaluationsAPI = {
  getAll: () => api.get('/evaluations'),
  submit: (data) => api.post('/evaluations', data),
};

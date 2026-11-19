const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('rymec_auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('rymec_auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('rymec_auth_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

export const api = {
  // Auth & OTP Gateway
  login: (credentials: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  verifyOtp: (payload: { email: string; code: string }) => apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  resendOtp: (payload: { email: string }) => apiRequest('/auth/resend-otp', { method: 'POST', body: JSON.stringify(payload) }),
  sendLoginOtp: (payload: { identifier: string }) => apiRequest('/auth/send-login-otp', { method: 'POST', body: JSON.stringify(payload) }),
  getDatabaseUsers: () => apiRequest('/auth/database-users'),
  getMe: () => apiRequest('/auth/me'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  updateProfile: (data: any) =>
    apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Items
  getItems: (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return apiRequest(`/items?${query.toString()}`);
  },
  getItemById: (id: string) => apiRequest(`/items/${id}`),
  createItem: (data: any) => apiRequest('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: string, data: any) => apiRequest(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id: string) => apiRequest(`/items/${id}`, { method: 'DELETE' }),
  reportAbuse: (id: string, reason: string) => apiRequest(`/items/${id}/abuse`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getLocations: () => apiRequest('/items/locations/list'),

  // Claims
  createClaim: (data: any) => apiRequest('/claims', { method: 'POST', body: JSON.stringify(data) }),
  decideClaim: (id: string, decision: 'APPROVE' | 'REJECT', isFraudulent = false) =>
    apiRequest(`/claims/${id}/decide`, { method: 'POST', body: JSON.stringify({ decision, is_fraudulent: isFraudulent }) }),
  shareContact: (claimId: string) => apiRequest(`/claims/${claimId}/share-contact`, { method: 'POST' }),
  getMyClaims: () => apiRequest('/claims/my-claims'),
  getIncomingClaims: () => apiRequest('/claims/incoming'),

  // Handover
  verifyHandover: (code: string) => apiRequest('/handover/verify', { method: 'POST', body: JSON.stringify({ code }) }),

  // Chat
  getChat: (claimId: string) => apiRequest(`/chat/${claimId}`),
  sendMessage: (claimId: string, body: string) => apiRequest(`/chat/${claimId}`, { method: 'POST', body: JSON.stringify({ body }) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),

  // Watchlist
  getWatchlist: () => apiRequest('/watchlist'),
  createWatchlist: (data: any) => apiRequest('/watchlist', { method: 'POST', body: JSON.stringify(data) }),
  deleteWatchlist: (id: string) => apiRequest(`/watchlist/${id}`, { method: 'DELETE' }),

  // Leaderboard & Certificate
  getLeaderboard: () => apiRequest('/leaderboard'),
  getCertificate: () => apiRequest('/leaderboard/certificate'),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminClaims: () => apiRequest('/admin/claims-queue'),
  getAdminAbuseReports: () => apiRequest('/admin/abuse-reports'),
  resolveAbuseReport: (id: string) => apiRequest(`/admin/abuse-reports/${id}/resolve`, { method: 'PUT' }),
  getAdminUsers: () => apiRequest('/admin/users'),
  toggleUserFlag: (id: string) => apiRequest(`/admin/users/${id}/flag`, { method: 'PUT' }),
  getAdminAuditLogs: () => apiRequest('/admin/audit-logs'),

  // Maintenance
  runMaintenance: () => apiRequest('/maintenance/run', { method: 'POST' }),
  donateItem: (id: string, note?: string) => apiRequest(`/maintenance/donate/${id}`, { method: 'POST', body: JSON.stringify({ note }) }),
};

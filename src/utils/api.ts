const BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('hec_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  demoLogin: (email: string) =>
    request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ email }) }),
  me: () => request('/auth/me'),

  // Members
  getMembers: () => request('/members'),
  createMember: (data: any) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id: string, data: any) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMember: (id: string) => request(`/members/${id}`, { method: 'DELETE' }),
  generateTithingCode: (id: string) => request(`/members/${id}/generate-tithing-code`, { method: 'POST' }),
  getBirthdays: () => request('/members/birthdays/today'),

  // Events
  getEvents: () => request('/events'),
  createEvent: (data: any) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: string) => request(`/events/${id}`, { method: 'DELETE' }),
  registerForEvent: (eventId: string, data: any) =>
    request(`/events/${eventId}/register`, { method: 'POST', body: JSON.stringify(data) }),

  // Courses
  getCourses: () => request('/courses'),
  updateCourse: (id: string, data: any) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id: string) => request(`/courses/${id}`, { method: 'DELETE' }),

  // Prayers
  getPrayers: () => request('/prayers'),
  submitPrayer: (data: any) => request('/prayers', { method: 'POST', body: JSON.stringify(data) }),
  getPrayerCategories: () => request('/prayers/categories'),

  // Testimonies
  getTestimonies: () => request('/testimonies'),
  submitTestimony: (data: any) => request('/testimonies', { method: 'POST', body: JSON.stringify(data) }),
  likeTestimony: (id: string) => request(`/testimonies/${id}/like`, { method: 'POST' }),

  // Giving
  submitGiving: (data: any) => request('/giving', { method: 'POST', body: JSON.stringify(data) }),
  getGiving: () => request('/giving'),
  verifyGiving: (id: string) => request(`/giving/${id}/verify`, { method: 'PUT' }),

  // Expenses
  getExpenses: () => request('/expenses'),
  createExpense: (data: any) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  // Service Counts
  submitServiceCount: (data: any) => request('/service-counts', { method: 'POST', body: JSON.stringify(data) }),
  getServiceCounts: () => request('/service-counts'),

  // Bookstore
  getProducts: () => request('/bookstore/products'),
  createProduct: (data: any) => request('/bookstore/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request(`/bookstore/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request(`/bookstore/products/${id}`, { method: 'DELETE' }),
  placeOrder: (data: any) => request('/bookstore/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request('/bookstore/orders'),
  verifyOrder: (id: string) => request(`/bookstore/orders/${id}/verify`, { method: 'PUT' }),

  // Branches
  getBranches: () => request('/branches'),
  createBranch: (data: any) => request('/branches', { method: 'POST', body: JSON.stringify(data) }),
  updateBranch: (id: string, data: any) => request(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBranch: (id: string) => request(`/branches/${id}`, { method: 'DELETE' }),

  // Cell Groups
  getCellGroups: () => request('/cell-groups'),
  createCellGroup: (data: any) => request('/cell-groups', { method: 'POST', body: JSON.stringify(data) }),
  updateCellGroup: (id: string, data: any) => request(`/cell-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCellGroup: (id: string) => request(`/cell-groups/${id}`, { method: 'DELETE' }),
  getCellGroupMembers: (id: string) => request(`/cell-groups/${id}/members`),
  addCellGroupMember: (groupId: string, memberId: string) => request(`/cell-groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ member_id: memberId }) }),
  removeCellGroupMember: (groupId: string, memberId: string) => request(`/cell-groups/${groupId}/members/${memberId}`, { method: 'DELETE' }),

  // Event Registrations
  getEventRegistrations: (eventId?: string) => request(eventId ? `/event-registrations/${eventId}` : '/event-registrations'),
  checkInRegistration: (id: string) => request(`/event-registrations/${id}/checkin`, { method: 'PUT' }),

  // First Timer Follow-ups
  getFirstTimers: () => request('/first-timers'),
  updateFirstTimerStatus: (id: string, data: any) => request(`/first-timers/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getFirstTimerStats: () => request('/first-timers/stats'),

  // Attendance
  checkInMember: (memberId: string, serviceType?: string) => request('/attendance/checkin', { method: 'POST', body: JSON.stringify({ member_id: memberId, service_type: serviceType }) }),
  getTodayAttendance: () => request('/attendance/today'),
  getMemberAttendance: (memberId: string) => request(`/attendance/member/${memberId}`),
  getMissedMembers: () => request('/attendance/missed'),
  getAttendanceSummary: (branchId?: string, months?: number) => request(`/attendance/summary${branchId ? `?branch_id=${branchId}` : ''}${months ? `${branchId ? '&' : '?'}months=${months}` : ''}`),

  // Counselling
  getCounsellingLogs: () => request('/counselling'),
  createCounsellingLog: (data: any) => request('/counselling', { method: 'POST', body: JSON.stringify(data) }),
  updateCounsellingLog: (id: string, data: any) => request(`/counselling/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMemberCounselling: (memberId: string) => request(`/counselling/member/${memberId}`),

  // Soul Winning
  logSoulWon: (data: any) => request('/soul-winning', { method: 'POST', body: JSON.stringify(data) }),
  getSoulWinning: () => request('/soul-winning'),
  getSoulLeaderboard: () => request('/soul-winning/leaderboard'),
  getMySoulStats: () => request('/soul-winning/my-stats'),
  setSoulTarget: (data: any) => request('/soul-winning/target', { method: 'POST', body: JSON.stringify(data) }),

  // Prayer Chain
  getIntercessors: () => request('/prayer-chain/intercessors'),
  getPrayerAssignments: () => request('/prayer-chain/assignments'),
  assignPrayer: (prayerId: string) => request('/prayer-chain/assign', { method: 'POST', body: JSON.stringify({ prayer_id: prayerId }) }),
  markPrayed: (assignmentId: string) => request(`/prayer-chain/assignments/${assignmentId}/prayed`, { method: 'PUT' }),

  // Communication
  sendCommunication: (data: any) => request('/communication/send', { method: 'POST', body: JSON.stringify(data) }),
  triggerBirthdayCheck: () => request('/communication/birthday-check', { method: 'POST' }),

  // CMS (Site Content)
  getSiteContent: () => request('/cms'),
  updateSiteContent: (data: Record<string, string>) => request('/cms', { method: 'PUT', body: JSON.stringify(data) }),
  // Public alias — no auth required
  getPublicSiteContent: () => request('/cms'),

  // Users
  getUsers: () => request('/auth/users'),
  createUser: (data: any) => request('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createBranchUser: (data: any) => request('/auth/branch-users', { method: 'POST', body: JSON.stringify(data) }),

  // Enrollments (Academy)
  getEnrollments: () => request('/enrollments'),
  createEnrollment: (member_id: string, course_id: string) => request('/enrollments', { method: 'POST', body: JSON.stringify({ member_id, course_id }) }),
  updateEnrollmentProgress: (id: string, data: any) => request(`/enrollments/${id}/progress`, { method: 'PUT', body: JSON.stringify(data) }),
  getMemberEnrollments: (memberId: string) => request(`/enrollments/member/${memberId}`),

  // Audit Logs (HQ only)
  getAuditLogs: () => request('/audit'),

  // Course Modules
  getCourseModules: (courseId: string) => request(`/courses/${courseId}/modules`),

  // Analytics (HQ)
  getAttendanceVelocity: () => request('/analytics/attendance-velocity'),
  getFinancialTrends: () => request('/analytics/financial-trends'),
  getSoulsTrends: () => request('/analytics/souls-trends'),
  getDemographics: () => request('/analytics/demographics'),
  getHeatmap: () => request('/analytics/heatmap'),

  // Remittances
  getRemittances: () => request('/remittances'),
  submitRemittance: (data: any) => request('/remittances', { method: 'POST', body: JSON.stringify(data) }),
  reconcileRemittance: (id: string) => request(`/remittances/${id}/reconcile`, { method: 'PUT' }),

  // Preacher Log
  getPreacherLogs: () => request('/preacher-log'),
  createPreacherLog: (data: any) => request('/preacher-log', { method: 'POST', body: JSON.stringify(data) }),

  // Bank Accounts (Bookstore)
  getBankAccounts: () => request('/bookstore/bank-accounts'),
  createBankAccount: (data: any) => request('/bookstore/bank-accounts', { method: 'POST', body: JSON.stringify(data) }),
  deleteBankAccount: (id: string) => request(`/bookstore/bank-accounts/${id}`, { method: 'DELETE' }),

  // Uploads
  uploadFile: async (file: File) => {
    const token = localStorage.getItem('hec_token');
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch(`${BASE}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!resp.ok) throw new Error('Upload failed');
    return resp.json();
  },

  // Exports
  exportMembersCSV: () => `${BASE}/export/members`,
  exportGivingCSV: () => `${BASE}/export/giving`,
  exportAttendanceCSV: () => `${BASE}/export/attendance`,
};

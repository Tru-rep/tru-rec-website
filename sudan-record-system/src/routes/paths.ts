/** Single source of truth for route paths used in links and navigation. */
export const paths = {
  login: '/login',
  resetPassword: '/reset-password',
  dashboard: '/',
  search: '/search',
  addRecord: '/records/new',
  recordDetails: (id = ':id') => `/records/${id}`,
  editRecord: (id = ':id') => `/records/${id}/edit`,
  users: '/users',
  settings: '/settings',
} as const;

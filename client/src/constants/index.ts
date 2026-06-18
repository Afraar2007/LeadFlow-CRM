export const APP_NAME = 'LeadFlow CRM';

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Leads', href: '/dashboard/leads', icon: 'Users' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { name: 'Profile', href: '/dashboard/profile', icon: 'User' },
  { name: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
] as const;

export const LEAD_STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
] as const;

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'] as const;

export const LEAD_SOURCE_OPTIONS = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email',
  'Advertisement',
  'Other',
] as const;

export const LEAD_STATUS_COLORS: Record<string, string> = {
  New: 'info',
  Contacted: 'warning',
  Qualified: 'info',
  'Proposal Sent': 'warning',
  Negotiation: 'warning',
  Won: 'success',
  Lost: 'destructive',
} as const;

export const PRIORITY_COLORS: Record<string, string> = {
  Low: 'info',
  Medium: 'warning',
  High: 'destructive',
} as const;

export const ITEMS_PER_PAGE = 10;

export const PAGINATION_PAGE_RANGE = 5;
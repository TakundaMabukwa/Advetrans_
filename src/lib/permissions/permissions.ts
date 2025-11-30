// Permission system configuration
export const PAGES = {
  dashboard: { name: 'Dashboard', path: '/dashboard', description: 'Main overview page with trip management and routing' },
  fleetJobs: { name: 'Fleet Jobs', path: '/jobsFleet', description: 'Manage and approve fleet job requests' },
  loadPlan: { name: 'Load Plan', path: '/load-plan', description: 'Plan and schedule vehicle loads and routes' },
  fuel: { name: 'Fuel Can Bus', path: '/fuel', description: 'Monitor fuel consumption and can bus data' },
  drivers: { name: 'Drivers', path: '/drivers', description: 'Manage driver information and assignments' },
  vehicles: { name: 'Vehicles', path: '/vehicles', description: 'Manage vehicle fleet and equipment' },
  costCenters: { name: 'Cost Centers', path: '/ccenter', description: 'Manage cost center allocations and budgets' },
  financials: { name: 'Financials', path: '/audit', description: 'View financial reports and audit trails' },
  inspections: { name: 'Inspections', path: '/fleetManager/inspections', description: 'Manage vehicle inspections and compliance' },
  userManagement: { name: 'User Management', path: '/userManagement', description: 'Manage user accounts and permissions' },
  systemSettings: { name: 'System Settings', path: '/settings', description: 'Configure system-wide settings and preferences' }
} as const;

export const ACTIONS = {
  view: 'View',
  create: 'Create', 
  edit: 'Edit',
  delete: 'Delete'
} as const;

export type PageKey = keyof typeof PAGES;
export type ActionKey = keyof typeof ACTIONS;

export interface Permission {
  page: PageKey;
  actions: ActionKey[];
}

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    { page: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'fleetJobs', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'loadPlan', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'fuel', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'drivers', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'vehicles', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'costCenters', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'financials', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'inspections', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'userManagement', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'systemSettings', actions: ['view', 'create', 'edit', 'delete'] }
  ],
  'fleet manager': [
    { page: 'dashboard', actions: ['view', 'create', 'edit'] },
    { page: 'fleetJobs', actions: ['view', 'create', 'edit'] },
    { page: 'drivers', actions: ['view', 'create', 'edit'] },
    { page: 'vehicles', actions: ['view', 'create', 'edit'] },
    { page: 'inspections', actions: ['view', 'create', 'edit'] },
    { page: 'fuel', actions: ['view', 'create', 'edit'] },
    { page: 'financials', actions: ['view'] },
    { page: 'systemSettings', actions: ['view'] }
  ],
  fc: [
    { page: 'dashboard', actions: ['view'] },
    { page: 'loadPlan', actions: ['view'] }
  ],
  customer: [
    { page: 'drivers', actions: ['view'] },
    { page: 'vehicles', actions: ['view'] },
    { page: 'inspections', actions: ['view'] },
    { page: 'fuel', actions: ['view'] },
    { page: 'financials', actions: ['view'] }
  ]
};

// Helper functions
export function hasPermission(userPermissions: Permission[], page: PageKey, action: ActionKey): boolean {
  const pagePermission = userPermissions.find(p => p.page === page);
  return pagePermission?.actions.includes(action) || false;
}

export function getPagePermissions(userPermissions: Permission[], page: PageKey): ActionKey[] {
  const pagePermission = userPermissions.find(p => p.page === page);
  return pagePermission?.actions || [];
}
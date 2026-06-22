export const ROLES = [
  'waiter',
  'restaurant_all_rounder',
  'bartender',
  'kitchen_hand',
  'entree_chef',
  'wok_chef',
  'curries_chef',
  'expo_chef',
  'supervisor',
  'manager',
] as const

export type Role = (typeof ROLES)[number]

export type Department = 'foh' | 'kitchen' | 'leadership'

export const DEPARTMENTS: Department[] = ['foh', 'kitchen', 'leadership']

const ROLE_LABELS: Record<Role, string> = {
  waiter: 'Waiter',
  restaurant_all_rounder: 'Restaurant All-Rounder',
  bartender: 'Bartender',
  kitchen_hand: 'Kitchen Hand',
  entree_chef: 'Entree Chef',
  wok_chef: 'Wok Chef',
  curries_chef: 'Curries Chef',
  expo_chef: 'Expo Chef',
  supervisor: 'Supervisor',
  manager: 'Manager',
}

const ROLE_DEPARTMENT: Record<Role, Department> = {
  waiter: 'foh',
  restaurant_all_rounder: 'foh',
  bartender: 'foh',
  kitchen_hand: 'kitchen',
  entree_chef: 'kitchen',
  wok_chef: 'kitchen',
  curries_chef: 'kitchen',
  expo_chef: 'kitchen',
  supervisor: 'leadership',
  manager: 'leadership',
}

const DEPARTMENT_LABELS: Record<Department, string> = {
  foh: 'Front of House',
  kitchen: 'Kitchen',
  leadership: 'Leadership',
}

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role
}

export function getDepartment(role: Role): Department {
  return ROLE_DEPARTMENT[role] ?? 'foh'
}

export function getDepartmentLabel(dept: Department): string {
  return DEPARTMENT_LABELS[dept] ?? dept
}

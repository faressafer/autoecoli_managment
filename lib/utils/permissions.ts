/**
 * Sidebar Permissions Management
 * 
 * This utility manages which sidebar features are available to each auto-école
 * based on their subscription pack or custom permissions set by super admin.
 */

import { SidebarPermissions } from '@/lib/types';

// Default permissions for each pack type
export const DEFAULT_PERMISSIONS: Record<'bronze' | 'silver' | 'gold', SidebarPermissions> = {
  bronze: {
    dashboard: true,
    candidats: true,
    moniteurs: false,
    rendezvous: false,
    facturation: true,
    factureB: false,
    offres: false,
    billing: false,
    settings: true,
  },
  silver: {
    dashboard: true,
    candidats: true,
    moniteurs: true,
    rendezvous: true,
    facturation: true,
    factureB: false,
    offres: true,
    billing: false,
    settings: true,
  },
  gold: {
    dashboard: true,
    candidats: true,
    moniteurs: true,
    rendezvous: true,
    facturation: true,
    factureB: true,
    offres: true,
    billing: true,
    settings: true,
  },
};

// Default permissions for auto-écoles without a pack (all disabled except essentials)
export const NO_PACK_PERMISSIONS: SidebarPermissions = {
  dashboard: true,
  candidats: false,
  moniteurs: false,
  rendezvous: false,
  facturation: false,
  factureB: false,
  offres: false,
  billing: false,
  settings: true,
};

// Sidebar menu items configuration
export interface SidebarMenuItem {
  key: keyof SidebarPermissions;
  label: string;
  description: string;
  icon: string;
}

export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Tableau de bord',
    description: 'Vue d\'ensemble et statistiques',
    icon: '📊'
  },
  {
    key: 'candidats',
    label: 'Candidats',
    description: 'Gestion des candidats',
    icon: '👥'
  },
  {
    key: 'moniteurs',
    label: 'Moniteurs',
    description: 'Gestion des moniteurs',
    icon: '🚗'
  },
  {
    key: 'rendezvous',
    label: 'Rendez-vous',
    description: 'Gestion du calendrier et RDV',
    icon: '📅'
  },
  {
    key: 'facturation',
    label: 'Facturation',
    description: 'Factures et paiements',
    icon: '💰'
  },
  {
    key: 'factureB',
    label: 'Facture B',
    description: 'Factures Type B',
    icon: '📄'
  },
  {
    key: 'offres',
    label: 'Offres',
    description: 'Gestion des offres et forfaits',
    icon: '🎁'
  },
  {
    key: 'billing',
    label: 'Billing',
    description: 'Gestion des abonnements',
    icon: '💳'
  },
  {
    key: 'settings',
    label: 'Paramètres',
    description: 'Configuration du compte',
    icon: '⚙️'
  },
];

/**
 * Get permissions for an auto-école based on pack or custom settings
 */
export function getAutoEcolePermissions(
  pack?: 'bronze' | 'silver' | 'gold' | null,
  customPermissions?: SidebarPermissions
): SidebarPermissions {
  // If custom permissions are set, use them
  if (customPermissions) {
    return customPermissions;
  }
  
  // Otherwise, use pack defaults
  if (pack && DEFAULT_PERMISSIONS[pack]) {
    return DEFAULT_PERMISSIONS[pack];
  }
  
  // No pack = limited access
  return NO_PACK_PERMISSIONS;
}

/**
 * Check if a specific feature is enabled
 */
export function hasPermission(
  permissions: SidebarPermissions | undefined,
  feature: keyof SidebarPermissions
): boolean {
  if (!permissions) return false;
  return permissions[feature] === true;
}

/**
 * Get count of enabled features
 */
export function getEnabledFeaturesCount(permissions?: SidebarPermissions): number {
  if (!permissions) return 0;
  return Object.values(permissions).filter(Boolean).length;
}

/**
 * Validate permissions object
 */
export function validatePermissions(permissions: Partial<SidebarPermissions>): SidebarPermissions {
  return {
    dashboard: permissions.dashboard ?? true,
    candidats: permissions.candidats ?? false,
    moniteurs: permissions.moniteurs ?? false,
    rendezvous: permissions.rendezvous ?? false,
    facturation: permissions.facturation ?? false,
    factureB: permissions.factureB ?? false,
    offres: permissions.offres ?? false,
    billing: permissions.billing ?? false,
    settings: permissions.settings ?? true,
  };
}

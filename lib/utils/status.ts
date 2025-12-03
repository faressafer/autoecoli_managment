/**
 * Auto-école Status Utilities
 * 
 * IMPORTANT: Status values in Firebase must always be lowercase English:
 * - "active"
 * - "inactive" 
 * - "pending"
 * 
 * These utilities ensure consistency between database values and UI display.
 */

// Type definition for auto-école status (database values)
export type AutoEcoleStatus = 'active' | 'inactive' | 'pending';

// Status display labels in French for UI
export const STATUS_LABELS: Record<AutoEcoleStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente'
};

// Status descriptions in French
export const STATUS_DESCRIPTIONS: Record<AutoEcoleStatus, string> = {
  active: "L'auto-école peut utiliser la plateforme",
  inactive: "L'auto-école est désactivée",
  pending: "En attente d'approbation"
};

// Status colors for badges
export const STATUS_COLORS: Record<AutoEcoleStatus, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200'
};

/**
 * Get the French label for a status value
 * @param status - The status value from database (active/inactive/pending)
 * @returns The French label for display
 */
export function getStatusLabel(status?: string): string {
  if (!status) return 'Inconnu';
  return STATUS_LABELS[status as AutoEcoleStatus] || status;
}

/**
 * Get the description for a status value
 * @param status - The status value from database
 * @returns The French description
 */
export function getStatusDescription(status?: string): string {
  if (!status) return '';
  return STATUS_DESCRIPTIONS[status as AutoEcoleStatus] || '';
}

/**
 * Get the Tailwind CSS classes for status badge
 * @param status - The status value from database
 * @returns The CSS classes for the badge
 */
export function getStatusColor(status?: string): string {
  if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
  return STATUS_COLORS[status as AutoEcoleStatus] || 'bg-gray-50 text-gray-700 border-gray-200';
}

/**
 * Validate if a status value is valid
 * @param status - The status value to validate
 * @returns true if valid, false otherwise
 */
export function isValidStatus(status: string): status is AutoEcoleStatus {
  return ['active', 'inactive', 'pending'].includes(status);
}

/**
 * Default status for new auto-écoles
 */
export const DEFAULT_STATUS: AutoEcoleStatus = 'pending';

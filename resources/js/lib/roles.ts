import { type User, type UserRole } from '@/types';

/**
 * Check if a user has a specific role.
 */
export function hasRole(user: User | null | undefined, role: UserRole): boolean {
    if (!user) return false;
    return user.role === role;
}

/**
 * Check if a user has any of the specified roles.
 */
export function hasAnyRole(user: User | null | undefined, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
}

/**
 * Check if the user is an admin.
 */
export function isAdmin(user: User | null | undefined): boolean {
    return hasRole(user, 'admin');
}

/**
 * Check if the user is in purchasing.
 */
export function isPurchasing(user: User | null | undefined): boolean {
    return hasRole(user, 'purchasing');
}

/**
 * Check if the user is in payables.
 */
export function isPayables(user: User | null | undefined): boolean {
    return hasRole(user, 'payables');
}

/**
 * Check if the user is in disbursement.
 */
export function isDisbursement(user: User | null | undefined): boolean {
    return hasRole(user, 'disbursement');
}

/**
 * Get a human-readable label for a role.
 */
export function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
        admin: 'Admin',
        purchasing: 'Purchasing',
        payables: 'Payables',
        disbursement: 'Disbursement',
    };
    return labels[role];
}

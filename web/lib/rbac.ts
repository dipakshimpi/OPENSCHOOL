export type UserRole = 'admin' | 'teacher' | 'student';

export const ROLES: Record<string, UserRole> = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
};

/**
 * Helper to check if a user has a specific role or one of multiple roles
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
}

/**
 * Standardizes the role string from metadata
 */
export function parseRole(role: string | null | undefined): UserRole {
    if (role === 'admin' || role === 'teacher' || role === 'student') {
        return role;
    }
    return 'student'; // Default fallback
}

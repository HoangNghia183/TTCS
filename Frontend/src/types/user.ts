export interface User {
    _id: string;
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    avatarUrl?: string;
    avatarId?: string;
    bio?: string;
    role: 'customer' | 'admin' | 'staff';
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}
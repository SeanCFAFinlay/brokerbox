export type UserRole = 'admin' | 'broker' | 'readonly' | 'lender_agent' | 'borrower' | 'investor';

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

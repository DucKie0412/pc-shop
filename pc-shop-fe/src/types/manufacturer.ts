export interface IManufacturer {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    type: string; // e.g., 'cpu', 'mainboard', etc.
    createdAt?: string;
    updatedAt?: string;
} 
export interface IProduct {
    _id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    imagePublicIds: string[];
    categoryId: {
        _id: string;
        name: string;
    };
    manufacturerId: {
        _id: string;
        name: string;
    };
    stock: number;
    originalPrice: number;
    discount: number;
    price: number;
    createdAt: string;
    updatedAt: string;
} 
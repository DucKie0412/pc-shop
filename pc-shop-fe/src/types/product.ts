export interface IProduct {
    _id: string;
    name: string;
    slug: string;
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
    soldCount: number;
    originalPrice: number;
    discount: number;
    createdAt: string;
    updatedAt: string;
    type: string;
    specs: Record<string, any>;
    finalPrice: number;
} 
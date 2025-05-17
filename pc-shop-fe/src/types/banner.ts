export enum BannerType {
    CAROUSEL = "carousel",
    SUB_BANNER = "sub_banner"
}

export interface IBanner {
    _id: string;
    title: string;
    url: string;
    link: string;
    imagePublicId: string;
    type: BannerType;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
} 
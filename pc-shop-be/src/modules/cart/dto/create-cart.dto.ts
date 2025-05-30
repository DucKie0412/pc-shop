export class CreateCartDto {
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        image?: string;
    }>;
}

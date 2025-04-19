export type Product = {
    id: string;                 // id sản phẩm
    title: string;              // tên sản phẩm
    description: string;        // mô tả sản phẩm
    categoryId: string;         // id danh mục sản phẩm
    stock: number;              // tồn kho sản phẩm
    originalPrice: number;      // giá gốc sản phẩm
    discount: number;              // giảm giá sản phẩm
    price: number;            // giá sau khi giảm
    image: string;            // đường dẫn hình ảnh
    slug: string;             // đường dẫn tên sản phẩm
    createdAt: string;        // ngày tạo (ISO string)
    updatedAt: string;        // ngày cập nhật (ISO string)
} 
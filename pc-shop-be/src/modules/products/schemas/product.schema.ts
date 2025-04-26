import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { Manufacturer } from '../../manufacturers/schemas/manufacturer.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {

    @Prop()
    id: string;                 // id sản phẩm

    @Prop()
    name: string;               // tên sản phẩm

    @Prop()
    description: string;        // mô tả sản phẩm

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    categoryId: Category;       // id danh mục sản phẩm

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manufacturer' })
    manufacturerId: Manufacturer; // id nhà sản xuất

    @Prop({ default: 0 })
    stock: number;              // tồn kho sản phẩm

    @Prop()
    originalPrice: number;      // giá gốc sản phẩm

    @Prop({ default: 0 })
    discount: number;           // giảm giá sản phẩm

    @Prop({ default: 0 })
    price: number;              // giá sau khi giảm

    @Prop()
    images: string[];           // lưu đường dẫn tất cả hình ảnh của sản phẩm

    @Prop()
    imagePublicIds: string[];   // lưu tất cả id hình ảnh dùng để xử lí xóa ảnh

    @Prop({ unique: true })
    slug: string;               // đường dẫn tên sản phẩm

}

const ProductSchema = SchemaFactory.createForClass(Product);

// Pre-save middleware to generate slug and calculate price
ProductSchema.pre('save', function (next) {
    // Generate slug from name
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    // Calculate price based on originalPrice and discount
    if (this.isModified('originalPrice') || this.isModified('discount')) {
        const discountAmount = (this.originalPrice * this.discount) / 100;
        this.price = this.originalPrice - discountAmount;
    }

    next();
});

export { ProductSchema };

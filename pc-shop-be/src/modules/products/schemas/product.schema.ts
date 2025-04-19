import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({timestamps: true})
export class Product {

    @Prop()
    id: string;                 // id sản phẩm

    @Prop()
    title: string;              // tên sản phẩm

    @Prop()
    description: string;        // mô tả sản phẩm

    @Prop()
    categoryId: string;         // id danh mục sản phẩm

    @Prop({default: 0})
    stock: number;              // tồn kho sản phẩm

    @Prop()
    originalPrice: number;      // giá gốc sản phẩm

    @Prop({default: 0})
    discount: number;           // giảm giá sản phẩm

    @Prop({default: 0})
    price: number;              // giá sau khi giảm

    @Prop()
    image: string;              // đường dẫn hình ảnh

    @Prop({ unique: true })
    slug: string;               // đường dẫn tên sản phẩm

}

const ProductSchema = SchemaFactory.createForClass(Product);

// Pre-save middleware to generate slug and calculate price
ProductSchema.pre('save', function(next) {
    // Generate slug from title
    if (this.isModified('title')) {
        this.slug = this.title
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

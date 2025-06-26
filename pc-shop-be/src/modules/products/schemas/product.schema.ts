import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { Manufacturer } from '../../manufacturers/schemas/manufacturer.schema';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductType {
    CPU = 'cpu',
    VGA = 'vga',
    RAM = 'ram',
    SSD = 'ssd',
    HDD = 'hdd',
    MAINBOARD = 'mainboard',
    PSU = 'psu',
    CASE = 'case',
    MONITOR = 'monitor',
    OTHER = 'other'
}

@Schema({ timestamps: true })
export class Product extends Document {

    @Prop({ required: true })
    name: string;               // tên sản phẩm

    @Prop({
        required: true,
        enum: ProductType
    })
    type: ProductType;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    categoryId: Category;       // id danh mục sản phẩm

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manufacturer' })
    manufacturerId: Manufacturer; // id nhà sản xuất

    @Prop({ default: 0, min: 0 })
    stock: number;              // tồn kho sản phẩm

    @Prop({ required: true, min: 0 })
    originalPrice: number;      // giá gốc sản phẩm

    @Prop({ default: 0, min: 0, max: 100 })
    discount: number;           // giảm giá sản phẩm
    
    @Prop({ required: true, min: 0 })
    finalPrice: number;
    
    @Prop({ type: Object, required: true })
    specs: Record<string, any>;

    @Prop()
    images: string[];           // lưu đường dẫn tất cả hình ảnh của sản phẩm

    @Prop()
    imagePublicIds: string[];   // lưu tất cả id hình ảnh dùng để xử lí xóa ảnh

    @Prop({ unique: true })
    slug: string;               // đường dẫn tên sản phẩm

    @Prop({
      type: [
        {
          title: { type: String, required: true },
          content: { type: String, required: false },
          image: { type: String, required: false },
        }
      ],
      default: [],
    })
    details?: {
      title?: string;
      content?: string;
      image?: string;
    }[];

    @Prop({ default: 0, min: 0 })
    soldCount: number;           // số lượng đã bán (dashboard)

    @Prop({ default: false })
    isRedeemable: boolean;       // sản phẩm có thể đổi điểm (redeem page)

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
        this.finalPrice = this.originalPrice - discountAmount;
    }

    next();
});

export { ProductSchema };

import { ProductForm } from "../product-form";

export default function CreateProductPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Create Product</h1>
            </div>
            <div className="w-full">
                <ProductForm />
            </div>
        </div>
    );
} 
import { CategoryForm } from "../category-form";

export default function CreateCategoryPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Thêm danh mục</h1>
            <CategoryForm />
        </div>
    );
} 
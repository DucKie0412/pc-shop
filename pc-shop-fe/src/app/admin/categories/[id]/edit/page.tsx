import { auth } from "@/auth";
import { CategoryForm } from "../../category-form";
import { sendRequest } from "@/utils/api";
import { notFound } from "next/navigation";

async function getCategory(id: string) {
    const session = await auth();
    try {
        const res = await sendRequest<IBackendRes<any>>({
            method: "GET",
            url: `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
            headers: { Authorization: `Bearer ${session?.user.accessToken}` },
            nextOption: { cache: "no-store" }
        });

        return res.data;
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
    }
}

export default async function EditCategoryPage({
    params,
}: {
    params: { id: string };
}) {
    const category = await getCategory(params.id);

    if (!category) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Edit Category</h1>
            <CategoryForm initialData={category} />
        </div>
    );
} 
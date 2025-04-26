import { notFound } from "next/navigation";
import { IProduct } from "@/types/product";
import { sendRequest } from "@/utils/api";
import { formatCurrency } from "@/utils/format-currency";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/breadcrumb";

async function getProduct(slug: string): Promise<IProduct> {
    try {
        const response = await sendRequest<IProduct>({
            url: `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
            method: "GET",
        });

        return response;
    } catch (error) {
        console.error("Error fetching product:", error);
        notFound();
    }
}

interface ProductPageProps {
    params: {
        slug: string;
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await getProduct(params.slug);

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: product.title }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative aspect-square">
                    {product.images?.[0] && (
                        <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover rounded-lg"
                            priority
                        />
                    )}
                </div>
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">{product.title}</h1>
                    <p className="text-gray-600">{product.description}</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Original Price:</span>
                            <span className="text-lg line-through">
                                {formatCurrency(product.originalPrice)}
                            </span>
                        </div>
                        {product.discount > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Discount:</span>
                                <span className="text-lg text-green-600">
                                    {product.discount}%
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Final Price:</span>
                            <span className="text-2xl font-bold text-primary">
                                {formatCurrency(product.finalPrice)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Stock:</span>
                            <span className={`text-lg ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </span>
                        </div>
                    </div>
                    <button
                        className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={product.stock === 0}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
} 
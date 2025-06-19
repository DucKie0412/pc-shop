"use client";

import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

// Example usage of DeleteConfirmationModal component

export function DeleteModalUsageExamples() {
    return (
        <div className="space-y-4">
            {/* Example 1: Simple button trigger */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Simple Button Trigger</h3>
                <DeleteConfirmationModal
                    title="Delete User"
                    description="Are you sure you want to delete this user? This action cannot be undone."
                    itemName="John Doe (john@example.com)"
                    itemId="user123"
                    apiEndpoint="/users"
                    successMessage="User deleted successfully!"
                    errorMessage="Failed to delete user"
                    trigger={
                        <Button variant="destructive" size="sm">
                            Delete User
                        </Button>
                    }
                />
            </div>

            {/* Example 2: Dropdown menu item trigger */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Dropdown Menu Item Trigger</h3>
                <DeleteConfirmationModal
                    title="Delete Product"
                    description="This action cannot be undone. This will permanently delete the product"
                    itemName="Gaming Laptop Pro"
                    itemId="gaming-laptop-pro"
                    apiEndpoint="/products"
                    successMessage="Product deleted successfully!"
                    errorMessage="Failed to delete product"
                    trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Delete Product
                        </DropdownMenuItem>
                    }
                />
            </div>

            {/* Example 3: With custom success callback */}
            <div>
                <h3 className="text-lg font-semibold mb-2">With Custom Success Callback</h3>
                <DeleteConfirmationModal
                    title="Delete Category"
                    description="This action cannot be undone. This will permanently delete the category and all associated products."
                    itemName="Electronics"
                    itemId="electronics-cat"
                    apiEndpoint="/categories"
                    successMessage="Category deleted successfully!"
                    errorMessage="Failed to delete category"
                    onSuccess={() => {
                        console.log("Category deleted, refreshing data...");
                        // Custom logic after successful deletion
                    }}
                    onError={(error) => {
                        console.error("Delete error:", error);
                        // Custom error handling
                    }}
                    trigger={
                        <Button variant="outline" size="sm">
                            Delete Category
                        </Button>
                    }
                />
            </div>

            {/* Example 4: With custom messages */}
            <div>
                <h3 className="text-lg font-semibold mb-2">With Custom Messages</h3>
                <DeleteConfirmationModal
                    title="Remove Banner"
                    description="This will remove the banner from the homepage. You can always add it back later."
                    itemName="Summer Sale Banner"
                    itemId="summer-banner-123"
                    apiEndpoint="/banners"
                    successMessage="Banner removed successfully! The homepage has been updated."
                    errorMessage="Unable to remove banner. Please try again."
                    trigger={
                        <Button variant="secondary" size="sm">
                            Remove Banner
                        </Button>
                    }
                />
            </div>

            {/* Example 5: For orders */}
            <div>
                <h3 className="text-lg font-semibold mb-2">For Orders</h3>
                <DeleteConfirmationModal
                    title="Cancel Order"
                    description="This will cancel the order and refund the customer. This action cannot be undone."
                    itemName={`Order #ORD-${Date.now()}`}
                    itemId="order123"
                    apiEndpoint="/orders"
                    successMessage="Order cancelled successfully! Customer will be notified."
                    errorMessage="Failed to cancel order. Please contact support."
                    trigger={
                        <Button variant="destructive" size="sm">
                            Cancel Order
                        </Button>
                    }
                />
            </div>
        </div>
    );
}

// Usage in different contexts:

// 1. In a data table column:
export function TableColumnExample() {
    const user = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com"
    };

    return (
        <DeleteConfirmationModal
            title="Are you sure?"
            description="This action cannot be undone. This will permanently delete the user account for"
            itemName={`${user.name} (${user.email})`}
            itemId={user._id}
            apiEndpoint="/users"
            successMessage="User deleted successfully!"
            errorMessage="An error occurred while deleting the user"
            trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Delete user
                </DropdownMenuItem>
            }
        />
    );
}

// 2. In a card or list item:
export function CardItemExample() {
    const product = {
        _id: "prod123",
        name: "Gaming Laptop",
        slug: "gaming-laptop"
    };

    return (
        <div className="border p-4 rounded-lg">
            <h3>{product.name}</h3>
            <div className="flex gap-2 mt-2">
                <Button size="sm">Edit</Button>
                <DeleteConfirmationModal
                    title="Delete Product"
                    description="This action cannot be undone. This will permanently delete the product"
                    itemName={product.name}
                    itemId={product.slug}
                    apiEndpoint="/products"
                    successMessage="Product deleted successfully!"
                    errorMessage="Failed to delete product"
                    trigger={
                        <Button variant="destructive" size="sm">
                            Delete
                        </Button>
                    }
                />
            </div>
        </div>
    );
} 
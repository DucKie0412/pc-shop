import { auth } from "@/auth";
import { ManufacturerForm } from "../../manufacturer-form";
import { sendRequest } from "@/utils/api";
import { notFound } from "next/navigation";

async function getManufacturer(id: string) {
    const session = await auth();
    try {
        const res = await sendRequest<IBackendRes<any>>({
            method: "GET",
            url: `${process.env.NEXT_PUBLIC_API_URL}/manufacturers/${id}`,
            headers: { Authorization: `Bearer ${session?.user.accessToken}` },
            nextOption: { cache: "no-store" }
        });

        return res.data;
    } catch (error) {
        console.error("Error fetching manufacturer:", error);
        return null;
    }
}

export default async function EditManufacturerPage({
    params,
}: {
    params: { id: string };
}) {
    const manufacturer = await getManufacturer(params.id);

    if (!manufacturer) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Edit Manufacturer</h1>
            <ManufacturerForm initialData={manufacturer} />
        </div>
    );
} 
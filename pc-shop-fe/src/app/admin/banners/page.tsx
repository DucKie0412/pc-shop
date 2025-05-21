"use client";

import { useEffect, useState } from "react";
import { IBanner, BannerType } from "@/types/banner";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const [banners, setBanners] = useState<IBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const [editedBanners, setEditedBanners] = useState<{ [id: string]: Partial<IBanner> }>({});
    const [dirtyBanners, setDirtyBanners] = useState<Set<string>>(new Set());

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await sendRequest<IBackendRes<IBanner[]>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/banners`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            });
            if (res?.data) {
                setBanners(res.data);
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
            toast.error("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [session]);

    const handleEditBanner = (id: string, updates: Partial<IBanner>) => {
        setEditedBanners(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
        setDirtyBanners(prev => new Set(prev).add(id));
    };

    const handleSaveBanner = async (id: string) => {
        const updates = editedBanners[id];
        if (!updates) return;
        await handleUpdateBanner(id, updates);
        setDirtyBanners(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        setEditedBanners(prev => {
            const newObj = { ...prev };
            delete newObj[id];
            return newObj;
        });
    };

    const handleCreateBanner = async (result: any) => {
        try {
            const newBanner = {
                title: "New Banner",
                url: result.info.secure_url,
                link: "/",
                imagePublicId: result.info.public_id,
                type: BannerType.CAROUSEL,
                order: banners.length,
                isActive: true
            };

            const res = await sendRequest<IBackendRes<IBanner>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/banners`,
                method: 'POST',
                body: newBanner,
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            });
            console.log(res);

            if (res?.data) {
                toast.success("Banner created successfully");
                console.log("Banner created successfully");
                fetchBanners();
            }
        } catch (error) {
            console.error("Error creating banner:", error);
            console.log("Error creating banner:", error);
            toast.error("Failed to create banner");
        }
    };

    const handleUpdateBanner = async (id: string, updates: Partial<IBanner>) => {
        try {
            const res = await sendRequest<IBackendRes<IBanner>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/banners/${id}`,
                method: 'PATCH',
                body: updates,
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            });
            console.log(res);
            if (res?.data) {
                toast.success("Banner updated successfully");
                console.log("Banner updated successfully");
                fetchBanners();
            }
        } catch (error) {
            console.error("Error updating banner:", error);
            console.log("Error updating banner:", error);
            toast.error("Failed to update banner");
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/banners/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            });

            if (res?.statusCode === 200) {
                toast.success("Banner deleted successfully");
                fetchBanners();
            }
        } catch (error) {
            console.error("Error deleting banner:", error);
            toast.error("Failed to delete banner");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Banner Settings</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Banner</h2>
                <CldUploadWidget
                    uploadPreset="pc_shop_banners"
                    onSuccess={handleCreateBanner}
                >
                    {({ open }) => (
                        <Button onClick={() => open()}>
                            Upload New Banner
                        </Button>
                    )}
                </CldUploadWidget>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => {
                        const isDirty = dirtyBanners.has(banner._id);
                        const edited = editedBanners[banner._id] || {};
                        return (
                            <div key={banner._id} className="border rounded-lg p-4 mb-4">
                                <div className="relative aspect-video mb-4">
                                    <Image
                                        src={banner.url}
                                        alt={banner.title}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            value={edited.title ?? banner.title}
                                            onChange={e => handleEditBanner(banner._id, { title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Link</Label>
                                        <Input
                                            value={edited.link ?? banner.link}
                                            onChange={e => handleEditBanner(banner._id, { link: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Type</Label>
                                        <Select
                                            value={edited.type ?? banner.type}
                                            onValueChange={value => handleEditBanner(banner._id, { type: value as BannerType })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={BannerType.CAROUSEL}>Carousel</SelectItem>
                                                <SelectItem value={BannerType.SUB_BANNER}>Sub Banner</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={edited.order ?? banner.order}
                                            onChange={e => handleEditBanner(banner._id, { order: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={edited.isActive ?? banner.isActive}
                                            onCheckedChange={checked => handleEditBanner(banner._id, { isActive: checked })}
                                        />
                                        <Label>Active</Label>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteBanner(banner._id)}
                                    >
                                        Delete Banner
                                    </Button>
                                </div>
                                {isDirty && (
                                    <div className="mt-4 bg-yellow-100 border border-yellow-400 rounded p-2 flex justify-between items-center">
                                        <span className="text-yellow-800">You have unsaved changes</span>
                                        <Button size="sm" onClick={() => handleSaveBanner(banner._id)}>
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
} 
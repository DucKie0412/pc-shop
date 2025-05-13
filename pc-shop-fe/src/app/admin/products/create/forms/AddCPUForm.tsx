import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendRequest } from "@/utils/api";
import { useEffect, useState } from "react";
import { ICategory } from "@/types/category";
import { toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const cpuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock must be at least 0"),
  originalPrice: z.coerce.number().min(0, "Price must be at least 0"),
  discount: z.coerce.number().min(0).max(100),
  brand: z.string().min(1, "CPU brand is required"),
  cores: z.coerce.number().min(1, "Cores must be at least 1"),
  threads: z.coerce.number().min(1, "Threads must be at least 1"),
  socket: z.string().min(1, "Socket is required"),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
});

const AMD_SOCKETS = ["AM4", "AM5"];
const INTEL_SOCKETS = [
  "LGA1700", "LGA1200", "LGA1151", "LGA1150", "LGA1155", "LGA1156", "LGA2066", "LGA2011"
];

export default function AddCPUForm({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imagePublicIds, setImagePublicIds] = useState<string[]>([]);
  const { data: session } = useSession();
  const router = useRouter();
  const [cpuBrand, setCpuBrand] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) {
        toast.error("Please login to continue");
        return;
      }
      setIsLoading(true);
      try {
        const categoriesRes = await sendRequest<IBackendRes<ICategory[]>>({
          url: '/api/categories',
          method: 'GET',
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        if (categoriesRes?.data) {
          setCategories(categoriesRes.data);
          // Find CPU category
          const cpuCategory = categoriesRes.data.find(
            cat => cat.name.trim().toLowerCase() === "cpu"
          );
          if (cpuCategory) {
            setCategoryLocked(true);
            form.setValue("categoryId", cpuCategory._id);
          } else {
            setCategoryLocked(false);
          }
        } else if (categoriesRes?.error) {
          toast.error(categoriesRes.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const form = useForm({
    resolver: zodResolver(cpuSchema),
    defaultValues: {
      stock: 0,
      originalPrice: 0,
      discount: 0,
      brand: "",
      images: [],
      imagePublicIds: []
    },
  });

  const onSubmit = async (values: any) => {
    if (!session?.user?.accessToken) {
      toast.error("Please login to continue");
      return;
    }
    try {
      const payload = {
        ...values,
        type: "cpu",
        categoryId: values.categoryId,
        images,
        imagePublicIds,
        specs: {
          brand: values.brand,
          cores: values.cores,
          threads: values.threads,
          socket: values.socket,
        },
      };
      const response = await sendRequest<IBackendRes<any>>({
        url: "/api/products",
        method: "POST",
        body: payload,
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("CPU added successfully");
        form.reset();
        setTimeout(() => { router.push("/admin/products"); }, 2000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add CPU");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8">
      <Button type="button" onClick={onBack} variant="ghost" className="mb-4">&larr; Back</Button>
      <h3 className="text-2xl font-bold mb-6 text-center">Add New CPU</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="CPU name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="CPU description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={val => form.setValue("categoryId", val)}
                    disabled={categoryLocked || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Stock quantity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Original price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Discount percentage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h4 className="font-semibold mb-2 text-gray-700">CPU Specs</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU Brand</FormLabel>
                    <FormControl>
                      <Select
                        value={cpuBrand}
                        onValueChange={val => {
                          setCpuBrand(val);
                          form.setValue("brand", val);
                          form.setValue("socket", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amd">AMD</SelectItem>
                          <SelectItem value="intel">Intel</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cores</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Number of cores" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="threads"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threads</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Number of threads" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Socket</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!cpuBrand}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a socket" />
                        </SelectTrigger>
                        <SelectContent>
                          {(cpuBrand === "amd" ? AMD_SOCKETS : cpuBrand === "intel" ? INTEL_SOCKETS : []).map(socket => (
                            <SelectItem key={socket} value={socket}>{socket}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Product Images</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`Product image ${index + 1}`}
                      width={200}
                      height={200}
                      className={`rounded-lg object-cover ${index === 0 ? 'ring-2 ring-blue-500' : ''}`}
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        // Move this image to the first position
                        setImages([image, ...images.filter((_, i) => i !== index)]);
                        setImagePublicIds([imagePublicIds[index], ...imagePublicIds.filter((_, i) => i !== index)]);
                      }}
                      className="absolute bottom-2 left-2 bg-white text-blue-600 border border-blue-500 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={index === 0}
                    >
                      Set as Main
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== index));
                        setImagePublicIds(imagePublicIds.filter((_, i) => i !== index));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <CldUploadWidget
                  uploadPreset="pc_shop_products"
                  options={{ multiple: true }}
                  onSuccess={(result: any) => {
                    if (Array.isArray(result)) {
                      setImages(prev => [
                        ...prev,
                        ...result.map((r) => r.info.secure_url)
                      ]);
                      setImagePublicIds(prev => [
                        ...prev,
                        ...result.map((r) => r.info.public_id)
                      ]);
                    } else if (result?.info?.secure_url) {
                      setImages(prev => [...prev, result.info.secure_url]);
                      setImagePublicIds(prev => [...prev, result.info.public_id]);
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                    </button>
                  )}
                </CldUploadWidget>
              </div>
            </div>
            
            <Button type="submit" className="w-full">Add CPU</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
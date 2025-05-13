import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendRequest } from "@/utils/api";
import { ICategory } from "@/types/category";
import { IManufacturer } from "@/types/manufacturer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';
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

const mainboardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  stock: z.coerce.number().min(0, "Stock must be at least 0"),
  originalPrice: z.coerce.number().min(0, "Price must be at least 0"),
  discount: z.coerce.number().min(0).max(100),
  brand: z.string().min(1, "Brand is required"),
  socket: z.string().min(1, "Socket is required"),
  chipset: z.string().min(1, "Chipset is required"),
  formFactor: z.string().min(1, "Form factor is required"),
  memoryType: z.string().min(1, "Memory type is required"),
  maxMemory: z.string().min(1, "Max memory is required"),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
});

const AMD_SOCKETS = [
  { value: "AM4", label: "AM4" },
  { value: "AM5", label: "AM5" },
  { value: "TR4", label: "TR4" },
  { value: "sTRX4", label: "sTRX4" },
  { value: "sWRX8", label: "sWRX8" },
];

const INTEL_SOCKETS = [
  { value: "LGA 1200", label: "LGA 1200" },
  { value: "LGA 1700", label: "LGA 1700" },
  { value: "LGA 2066", label: "LGA 2066" },
  { value: "LGA 2011-3", label: "LGA 2011-3" },
];

const AMD_CHIPSETS = [
  { value: "A", label: "A Series (Entry Level)" },
  { value: "B", label: "B Series (Mid Range)" },
  { value: "X", label: "X Series (High End)" },
];

const INTEL_CHIPSETS = [
  { value: "H", label: "H Series (Entry Level)" },
  { value: "B", label: "B Series (Mid Range)" },
  { value: "Z", label: "Z Series (High End)" },
];

export default function AddMainboardForm({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [manufacturers, setManufacturers] = useState<IManufacturer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imagePublicIds, setImagePublicIds] = useState<string[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(mainboardSchema),
    defaultValues: { 
      stock: 0, 
      originalPrice: 0, 
      discount: 0,
      brand: "",
      socket: "",
      chipset: "",
      formFactor: "",
      memoryType: "",
      maxMemory: "",
      name: "",
      description: "",
      categoryId: "",
      manufacturerId: "",
      images: [],
      imagePublicIds: []
    },
  });

  const selectedBrand = form.watch("brand");

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
          const mainboardCategory = categoriesRes.data.find(
            cat => cat.name.trim().toLowerCase() === "mainboard"
          );
          if (mainboardCategory) {
            setCategoryLocked(true);
            form.setValue("categoryId", mainboardCategory._id);
          } else {
            setCategoryLocked(false);
          }
        } else if (categoriesRes?.error) {
          toast.error(categoriesRes.error);
        }
        const manufacturersRes = await sendRequest<IBackendRes<IManufacturer[]>>({
          url: '/api/manufacturers',
          method: 'GET',
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        if (manufacturersRes?.data) {
          setManufacturers(manufacturersRes.data);
        } else if (manufacturersRes?.error) {
          toast.error(manufacturersRes.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load categories and manufacturers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session]);

  // Reset socket and chipset when brand changes
  useEffect(() => {
    form.setValue("socket", "");
    form.setValue("chipset", "");
  }, [selectedBrand]);

  const onSubmit = async (values: any) => {
    if (!session?.user?.accessToken) {
      toast.error("Please login to continue");
      return;
    }
    try {
      const payload = {
        ...values,
        type: "mainboard",
        categoryId: values.categoryId,
        manufacturerId: values.manufacturerId,
        specs: {
          brand: values.brand,
          socket: values.socket,
          chipset: values.chipset,
          formFactor: values.formFactor,
          memoryType: values.memoryType,
          maxMemory: values.maxMemory,
        },
        images: values.images,
        imagePublicIds: values.imagePublicIds
      };
      const response = await sendRequest<IBackendRes<any>>({
        url: "/api/products",
        method: "POST",
        body: payload,
        headers: { 
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Mainboard added successfully");
        form.reset();
        setTimeout(() => { router.push("/admin/products"); }, 2000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add Mainboard");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8">
      <Button type="button" onClick={onBack} variant="ghost" className="mb-4">&larr; Back</Button>
      <h3 className="text-2xl font-bold mb-6 text-center">Add New Mainboard</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mainboard name" {...field} />
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
                  <Textarea placeholder="Mainboard description" {...field} />
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
            <FormField
              control={form.control}
              name="manufacturerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a manufacturer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer._id} value={manufacturer._id}>
                          {manufacturer.name}
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
            <h4 className="font-semibold mb-2 text-gray-700">Mainboard Specs</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU Brand</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select CPU brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AMD">AMD</SelectItem>
                          <SelectItem value="Intel">Intel</SelectItem>
                        </SelectContent>
                      </Select>
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
                        disabled={!selectedBrand}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select socket" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedBrand === "AMD" && AMD_SOCKETS.map(socket => (
                            <SelectItem key={socket.value} value={socket.value}>
                              {socket.label}
                            </SelectItem>
                          ))}
                          {selectedBrand === "Intel" && INTEL_SOCKETS.map(socket => (
                            <SelectItem key={socket.value} value={socket.value}>
                              {socket.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chipset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chipset Series</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedBrand}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chipset series" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedBrand === "AMD" && AMD_CHIPSETS.map(chipset => (
                            <SelectItem key={chipset.value} value={chipset.value}>
                              {chipset.label}
                            </SelectItem>
                          ))}
                          {selectedBrand === "Intel" && INTEL_CHIPSETS.map(chipset => (
                            <SelectItem key={chipset.value} value={chipset.value}>
                              {chipset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="formFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Factor</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select form factor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mini-ITX">Mini-ITX</SelectItem>
                          <SelectItem value="Micro-ATX">Micro-ATX</SelectItem>
                          <SelectItem value="ATX">ATX</SelectItem>
                          <SelectItem value="E-ATX">E-ATX</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select memory type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DDR4">DDR4</SelectItem>
                          <SelectItem value="DDR5">DDR5</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxMemory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Memory</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select max memory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="32">32GB</SelectItem>
                          <SelectItem value="64">64GB</SelectItem>
                          <SelectItem value="128">128GB</SelectItem>
                          <SelectItem value="256">256GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
          <Button type="submit" className="w-full">Add Mainboard</Button>
        </form>
      </Form>
    </div>
  );
} 
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
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const monitorSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
  manufacturerId: z.string().min(1, "Nhà sản xuất là bắt buộc"),
  stock: z.coerce.number().min(0, "Số lượng phải ít nhất 0"),
  originalPrice: z.coerce.number().min(0, "Giá phải ít nhất 0"),
  discount: z.coerce.number().min(0).max(100),
  monitorSize: z.string().min(1, "Kích thước là bắt buộc"),
  monitorResolution: z.string().min(1, "Độ phân giải là bắt buộc"),
  monitorRefreshRate: z.string().min(1, "Tốc độ quét là bắt buộc"),
  monitorPanelType: z.string().min(1, "Loại màn hình là bắt buộc"),
  monitorResponseTime: z.string().min(1, "Thời gian phản hồi là bắt buộc"),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
  details: z.array(z.object({
    title: z.string().min(1, "Tiêu đề là bắt buộc"),
    content: z.string().optional(),
    image: z.string().optional()
  })).optional()
});

export default function AddMonitorForm({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [manufacturers, setManufacturers] = useState<IManufacturer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imagePublicIds, setImagePublicIds] = useState<string[]>([]);
  const [details, setDetails] = useState<{ title: string; content: string; image?: string }[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(monitorSchema),
    defaultValues: { 
      stock: 0, 
      originalPrice: 0, 
      discount: 0,
      monitorSize: "",
      monitorResolution: "",
      monitorRefreshRate: "",
      monitorPanelType: "",
      monitorResponseTime: "",
      name: "",
      categoryId: "",
      manufacturerId: "",
      images: [],
      imagePublicIds: [],
      details: []
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
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
          const monitorCategory = categoriesRes.data.find(
            cat => cat.name.trim().toLowerCase() === "monitor"
          );
          if (monitorCategory) {
            setCategoryLocked(true);
            form.setValue("categoryId", monitorCategory._id);
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
          setManufacturers(manufacturersRes.data.filter(m => m.type === 'monitor'));
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

  const onSubmit = async (values: any) => {
    if (!session?.user?.accessToken) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }
    try {
      const payload = {
        ...values,
        type: "monitor",
        categoryId: values.categoryId,
        manufacturerId: values.manufacturerId,
        specs: {
          monitorSize: values.monitorSize.startsWith("custom_") ? values.monitorSize.replace("custom_", "") : values.monitorSize,
          monitorResolution: values.monitorResolution.startsWith("custom_") ? values.monitorResolution.replace("custom_", "") : values.monitorResolution,
          monitorRefreshRate: values.monitorRefreshRate.startsWith("custom_") ? values.monitorRefreshRate.replace("custom_", "") : values.monitorRefreshRate,
          monitorPanelType: values.monitorPanelType.startsWith("custom_") ? values.monitorPanelType.replace("custom_", "") : values.monitorPanelType,
          monitorResponseTime: values.monitorResponseTime.startsWith("custom_") ? values.monitorResponseTime.replace("custom_", "") : values.monitorResponseTime,
        },
        images,
        imagePublicIds,
        details
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
        console.error('Backend error:', response.error);
        toast.error(response.error);
      } else {
        toast.success("Monitor added successfully");
        form.reset();
        setImages([]);
        setImagePublicIds([]);
        setDetails([]);
        setTimeout(() => { router.push("/admin/products"); }, 2000);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      toast.error(error.response?.data?.message || "Failed to add Monitor");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8">
      <Button type="button" onClick={onBack} variant="ghost" className="mb-4">&larr; Quay lại</Button>
      <h3 className="text-2xl font-bold mb-6 text-center">Thêm màn hình mới</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="Tên màn hình" {...field} />
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
                  <FormLabel>Danh mục</FormLabel>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={val => form.setValue("categoryId", val)}
                    disabled={categoryLocked || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
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
                  <FormLabel>Nhà sản xuất</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhà sản xuất" />
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
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Số lượng" {...field} />
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
                  <FormLabel>Giá gốc</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Giá gốc" {...field} />
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
                  <FormLabel>Chiết khấu (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Chiết khấu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h4 className="font-semibold mb-2 text-gray-700">Thông số màn hình</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monitorSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kích thước</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kích thước" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="24">24 inch</SelectItem>
                          <SelectItem value="27">27 inch</SelectItem>
                          <SelectItem value="32">32 inch</SelectItem>
                          <SelectItem value="34">34 inch</SelectItem>
                          <SelectItem value="38">38 inch</SelectItem>
                          <SelectItem value="43">43 inch</SelectItem>
                          <SelectItem value="custom">Custom size...</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value.startsWith("custom_") && (
                      <Input
                        className="mt-2"
                        placeholder="Enter custom size (e.g., 28 inch)"
                        value={field.value.replace("custom_", "")}
                        onChange={(e) => field.onChange("custom_" + e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monitorResolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ phân giải</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn độ phân giải" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1920x1080">1920 x 1080 (Full HD)</SelectItem>
                          <SelectItem value="2560x1440">2560 x 1440 (QHD)</SelectItem>
                          <SelectItem value="3440x1440">3440 x 1440 (UWQHD)</SelectItem>
                          <SelectItem value="3840x2160">3840 x 2160 (4K UHD)</SelectItem>
                          <SelectItem value="custom">Custom resolution...</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value.startsWith("custom_") && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            type="number"
                            placeholder="Width (e.g., 2560)"
                            value={field.value.replace("custom_", "").split("x")[0] || ""}
                            onChange={(e) => {
                              const width = e.target.value;
                              const height = field.value.replace("custom_", "").split("x")[1] || "";
                              field.onChange("custom_" + width + "x" + height);
                            }}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="Height (e.g., 1440)"
                            value={field.value.replace("custom_", "").split("x")[1] || ""}
                            onChange={(e) => {
                              const width = field.value.replace("custom_", "").split("x")[0] || "";
                              const height = e.target.value;
                              field.onChange("custom_" + width + "x" + height);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monitorRefreshRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tần số quét</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tần số quét" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="60">60 Hz</SelectItem>
                          <SelectItem value="75">75 Hz</SelectItem>
                          <SelectItem value="120">120 Hz</SelectItem>
                          <SelectItem value="144">144 Hz</SelectItem>
                          <SelectItem value="165">165 Hz</SelectItem>
                          <SelectItem value="240">240 Hz</SelectItem>
                          <SelectItem value="custom">Custom refresh rate...</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value.startsWith("custom_") && (
                      <Input
                        className="mt-2"
                        placeholder="Enter custom refresh rate (e.g., 180 Hz)"
                        value={field.value.replace("custom_", "")}
                        onChange={(e) => field.onChange("custom_" + e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monitorPanelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại tấm nền</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tấm nền" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IPS">IPS</SelectItem>
                          <SelectItem value="VA">VA</SelectItem>
                          <SelectItem value="TN">TN</SelectItem>
                          <SelectItem value="OLED">OLED</SelectItem>
                          <SelectItem value="custom">Custom panel type...</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value.startsWith("custom_") && (
                      <Input
                        className="mt-2"
                        placeholder="Enter custom panel type"
                        value={field.value.replace("custom_", "")}
                        onChange={(e) => field.onChange("custom_" + e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monitorResponseTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian phản hồi</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thời gian phản hồi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 ms</SelectItem>
                          <SelectItem value="2">2 ms</SelectItem>
                          <SelectItem value="4">4 ms</SelectItem>
                          <SelectItem value="5">5 ms</SelectItem>
                          <SelectItem value="8">8 ms</SelectItem>
                          <SelectItem value="custom">Custom response time...</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value.startsWith("custom_") && (
                      <Input
                        className="mt-2"
                        placeholder="Enter custom response time (e.g., 3 ms)"
                        value={field.value.replace("custom_", "")}
                        onChange={(e) => field.onChange("custom_" + e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="space-y-4">
            <FormLabel>Hình ảnh sản phẩm</FormLabel>
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
                      Chính
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
                    Đặt làm ảnh chính
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
                    <span className="mt-2 text-sm text-gray-500">Tải ảnh lên</span>
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
          {/* Product Details Section */}
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h4 className="font-semibold mb-2 text-gray-700">Mô tả sản phẩm</h4>
            {details.map((detail, idx) => (
              <div key={idx} className="mb-4 border rounded p-3 bg-white">
                <input
                  className="mb-2 w-full border rounded px-2 py-1"
                  placeholder="Tiêu đề"
                  value={detail.title}
                  onChange={e => {
                    const newDetails = [...details];
                    newDetails[idx].title = e.target.value;
                    setDetails(newDetails);
                  }}
                />
                <textarea
                  className="mb-2 w-full border rounded px-2 py-1"
                  placeholder="Nội dung"
                  value={detail.content}
                  onChange={e => {
                    const newDetails = [...details];
                    newDetails[idx].content = e.target.value;
                    setDetails(newDetails);
                  }}
                />
                {/* Image selection from uploaded images as thumbnails */}
                <div className="mb-2">
                  <div className="font-medium mb-1">Select Image</div>
                  <div className="flex gap-2 flex-wrap">
                    <div
                      className={`border rounded cursor-pointer p-1 ${!detail.image ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => {
                        const newDetails = [...details];
                        newDetails[idx].image = "";
                        setDetails(newDetails);
                      }}
                    >
                      <div className="w-24 h-16 flex items-center justify-center text-xs text-gray-400">No image</div>
                    </div>
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`border rounded cursor-pointer p-1 ${detail.image === img ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => {
                          const newDetails = [...details];
                          newDetails[idx].image = img;
                          setDetails(newDetails);
                        }}
                      >
                        <img src={img} alt="Detail" className="w-24 h-16 object-cover rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-red-500 text-sm"
                  onClick={() => setDetails(details.filter((_, i) => i !== idx))}
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => setDetails([...details, { title: "", content: "", image: "" }])}
            >
              Thêm
            </button>
          </div>
          <Button type="submit" className="w-full">Thêm màn hình</Button>
        </form>
      </Form>
    </div>
  );
} 
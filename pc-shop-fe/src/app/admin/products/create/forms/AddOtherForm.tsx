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
import { CldUploadWidget } from "next-cloudinary";

const otherSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
  manufacturerId: z.string().min(1, "Nhà sản xuất là bắt buộc"),
  stock: z.coerce.number().min(0, "Số lượng phải ít nhất 0"),
  originalPrice: z.coerce.number().min(0, "Giá phải ít nhất 0"),
  discount: z.coerce.number().min(0).max(100),
  specs: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
  details: z.array(z.object({
    title: z.string().min(1, "Tiêu đề là bắt buộc"),
    content: z.string().optional(),
    image: z.string().optional()
  })).optional()
});

export default function AddOtherForm({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [manufacturers, setManufacturers] = useState<IManufacturer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imagePublicIds, setImagePublicIds] = useState<string[]>([]);
  const [details, setDetails] = useState<{ title: string; content: string; image?: string }[]>([]);
  const [specFields, setSpecFields] = useState<{ key: string; value: string }[]>([]);
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(otherSchema),
    defaultValues: { 
      stock: 0, 
      originalPrice: 0, 
      discount: 0,
      name: "",
      categoryId: "",
      manufacturerId: "",
      specs: {},
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
        } else if (categoriesRes?.error) {
          toast.error(categoriesRes.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải danh mục và nhà sản xuất");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session]);

  useEffect(() => {
    const selectedCat = categories.find(cat => cat._id === form.watch("categoryId"));
    const type = selectedCat ? selectedCat.name.trim().toLowerCase() : "";
    setSelectedCategoryName(type);

    if (!type || !session?.user?.accessToken) {
      setManufacturers([]);
      return;
    }

    const fetchManufacturers = async () => {
      setIsLoading(true);
      try {
        const manufacturersRes = await sendRequest<IBackendRes<IManufacturer[]>>({
          url: '/api/manufacturers',
          method: 'GET',
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        if (manufacturersRes?.data) {
          setManufacturers(manufacturersRes.data.filter(m => m.type === type));
        } else if (manufacturersRes?.error) {
          toast.error(manufacturersRes.error);
        }
      } catch (error) {
        toast.error("Không thể tải nhà sản xuất");
      } finally {
        setIsLoading(false);
      }
    };

    fetchManufacturers();
  }, [form.watch("categoryId"), categories, session]);

  const addSpecField = () => {
    setSpecFields([...specFields, { key: "", value: "" }]);
  };

  const removeSpecField = (index: number) => {
    const newFields = specFields.filter((_, i) => i !== index);
    setSpecFields(newFields);
    const specs = { ...form.getValues("specs") };
    delete specs[specFields[index].key];
    form.setValue("specs", specs);
  };

  const updateSpecField = (index: number, field: "key" | "value", value: string) => {
    const newFields = [...specFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setSpecFields(newFields);

    const specs = { ...form.getValues("specs") };
    if (field === "key") {
      delete specs[specFields[index].key];
      specs[value] = newFields[index].value;
    } else {
      specs[newFields[index].key] = value;
    }
    form.setValue("specs", specs);
  };

  const onSubmit = async (values: any) => {
    if (!session?.user?.accessToken) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }
    try {
      const payload = {
        ...values,
        type: "other",
        categoryId: values.categoryId,
        manufacturerId: values.manufacturerId,
        specs: values.specs || {},
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
        toast.error(response.error);
      } else {
        toast.success("Thêm sản phẩm thành công");
        form.reset();
        setTimeout(() => { router.push("/admin/products"); }, 2000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Lỗi khi thêm sản phẩm");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8">
      <Button type="button" onClick={onBack} variant="ghost" className="mb-4">&larr; Quay lại</Button>
      <h3 className="text-2xl font-bold mb-6 text-center">Thêm sản phẩm khác</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="Tên sản phẩm" {...field} />
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
                    disabled={isLoading}
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
                  <FormLabel>Tồn kho</FormLabel>
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
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-700">Thông số sản phẩm</h4>
              <Button type="button" onClick={addSpecField} variant="outline" size="sm">Thêm thông số</Button>
            </div>
            <div className="space-y-4">
              {specFields.map((field, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Tên thông số"
                      value={field.key}
                      onChange={(e) => updateSpecField(index, "key", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Giá trị"
                      value={field.value}
                      onChange={(e) => updateSpecField(index, "value", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeSpecField(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </Button>
                </div>
              ))}
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
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Ảnh chính</span>
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
                  <div className="font-medium mb-1">Chọn ảnh</div>
                  <div className="flex gap-2 flex-wrap">
                    <div
                      className={`border rounded cursor-pointer p-1 ${!detail.image ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => {
                        const newDetails = [...details];
                        newDetails[idx].image = "";
                        setDetails(newDetails);
                      }}
                    >
                      <div className="w-24 h-16 flex items-center justify-center text-xs text-gray-400">Không có ảnh</div>
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
          <Button type="submit" className="w-full">Thêm sản phẩm</Button>
        </form>
      </Form>
    </div>
  );
} 
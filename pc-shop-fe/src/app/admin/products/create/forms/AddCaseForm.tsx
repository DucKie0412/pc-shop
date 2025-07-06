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
import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const caseSchema = z.object({
  name: z.string().min(1, "Không được để trống"),
  categoryId: z.string().min(1, "Không được để trống"),
  manufacturerId: z.string().min(1, "Không được để trống"),
  stock: z.coerce.number().min(0, "Không được để trống, tối thiểu 0"),
  originalPrice: z.coerce.number().min(0, "Không được để trống, tối thiểu 0"),
  discount: z.coerce.number().min(0).max(100),
  formFactor: z.string().min(1, "Không được để trống"),
  material: z.string().min(1, "Không được để trống"),
  color: z.string().min(1, "Không được để trống"),
  length: z.coerce.number().min(0, "Không được để trống, tối thiểu 0"),
  width: z.coerce.number().min(0, "Không được để trống, tối thiểu 0"),
  height: z.coerce.number().min(0, "Không được để trống, tối thiểu 0"),
  fans: z.coerce.number().min(0, "Không được để trống, tối thiểu 0"),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
  details: z.array(z.object({
    title: z.string().min(1, "Không được để trống"),
    content: z.string().optional(),
    image: z.string().optional()
  })).optional()
});

export default function AddCaseForm({ onBack }: { onBack: () => void }) {
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
    resolver: zodResolver(caseSchema),
    defaultValues: { 
      stock: 0, 
      originalPrice: 0, 
      discount: 0,
      formFactor: "",
      material: "",
      color: "",
      length: 0,
      width: 0,
      height: 0,
      fans: 0,
      name: "",
      categoryId: "",
      manufacturerId: "",
      images: [],
      imagePublicIds: [],
      details: []
    },
  });

  const onSubmit = async (values: any) => {
    if (!session?.user?.accessToken) {
      toast.error("Đăng nhập để tiếp tục");
      return;
    }
    try {
      const payload = {
        ...values,
        type: "case",
        categoryId: values.categoryId,
        manufacturerId: values.manufacturerId,
        images,
        imagePublicIds,
        specs: {
          caseFormFactor: values.formFactor,
          caseMaterial: values.material,
          caseColor: values.color,
          caseDimensions: `${values.length} x ${values.width} x ${values.height} mm`,
          caseFans: values.fans,
        },
        details,
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
        setImages([]);
        setImagePublicIds([]);
        setTimeout(() => { router.push("/admin/products"); }, 2000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Lỗi khi thêm sản phẩm");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) {
        toast.error("Đăng nhập để tiếp tục");
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
          const caseCategory = categoriesRes.data.find(
            cat => cat.name.trim().toLowerCase() === "case"
          );
          if (caseCategory) {
            setCategoryLocked(true);
            form.setValue("categoryId", caseCategory._id);
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
          setManufacturers(manufacturersRes.data.filter(m => m.type === 'case'));
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

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8">
      <Button type="button" onClick={onBack} variant="ghost" className="mb-4">&larr; Quay lại</Button>
      <h3 className="text-2xl font-bold mb-6 text-center">Thêm mới</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="Case name" {...field} />
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
                    <Input type="number" {...field} />
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
                  <FormLabel>Giảm giá (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h4 className="font-semibold mb-2 text-gray-700">Thông số chi tiết</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="formFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiểu case</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kiểu case" />
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
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chất liệu</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn một chất liệu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Steel">Thép</SelectItem>
                          <SelectItem value="Aluminum">Nhôm</SelectItem>
                          <SelectItem value="Plastic">Nhựa</SelectItem>
                          <SelectItem value="Tempered Glass">Kính cường lực</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn màu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Black">Đen</SelectItem>
                          <SelectItem value="White">Trắng</SelectItem>
                          <SelectItem value="Gray">Xám</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2">
                <h5 className="text-sm font-medium mb-2">Kích thước (mm)</h5>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chiều dài</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chiều rộng</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chiều cao</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="fans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng quạt</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
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
                      Ảnh chính
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
          <Button type="submit" className="w-full">Thêm case</Button>
        </form>
      </Form>
    </div>
  );
} 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendRequest } from "@/utils/api";
import { useEffect, useState } from "react";
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

const vgaSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
  manufacturerId: z.string().min(1, "Nhà sản xuất là bắt buộc"),
  stock: z.coerce.number().min(0, "Số lượng phải ít nhất 0"),
  originalPrice: z.coerce.number().min(0, "Giá phải ít nhất 0"),
  discount: z.coerce.number().min(0).max(100),
  vgaVram: z.string().min(1, "VRAM phải ít nhất 1"),
  vgaVramType: z.string().min(1, "VRAM type là bắt buộc"),
  vgaBoostSpeed: z.string().min(1, "Boost speed là bắt buộc"),
  vgaPCIExpress: z.string().min(1, "PCI Express version là bắt buộc"),
  vgaDisplayPorts: z.coerce.number().min(0).default(0),
  vgaHdmiPorts: z.coerce.number().min(0).default(0),
  vgaVgaPorts: z.coerce.number().min(0).default(0),
  vgaDviPorts: z.coerce.number().min(0).default(0),
  vga6PinConnectors: z.coerce.number().min(0).default(0),
  vga6Plus2PinConnectors: z.coerce.number().min(0).default(0),
  vga8PinConnectors: z.coerce.number().min(0).default(0),
  vga12PinConnectors: z.coerce.number().min(0).default(0),
  vgaMaxTDP: z.string().min(1, "Max TDP là bắt buộc"),
  vgaSizeWidth: z.string().min(1, "Width là bắt buộc"),
  vgaSizeLength: z.string().min(1, "Length là bắt buộc"),
  vgaSizeHeight: z.string().min(1, "Height là bắt buộc"),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
  details: z.array(z.object({
    title: z.string().min(1, "Title là bắt buộc"),
    content: z.string().optional(),
    image: z.string().optional()
  })).optional()
});

export default function AddVGAForm({ onBack }: { onBack: () => void }) {
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
    resolver: zodResolver(vgaSchema),
    defaultValues: { 
      stock: 0, 
      originalPrice: 0, 
      discount: 0,
      vgaVram: "",
      vgaVramType: "",
      vgaBoostSpeed: "",
      vgaPCIExpress: "",
      vgaDisplayPorts: 0,
      vgaHdmiPorts: 0,
      vgaVgaPorts: 0,
      vgaDviPorts: 0,
      vga6PinConnectors: 0,
      vga6Plus2PinConnectors: 0,
      vga8PinConnectors: 0,
      vga12PinConnectors: 0,
      vgaMaxTDP: "",
      vgaSizeWidth: "",
      vgaSizeLength: "",
      vgaSizeHeight: "",
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
          // Find GPU category
          const gpuCategory = categoriesRes.data.find(
            cat => cat.name.trim().toLowerCase() === "vga"
          );
          if (gpuCategory) {
            setCategoryLocked(true);
            form.setValue("categoryId", gpuCategory._id);
          } else {
            setCategoryLocked(false);
          }
        } else if (categoriesRes?.error) {
          toast.error(categoriesRes.error);
        }
        // Fetch manufacturers
        const manufacturersRes = await sendRequest<IBackendRes<IManufacturer[]>>({
          url: '/api/manufacturers',
          method: 'GET',
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        if (manufacturersRes?.data) {
          setManufacturers(manufacturersRes.data.filter(m => m.type === 'vga'));
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
        type: "vga",
        categoryId: values.categoryId,
        manufacturerId: values.manufacturerId,
        specs: {
          vgaVram: values.vgaVram,
          vgaVramType: values.vgaVramType,
          vgaBoostSpeed: values.vgaBoostSpeed.startsWith("custom_") ? values.vgaBoostSpeed.replace("custom_", "") : values.vgaBoostSpeed,
          vgaPCIExpress: values.vgaPCIExpress,
          vgaDisplayPorts: values.vgaDisplayPorts,
          vgaHdmiPorts: values.vgaHdmiPorts,
          vgaVgaPorts: values.vgaVgaPorts,
          vgaDviPorts: values.vgaDviPorts,
          vga6PinConnectors: values.vga6PinConnectors,
          vga6Plus2PinConnectors: values.vga6Plus2PinConnectors,
          vga8PinConnectors: values.vga8PinConnectors,
          vga12PinConnectors: values.vga12PinConnectors,
          vgaMaxTDP: values.vgaMaxTDP.startsWith("custom_") ? values.vgaMaxTDP.replace("custom_", "") : values.vgaMaxTDP,
          vgaSize: `${values.vgaSizeWidth} x ${values.vgaSizeLength} x ${values.vgaSizeHeight}`,
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
        toast.error(response.error);
      } else {
        toast.success("Thêm VGA thành công");
        form.reset();
        setTimeout(() => { router.push("/admin/products"); }, 2000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Lỗi khi thêm VGA");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8">
      <Button type="button" onClick={onBack} variant="ghost" className="mb-4">&larr; Quay lại</Button>
      <h3 className="text-2xl font-bold mb-6 text-center">Thêm VGA mới</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="Tên VGA" {...field} />
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
            <h4 className="font-semibold mb-2 text-gray-700">Thông số VGA</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vgaVram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VRAM (GB)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn dung lượng VRAM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1GB</SelectItem>
                          <SelectItem value="2">2GB</SelectItem>
                          <SelectItem value="3">3GB </SelectItem>
                          <SelectItem value="4">4GB</SelectItem>
                          <SelectItem value="6">6GB</SelectItem>
                          <SelectItem value="8">8GB</SelectItem>
                          <SelectItem value="12">12GB</SelectItem>
                          <SelectItem value="16">16GB</SelectItem>
                          <SelectItem value="24">24GB</SelectItem>
                          <SelectItem value="32">32GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vgaVramType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại VRAM</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại VRAM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GDDR3">GDDR3</SelectItem>
                          <SelectItem value="GDDR4">GDDR4</SelectItem>
                          <SelectItem value="GDDR5">GDDR5</SelectItem>
                          <SelectItem value="GDDR6">GDDR6</SelectItem>
                          <SelectItem value="GDDR6X">GDDR6X</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vgaBoostSpeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xung nhịp boost (MHz)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={value => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn xung nhịp boost" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1500">1500 MHz</SelectItem>
                          <SelectItem value="1600">1600 MHz</SelectItem>
                          <SelectItem value="1700">1700 MHz</SelectItem>
                          <SelectItem value="1800">1800 MHz</SelectItem>
                          <SelectItem value="1900">1900 MHz</SelectItem>
                          <SelectItem value="2000">2000 MHz</SelectItem>
                          <SelectItem value="2100">2100 MHz</SelectItem>
                          <SelectItem value="2200">2200 MHz</SelectItem>
                          <SelectItem value="2300">2300 MHz</SelectItem>
                          <SelectItem value="2400">2400 MHz</SelectItem>
                          <SelectItem value="2500">2500 MHz</SelectItem>
                          <SelectItem value="2600">2600 MHz</SelectItem>
                          <SelectItem value="2700">2700 MHz</SelectItem>
                          <SelectItem value="2800">2800 MHz</SelectItem>
                          <SelectItem value="2900">2900 MHz</SelectItem>
                          <SelectItem value="3000">3000 MHz</SelectItem>
                          <SelectItem value="custom">Custom...</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value.startsWith("custom_") && (
                      <Input
                        className="mt-2"
                        placeholder="Nhập xung nhịp boost tùy chỉnh (vd: 2750 MHz)"
                        value={field.value.replace("custom_", "")}
                        onChange={e => field.onChange("custom_" + e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vgaPCIExpress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chuẩn PCI Express</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={value => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chuẩn PCI Express" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PCIe 2.0 x8">PCIe 2.0 x8</SelectItem>
                          <SelectItem value="PCIe 2.0 x16">PCIe 2.0 x16</SelectItem>
                          <SelectItem value="PCIe 3.0 x8">PCIe 3.0 x8</SelectItem>
                          <SelectItem value="PCIe 3.0 x16">PCIe 3.0 x16</SelectItem>
                          <SelectItem value="PCIe 4.0 x8">PCIe 4.0 x8</SelectItem>
                          <SelectItem value="PCIe 4.0 x16">PCIe 4.0 x16</SelectItem>
                          <SelectItem value="PCIe 5.0 x16">PCIe 5.0 x16</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vgaMaxTDP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TDP tối đa (W)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.startsWith("custom_") ? "custom" : field.value}
                        onValueChange={value => {
                          if (value === "custom") {
                            field.onChange("custom_");
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn TDP tối đa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="75">75W</SelectItem>
                          <SelectItem value="100">100W</SelectItem>
                          <SelectItem value="125">125W</SelectItem>
                          <SelectItem value="150">150W</SelectItem>
                          <SelectItem value="175">175W</SelectItem>
                          <SelectItem value="200">200W</SelectItem>
                          <SelectItem value="225">225W</SelectItem>
                          <SelectItem value="250">250W</SelectItem>
                          <SelectItem value="275">275W</SelectItem>
                          <SelectItem value="300">300W</SelectItem>
                          <SelectItem value="325">325W</SelectItem>
                          <SelectItem value="350">350W</SelectItem>
                          <SelectItem value="375">375W</SelectItem>
                          <SelectItem value="400">400W</SelectItem>
                          <SelectItem value="450">450W</SelectItem>
                          <SelectItem value="500">500W</SelectItem>
                          <SelectItem value="600">600W</SelectItem>
                          <SelectItem value="custom">Custom...</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value.startsWith("custom_") && (
                      <Input
                        className="mt-2"
                        placeholder="Nhập TDP tối đa tùy chỉnh (vd: 425W)"
                        value={field.value.replace("custom_", "")}
                        onChange={e => field.onChange("custom_" + e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Display Ports Section */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-gray-700">Cổng xuất hình</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="vgaDisplayPorts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DisplayPort</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vgaHdmiPorts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HDMI</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vgaVgaPorts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VGA</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vgaDviPorts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DVI</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Power Connectors Section */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-gray-700">Cổng nguồn</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="vga6PinConnectors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6-pin</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vga6Plus2PinConnectors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6+2-pin</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vga8PinConnectors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>8-pin</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vga12PinConnectors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>12-pin</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Số lượng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dimensions Section */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-gray-700">Kích thước</h5>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="vgaSizeWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rộng (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Nhập chiều rộng"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vgaSizeLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dài (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Nhập chiều dài"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vgaSizeHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cao (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Nhập chiều cao"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
          <Button type="submit" className="w-full">Thêm VGA</Button>
        </form>
      </Form>
    </div>
  );
} 
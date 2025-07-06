"use client";

import { useState } from "react";
import { PRODUCT_TYPES } from "@/constants/productSpecs";
import AddCPUForm from "./forms/AddCPUForm";
import AddVGAForm from "./forms/AddVGAForm";
import AddRAMForm from "./forms/AddRAMForm";
import AddSSDForm from "./forms/AddSSDForm";
import AddMainboardForm from "./forms/AddMainboardForm";
import AddPSUForm from "./forms/AddPSUForm";
import AddCaseForm from "./forms/AddCaseForm";
import AddMonitorForm from "./forms/AddMonitorForm";
import AddOtherForm from "./forms/AddOtherForm";
import AddHDDForm from "./forms/AddHDDForm";
const typeToForm: Record<string, React.FC<{ onBack: () => void }>> = {
  cpu: AddCPUForm,
  vga: AddVGAForm,
  ram: AddRAMForm,
  ssd: AddSSDForm,
  hdd: AddHDDForm,
  mainboard: AddMainboardForm,
  psu: AddPSUForm,
  case: AddCaseForm,
  monitor: AddMonitorForm,
  other: AddOtherForm,
};

export default function AddProductEntry() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (selectedType) {
    const FormComponent = typeToForm[selectedType];
    if (FormComponent) {
      return <FormComponent onBack={() => setSelectedType(null)} />;
    }
    return (
      <div className="p-8 text-center">Chưa có mẫu thêm cho sản phẩm này.</div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Chọn loại sản phẩm</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PRODUCT_TYPES.map((type) => (
          <button
            key={type}
            className="px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            onClick={() => setSelectedType(type)}
          >
            Thêm mới {type.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
} 
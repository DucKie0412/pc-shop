export const PRODUCT_TYPE_SPECS = {
  cpu: [
    { name: 'cores', label: 'Cores', type: 'number' },
    { name: 'threads', label: 'Threads', type: 'number' },
    { name: 'socket', label: 'Socket', type: 'text' },
  ],
  gpu: [
    { name: 'vram', label: 'VRAM (GB)', type: 'number' },
    { name: 'chipset', label: 'Chipset', type: 'text' },
  ],
  ram: [
    { name: 'size', label: 'Size (GB)', type: 'number' },
    { name: 'bus', label: 'Bus', type: 'text' },
  ],
  ssd: [
    { name: 'capacity', label: 'Capacity (GB)', type: 'number' },
    { name: 'interface', label: 'Interface', type: 'text' },
  ],
  mainboard: [
    { name: 'chipset', label: 'Chipset', type: 'text' },
    { name: 'socket', label: 'Socket', type: 'text' },
    { name: 'formFactor', label: 'Form Factor', type: 'text' },
  ],
  psu: [
    { name: 'wattage', label: 'Wattage (W)', type: 'number' },
    { name: 'efficiency', label: 'Efficiency', type: 'text' },
  ],
  case: [
    { name: 'formFactor', label: 'Form Factor', type: 'text' },
    { name: 'color', label: 'Color', type: 'text' },
  ],
  monitor: [
    { name: 'size', label: 'Size (inch)', type: 'number' },
    { name: 'resolution', label: 'Resolution', type: 'text' },
    { name: 'refreshRate', label: 'Refresh Rate (Hz)', type: 'number' },
  ],
  other: [
    { name: 'detail', label: 'Detail', type: 'text' },
  ],
};

export const PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_SPECS); 
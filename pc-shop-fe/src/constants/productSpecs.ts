export const PRODUCT_TYPE_SPECS = {
  cpu: [
    { name: 'cores', label: 'Cores', type: 'number', options: ['1', '2', '4', '6', '8', '12', '16', '24', '32', '64'] },
    { name: 'threads', label: 'Threads', type: 'number', options: ['1', '2', '4', '6', '8', '12', '16', '24', '32', '64'] },
    { name: 'socket', label: 'Socket', type: 'text', options: ['AM4', 'AM5', 'LGA1200', 'LGA1700'] }, 
  ],
  vga: [
    { name: 'vram', label: 'VRAM (GB)', type: 'number' },
    { name: 'vramType', label: 'VRAM Type', type: 'text', options: ['GDDR5', 'GDDR6', 'GDDR6X', 'HBM2'] },
  ],
  ram: [
    { name: 'size', label: 'Size (GB)', type: 'number', options: ['1', '2', '4', '8', '16', '32', '64', '128', '256', '512'] },
    { name: 'type', label: 'Type', type: 'text', options: ['DDR3', 'DDR4', 'DDR5'] },
    { name: 'bus', label: 'Bus', type: 'text', options: ['2133', '2400', '2666', '2933', '3200', '3600', '4000', ] },
  ],
  ssd: [
    { name: 'capacity', label: 'Capacity (GB)', type: 'number' },
    { name: 'interface', label: 'Interface', type: 'text', options: ['SATA', 'NVMe', 'PCIe'] },
    { name: 'type', label: 'Type', type: 'text', options: ['2.5"', 'M.2', 'U.2', 'mSATA'] },
  ],
  mainboard: [
    { name: 'chipset', label: 'Chipset', type: 'text', options: ['A Series', 'B Series', 'X Series', 'H Series', 'Z Series'] },
    { name: 'socket', label: 'Socket', type: 'text', options: ['AM4', 'AM5', 'LGA 1200', 'LGA 1700'] },
    { name: 'formFactor', label: 'Form Factor', type: 'text', options: ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'] },
    { name: 'memoryType', label: 'Memory Type', type: 'text', options: ['DDR3', 'DDR4', 'DDR5'] },
    { name: 'maxMemory', label: 'Max Memory (GB)', type: 'number' },
  ],
  psu: [
    { name: 'wattage', label: 'Wattage (W)', type: 'number', options: ['400', '450', '500', '550', '600', '650', '700', '750', '800', '850', '1000', '1200', '1300', '1600'] },
    { name: 'efficiency', label: 'Efficiency', type: 'text', options: ['80 Plus', '80 Plus Bronze', '80 Plus Silver', '80 Plus Gold', '80 Plus Platinum', '80 Plus Titanium'] },
    { name: 'modular', label: 'Modular', type: 'text', options: ['Yes', 'No'] },
  ],
  case: [
    { name: 'formFactor', label: 'Form Factor', type: 'text', options: ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'] },
    { name: 'material', label: 'Material', type: 'text', options: ['Steel', 'Aluminum', 'Plastic', 'Tempered Glass'] },
    { name: 'color', label: 'Color', type: 'text', options: ['Black', 'White', 'Silver', 'Red', 'Blue'] },
    { name: 'fans', label: 'Number of Fans', type: 'number' },
  ],
  monitor: [
    { name: 'size', label: 'Size (inch)', type: 'number' },
    { name: 'resolution', label: 'Resolution', type: 'text', options: ['1920x1080', '2560x1440', '3840x2160', '5120x2880'] },
    { name: 'refreshRate', label: 'Refresh Rate (Hz)', type: 'number', options: ['60', '75', '120', '144', '165', '240'] },
    { name: 'panelType', label: 'Panel Type', type: 'text', options: ['IPS', 'TN', 'VA', 'OLED'] },
    { name: 'responseTime', label: 'Response Time (ms)', type: 'number', options: ['1', '2', '4', '5', '8'] },
  ],
  other: [
    { name: 'detail', label: 'Detail', type: 'text' },
  ],
};

export const PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_SPECS); 
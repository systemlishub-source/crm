// app/products/components/types.ts
export interface Product {
  id: number;
  code: string;
  type: string;
  name: string;
  model: string;
  description?: string;
  image?: string;
  size?: string;
  sizeNumber: number;
  color: string;
  material: string;
  purchaseValue: number;
  saleValue: number;
  margin: number;
  status: number;
  quantity: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'grid' | 'list';
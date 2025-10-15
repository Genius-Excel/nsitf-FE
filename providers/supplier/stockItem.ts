// types.ts
export interface StockItem {
  itemImage?: string;
  itemName: string;
  category: string;
  stockType: string;
  price: number;
  quantity: number;
  measuringUnit: string;
  id: string;
  storeId: string;
  expiryDate?: string;
  lowStockAlert?: number;
}

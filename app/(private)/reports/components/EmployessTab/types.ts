// app/reports/components/employees/types.ts
export interface EmployeeData {
  employeeId: string;
  employeeName: string;
  employeeNickname: string;
  employeeEmail: string;
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageTicket: number;
  averageItemsPerSale: number;
}

export interface TotalMetrics {
  activeEmployees: number;
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  averageRevenuePerEmployee: number;
  averageOrdersPerEmployee: number;
}

export interface ChartData {
  salesByEmployee: Array<{ name: string; orders: number; revenue: number }>;
  ranking: Array<{ position: number; name: string; revenue: number; orders: number }>;
}

export interface ApiResponse {
  period: string;
  totalMetrics: TotalMetrics;
  employees: EmployeeData[];
  chartData: ChartData;
}

export type PeriodType = '7' | '30' | '90' | '180' | '365' | 'all';
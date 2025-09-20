export type PeriodType = '7' | '30' | '365' | 'all';

export interface SalesData {
    salesEvolution: {
        labels: string[];
        data: number[];
    };
    salesByCategory: {
        labels: string[];
        data: number[];
    };
    salesByTimePeriod: {
        labels: string[];
        data: number[];
    };
    salesByEmployee: {
        labels: string[];
        data: number[];
        orderCounts: number[];
    };
    metrics: {
        totalRevenue: number;
        totalOrders: number;
        totalItemsSold: number;
        uniqueClients: number;
        averageTicket: number;
        averageItemsPerOrder: number;
    };
    topProducts: Array<{
        name: string;
        quantity: number;
        revenue: number;
    }>;
    period: string;
}
// app/api/analytics/products/route.ts
import { NextResponse } from 'next/server'

import { subDays, subYears, startOfDay, endOfDay } from 'date-fns'
import { verifyAuthHeader } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export async function GET(request: Request) {
  try {
    const authenticatedUser = await verifyAuthHeader()
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    let dateFilter = {}
    let periodText = 'Todos os períodos'

    if (period !== 'all') {
      const days = parseInt(period)
      const startDate = subDays(new Date(), days)
      
      dateFilter = {
        purchaseDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(new Date())
        }
      }

      if (days === 7) periodText = 'Últimos 7 dias'
      else if (days === 30) periodText = 'Últimos 30 dias'
      else if (days === 365) periodText = 'Último ano'
    }

    // 1. Margem de Lucro por Produto
    const productsWithMargin = await prisma.products.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        model: true,
        purchaseValue: true,
        saleValue: true,
        margin: true,
        quantity: true,
        orderItems: {
          where: {
            order: dateFilter
          },
          select: {
            quantity: true,
            price: true
          }
        }
      },
      orderBy: {
        margin: 'desc'
      }
    })

    const profitMarginData = productsWithMargin.map(product => ({
      id: product.id,
      name: product.name,
      model: product.model,
      purchaseValue: product.purchaseValue,
      saleValue: product.saleValue,
      margin: product.margin,
      currentStock: product.quantity,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      profitMarginPercentage: ((product.saleValue - product.purchaseValue) / product.purchaseValue) * 100
    }))

    // 2. Estoque Crítico (produtos com quantidade <= 5)
    const criticalStock = await prisma.products.findMany({
      where: {
        status: 1,
        quantity: {
          lte: 5
        }
      },
      select: {
        id: true,
        name: true,
        model: true,
        code: true,
        quantity: true,
        purchaseValue: true,
        saleValue: true
      },
      orderBy: {
        quantity: 'asc'
      }
    })

    // 3. Produtos Mais Vendidos
    const bestSellingProducts = await prisma.products.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        model: true,
        code: true,
        orderItems: {
          where: {
            order: dateFilter
          },
          select: {
            quantity: true,
            price: true
          }
        }
      },
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const bestSellersData = bestSellingProducts.map(product => ({
      id: product.id,
      name: product.name,
      model: product.model,
      code: product.code,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      averagePrice: product.orderItems.length > 0 ? 
        product.orderItems.reduce((sum, item) => sum + item.price, 0) / product.orderItems.length : 0
    })).sort((a, b) => b.totalSold - a.totalSold)

    // 4. Categorias em Destaque (agrupando por tipo)
    const productsByType = await prisma.products.findMany({
      where: { status: 1 },
      select: {
        type: true,
        orderItems: {
          where: {
            order: dateFilter
          },
          select: {
            quantity: true,
            price: true
          }
        }
      }
    })

    type CategoryAccumulator = {
      [type: string]: {
        totalSold: number;
        totalRevenue: number;
        productCount: number;
      }
    };

    const categoryData = productsByType.reduce((acc: CategoryAccumulator, product) => {
      if (!product.type) return acc;
      
      if (!acc[product.type]) {
        acc[product.type] = {
          totalSold: 0,
          totalRevenue: 0,
          productCount: 0
        }
      }
      
      const typeSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const typeRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      acc[product.type].totalSold += typeSold
      acc[product.type].totalRevenue += typeRevenue
      acc[product.type].productCount += 1
      
      return acc
    }, {} as CategoryAccumulator)

    const categoryPerformance = Object.entries(categoryData).map(([type, data]: [string, any]) => ({
      type,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
      productCount: data.productCount,
      averageRevenuePerProduct: data.productCount > 0 ? data.totalRevenue / data.productCount : 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)

    // 5. Desempenho por Marca (agrupando por model)
    const productsByModel = await prisma.products.findMany({
      where: { status: 1 },
      select: {
        model: true,
        orderItems: {
          where: {
            order: dateFilter
          },
          select: {
            quantity: true,
            price: true
          }
        }
      }
    })

    type BrandAccumulator = {
      [model: string]: {
        totalSold: number;
        totalRevenue: number;
        productCount: number;
      }
    };

    const brandData = productsByModel.reduce((acc: BrandAccumulator, product) => {
      if (!product.model) return acc;
      
      if (!acc[product.model]) {
        acc[product.model] = {
          totalSold: 0,
          totalRevenue: 0,
          productCount: 0
        }
      }
      
      const modelSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const modelRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      acc[product.model].totalSold += modelSold
      acc[product.model].totalRevenue += modelRevenue
      acc[product.model].productCount += 1
      
      return acc
    }, {} as BrandAccumulator)

    const brandPerformance = Object.entries(brandData).map(([model, data]: [string, any]) => ({
      model,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
      productCount: data.productCount,
      averageRevenuePerProduct: data.productCount > 0 ? data.totalRevenue / data.productCount : 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)

    // 6. Métricas Gerais
    const totalProducts = await prisma.products.count({
      where: { status: 1 }
    })

    const totalStockValue = await prisma.products.aggregate({
      where: { status: 1 },
      _sum: {
        quantity: true
      }
    })

    const totalPurchaseValue = await prisma.products.aggregate({
      where: { status: 1 },
      _sum: {
        purchaseValue: true
      }
    })

    const averageMargin = await prisma.products.aggregate({
      where: { status: 1 },
      _avg: {
        margin: true
      }
    })

    // CORREÇÃO: Buscar o valor total do estoque calculando (purchaseValue * quantity) para cada produto

    const productsForStockValue = await prisma.products.findMany({
      where: { status: 1 },
      select: {
        purchaseValue: true,
        quantity: true
      }
    })

    // Calcular o valor total do estoque somando (purchaseValue * quantity) de cada produto
    const totalStockValueCalc = productsForStockValue.reduce((total, product) => {
      return total + (product.purchaseValue * product.quantity)
    }, 0)

    return NextResponse.json({
      profitMargin: profitMarginData,
      criticalStock: criticalStock.map(product => ({
        ...product,
        stockValue: product.quantity * product.purchaseValue
      })),
      bestSellers: bestSellersData,
      categoryPerformance,
      brandPerformance,
      metrics: {
        totalProducts,
        totalActiveProducts: totalProducts,
        totalInStock: totalStockValue._sum.quantity || 0,
        totalStockValue: totalStockValueCalc,
        averageMargin: averageMargin._avg.margin || 0,
        criticalStockCount: criticalStock.length
      },
      period: periodText,
      periodType: period,
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (err) {
    console.error('Erro na API de produtos:', err)
    return NextResponse.json({ 
      error: 'Erro interno do servidor ao buscar dados de produtos.' 
    }, { status: 500 })
  }
}
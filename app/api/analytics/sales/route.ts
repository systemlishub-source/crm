// app/api/analytics/sales/route.ts
import { NextResponse } from 'next/server'
import { verifyAuthHeader } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export async function GET(request: Request) {
  try {
    const authenticatedUser = await verifyAuthHeader()
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // padrão: 30 dias
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFilter = {}
    
    // Se não houver datas específicas, usar o período
    if (!startDate || !endDate) {
      const periodDate = new Date()
      
      switch (period) {
        case '7':
          periodDate.setDate(periodDate.getDate() - 7)
          break
        case '30':
          periodDate.setDate(periodDate.getDate() - 30)
          break
        case '365':
          periodDate.setDate(periodDate.getDate() - 365)
          break
        case 'all':
          // Não aplicar filtro de data
          break
        default:
          periodDate.setDate(periodDate.getDate() - 30)
      }
      
      if (period !== 'all') {
        dateFilter = {
          purchaseDate: {
            gte: periodDate
          }
        }
      }
    } else {
      // Usar datas específicas se fornecidas
      dateFilter = {
        purchaseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    }

    // Buscar todos os dados necessários em paralelo para melhor performance
    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                type: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        },
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        purchaseDate: 'asc'
      }
    })

    // Buscar produtos separadamente para evitar problemas de relacionamento
    const products = await prisma.products.findMany({
      where: { status: 1 },
      select: {
        id: true,
        type: true,
        name: true
      }
    })

    // 1. Dados para Evolução de Vendas (por dia/semana/mês)
    const salesEvolution = calculateSalesEvolution(orders)

    // 2. Dados para Vendas por Categoria
    const salesByCategory = calculateSalesByCategory(orders, products)

    // 3. Dados para Vendas por Período (manhã, tarde, noite)
    const salesByTimePeriod = calculateSalesByTimePeriod(orders)

    // 4. Dados para Vendas por Funcionário
    const salesByEmployee = calculateSalesByEmployee(orders)

    // 5. Métricas Gerais
    const metrics = calculateMetrics(orders)

    // 6. Top Produtos
    const topProducts = calculateTopProducts(orders)

    return NextResponse.json({
      salesEvolution,
      salesByCategory,
      salesByTimePeriod,
      salesByEmployee,
      metrics,
      topProducts,
      period: period
    }, { status: 200 })

  } catch (err) {
    console.error('Erro no dashboard de vendas:', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

// Funções auxiliares
function calculateSalesEvolution(orders: any[]) {
  const salesByDate: { [key: string]: number } = {}

  orders.forEach(order => {
    const date = order.purchaseDate.toISOString().split('T')[0]
    const orderTotal = order.orderItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    if (!salesByDate[date]) {
      salesByDate[date] = 0
    }
    salesByDate[date] += orderTotal
  })

  // Ordenar por data e formatar labels para exibição
  const sortedDates = Object.keys(salesByDate).sort()
  const labels = sortedDates.map(date => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  })
  
  const data = sortedDates.map(date => salesByDate[date])

  return { labels, data }
}

function calculateSalesByCategory(orders: any[], products: any[]) {
  const categoryMap: { [key: string]: number } = {}
  
  // Criar mapa de categorias a partir dos produtos
  const productCategoryMap: { [key: number]: string } = {}
  products.forEach(product => {
    productCategoryMap[product.id] = product.type || 'Outros'
  })

  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      const category = productCategoryMap[item.productId] || 'Outros'
      const itemTotal = item.price * item.quantity

      if (!categoryMap[category]) {
        categoryMap[category] = 0
      }
      categoryMap[category] += itemTotal
    })
  })

  // Ordenar por valor e limitar a 10 categorias
  const sortedCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const labels = sortedCategories.map(([category]) => category)
  const data = sortedCategories.map(([, total]) => total)

  return { labels, data }
}

function calculateSalesByTimePeriod(orders: any[]) {
  const timePeriods = [
    { label: 'Madrugada (0h-6h)', total: 0 },
    { label: 'Manhã (6h-12h)', total: 0 },
    { label: 'Tarde (12h-18h)', total: 0 },
    { label: 'Noite (18h-24h)', total: 0 },
  ]

  orders.forEach(order => {
    const hour = new Date(order.purchaseDate).getHours()
    const orderTotal = order.orderItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    if (hour >= 0 && hour < 6) {
      timePeriods[0].total += orderTotal
    } else if (hour >= 6 && hour < 12) {
      timePeriods[1].total += orderTotal
    } else if (hour >= 12 && hour < 18) {
      timePeriods[2].total += orderTotal
    } else if (hour >= 18 && hour < 24) {
      timePeriods[3].total += orderTotal
    }
  })

  const labels = timePeriods.map(period => period.label)
  const data = timePeriods.map(period => period.total)

  return { labels, data }
}

function calculateSalesByEmployee(orders: any[]) {
  const employeeSales: { [key: string]: { total: number, count: number, name: string } } = {}

  orders.forEach(order => {
    const employeeId = order.userId
    const employeeName = order.user?.name || `Funcionário ${employeeId}`
    const orderTotal = order.orderItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    if (!employeeSales[employeeId]) {
      employeeSales[employeeId] = { total: 0, count: 0, name: employeeName }
    }
    
    employeeSales[employeeId].total += orderTotal
    employeeSales[employeeId].count += 1
  })

  const sortedEmployees = Object.values(employeeSales)
    .filter(emp => emp.total > 0)
    .sort((a, b) => b.total - a.total)

  const labels = sortedEmployees.map(emp => emp.name)
  const data = sortedEmployees.map(emp => emp.total)
  const orderCounts = sortedEmployees.map(emp => emp.count)

  return { labels, data, orderCounts }
}

function calculateMetrics(orders: any[]) {
  let totalRevenue = 0
  let totalItemsSold = 0
  const clientOrders: { [key: string]: number } = {}

  orders.forEach(order => {
    const orderTotal = order.orderItems.reduce((sum: number, item: any) => {
      totalItemsSold += item.quantity
      return sum + (item.price * item.quantity)
    }, 0)
    
    totalRevenue += orderTotal
    clientOrders[order.clientId] = (clientOrders[order.clientId] || 0) + 1
  })

  const totalOrders = orders.length
  const uniqueClients = Object.keys(clientOrders).length
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const averageItemsPerOrder = totalOrders > 0 ? totalItemsSold / totalOrders : 0

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalOrders,
    totalItemsSold,
    uniqueClients,
    averageTicket: parseFloat(averageTicket.toFixed(2)),
    averageItemsPerOrder: parseFloat(averageItemsPerOrder.toFixed(2))
  }
}

function calculateTopProducts(orders: any[]) {
  const productSales: { [key: string]: { quantity: number, revenue: number, name: string } } = {}

  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      const productId = item.productId.toString()
      const productName = item.product?.name || `Produto ${productId}`
      
      if (!productSales[productId]) {
        productSales[productId] = {
          quantity: 0,
          revenue: 0,
          name: productName
        }
      }
      
      productSales[productId].quantity += item.quantity
      productSales[productId].revenue += item.price * item.quantity
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  return topProducts
}
// app/api/analytics/insights/route.ts
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
    const period = searchParams.get('period') || '30' // default: 30 dias
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFilter = {}
    
    // Se datas específicas foram fornecidas, usa elas
    if (startDate && endDate) {
      dateFilter = {
        purchaseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
      // Caso contrário, usa o período selecionado
      const now = new Date()
      const startDate = new Date()
      
      switch (period) {
        case '7':
          startDate.setDate(now.getDate() - 7)
          break
        case '30':
          startDate.setDate(now.getDate() - 30)
          break
        case '365':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        case 'all':
          // Não filtra por data - pega tudo
          break
        default:
          startDate.setDate(now.getDate() - 30)
      }

      if (period !== 'all') {
        dateFilter = {
          purchaseDate: {
            gte: startDate,
            lte: now
          }
        }
      }
    }

    // Buscar todos os dados necessários em paralelo
    const [
      orders,
      clients,
      products,
      orderItems,
      totalOrdersCount,
      activeClientsCount
    ] = await Promise.all([
      // Orders com orderItems
      prisma.order.findMany({
        where: dateFilter,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          client: true,
          user: true
        },
        orderBy: {
          purchaseDate: 'desc'
        }
      }),

      // Todos os clientes
      prisma.client.findMany({
        where: { status: 1 },
        include: {
          orders: {
            where: dateFilter,
            include: {
              orderItems: true
            }
          }
        }
      }),

      // Produtos ativos
      prisma.products.findMany({
        where: { status: 1 },
        include: {
          orderItems: {
            where: {
              order: dateFilter
            }
          }
        }
      }),

      // OrderItems para cálculos
      prisma.orderItem.findMany({
        where: {
          order: dateFilter
        },
        include: {
          product: true,
          order: true
        }
      }),

      // Contagem total de pedidos
      prisma.order.count({
        where: dateFilter
      }),

      // Clientes que fizeram pedidos no período
      prisma.client.count({
        where: {
          status: 1,
          orders: {
            some: dateFilter
          }
        }
      })
    ])

    // Cálculo do Ticket Médio
    const totalRevenue = orders.reduce((sum: any, order:any) => {
      const orderTotal = order.orderItems.reduce((orderSum:any, item:any) => 
        orderSum + (item.price * item.quantity), 0
      )
      return sum + orderTotal
    }, 0)

    const totalOrders = orders.length
    const uniqueClients = new Set(orders.map((order:any) => order.clientId)).size

    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const averageTicketPerClient = uniqueClients > 0 ? totalRevenue / uniqueClients : 0

    // Cálculo de vendas do período
    const periodSales = orders.length

    // Faturamento do período
    const periodRevenue = orders.reduce((sum:any, order:any) => {
      const orderTotal = order.orderItems.reduce((orderSum:any, item:any) => 
        orderSum + (item.price * item.quantity), 0
      )
      return sum + orderTotal
    }, 0)

    // Top produtos (mais vendidos)
    const topProducts = products
      .map(product => ({
        id: product.id,
        name: product.name,
        code: product.code,
        totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        profitMargin: ((product.saleValue - product.purchaseValue) / product.purchaseValue) * 100
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10)

    // Evolução de vendas por dia
    const salesByDay = calculateSalesByDay(orders, period)

    // Métricas gerais
    const metrics = {
      averageTicket: parseFloat(averageTicket.toFixed(2)),
      averageTicketPerClient: parseFloat(averageTicketPerClient.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders: totalOrdersCount,
      uniqueClients: activeClientsCount,
      periodSales: periodSales,
      periodRevenue: parseFloat(periodRevenue.toFixed(2)),
      activeClients: activeClientsCount
    }

    return NextResponse.json({
      metrics,
      topProducts,
      salesByDay,
      period: getPeriodLabel(period),
      periodType: period,
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (err:any) {
    console.error('Erro na API de insights:', err)
    return NextResponse.json({ 
      error: 'Erro interno do servidor.',
      details: err.message 
    }, { status: 500 })
  }
}

// Função auxiliar para calcular vendas por dia
function calculateSalesByDay(orders: any[], period: string) {
  const now = new Date()
  let daysToShow = 7 // padrão

  switch (period) {
    case '7':
      daysToShow = 7
      break
    case '30':
      daysToShow = 30
      break
    case '365':
      daysToShow = 12 // meses no ano
      break
    case 'all':
      daysToShow = Math.min(30, Math.ceil((now.getTime() - new Date(orders[0]?.purchaseDate || now).getTime()) / (1000 * 60 * 60 * 24)))
      break
  }

  if (period === '365') {
    // Agrupar por mês para período anual
    const salesByMonth: { [key: string]: { revenue: number; orders: number; date: string } } = {}
    const currentYear = now.getFullYear()
    
    for (let i = 0; i < 12; i++) {
      const month = i
      const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`
      salesByMonth[monthKey] = { revenue: 0, orders: 0, date: monthKey }
    }

    orders.forEach(order => {
      const orderDate = new Date(order.purchaseDate)
      if (orderDate.getFullYear() === currentYear) {
        const monthKey = `${currentYear}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
        const orderTotal = order.orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
        
        salesByMonth[monthKey].revenue += orderTotal
        salesByMonth[monthKey].orders += 1
      }
    })

    return Object.values(salesByMonth)
  } else {
    // Agrupar por dia
    const salesByDay: { [date: string]: { revenue: number; orders: number; date: string } } = {}
    const dates = Array.from({ length: daysToShow }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    dates.forEach(date => {
      salesByDay[date] = { revenue: 0, orders: 0, date }
    })

    orders.forEach(order => {
      const orderDate = order.purchaseDate.toISOString().split('T')[0]
      if (salesByDay[orderDate]) {
        const orderTotal = order.orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
        salesByDay[orderDate].revenue += orderTotal
        salesByDay[orderDate].orders += 1
      }
    })

    return Object.values(salesByDay)
  }
}

// Função auxiliar para obter label do período
function getPeriodLabel(period: string) {
  switch (period) {
    case '7': return 'Últimos 7 dias'
    case '30': return 'Últimos 30 dias'
    case '365': return 'Último ano'
    case 'all': return 'Todo o período'
    default: return 'Últimos 30 dias'
  }
}
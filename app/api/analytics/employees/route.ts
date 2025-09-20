// app/api/analytics/employees/route.ts
import { NextResponse } from 'next/server'
import { verifyAuthHeader } from '../../lib/auth';
import { prisma } from '../../lib/prisma';


// Função para criar nickname a partir do nome completo
function getEmployeeNickname(fullName: string): string {
  const names = fullName.trim().split(/\s+/);
  
  if (names.length === 0) return 'Funcionário';
  if (names.length === 1) return names[0];
  
  // Primeiro nome + último nome
  const firstName = names[0];
  const lastName = names[names.length - 1];
  
  return `${firstName} ${lastName}`;
}


function getDateRangeFromPeriod(period: string): { startDate: Date | null; endDate: Date | null } {
  const endDate = new Date()
  let startDate = new Date()

  switch (period) {
    case '7':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '180':
      startDate.setDate(endDate.getDate() - 180)
      break
    case '365':
      startDate.setDate(endDate.getDate() - 365)
      break
    case 'all':
      return { startDate: null, endDate: null }
    default:
      startDate.setDate(endDate.getDate() - 30)
  }

  // Reset time to start of day
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

function getPeriodText(period: string): string {
  switch (period) {
    case '7':
      return 'Últimos 7 dias'
    case '30':
      return 'Últimos 30 dias'
    case '90':
      return 'Últimos 90 dias'
    case '180':
      return 'Últimos 180 dias'
    case '365':
      return 'Últimos 365 dias'
    case 'all':
      return 'Todos os períodos'
    default:
      return 'Últimos 30 dias'
  }
}

export async function GET(request: Request) {
  try {
    const authenticatedUser = await verifyAuthHeader()
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as '7' | '30' | '90' | '180' | '365' | 'all' || '30'

    // Calcular datas baseadas no período
    const { startDate, endDate } = getDateRangeFromPeriod(period)

    // Construir filtro de data
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        purchaseDate: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    // Buscar todos os funcionários ativos
    const activeEmployees = await prisma.users.findMany({
      where: {
        status: 1,
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    // Buscar todas as ordens no período com seus itens
    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Calcular métricas por funcionário
    const employeeMetrics = activeEmployees.map(employee => {
      const employeeOrders = orders.filter(order => order.userId === employee.id)
      
      const totalOrders = employeeOrders.length
      
      const totalRevenue = employeeOrders.reduce((sum, order) => {
        const orderTotal = order.orderItems.reduce((orderSum, item) => 
          orderSum + (item.price * item.quantity), 0
        )
        return sum + orderTotal
      }, 0)

      const totalItemsSold = employeeOrders.reduce((sum, order) => {
        return sum + order.orderItems.reduce((orderSum, item) => 
          orderSum + item.quantity, 0
        )
      }, 0)

      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const averageItemsPerSale = totalOrders > 0 ? totalItemsSold / totalOrders : 0

      return {
        employeeId: employee.id,
        employeeName: getEmployeeNickname(employee.name),
        employeeEmail: employee.email,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalItemsSold,
        averageTicket: parseFloat(averageTicket.toFixed(2)),
        averageItemsPerSale: parseFloat(averageItemsPerSale.toFixed(2))
      }
    })

    // Ordenar por total de vendas (decrescente)
    const sortedEmployees = employeeMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Calcular métricas gerais
    const totalRevenue = sortedEmployees.reduce((sum, emp) => sum + emp.totalRevenue, 0)
    const totalOrders = sortedEmployees.reduce((sum, emp) => sum + emp.totalOrders, 0)
    const totalItemsSold = sortedEmployees.reduce((sum, emp) => sum + emp.totalItemsSold, 0)
    const averageRevenuePerEmployee = activeEmployees.length > 0 ? totalRevenue / activeEmployees.length : 0
    const averageOrdersPerEmployee = activeEmployees.length > 0 ? totalOrders / activeEmployees.length : 0

    return NextResponse.json({
      period: getPeriodText(period),
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      totalMetrics: {
        activeEmployees: activeEmployees.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalItemsSold,
        averageRevenuePerEmployee: parseFloat(averageRevenuePerEmployee.toFixed(2)),
        averageOrdersPerEmployee: parseFloat(averageOrdersPerEmployee.toFixed(2))
      },
      employees: sortedEmployees,
      chartData: {
        // Dados para gráfico de barras (vendas por funcionário)
        salesByEmployee: sortedEmployees.map(emp => ({
          name: emp.employeeName,
          orders: emp.totalOrders,
          revenue: emp.totalRevenue
        })),
        // Dados para gráfico de ranking
        ranking: sortedEmployees.map((emp, index) => ({
          position: index + 1,
          name: emp.employeeName,
          revenue: emp.totalRevenue,
          orders: emp.totalOrders
        }))
      }
    }, { status: 200 })

  } catch (err) {
    console.error('Erro na API de analytics de funcionários:', err)
    return NextResponse.json({ 
      error: 'Erro interno do servidor ao buscar dados dos funcionários.' 
    }, { status: 500 })
  }
}
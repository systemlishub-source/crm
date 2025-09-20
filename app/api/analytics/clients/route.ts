// app/api/analytics/clients/route.ts
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
    const period = searchParams.get('period') as '7' | '30' | '90' | '180' | '365' | 'all' || '30'

    // Calcular datas baseadas no período
    const { startDate, endDate } = getDateRangeFromPeriod(period)

    // Buscar todos os clientes com seus dados completos (do período selecionado)
    const clients = await prisma.client.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        orders: {
          where: {
            purchaseDate: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            orderItems: true
          }
        },
        address: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 1. Novos clientes cadastrados por período (dentro do range)
    const newClientsByPeriod = await getNewClientsByPeriod(startDate, endDate)

    // 2. Clientes ativos vs inativos (baseado no status)
    const activeVsInactive = getActiveVsInactive(clients)

    // 3. Distribuição por gênero (dos clientes do período)
    const genderDistribution = getGenderDistribution(clients)

    // 4. Faixa etária dos clientes (do período)
    const ageDistribution = getAgeDistribution(clients)

    // 5. Clientes mais recorrentes (no período selecionado)
    const mostFrequentClients = getMostFrequentClients(clients)

    // 6. Métricas gerais (do período)
    const metrics = getClientMetrics(clients)

    // 7. Distribuição por região (do período)
    const regionDistribution = getRegionDistribution(clients)

    return NextResponse.json({
      newClientsByPeriod,
      activeVsInactive,
      genderDistribution,
      ageDistribution,
      mostFrequentClients,
      metrics,
      regionDistribution,
      totalClients: clients.length,
      period: getPeriodText(period, startDate, endDate)
    }, { status: 200 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

// Função para calcular o range de datas baseado no período
function getDateRangeFromPeriod(period: '7' | '30' | '90' | '180' | '365' | 'all'): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999) // Fim do dia
  
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
      startDate = new Date(0) // Data mínima (01/01/1970)
      break
    default:
      startDate.setDate(endDate.getDate() - 30)
  }

  startDate.setHours(0, 0, 0, 0) // Início do dia

  return { startDate, endDate }
}

// Função para obter texto descritivo do período
function getPeriodText(period: '7' | '30' | '90' | '180' | '365' | 'all', startDate: Date, endDate: Date): string {
  const periodTexts = {
    '7': 'Últimos 7 dias',
    '30': 'Últimos 30 dias',
    '90': 'Últimos 90 dias',
    '180': 'Últimos 180 dias',
    '365': 'Últimos 365 dias',
    'all': 'Todos os períodos'
  }

  return periodTexts[period] || `Período: ${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`
}

// Funções auxiliares
async function getNewClientsByPeriod(startDate: Date, endDate: Date) {
  const clientsByDate = await prisma.client.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _count: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  // Agrupar por dia para melhor visualização
  const dailyData: Record<string, number> = {}
  
  clientsByDate.forEach(item => {
    const dateKey = item.createdAt.toISOString().split('T')[0]
    dailyData[dateKey] = (dailyData[dateKey] || 0) + item._count.id
  })

  return Object.entries(dailyData).map(([date, count]) => ({
    date,
    count
  }))
}

function getActiveVsInactive(clients: any[]) {
  const active = clients.filter(client => client.status === 1).length
  const inactive = clients.filter(client => client.status === 0).length
  
  return [
    { name: 'Ativos', value: active, color: '#10B981' },
    { name: 'Inativos', value: inactive, color: '#EF4444' }
  ]
}

function getGenderDistribution(clients: any[]) {
  const genderCount: Record<string, number> = {}
  
  clients.forEach(client => {
    const gender = client.gender || 'Não informado'
    genderCount[gender] = (genderCount[gender] || 0) + 1
  })

  return Object.entries(genderCount).map(([name, value]) => ({
    name,
    value,
    color: getGenderColor(name)
  }))
}

function getGenderColor(gender: string): string {
  const colors: Record<string, string> = {
    'Masculino': '#3B82F6',
    'Feminino': '#EC4899',
    'Outro': '#8B5CF6',
    'Não informado': '#6B7280'
  }
  return colors[gender] || '#9CA3AF'
}

function getAgeDistribution(clients: any[]) {
  const ageGroups: Record<string, number> = {
    '0-18': 0,
    '19-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-55': 0,
    '56+': 0
  }

  clients.forEach(client => {
    if (client.birthDate) {
      const birthDate = new Date(client.birthDate)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      
      if (age <= 18) ageGroups['0-18']++
      else if (age <= 25) ageGroups['19-25']++
      else if (age <= 35) ageGroups['26-35']++
      else if (age <= 45) ageGroups['36-45']++
      else if (age <= 55) ageGroups['46-55']++
      else ageGroups['56+']++
    }
  })

  return Object.entries(ageGroups).map(([name, value]) => ({
    name,
    value
  }))
}

function getMostFrequentClients(clients: any[]) {
  return clients
    .map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      totalOrders: client.orders.length,
      totalSpent: client.orders.reduce((total: number, order: any) => {
        return total + order.orderItems.reduce((orderTotal: number, item: any) => 
          orderTotal + (item.price * item.quantity), 0
        )
      }, 0),
      lastPurchase: client.orders.length > 0 
        ? new Date(Math.max(...client.orders.map((o: any) => new Date(o.purchaseDate).getTime())))
        : null
    }))
    .filter(client => client.totalOrders > 0) // Apenas clientes com compras no período
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 10)
}

function getClientMetrics(clients: any[]) {
  const activeClients = clients.filter(client => client.status === 1).length
  const totalOrders = clients.reduce((total, client) => total + client.orders.length, 0)
  const totalRevenue = clients.reduce((total, client) => {
    return total + client.orders.reduce((orderTotal: number, order: any) => {
      return orderTotal + order.orderItems.reduce((itemTotal: number, item: any) => 
        itemTotal + (item.price * item.quantity), 0
      )
    }, 0)
  }, 0)

  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const averageOrdersPerClient = clients.length > 0 ? totalOrders / clients.length : 0

  return {
    totalClients: clients.length,
    activeClients,
    inactiveClients: clients.length - activeClients,
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    averageTicket: parseFloat(averageTicket.toFixed(2)),
    averageOrdersPerClient: parseFloat(averageOrdersPerClient.toFixed(1))
  }
}

function getRegionDistribution(clients: any[]) {
  const regionCount: Record<string, number> = {}
  
  clients.forEach(client => {
    if (client.address && client.address.length > 0) {
      const state = client.address[0].state || 'Não informado'
      regionCount[state] = (regionCount[state] || 0) + 1
    } else {
      regionCount['Não informado'] = (regionCount['Não informado'] || 0) + 1
    }
  })

  return Object.entries(regionCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}
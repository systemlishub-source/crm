// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthHeader } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Valida o token de autenticação
  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const orderId = parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID da ordem inválido' },
        { status: 400 }
      )
    }

    // Verificar se a ordem existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        client: true,
        user: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Ordem não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões (opcional: apenas administrador ou o usuário que criou a ordem pode excluir)
    if (authenticatedUser.role !== 'Administrador' && existingOrder.userId !== authenticatedUser.userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir esta ordem' },
        { status: 403 }
      )
    }

    // Excluir a ordem em uma transação para garantir consistência
    const deletedOrder = await prisma.$transaction(async (tx) => {
      // 1. Restaurar estoque dos produtos
      for (const item of existingOrder.orderItems) {
        await tx.products.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        })
      }

      // 2. Excluir a ordem (os OrderItems serão excluídos automaticamente devido ao onDelete: Cascade)
      const deleted = await tx.order.delete({
        where: { id: orderId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        }
      })

      return deleted
    })

    return NextResponse.json({
      message: 'Ordem excluída com sucesso',
      deletedOrder: {
        id: deletedOrder.id,
        client: deletedOrder.client,
        user: deletedOrder.user,
        purchaseDate: deletedOrder.purchaseDate,
        discount: deletedOrder.discount,
        orderItems: deletedOrder.orderItems,
        total: deletedOrder.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting order:', error)
    
    // Verificar se é um erro de constraint do Prisma
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Não foi possível excluir a ordem devido a dependências' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

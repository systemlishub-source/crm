
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
import { verifyAuthHeader } from '../lib/auth';
import { prisma } from '../lib/prisma';

const orderItemSchema = z.object({
  productId: z.number().positive(),
  quantity: z.number().positive().int(),
  price: z.number().positive().optional()
});

const orderSchema = z.object({
  clientId: z.string().uuid(),
  notes: z.string().optional().nullable(),
  purchaseDate: z.string().datetime().optional(),
  orderItems: z.array(orderItemSchema).min(1),
  discount: z.number().min(0).default(0)
});


export async function POST(req: NextRequest) {
  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json();

    const parseResult = orderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Dados de venda inválidos', issues: parseResult.error.issues }, { status: 400 });
    }

    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id: body.clientId }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário (funcionário) existe
    const user = await prisma.users.findUnique({
      where: { id: authenticatedUser.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar estoque e preços dos produtos
    const productIds = body.orderItems.map((item: any) => item.productId);
    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds }
      }
    });

    // Mapear produtos para acesso rápido
    const productMap = new Map(products.map(p => [p.id, p]));

    // Calcular subtotal para validar o desconto
    let subtotal = 0;

    // Validar cada item do pedido
    for (const item of body.orderItems) {
      const product = productMap.get(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Produto com ID ${item.productId} não encontrado` },
          { status: 404 }
        );
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.quantity}, Solicitado: ${item.quantity}` },
          { status: 400 }
        );
      }

      // Usar o preço atual de venda do produto
      item.price = product.saleValue;
      
      // Calcular subtotal
      subtotal += item.price * item.quantity;
    }

    // Validar se o desconto não é maior que o subtotal
    if (body.discount > subtotal) {
      return NextResponse.json(
        { error: `Desconto (R$ ${body.discount}) não pode ser maior que o subtotal (R$ ${subtotal})` },
        { status: 400 }
      );
    }

    // Criar a ordem e os itens em uma transação
    const newOrder = await prisma.$transaction(async (tx) => {
      // Criar a ordem
      const order = await tx.order.create({
        data: {
          clientId: body.clientId,
          userId: authenticatedUser.userId,
          notes: body.notes || null,
          purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : new Date(),
          discount: body.discount || 0 // Agora armazena o valor em reais
        }
      });

      // Criar os itens da ordem e atualizar estoque
      const orderItemsData = body.orderItems.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      // Criar todos os itens
      await tx.orderItem.createMany({
        data: orderItemsData
      });

      // Atualizar estoque para cada produto
      for (const item of body.orderItems) {
        await tx.products.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // Retornar a ordem completa com itens
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          client: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  model: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Opcional: Rota GET para listar pedidos
export async function GET(req: NextRequest) {
  const authenticatedUser = await verifyAuthHeader();

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      skip,
      take: limit,
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
                code: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    });

    // Calcular total para cada pedido (agora com desconto em reais)
    const ordersWithTotal = orders.map(order => {
      const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discountAmount = order.discount; // Já é o valor em reais
      const total = subtotal - discountAmount;

      // Calcular percentual de desconto para exibição (opcional)
      const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;

      return {
        ...order,
        subtotal,
        discountAmount, // Valor do desconto em reais
        discountPercentage: Math.round(discountPercentage * 100) / 100, // Percentual calculado
        total // Total final com desconto
      };
    });

    const total = await prisma.order.count();

    return NextResponse.json({
      orders: ordersWithTotal,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
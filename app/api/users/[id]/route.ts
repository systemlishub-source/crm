import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { verifyAuthHeader } from '../../lib/auth'


const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['Administrador', 'UsuarioPadrao']).optional(),
  status: z.number().optional(),
  cpf: z.string().min(14, 'O CPF está incompleto!').optional(),
  phoneNumber: z.string().min(10, 'O numero de telefone está incompleto!').optional(),
  address: z.object({
    cep: z.string().min(6,'O CEP está incompleto!').optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    street: z.string().optional(),
    complement: z.string().optional(),
  }).optional()
})

export async function PATCH(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {

  const { id } = await params;

  // Valida o token de autenticação
  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  
  // Valida se o usuário é um administrador
  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }


  // validação do formulário para atualização de usuário
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  // Se a validação falhar, retorna os erros
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
  }

  // Se a validação for bem-sucedida, extrai os dados
  const data = parsed.data

  try {

    // Valida a senha
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    if (data.address) {
      data.address = {
        cep: data.address.cep,
        country: data.address.country,
        state: data.address.state,
        city: data.address.city,
        district: data.address.district,
        street: data.address.street,
        complement: data.address.complement
      };
    }

    // First, find the address by userId
    const addressRecord = await prisma.address.findFirst({
      where: { userId: id }
    });

    let updatedAddress = null;
    if (addressRecord) {
      updatedAddress = await prisma.address.update({
        where: { id: addressRecord.id },
        data: {
          cep: data.address?.cep,
          country: data.address?.country,
          state: data.address?.state,
          city: data.address?.city,
          district: data.address?.district,
          street: data.address?.street,
          complement: data.address?.complement
        }
      });
    }

    // Remove address from data before updating user
    const { address, ...userData } = data;

    // edita o usuário
    const updatedUser = await prisma.users.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        status: true
      }
    })

    return NextResponse.json({updatedUser, updatedAddress}, { status: 200 })

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 })
  }
}


export async function GET(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;

  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
        
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar usuário.' }, { status: 500 })
  }
}



export async function DELETE(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  
  const { id } = await params;

  // Valida o token de autenticação
  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  
  // Valida se o usuário é um administrador
  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }

  try {
    // Verifica se existem pedidos vinculados a esta transportadora
    const userOrdersCount = await prisma.order.count({
      where: { userId: id }
    });

    if (userOrdersCount > 0) {
      // Se existirem pedidos vinculados, apenas atualiza o status para 2 (inativo)
      await prisma.users.update({
        where: { id: id },
        data: { status: 2 }
      });
      
      return NextResponse.json(
        { message: 'Usuário marcado como inativo pois possui registros vinculados.' }, 
        { status: 200 }
      );
    }else{

      // Deleta o usuário pelo ID
      await prisma.users.delete({ where: { id } })

      return NextResponse.json({ message: 'Usuário deletado com sucesso.' }, { status: 200 })
    }

  } catch (error: any) {
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar usuário.' }, { status: 500 })
  }
}
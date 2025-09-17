import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { verifyAuthHeader } from '@/app/api/lib/auth'


// Validação do formulário para criação de usuário
const userSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['Administrador', 'UsuarioPadrao']),
  cpf: z.string().min(14, 'O CPF está incompleto!'),
  phoneNumber: z.string().min(10, 'O numero de telefone está incompleto!'),
  address: z.object({
    cep: z.string().min(6,'O CEP está incompleto!'),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    district: z.string(),
    street: z.string(),
    complement: z.string(),
  })
})


export async function POST(req: NextRequest) {
  try {

    // Valida o token de autenticação
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Valida se o usuário é um administrador
    if (authenticatedUser.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    //Valida os dados do usuário
    const body = await req.json()
    const parsed = userSchema.safeParse(body)

    // Se a validação falhar, retorna os erros
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    // Se a validação for bem-sucedida, extrai os dados
    const { 
      name, 
      email, 
      password, 
      role, 
      cpf,
      phoneNumber,
      address
    } = parsed.data

    // Verifica se o e-mail já existe
    const existingEmail = await prisma.users.findUnique({ where: { email: email.toLowerCase() } })
    if (existingEmail) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 400 })
    }

    const existingCpf = await prisma.users.findUnique({ where: { cpf } })
    if (existingCpf) {
      return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 400 })
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10)


    // Cria o usuário
    const user = await prisma.users.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        cpf,
        phoneNumber,
        status: 1 // Cadastra como user ativo
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true
      }
    })

    const userAddress = await prisma.address.create({
      data: {
        userId: user.id,
        cep: address.cep,
        country: address.country,
        state: address.state,
        city: address.city,
        district: address.district,
        street: address.street,
        complement: address.complement
      }
    })

    return NextResponse.json({user,userAddress}, { status: 201 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) { 
  try {
    // Valida o token de autenticação
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    // Valida se o usuário é um administrador
    if (authenticatedUser.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }


    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        cpf: true,
        phoneNumber: true,
        createdAt: true,
        address: true
      },
    
    })

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários.' }, { status: 500 })
  }
}
import z from "zod"
import { NextRequest, NextResponse } from "next/server"
import { verifyAuthHeader } from "../../lib/auth"
import { prisma } from "../../lib/prisma"

// Schema para update (todos os campos opcionais)
const clientUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10, "O numero de telefone está incompleto!").optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  status: z.number().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["Masculino", "Feminino", "Outro"]).optional(),
  address: z.object({
    cep: z.string().min(6, "O CEP está incompleto!").optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    street: z.string().optional(),
    complement: z.string().optional(),
  }).optional()
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Valida o token
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Pega o ID da URL
    const { id } = params

    // Lê e valida os dados do body
    const body = await req.json()
    const parsed = clientUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    const {
      name,
      email,
      cpf,
      phoneNumber,
      birthDate,
      gender,
      rg,
      address,
      status
    } = parsed.data

    // Verifica se cliente existe
    const existingClient = await prisma.client.findUnique({ where: { id } })
    if (!existingClient) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Se email for atualizado, verifica duplicidade
    if (email) {
      const existingEmail = await prisma.client.findUnique({ where: { email: email.toLowerCase() } })
      if (existingEmail && existingEmail.id !== id) {
        return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 })
      }
    }

    // Atualiza o cliente
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email: email?.toLowerCase(),
        cpf,
        phoneNumber,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        rg,
        status
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phoneNumber: true,
        birthDate: true,
        gender: true,
        rg: true
      }
    })

    // Atualiza ou cria o endereço (se enviado)
    let clientAddress = null
    if (address) {
      // Busca o endereço existente pelo clientId
      const existingAddress = await prisma.address.findFirst({
        where: { clientId: client.id }
      })

      clientAddress = await prisma.address.upsert({
        where: existingAddress ? { id: existingAddress.id } : { id: 0 }, // id: 0 nunca existirá, força o create
        update: {
          cep: address.cep,
          country: address.country,
          state: address.state,
          city: address.city,
          district: address.district,
          street: address.street,
          complement: address.complement
        },
        create: {
          cep: address.cep!,
          country: address.country!,
          state: address.state!,
          city: address.city!,
          district: address.district!,
          street: address.street!,
          complement: address.complement!,
          client: {
            connect: { id: client.id }
          }
        }
      })
    }

    return NextResponse.json({ client, clientAddress }, { status: 200 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}



export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Valida o token
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Pega o ID da URL
    const { id } = params


    // Verifica se existem pedidos vinculados a este cliente
    const clientOrdersCount = await prisma.order.count({
      where: { clientId: id }
    });

    if (clientOrdersCount > 0) {
      // Se existirem pedidos vinculados, apenas atualiza o status para 2 (inativo)
      await prisma.client.update({
        where: { id: id },
        data: { status: 0 }
      });

      return NextResponse.json(
        { message: 'Cliente marcado como inativo pois possui registros vinculados.' },
        { status: 200 }
      );
    } else {

      // Deleta o cliente pelo ID
      await prisma.client.delete({ where: { id } })

      return NextResponse.json({ message: 'Cliente deletado com sucesso.' }, { status: 200 })
    }

  } catch (error: any) {

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar usuário.' }, { status: 500 })
  }

}

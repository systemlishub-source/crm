import z from "zod";
import { verifyAuthHeader } from "../lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";


const clientSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phoneNumber: z.string().min(10, 'O numero de telefone está incompleto!'),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    birthDate: z.string(),
    gender: z.enum(["Masculino", "Feminino", "Outro"]),
    address: z.object({
        cep: z.string().min(6, 'O CEP está incompleto!'),
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


        //Valida os dados do usuário
        const body = await req.json()
        const parsed = clientSchema.safeParse(body)

        // Se a validação falhar, retorna os erros
        if (!parsed.success) {
            return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
        }

        // Se a validação for bem-sucedida, extrai os dados
        const {
            name,
            email,
            cpf,
            phoneNumber,
            birthDate,
            gender,
            rg,
            address
        } = parsed.data

        // Verifica se o e-mail já existe
        const existingEmail = await prisma.client.findUnique({ where: { email: email.toLowerCase() } })
        if (existingEmail) {
            return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 400 })
        }

        // Cria o cliente
        const client = await prisma.client.create({
            data: {
                name,
                email: email.toLowerCase(),
                cpf,
                phoneNumber,
                birthDate,
                gender,
                rg
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

        const clientAddress = await prisma.address.create({
        data: {
            cep: address.cep,
            country: address.country,
            state: address.state,
            city: address.city,
            district: address.district,
            street: address.street,
            complement: address.complement,
            client: {
            connect: {
                id: client.id
            }
            }
        }
        });

        return NextResponse.json({ client, clientAddress }, { status: 201 })

    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
    }
}

export async function GET() {
    try {
        // Valida o token de autenticação
        const authenticatedUser = await verifyAuthHeader()

        if (!authenticatedUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Busca os clientes
        const clients = await prisma.client.findMany({
            where: { status: 1 }, // Busca apenas clientes ativos
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                phoneNumber: true,
                birthDate: true,
                gender: true,
                rg: true,
                address: true,
                orders: {
                    select: {
                        orderItems: {
                            select: {
                                price: true,
                                quantity: true,
                                
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(clients, { status: 200 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
    }
}
const { PrismaClient, Role } = require('@prisma/client')

const prisma = new PrismaClient()



async function main() {

  const { faker } = await import('@faker-js/faker')

  function generateProductCode() {
  const letters = faker.string.alpha({ count: 3, casing: 'upper' })
  const numbers = faker.number.int({ min: 1, max: 999 }).toString().padStart(3, '0')
  return `${letters}${numbers}`
}

  // Usuários
  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.users.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          cpf: faker.string.numeric(11),
          phoneNumber: faker.phone.number(),
          role: faker.helpers.arrayElement([Role.Administrador, Role.UsuarioPadrao]),
        },
      })
    )
  )

  // Clientes
  const clients = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.client.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phoneNumber: faker.phone.number(),
          cpf: faker.string.numeric(11),
          rg: faker.string.numeric(9),
          gender: faker.helpers.arrayElement(['Masculino', 'Feminino']),
          birthDate: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
        },
      })
    )
  )

  // Produtos
  const products = await Promise.all(
    Array.from({ length: 30 }).map(() =>
      prisma.products.create({
        data: {
          code: generateProductCode(),
          type: faker.helpers.arrayElement(['Roupas', 'Joias']),
          name: faker.commerce.productName(),
          model: faker.helpers.arrayElement(['Saia', 'Vestido', 'Calça']),
          description: faker.commerce.productDescription(),
          size: faker.helpers.arrayElement(['P', 'M', 'G']),
          sizeNumber: faker.number.int({ min: 34, max: 46 }),
          color: faker.color.human(),
          material: faker.commerce.productMaterial(),
          purchaseValue: faker.number.float({ min: 20, max: 200 }),
          saleValue: faker.number.float({ min: 50, max: 500 }),
          margin: faker.number.float({ min: 10, max: 300 }),
          quantity: faker.number.int({ min: 0, max: 100 }),
          supplier: faker.company.name(),
        },
      })
    )
  )

  // Pedidos + Itens
  for (let i = 0; i < 50; i++) {
    const client = faker.helpers.arrayElement(clients)
    const user = faker.helpers.arrayElement(users)

    const order = await prisma.order.create({
      data: {
        clientId: client.id,
        userId: user.id,
        purchaseDate: faker.date.recent({ days: 90 }),
      },
    })

    const numItems = faker.number.int({ min: 1, max: 5 })
    for (let j = 0; j < numItems; j++) {
      const product = faker.helpers.arrayElement(products)
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 3 }),
          price: product.saleValue,
        },
      })
    }
  }
}

main()
  .then(() => {
    console.log('🌱 Seed concluído com sucesso!')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

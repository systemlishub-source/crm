import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { verifyAuthHeader } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import cloudinary from "@/lib/coudinary";


const updateSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    model: z.string().optional(),
    description: z.string().optional().optional(),
    image: z.string().optional(),
    size: z.string().optional(),
    sizeNumber: z.number().min(0).optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    purchaseValue: z.number().min(0).optional(),
    saleValue: z.number().min(0).optional(),
    margin: z.number().min(0).optional(),
    quantity: z.number().min(0).optional(),
    supplier: z.string().optional()
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Valida o token de autenticação
  const authenticatedUser = await verifyAuthHeader();

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Valida se o usuário é um administrador
  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
  }

  if (!id) {
    return NextResponse.json({ error: 'ID do produto é obrigatório.' }, { status: 400 });
  }

  const productId = Number(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: 'ID do produto inválido.' }, { status: 400 });
  }

  try {
    // Obter FormData em vez de JSON
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    // Extrair e converter outros campos do produto
    const formDataObject = Object.fromEntries(formData.entries());
    
    // Converter os valores para os tipos corretos
    const productData: any = {};
    
    // Campos numéricos - converter para número
    const numericFields = ['purchaseValue', 'saleValue', 'margin', 'quantity', 'sizeNumber'];
    numericFields.forEach(field => {
      if (formDataObject[field]) {
        productData[field] = parseFloat(formDataObject[field] as string);
      }
    });
    
    // Campos de texto - garantir que são strings
    const stringFields = ['type', 'name', 'model', 'description', 'size', 'color', 'material', 'supplier', 'code'];
    stringFields.forEach(field => {
      if (formDataObject[field]) {
        productData[field] = String(formDataObject[field]);
      }
    });

    // Remover a imagem dos dados do produto (já extraímos separadamente)
    delete productData.image;

    // Validar os dados do produto com o schema de atualização
    const parsed = updateSchema.safeParse(productData);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
    }

    let imageUrl: string | undefined;

    // Fazer upload para o Cloudinary se houver nova imagem
    if (imageFile && imageFile.size > 0) {
      try {
        // Converter File para buffer
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Fazer upload para o Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'products',
               transformation: [
                { width: 800, height: 800, crop: 'limit' }, // Redimensiona mantendo proporção
                { quality: 'auto', fetch_format: 'auto' }   // Otimização automática
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        imageUrl = (uploadResult as any).secure_url;
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return NextResponse.json(
          { error: 'Falha ao fazer upload da imagem' }, 
          { status: 500 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = { ...productData };
    
    // Se uma nova imagem foi enviada, atualizar a URL
    if (imageUrl !== undefined) {
      updateData.image = imageUrl;
    }

    // Verificar se o produto existe antes de atualizar
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    // Atualizar o produto
    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
        model: true,
        description: true,
        image: true,
        size: true,
        color: true,
        material: true,
        purchaseValue: true,
        saleValue: true,
        margin: true,
        quantity: true,
        supplier: true,
        code: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      message: 'Produto atualizado com sucesso.', 
      product: updatedProduct 
    }, { status: 200 });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID do produto é obrigatório.' }, { status: 400 })
  }

  const productId = Number(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: 'ID do produto inválido.' }, { status: 400 })
  }

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

    // Verifica se existem orders vinculadas ao produto
    const ordersWithProduct = await prisma.orderItem.findMany({
      where: { productId },
      include: {
        order: {
          include: {
            client: true,
            user: true
          }
        }
      }
    });

    if (ordersWithProduct.length > 0) {
      // Se existirem pedidos vinculados, apenas atualiza o status para 2 (inativo)
      await prisma.products.update({
        where: { id: productId },
        data: { status: 0 }
      });

      return NextResponse.json(
        { message: 'Produto marcado como inativo pois possui registros vinculados.' },
        { status: 200 }
      );
    } else {

      // Deleta o produto pelo ID
      await prisma.products.delete({ where: { id: productId } })

      return NextResponse.json({ message: 'Produto deletado com sucesso.' }, { status: 200 })
    }


  } catch (error: any) {
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar produto.' }, { status: 500 })
  }
}


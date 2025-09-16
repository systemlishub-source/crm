import z from "zod"
import { verifyAuthHeader } from "../lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "../lib/prisma"
import cloudinary from "@/lib/coudinary"


const productSchema = z.object({
  name: z.string(),
  type: z.string(),
  model: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  size: z.string(),
  sizeNumber: z.number().min(0),
  color: z.string(),
  material: z.string(),
  purchaseValue: z.number().min(0),
  saleValue: z.number().min(0),
  margin: z.number().min(0),
  quantity: z.number().min(0),
  supplier: z.string().optional(),
})

export async function POST(req: Request) {
  // Valida o token de autenticação
  const authenticatedUser = await verifyAuthHeader();

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Valida se o usuário é um administrador
  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
  }

  try {
    const formData = await req.formData();

    // Extrair a imagem do formData
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

    // Validar os dados do produto
    const parsed = productSchema.safeParse(productData);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
    }

    let imageUrl = '';

    // Fazer upload para o Cloudinary se houver imagem
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

          // Escrever o buffer no stream de upload
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

    // --- Gerar código ---
    // Usar productData.model ou productData.name (já convertidos para string)
    const baseCode = (productData.model || productData.name || '').substring(0, 3).toUpperCase();

    // Pegar último código com esse prefixo
    const lastProduct = await prisma.products.findFirst({
      where: { code: { startsWith: baseCode } },
      orderBy: { code: 'desc' },
    });

    let nextNumber = 1;
    if (lastProduct) {
      const lastCode = lastProduct.code;
      const numPart = parseInt(lastCode.slice(3)); // pega parte numérica
      if (!isNaN(numPart)) {
        nextNumber = numPart + 1;
      }
    }

    const code = `${baseCode}${String(nextNumber).padStart(4, '0')}`;

    // Criar o produto com todos os campos necessários
    const newProduct = await prisma.products.create({
      data: {
        ...productData, // Já contém todos os campos convertidos
        code,
        image: imageUrl || null,
        // Garantir que todos os campos obrigatórios estão presentes
        type: productData.type,
        name: productData.name,
        model: productData.model,
        description: productData.description || '',
        size: productData.size || '',
        sizeNumber: productData.sizeNumber || 0,
        color: productData.color || '',
        material: productData.material || '',
        purchaseValue: productData.purchaseValue || 0,
        saleValue: productData.saleValue || 0,
        margin: productData.margin || 0,
        quantity: productData.quantity || 0,
        supplier: productData.supplier || '',
        // createdAt e updatedAt serão gerados automaticamente
      },
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
   try {
        // Valida o token de autenticação
        const authenticatedUser = await verifyAuthHeader()

        if (!authenticatedUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Busca os produtos
        const products = await prisma.products.findMany({
            where: { status: 1 }, // Busca apenas produtos ativos
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(products, { status: 200 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
    }
}
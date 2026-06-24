import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Configurar Cloudinary se as chaves estiverem disponíveis
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 1. Caso o Cloudinary esteja configurado, faz upload remoto
    if (isCloudinaryConfigured) {
      console.log('Realizando upload de imagem para o Cloudinary...')
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'calorietrack-ai' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })

      return NextResponse.json({ url: uploadResult.secure_url })
    }

    // 2. Fallback Sandbox: Salva localmente na pasta public/uploads
    console.warn('Configurações do Cloudinary não encontradas. Salvando imagem localmente (Modo Sandbox).')
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Criar pasta public/uploads se não existir
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Gerar nome de arquivo único
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${ext}`
    const filePath = path.join(uploadsDir, fileName)

    // Escrever arquivo
    fs.writeFileSync(filePath, buffer)

    // Retornar a rota pública estática
    const localUrl = `/uploads/${fileName}`
    
    return NextResponse.json({ url: localUrl })
  } catch (error: any) {
    console.error('Erro no upload da imagem:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao realizar upload da imagem.' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

// Inicializar cliente OpenAI se a chave estiver configurada
const isOpenAiConfigured = !!process.env.OPENAI_API_KEY
const openai = isOpenAiConfigured ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

// Pratos simulados para o Modo Sandbox de IA
const MOCK_MEALS = [
  {
    items: [
      { nome: 'Arroz branco cozido', quantidade_gramas: 150, calorias: 195, proteinas: 3.8, carboidratos: 42.1, gorduras: 0.3 },
      { nome: 'Feijão carioca cozido', quantidade_gramas: 100, calorias: 76, proteinas: 4.8, carboidratos: 13.6, gorduras: 0.5 },
      { nome: 'Peito de frango grelhado', quantidade_gramas: 120, calorias: 198, proteinas: 37.2, carboidratos: 0.0, gorduras: 4.5 },
      { nome: 'Salada de alface, tomate e azeite', quantidade_gramas: 80, calorias: 45, proteinas: 0.9, carboidratos: 2.5, gorduras: 3.8 }
    ],
    calorias_totais: 514,
    proteinas_totais: 46.7,
    carboidratos_totais: 58.2,
    gorduras_totais: 9.1
  },
  {
    items: [
      { nome: 'Macarrão espaguete integral', quantidade_gramas: 180, calorias: 224, proteinas: 9.5, carboidratos: 47.8, gorduras: 1.1 },
      { nome: 'Molho de tomate caseiro', quantidade_gramas: 80, calorias: 40, proteinas: 1.2, carboidratos: 7.2, gorduras: 0.8 },
      { nome: 'Carne moída (patinho grelhado)', quantidade_gramas: 100, calorias: 219, proteinas: 28.0, carboidratos: 0.0, gorduras: 11.0 },
      { nome: 'Queijo parmesão ralado', quantidade_gramas: 10, calorias: 43, proteinas: 3.8, carboidratos: 0.1, gorduras: 2.9 }
    ],
    calorias_totais: 526,
    proteinas_totais: 42.5,
    carboidratos_totais: 55.1,
    gorduras_totais: 15.8
  },
  {
    items: [
      { nome: 'Ovo mexido (2 unidades)', quantidade_gramas: 100, calorias: 147, proteinas: 12.6, carboidratos: 0.8, gorduras: 9.9 },
      { nome: 'Pão de forma integral (2 fatias)', quantidade_gramas: 50, calorias: 122, proteinas: 4.7, carboidratos: 22.5, gorduras: 1.5 },
      { nome: 'Queijo cottage', quantidade_gramas: 40, calorias: 39, proteinas: 4.8, carboidratos: 1.2, gorduras: 1.6 },
      { nome: 'Mamão formosa fresco', quantidade_gramas: 120, calorias: 47, proteinas: 0.6, carboidratos: 11.6, gorduras: 0.1 }
    ],
    calorias_totais: 355,
    proteinas_totais: 22.7,
    carboidratos_totais: 36.1,
    gorduras_totais: 13.1
  },
  {
    items: [
      { nome: 'Filé de salmão grelhado', quantidade_gramas: 150, calorias: 309, proteinas: 33.1, carboidratos: 0.0, gorduras: 18.6 },
      { nome: 'Purê de batata doce', quantidade_gramas: 120, calorias: 112, proteinas: 1.8, carboidratos: 25.8, gorduras: 0.2 },
      { nome: 'Brócolis cozido no vapor', quantidade_gramas: 100, calorias: 35, proteinas: 2.8, carboidratos: 7.0, gorduras: 0.4 }
    ],
    calorias_totais: 456,
    proteinas_totais: 37.7,
    carboidratos_totais: 32.8,
    gorduras_totais: 19.2
  }
]

function getMockMealByDescription(description?: string) {
  if (!description) {
    const randomIndex = Math.floor(Math.random() * MOCK_MEALS.length)
    return MOCK_MEALS[randomIndex]
  }

  const descLower = description.toLowerCase()

  // 1. Salmão / Peixe / Batata Doce / Brócolis
  if (
    descLower.includes('salmão') ||
    descLower.includes('salmao') ||
    descLower.includes('peixe') ||
    descLower.includes('batata doce') ||
    descLower.includes('brocolis') ||
    descLower.includes('brócolis')
  ) {
    return MOCK_MEALS[3]
  }

  // 2. Ovo / Pão / Pao / Café / Cafe / Mamão / Mamão / Café da manhã
  if (
    descLower.includes('ovo') ||
    descLower.includes('pão') ||
    descLower.includes('pao') ||
    descLower.includes('mamão') ||
    descLower.includes('mamao') ||
    descLower.includes('café') ||
    descLower.includes('cafe') ||
    descLower.includes('manha') ||
    descLower.includes('manhã')
  ) {
    return MOCK_MEALS[2]
  }

  // 3. Macarrão / Macarrao / Massa / Espaguete / Pasta / Lasanha / Carne moída / Bolonhesa
  if (
    descLower.includes('macarrão') ||
    descLower.includes('macarrao') ||
    descLower.includes('massa') ||
    descLower.includes('espaguete') ||
    descLower.includes('pasta') ||
    descLower.includes('lasanha') ||
    descLower.includes('bolonhesa') ||
    descLower.includes('carne moída') ||
    descLower.includes('carne moida')
  ) {
    return MOCK_MEALS[1]
  }

  // 4. Frango / Arroz / Feijão / Feijao / Carne / Salada / Almoço / Janta
  if (
    descLower.includes('frango') ||
    descLower.includes('arroz') ||
    descLower.includes('feijão') ||
    descLower.includes('feijao') ||
    descLower.includes('salada') ||
    descLower.includes('carne') ||
    descLower.includes('almoço') ||
    descLower.includes('almoco') ||
    descLower.includes('janta') ||
    descLower.includes('jantar')
  ) {
    return MOCK_MEALS[0]
  }

  // Default: aleatório
  const randomIndex = Math.floor(Math.random() * MOCK_MEALS.length)
  return MOCK_MEALS[randomIndex]
}

export async function POST(req: Request) {
  try {
    const { url, description } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'A URL da imagem é obrigatória.' },
        { status: 400 }
      )
    }

    // 1. Modo Sandbox se OpenAI não estiver configurado
    if (!isOpenAiConfigured || !openai) {
      console.warn('Chave da OpenAI não configurada. Simulando análise por IA (Modo Sandbox)...')
      if (description) {
        console.info(`Descrição fornecida pelo usuário: "${description}"`)
      }
      
      // Simular delay de análise da IA (1.5 segundos)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Selecionar prato baseado na descrição (Mock Inteligente)
      const mockResult = getMockMealByDescription(description)

      return NextResponse.json(mockResult)
    }

    // 2. Modo Produção: Análise real via OpenAI Vision
    console.log('Realizando análise real da imagem com OpenAI Vision API...')
    
    let base64Image = ''

    // Se for uma imagem salva localmente, lemos o arquivo para obter o base64
    if (url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', url)
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath)
        const mimeType = url.endsWith('.png') ? 'image/png' : 'image/jpeg'
        base64Image = `data:${mimeType};base64,${fileBuffer.toString('base64')}`
      }
    }

    // O link de entrada para a OpenAI deve ser a URL remota ou o dataURI em base64
    const imageInput = base64Image || url

    const descriptionContext = description
      ? `\n\nInformação adicional fornecida pelo usuário que pode ajudar na identificação: "${description}". Use isso como contexto adicional, mas priorize o que você vê na imagem.`
      : ''

    const prompt = `Você é um nutricionista especialista em IA. Analise a imagem do prato de comida fornecida e identifique todos os itens alimentares presentes.${descriptionContext}
Para cada alimento identificado, você DEVE estimar:
1. O peso aproximado em gramas.
2. As calorias totais.
3. Proteínas em gramas.
4. Carboidratos em gramas.
5. Gorduras em gramas.

Você também deve calcular as calorias e macronutrientes totais de todo o prato somando os itens.
Sua resposta DEVE ser estritamente no formato JSON estruturado, sem blocos de código markdown como \`\`\`json ou qualquer texto adicional. Apenas o JSON limpo.

Estrutura do JSON esperada:
{
  "items": [
    {
      "nome": "Nome do Alimento",
      "quantidade_gramas": 150,
      "calorias": 200,
      "proteinas": 20.5,
      "carboidratos": 10.0,
      "gorduras": 5.2
    }
  ],
  "calorias_totais": 200,
  "proteinas_totais": 20.5,
  "carboidratos_totais": 10.0,
  "gorduras_totais": 5.2
}`

    let responseContent = ''
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageInput,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      })
      responseContent = response.choices[0]?.message?.content || ''
    } catch (apiError: any) {
      console.warn('Erro ao chamar OpenAI API, ativando fallback automático para o Modo Sandbox (Mock):', apiError.message || apiError)
      
      // Simular delay de análise da IA (1.5 segundos)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Selecionar prato baseado na descrição (Mock Inteligente)
      const mockResult = getMockMealByDescription(description)

      return NextResponse.json({
        ...mockResult,
        warning: 'Excedeu a cota da OpenAI ou ocorreu um erro. Usando dados fictícios do modo Sandbox baseado na descrição.'
      })
    }
    
    // Limpar marcações de código markdown se o GPT tiver gerado por engano
    const cleanJsonString = responseContent
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    try {
      const parsedResult = JSON.parse(cleanJsonString)
      return NextResponse.json(parsedResult)
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON retornado pela OpenAI:', responseContent)
      // Se quebrar, retornar um fallback estruturado a partir do texto
      return NextResponse.json(
        { error: 'A IA não retornou um formato JSON válido. Tente enviar outra foto.' },
        { status: 422 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao analisar imagem com OpenAI:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar análise da refeição.' },
      { status: 500 }
    )
  }
}

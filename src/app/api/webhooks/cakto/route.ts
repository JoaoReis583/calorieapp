import { NextResponse } from 'next/server'
import { dbService } from '@/lib/db-service'

// Mapeamento dos eventos da Cakto (conforme painel de configuração)
// Eventos que ATIVAM o plano premium:
const EVENTOS_APROVACAO = [
  'purchase_approved',     // Compra aprovada (único e assinaturas)
  'subscription_created',  // Assinatura criada
  'subscription_renewed',  // Assinatura renovada
]

// Eventos que DESATIVAM / rebaixam o plano:
const EVENTOS_CANCELAMENTO = [
  'subscription_canceled', // Assinatura cancelada
  'refunded',              // Reembolso
  'chargeback',            // Chargeback
]

// Rota POST /api/webhooks/cakto
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[Cakto Webhook] Evento recebido:', JSON.stringify(body, null, 2))

    const { secret, event, data } = body

    // 1. Validar a chave secreta do webhook (configurada no painel da Cakto)
    const configuredSecret = process.env.CAKTO_WEBHOOK_SECRET
    if (configuredSecret && secret !== configuredSecret) {
      console.warn('[Cakto Webhook] Chave secreta inválida. Requisição rejeitada.')
      return NextResponse.json({ error: 'Chave secreta inválida.' }, { status: 401 })
    }

    if (!event || !data) {
      return NextResponse.json({ error: 'Payload inválido: campos event e data são obrigatórios.' }, { status: 400 })
    }

    // 2. Eventos de APROVAÇÃO → Ativar / renovar plano Premium
    if (EVENTOS_APROVACAO.includes(event)) {
      const customerEmail = data?.customer?.email
      const customerName = data?.customer?.name || 'Cliente'
      const transactionId = data?.id || data?.refId || `cakto_${Date.now()}`

      // O nome do produto é usado para determinar o plano (Mensal ou Anual)
      const productName = (data?.product?.name || '').toLowerCase()
      const productType = data?.product?.type || ''

      if (!customerEmail) {
        console.warn('[Cakto Webhook] E-mail do cliente ausente no payload.')
        return NextResponse.json({ error: 'E-mail do cliente não fornecido no payload.' }, { status: 400 })
      }

      // Detectar tipo do plano pelo nome do produto
      let plano = 'MENSAL'
      let validadeDias = 30

      if (
        productName.includes('anual') ||
        productName.includes('annual') ||
        productName.includes('year') ||
        productName.includes('12 meses')
      ) {
        plano = 'ANUAL'
        validadeDias = 365
      }

      // Calcular data de expiração
      const validadeAte = new Date()
      validadeAte.setDate(validadeAte.getDate() + validadeDias)

      // Buscar usuário pelo e-mail do comprador
      const user = await dbService.findUserByEmail(customerEmail)

      if (user) {
        console.log(`[Cakto Webhook] Ativando plano ${plano} para ${customerEmail}. Validade: ${validadeAte.toLocaleDateString('pt-BR')}`)
        await dbService.updateUserPlan(user.id, plano, validadeAte, transactionId)
        return NextResponse.json({
          success: true,
          message: `Plano ${plano} ativado com sucesso para o usuário ${user.nome}.`
        })
      } else {
        // Usuário ainda não tem conta — criar pré-conta para quando ele se cadastrar
        console.warn(`[Cakto Webhook] Usuário com e-mail ${customerEmail} não encontrado. Criando pré-conta Premium...`)
        try {
          // Senha temporária hasheada (usuário precisará criar senha via recuperação)
          const bcrypt = require('bcryptjs')
          const tempPass = Math.random().toString(36).slice(-10)
          const tempHash = await bcrypt.hash(tempPass, 10)

          const newUser = await dbService.createUser(customerName, customerEmail, tempHash)
          await dbService.updateUserPlan(newUser.id, plano, validadeAte, transactionId)
          console.log(`[Cakto Webhook] Pré-conta Premium criada para ${customerEmail}`)
        } catch (err: any) {
          console.error('[Cakto Webhook] Erro ao criar pré-conta:', err.message)
        }

        return NextResponse.json({
          success: true,
          message: 'Compra aprovada. Pré-conta Premium ativada para o e-mail do comprador.'
        })
      }
    }

    // 3. Eventos de CANCELAMENTO → Rebaixar para FREE
    if (EVENTOS_CANCELAMENTO.includes(event)) {
      const customerEmail = data?.customer?.email

      if (customerEmail) {
        const user = await dbService.findUserByEmail(customerEmail)
        if (user) {
          console.log(`[Cakto Webhook] Rebaixando plano de ${customerEmail} para FREE (evento: ${event})`)
          await dbService.updateUserPlan(user.id, 'FREE', null, null)
          return NextResponse.json({
            success: true,
            message: `Plano do usuário ${user.nome} revertido para FREE.`
          })
        }
      }

      return NextResponse.json({ success: true, message: 'Cancelamento processado (usuário não encontrado localmente).' })
    }

    // 4. Outros eventos ignorados (boleto gerado, pix gerado, abandono de checkout, etc.)
    console.log(`[Cakto Webhook] Evento "${event}" recebido, mas não requer ação.`)
    return NextResponse.json({ success: true, message: `Evento "${event}" registrado sem ação necessária.` })

  } catch (error: any) {
    console.error('[Cakto Webhook] Erro interno ao processar evento:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor ao processar o webhook.' },
      { status: 500 }
    )
  }
}

# CalorieTrack AI 🍏✨

**CalorieTrack AI** é um SaaS completo para rastreamento inteligente de calorias e macronutrientes. Ele permite que os usuários registrem suas refeições tirando fotos dos pratos. A IA analisa a imagem, detecta os alimentos e estima porções em gramas, calorias e macros correspondentes de maneira 100% automatizada.

---

## 🚀 Tecnologias Utilizadas

* **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS v4, Motion (Framer Motion).
* **Banco de Dados:** PostgreSQL & Prisma ORM.
* **Autenticação:** NextAuth (Auth.js) com login por e-mail e senha.
* **Inteligência Artificial:** OpenAI Vision API (`gpt-4o-mini`).
* **Gráficos:** Recharts para análises de ingestão de macros e progresso.
* **Armazenamento:** Cloudinary (SDK remota) com fallback local.

---

## 🛠️ Requisitos

* **Node.js:** Versão `>= 20.9.0` (exigido pelo Next.js 15).
* **Banco de Dados:** PostgreSQL (uma imagem do PostgreSQL 15-alpine está configurada e pronta para rodar no `docker-compose.yml` da raiz do workspace).

---

## 📦 Instalação e Execução

### 1. Clonar ou navegar até a pasta
Navegue até a pasta do projeto:
```bash
cd calorietrack-ai
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente (`.env`)
Crie ou edite o arquivo `.env` na raiz da pasta `calorietrack-ai`. O arquivo já possui configurações padrão prontas para o Postgres local do Docker:
```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:senacpassword2026@localhost:5432/calorietrack_ai?schema=public"

# NextAuth Configuração
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="calorie-track-ai-super-secret-key-2026"

# OpenAI API (Caso queira utilizar o scan real de IA)
OPENAI_API_KEY="sua_chave_openai_aqui"

# Cloudinary (Caso queira fazer uploads reais para nuvem)
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="sua_api_secret"
```

### 4. Sincronizar o Banco de Dados (Prisma)
Se você tiver o contêiner do Docker ativo, sincronize o banco de dados e as tabelas executando:
```bash
npx prisma db push
```

> [!NOTE]
> **Resiliência Local (Modo Fallback):** Caso o Docker Desktop esteja desligado ou ocorra qualquer erro de conexão com o banco de dados, o CalorieTrack AI ativará de forma automática e transparente um banco de dados local em formato de arquivo JSON (`db.json` criado automaticamente na raiz do projeto). Isso garante que o app continue funcionando 100% para testes offline locais!

### 5. Executar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse o aplicativo em seu navegador pelo endereço: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Modo Sandbox / Simulação

O projeto foi projetado com um **Modo Sandbox Inteligente** para que seja possível demonstrar todo o seu fluxo de imediato sem gastar créditos de API:
1. **Upload offline:** Se as variáveis do Cloudinary no `.env` estiverem vazias, o sistema salva as fotos localmente na pasta `public/uploads/` do servidor e as serve estaticamente no frontend.
2. **Análise por IA Simulada:** Se a variável `OPENAI_API_KEY` estiver vazia, a rota de análise nutricional simulará uma varredura de visão computacional realista sobre a imagem, identificando pratos saudáveis e retornando a tabela nutricional editável após um pequeno delay simulado.

---

## 🏗️ Deploy em Produção

Para gerar a build otimizada de produção e iniciar o servidor:
```bash
npm run build
npm start
```
No Vercel, basta conectar o repositório e fornecer as variáveis de ambiente descritas acima. O build funcionará automaticamente integrando com seu banco PostgreSQL gerenciado.

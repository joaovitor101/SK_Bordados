# SK Bordados - Sistema de Gerenciamento de Pedidos

Sistema web desenvolvido com Next.js para gerenciamento de pedidos de bordados e estampas. Hospedado na Vercel.

## Funcionalidades

- ✅ Cadastro de clientes (nome, empresa, telefone, email, endereço)
- ✅ Cadastro de pedidos com especificações (descrição, cor, tecido, tamanho, observação)
- ✅ Lista de pedidos com informações completas
- ✅ Controle de status dos pedidos:
  - Cortado / Não cortado
  - Silkado / Não silkado
  - Bordado / Não bordado
  - Entregue / Não entregue
  - Data de entrega
- ✅ Busca de pedidos
- ✅ Banco de dados MongoDB Atlas (nuvem)
- ✅ Acessível de qualquer lugar via web

## Instalação Local

1. Instale as dependências:
```bash
npm install
```

2. Configure o MongoDB Atlas e variáveis de ambiente:
   - Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Crie um cluster gratuito
   - Crie um usuário de banco de dados
   - Adicione seu IP à whitelist (ou use 0.0.0.0/0 para permitir qualquer IP)
   - Copie a string de conexão
   - Crie um arquivo `.env.local` na raiz do projeto:
   ```
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sk_bordados?retryWrites=true&w=majority
   ADMIN_PASSWORD=sua_senha_segura_aqui
   SESSION_SECRET=chave-secreta-aleatoria-mude-isso
   ```
   - Substitua `usuario`, `senha` e `cluster` com suas credenciais reais
   - **IMPORTANTE**: Defina uma senha forte em `ADMIN_PASSWORD` (esta será a senha de acesso ao sistema)
   - Gere uma chave aleatória para `SESSION_SECRET` (pode usar: `openssl rand -base64 32`)

3. Execute em desenvolvimento:
```bash
npm run dev
```

4. Acesse em: http://localhost:3000

## Deploy na Vercel

### Opção 1: Via GitHub (Recomendado)

1. Crie um repositório no GitHub e faça push do código:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/sk-bordados.git
git push -u origin main
```

2. Acesse [Vercel](https://vercel.com) e faça login com GitHub

3. Clique em "New Project"

4. Importe seu repositório

5. Configure as variáveis de ambiente:
   - Em "Environment Variables", adicione:
   - Name: `MONGODB_URI`, Value: sua string de conexão do MongoDB Atlas
   - Name: `ADMIN_PASSWORD`, Value: senha de acesso ao sistema (escolha uma senha forte!)
   - Name: `SESSION_SECRET`, Value: chave secreta aleatória (gere com: `openssl rand -base64 32`)

6. Clique em "Deploy"

7. Pronto! Sua aplicação estará online

### Opção 2: Via CLI da Vercel

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Configure a variável de ambiente:
```bash
vercel env add MONGODB_URI
```

4. Faça o deploy:
```bash
vercel
```

## Estrutura do Projeto

- `app/` - Páginas e rotas do Next.js
  - `api/` - API Routes (substituem os IPC handlers do Electron)
  - `page.js` - Página principal
  - `layout.js` - Layout raiz
  - `globals.css` - Estilos globais
- `lib/` - Utilitários
  - `mongodb.js` - Conexão com MongoDB
- `models/` - Modelos Mongoose
  - `Cliente.js` - Modelo de Cliente
  - `Pedido.js` - Modelo de Pedido

## Tecnologias

- Next.js 14 (React)
- MongoDB Atlas (Mongoose)
- Vercel (Hospedagem)

## Configuração do MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Faça login ou crie uma conta
3. Crie um novo cluster (Free tier M0 é suficiente)
4. Em "Database Access", crie um usuário:
   - Username: escolha um nome
   - Password: gere uma senha segura (salve ela!)
   - Database User Privileges: "Read and write to any database"
5. Em "Network Access", adicione seu IP:
   - Clique em "Add IP Address"
   - Para produção, use "Allow Access from Anywhere" (0.0.0.0/0)
6. Em "Database", clique em "Connect"
7. Escolha "Connect your application"
8. Copie a connection string
9. Substitua `<password>` pela senha do usuário criado
10. Substitua `<dbname>` por `sk_bordados` (ou o nome que preferir)
11. Use essa string como `MONGODB_URI` na Vercel

## Uso

1. **Cadastrar Cliente**: Vá em "Clientes" e clique em "+ Adicionar Cliente"
2. **Criar Pedido**: Vá em "Novo Pedido", selecione o cliente e preencha os dados da peça
3. **Gerenciar Pedidos**: Na "Lista de Pedidos", você pode:
   - Ver todos os pedidos com seus status
   - Editar o status de cada pedido
   - Buscar pedidos
   - Excluir pedidos

## Troubleshooting

### Erro de conexão com MongoDB
- Verifique se a variável `MONGODB_URI` está configurada corretamente na Vercel
- Confirme que o IP está na whitelist do MongoDB Atlas (use 0.0.0.0/0 para produção)
- Verifique se o usuário e senha estão corretos

### Erros no build
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique os logs de build na Vercel para mais detalhes

# SK Bordados - Sistema de Gerenciamento de Pedidos

Sistema desktop desenvolvido com Electron para gerenciamento de pedidos de bordados e estampas.

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

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o MongoDB Atlas:
   - Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Crie um cluster gratuito
   - Crie um usuário de banco de dados
   - Adicione seu IP à whitelist (ou use 0.0.0.0/0 para permitir qualquer IP)
   - Copie a string de conexão
   - Crie um arquivo `.env` na raiz do projeto:
   ```
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sk_bordados?retryWrites=true&w=majority
   ```
   - Substitua `usuario`, `senha` e `cluster` com suas credenciais reais

3. Execute a aplicação:
```bash
npm start
```

Para desenvolvimento com DevTools:
```bash
npm run dev
```

## Estrutura do Projeto

- `main.js` - Processo principal do Electron e lógica do banco de dados
- `preload.js` - Bridge de segurança entre renderer e main process
- `models.js` - Modelos Mongoose (Cliente e Pedido)
- `index.html` - Interface principal
- `styles.css` - Estilos da aplicação
- `renderer.js` - Lógica da interface e comunicação com o backend
- `.env` - Configuração da conexão MongoDB (não versionado)

## Tecnologias

- Electron 28
- MongoDB Atlas (Mongoose)
- HTML/CSS/JavaScript
- dotenv (variáveis de ambiente)

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
   - Para desenvolvimento, use "Allow Access from Anywhere" (0.0.0.0/0)
6. Em "Database", clique em "Connect"
7. Escolha "Connect your application"
8. Copie a connection string
9. Substitua `<password>` pela senha do usuário criado
10. Substitua `<dbname>` por `sk_bordados` (ou o nome que preferir)
11. Cole no arquivo `.env` como `MONGODB_URI`

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
- Verifique se a string de conexão no `.env` está correta
- Confirme que o IP está na whitelist do MongoDB Atlas
- Verifique se o usuário e senha estão corretos
- Certifique-se de que o cluster está rodando

### Erros no npm install
- Certifique-se de ter Node.js instalado (versão 16 ou superior)
- Tente limpar o cache: `npm cache clean --force`
- Delete `node_modules` e `package-lock.json` e execute `npm install` novamente

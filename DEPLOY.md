# 🚀 Guia de Deploy no Vercel

## Pré-requisitos

1. ✅ Conta no [Vercel](https://vercel.com) (pode usar GitHub para login)
2. ✅ Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. ✅ Código do projeto pronto

## Passo a Passo

### 1. Preparar o MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito (M0)
3. Em **Database Access**, crie um usuário:
   - Username: escolha um nome
   - Password: gere uma senha forte (salve ela!)
   - Permissões: "Read and write to any database"
4. Em **Network Access**, adicione IP:
   - Clique em "Add IP Address"
   - Selecione "Allow Access from Anywhere" (0.0.0.0/0)
   - Clique em "Confirm"
5. Em **Database**, clique em "Connect"
6. Escolha "Connect your application"
7. Copie a connection string (algo como):
   ```
   mongodb+srv://usuario:senha@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
8. Substitua `<password>` pela senha do usuário criado
9. Adicione o nome do banco: `sk_bordados` (ou o que preferir)
   ```
   mongodb+srv://usuario:senha@cluster.mongodb.net/sk_bordados?retryWrites=true&w=majority
   ```

### 2. Preparar o Código

1. Certifique-se de que o `.env` está no `.gitignore` (já está)
2. Faça commit de todas as alterações:
   ```bash
   git add .
   git commit -m "Preparar para deploy"
   ```

### 3. Deploy na Vercel

#### Opção A: Via Interface Web (Mais Fácil) ⭐

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar GitHub)

2. Clique em **"Add New..."** → **"Project"**

3. Se você tem o código no GitHub:
   - Conecte seu repositório GitHub
   - Selecione o repositório `sk_bordados`
   - Clique em **"Import"**

4. Se você NÃO tem no GitHub ainda:
   - Clique em **"Upload"** (ou use a CLI - veja Opção B)

5. Configure o projeto:
   - **Framework Preset**: Next.js (deve detectar automaticamente)
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build` (já vem preenchido)
   - **Output Directory**: `.next` (já vem preenchido)

6. **IMPORTANTE**: Configure as variáveis de ambiente:
   - Clique em **"Environment Variables"**
   - Adicione as seguintes variáveis:

   | Nome | Valor | Descrição |
   |------|-------|-----------|
   | `MONGODB_URI` | `mongodb+srv://usuario:senha@cluster.mongodb.net/sk_bordados?retryWrites=true&w=majority` | String de conexão do MongoDB (substitua usuario, senha e cluster) |
   | `ADMIN_PASSWORD` | `sua_senha_segura_aqui` | Senha para acessar o sistema (escolha uma senha forte!) |
   | `SESSION_SECRET` | `chave-aleatoria-secreta` | Chave secreta para sessões (gere uma aleatória) |

   **Dica**: Para gerar `SESSION_SECRET`, use:
   ```bash
   openssl rand -base64 32
   ```
   Ou use um gerador online: https://randomkeygen.com/

7. Clique em **"Deploy"**

8. Aguarde o build (pode levar 2-5 minutos)

9. ✅ Pronto! Sua aplicação estará online em uma URL como:
   `https://sk-bordados.vercel.app`

#### Opção B: Via CLI da Vercel

1. Instale a CLI:
   ```bash
   npm i -g vercel
   ```

2. No diretório do projeto, faça login:
   ```bash
   vercel login
   ```

3. Configure as variáveis de ambiente:
   ```bash
   vercel env add MONGODB_URI
   # Cole a string de conexão quando solicitado
   
   vercel env add ADMIN_PASSWORD
   # Digite a senha de acesso ao sistema
   
   vercel env add SESSION_SECRET
   # Cole a chave secreta gerada
   ```

4. Faça o deploy:
   ```bash
   vercel
   ```

5. Para produção:
   ```bash
   vercel --prod
   ```

### 4. Verificar o Deploy

1. Após o deploy, acesse a URL fornecida pela Vercel
2. Você verá a tela de login
3. Use a senha que você definiu em `ADMIN_PASSWORD`
4. Se tudo funcionar, está tudo certo! 🎉

### 5. Atualizações Futuras

Sempre que você fizer alterações no código:

1. Faça commit:
   ```bash
   git add .
   git commit -m "Descrição da alteração"
   git push
   ```

2. Se conectou via GitHub, a Vercel faz deploy automático!

3. Se usou CLI, rode:
   ```bash
   vercel --prod
   ```

## 🔧 Troubleshooting

### Erro: "MongoServerError: Authentication failed"
- Verifique se a senha no `MONGODB_URI` está correta
- Certifique-se de que substituiu `<password>` pela senha real

### Erro: "MongoNetworkError: connection timeout"
- Verifique se o IP está na whitelist do MongoDB Atlas
- Use `0.0.0.0/0` para permitir qualquer IP

### Erro no build
- Verifique os logs na Vercel (aba "Deployments" → clique no erro)
- Certifique-se de que todas as dependências estão no `package.json`

### Variáveis de ambiente não funcionam
- Verifique se adicionou as variáveis na Vercel
- Certifique-se de que fez um novo deploy após adicionar as variáveis
- Variáveis só funcionam após um novo deploy

## 📝 Checklist Final

- [ ] MongoDB Atlas configurado
- [ ] Cluster criado e usuário configurado
- [ ] IP adicionado na whitelist (0.0.0.0/0)
- [ ] Connection string copiada e testada
- [ ] Código commitado no Git
- [ ] Projeto criado na Vercel
- [ ] Variáveis de ambiente configuradas:
  - [ ] MONGODB_URI
  - [ ] ADMIN_PASSWORD
  - [ ] SESSION_SECRET
- [ ] Deploy realizado com sucesso
- [ ] Aplicação acessível e funcionando

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. **Customizar domínio** (opcional):
   - Na Vercel, vá em Settings → Domains
   - Adicione seu domínio personalizado

2. **Monitorar uso**:
   - Acompanhe logs e métricas na dashboard da Vercel
   - Monitore o uso do MongoDB Atlas

3. **Backup**:
   - Configure backups regulares no MongoDB Atlas
   - Considere exportar dados periodicamente

---

**Dúvidas?** Consulte a [documentação da Vercel](https://vercel.com/docs) ou a [documentação do MongoDB Atlas](https://docs.atlas.mongodb.com/).

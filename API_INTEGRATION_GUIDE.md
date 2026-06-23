# Guia de Integração da API - Portfolio Sabrina

Este documento descreve a implementação completa da integração com a API REST do backend.

## 📋 Resumo da Implementação

Foi implementado um sistema completo de autenticação JWT, consumo de API e CRUD de posts no frontend Angular.

## 🔑 Autenticação

### Serviço de Autenticação (`auth.service.ts`)

Gerencia todo o fluxo de autenticação:

```typescript
// Login
authService.login({ email: 'admin@email.com', password: 'senha123' })

// Logout
authService.logout()

// Verificar se está autenticado
authService.isAuthenticated()

// Obter token
authService.getToken()
```

**O que ele faz:**
- Realiza POST em `/auth/login`
- Armazena o token JWT no localStorage
- Mantém o estado de autenticação em um signal
- Redireciona para login em caso de token expirado (401)

### Interceptor JWT (`jwt.interceptor.ts`)

Injeta automaticamente o token em todas as requisições:

```typescript
// Qualquer requisição protegida já terá o token
// Header: Authorization: Bearer <token>
```

**Comportamentos:**
- ✅ Adiciona token a todas as requisições autenticadas
- ✅ Captura erros 401 e faz logout automático
- ✅ Trata rate limit (429) com mensagem de erro

## 🛡️ Guard de Autenticação

A rota `/admin` está protegida:

```typescript
{ 
  path: "admin", 
  component: AdminComponent, 
  canActivate: [authGuard]
}
```

Se não autenticado, redireciona para `/login`.

## 📝 Serviço de Posts (`post.service.ts`)

### Rotas Públicas

```typescript
// Listar todos os posts
postService.getPosts()

// Listar resumido (para grids)
postService.getPostsSummary()

// Obter post por ID
postService.getPostById(id)
```

### Rotas Protegidas (requer token JWT)

```typescript
// Criar post
postService.createPost({
  title: 'Meu Post',
  content: 'Conteúdo...',
  images: ['https://...'],
  videos: ['https://...'],
  tags: ['tag1', 'tag2']
})

// Atualizar post
postService.updatePost(id, { /* mesmos campos */ })

// Deletar post
postService.deletePost(id)
```

## 🔐 Validação de URLs

A API valida URLs em imagens e vídeos:

```typescript
// ✅ Válidas
['https://exemplo.com/img.jpg', 'http://exemplo.com/video.mp4']

// ❌ Inválidas (rejeitadas pela API)
['javascript:alert("xss")', 'data:image/png;base64,...']
```

**O frontend filtra URLs inválidas antes de enviar.**

## 🖥️ Componentes Criados

### LoginComponent (`/login`)

Formulário de autenticação:
- Email e password obrigatórios
- Validação de forma
- Mensagens de erro
- Redirecionamento automático após sucesso

### AdminComponent (`/admin`)

Painel de administração (protegido por authGuard):

#### Funcionalidades:
1. **Criar Post**
   - Form com campos: title, content, images, videos, tags
   - Validação de máximo de caracteres
   - Parsing de URLs (separadas por quebra de linha ou vírgula)

2. **Listar Posts**
   - Exibe todos os posts criados
   - Mostra preview do conteúdo
   - Data de criação e tags

3. **Editar Post**
   - Clica em "Editar" no post
   - Form é preenchido com dados do post
   - PUT request ao atualizar

4. **Deletar Post**
   - Botão com confirmação
   - DELETE request
   - Atualiza lista automaticamente

#### Estados:
- `loading`: Indica operações em andamento
- `error`: Exibe mensagens de erro
- `success`: Exibe confirmações de sucesso
- `editingId`: ID do post sendo editado
- `showForm`: Controla visibilidade do formulário

## 🌍 URLs e Endpoints

```
Base URL: https://portfolio-sabrina-backend.vercel.app

Public Routes:
- GET /posts
- GET /posts/summary
- GET /posts/:id

Protected Routes (requer Authorization: Bearer <token>):
- POST /posts (criar)
- PUT /posts/:id (atualizar)
- DELETE /posts/:id (deletar)

Auth:
- POST /auth/login
```

## 📦 Estrutura de Pastas

```
src/app/
├── models/
│   ├── post.model.ts         # Interfaces Post, PostSummary
│   └── auth.model.ts         # Interfaces de autenticação
├── services/
│   ├── auth.service.ts       # Serviço de autenticação
│   └── post.service.ts       # Serviço de posts (CRUD)
├── interceptors/
│   ├── jwt.interceptor.ts    # Injeta token JWT
│   └── analytics-timing.interceptor.ts
├── guards/
│   └── auth.guard.ts         # Protege rotas privadas
├── pages/
│   ├── login/                # Componente de login
│   └── admin/                # Painel admin (protegido)
└── app.routes.ts             # Rotas da aplicação
```

## 🚀 Como Usar

### 1. Login

```
1. Acesse /login
2. Digite username e senha do admin
3. Clique em "Entrar"
4. Será redirecionado para /admin
```

### 2. Criar Post

```
1. Em /admin, clique em "+ Novo Post"
2. Preencha os campos:
   - Título (até 200 caracteres)
   - Conteúdo (até 20000 caracteres)
   - Imagens (URLs, uma por linha)
   - Vídeos (URLs, uma por linha)
   - Tags (separadas por vírgula)
3. Clique em "Salvar Post"
```

### 3. Editar Post

```
1. Encontre o post na lista
2. Clique em "Editar"
3. Modifique os campos
4. Clique em "Salvar Post"
```

### 4. Deletar Post

```
1. Encontre o post na lista
2. Clique em "Deletar"
3. Confirme na dialog
4. Post é removido
```

## ⚠️ Tratamento de Erros

| Status | Comportamento |
|--------|--------------|
| 400 | Exibe mensagem de erro específica |
| 401 | Faz logout automático, redireciona para /login |
| 403 | CORS bloqueado (origem não permitida) |
| 404 | "Post não encontrado" |
| 429 | "Muitas tentativas, tente novamente em minutos" |
| 500 | Erro interno do servidor |

## 🔐 Segurança

### ✅ Implementado

- [x] JWT em Authorization header
- [x] Token armazenado no localStorage
- [x] Logout automático em 401
- [x] Validação de URLs (http/https)
- [x] Guard de rota para admin
- [x] Interceptor para todas as requisições

### ⚠️ Considerações

- **Token expiração**: 7 dias (sem refresh, fazer logout)
- **Armazenamento**: localStorage (considere usar sessionStorage para maior segurança)
- **HTTPS**: Sempre use HTTPS em produção
- **Rate limit**: 100 requisições por IP a cada 15 minutos

## 🧪 Testando

### Login de Teste

```
Username: seu_usuario
Senha: sua-senha
```

### Request Manual (curl)

```bash
# Login
curl -X POST https://portfolio-sabrina-backend.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_user","password":"senha123"}'

# Criar post (com token)
curl -X POST https://portfolio-sabrina-backend.vercel.app/posts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Meu Post",
    "content":"Conteúdo do post",
    "tags":["tag1"]
  }'
```

## 📄 Documentação Relacionada

- [`GITHUB_SECRETS.md`](./GITHUB_SECRETS.md) - Como configurar credenciais no GitHub Actions
- [`.env.example`](./.env.example) - Variáveis de ambiente necessárias
- [`package.json`](./package.json) - Dependências do projeto

## 🔄 Próximos Passos (Opcional)

- [ ] Implementar refresh token
- [ ] Adicionar edição inline de posts
- [ ] Implementar paginação para grande quantidade de posts
- [ ] Adicionar upload de imagens (ao invés de URLs)
- [ ] Implementar busca/filtro de posts
- [ ] Adicionar confirmação por email de login
- [ ] Implementar 2FA (autenticação de dois fatores)

## 📞 Suporte

Para problemas com a integração:

1. Verifique se a API está online: https://portfolio-sabrina-backend.vercel.app/posts
2. Verifique se o CORS está configurado corretamente
3. Verifique o console do navegador para erros
4. Verifique o Network tab para requisições falhadas
5. Verifique os logs da API no backend

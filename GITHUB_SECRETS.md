# Configuração de Secrets no GitHub

Este documento explica como configurar as credenciais de login no GitHub para uso em CI/CD.

## Por que usar GitHub Secrets?

As credenciais de autenticação (email e senha do admin) nunca devem ser commitadas no repositório. O GitHub Secrets permite armazenar essas informações de forma segura e acessá-las apenas em workflows de CI/CD.

## Como adicionar Secrets no GitHub

### Método 1: Via Interface Web

1. Acesse o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu esquerdo, clique em **Secrets and variables** > **Actions**
4. Clique em **New repository secret**
5. Adicione cada secret conforme descrito abaixo

### Método 2: Via GitHub CLI

```bash
# Login no GitHub CLI
gh auth login

# Adicionar secrets
gh secret set ADMIN_USERNAME --body "seu_usuario"
gh secret set ADMIN_PASSWORD --body "sua-senha-segura"
```

## Secrets necessários

### `ADMIN_USERNAME`
- **Valor**: Username do usuário admin registrado na API
- **Exemplo**: `admin_user`

### `ADMIN_PASSWORD`
- **Valor**: Senha do usuário admin registrado na API
- **Exemplo**: `MinhaSenh@Segura123`

## Como usar em GitHub Actions

No arquivo do workflow (`.github/workflows/seu-workflow.yml`), acesse os secrets assim:

```yaml
- name: Login e Teste
  env:
    ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
  run: |
    echo "Email: $ADMIN_EMAIL"
    # Use as variáveis em seus testes ou scripts
```

## Boas práticas de segurança

✅ **Sempre:**
- Use GitHub Secrets para credenciais
- Regenere as senhas periodicamente
- Use senhas fortes (mínimo 12 caracteres, caracteres especiais)
- Nunca commitee `.env` ou arquivos com credenciais

❌ **Nunca:**
- Coloque credenciais no `.env` commitado
- Coloque credenciais em comentários de código
- Coloque credenciais em variáveis de ambiente locais que serão versionadas
- Compartilhe credenciais por mensagens ou emails

## Testando localmente

Para testes locais, crie um arquivo `.env.local` (não versionado):

```bash
# .env.local (adicionar ao .gitignore)
VITE_ADMIN_EMAIL=seu-email@example.com
VITE_ADMIN_PASSWORD=sua-senha-segura
```

Certifique-se de que `.env.local` está no `.gitignore`:

```bash
# .gitignore
.env.local
.env
.env.*.local
```

## Rotação de credenciais

Recomenda-se alterar as credenciais periodicamente:

1. Atualize a senha no backend/API
2. Atualize o secret no GitHub: Settings > Secrets > clique no secret e atualize
3. Qualquer workflow que use o secret terá acesso automaticamente à nova credencial

## Resolução de problemas

### "Secrets not found"
- Verifique se os nomes estão exatamente iguais
- Aguarde ~1 minuto após criar o secret
- Tente executar o workflow novamente

### Variáveis não aparecem em logs
- Isso é normal! GitHub oculta automaticamente valores de secrets nos logs por segurança

### Preciso adicionar um novo secret?
- Repita os passos de criação acima
- Não esqueça de usar o novo secret nos workflows

## Referências

- [GitHub: Creating and storing encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub CLI: Secret command](https://cli.github.com/manual/gh_secret_set)

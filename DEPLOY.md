# Como publicar o Espaço Lígia Ramos num servidor público

Este guia segue o caminho mais simples: manter o banco SQLite e os arquivos
(fotos/documentos) exatamente como estão hoje, só que num disco persistente
na nuvem, sem precisar reescrever nada do sistema de armazenamento.

Vou usar o **Railway** como exemplo (o **Render** funciona quase
identicamente, os mesmos passos servem). Ambos:

- Detectam automaticamente que é um projeto Next.js.
- Rodam um servidor Node sempre ligado (diferente da Vercel, que não tem
  disco persistente).
- Custam a partir de ~US$5/mês no plano com disco persistente — não existe
  opção 100% gratuita com armazenamento permanente de arquivos/banco, porque
  os planos gratuitos dessas plataformas não incluem disco persistente.

## Pré-requisitos

- Uma conta no [GitHub](https://github.com) (gratuita).
- Uma conta no [Railway](https://railway.app) (ou Render).

## Passo 0 — Subir o código para o GitHub

O código hoje só existe na sua máquina. Railway/Render publicam a partir de
um repositório do GitHub, então:

1. Crie um repositório novo e vazio no GitHub (ex: `espaco-ligia-ramos`),
   sem README/gitignore (o projeto já tem os seus).
2. No projeto, rode (posso fazer isso por você se pedir):
   ```bash
   git init
   git add .
   git commit -m "Versão inicial da plataforma"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/espaco-ligia-ramos.git
   git push -u origin main
   ```

## Passo 1 — Criar o projeto no Railway

1. Entre em [railway.app](https://railway.app) e crie uma conta (dá pra
   entrar direto com GitHub).
2. **New Project → Deploy from GitHub repo** → escolha o repositório que
   você acabou de subir.
3. O Railway detecta que é Next.js e já prepara o build automaticamente.

## Passo 2 — Adicionar um disco persistente (Volume)

Sem isso, os pacientes cadastrados e os arquivos enviados **somem a cada
novo deploy** — o container em si não guarda nada entre reinicializações.

1. No projeto criado, vá em **Settings → Volumes → New Volume**.
2. Monte em `/data` (mount path).
3. Isso cria uma pasta `/data` que persiste entre deploys.

## Passo 3 — Variáveis de ambiente

Em **Variables**, adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `file:/data/prod.db` |
| `STORAGE_ROOT` | `/data/uploads` |
| `NEXTAUTH_SECRET` | um valor aleatório forte — gere com `openssl rand -base64 32` no seu terminal, ou peça pra mim gerar um |
| `NEXTAUTH_URL` | a URL pública que o Railway te der (ex: `https://espaco-ligia-ramos-production.up.railway.app`) — você só sabe essa URL depois do primeiro deploy, então dá pra deixar em branco e voltar aqui pra preencher depois |

## Passo 4 — Deploy

O Railway builda e sobe sozinho. O comando de start (`npm run start`) já
aplica as migrações do banco automaticamente antes de iniciar o servidor —
não precisa rodar nada manual para isso.

## Passo 5 — Criar o usuário administrador

O banco começa **zerado** de propósito (sem pacientes fictícios). Você
precisa criar o primeiro usuário ADMIN uma única vez. No Railway, abra o
**Shell** do serviço (ou use a CLI: `railway run npm run db:seed`) e rode:

```bash
npm run db:seed
```

Isso cria:
- E-mail: `admin@gmail.com`
- Senha: `Ligia@2026`

**Troque essa senha assim que entrar pela primeira vez** (crie um novo
usuário ADMIN com seu e-mail real em Configurações → Usuários, e depois
pode desativar/remover essa conta padrão).

## Passo 6 — Testar

Acesse a URL pública que o Railway gerou. Se o login funcionar e o
dashboard aparecer zerado, está tudo certo.

## Passo 7 (opcional) — Domínio próprio

Em **Settings → Networking → Custom Domain**, aponte um domínio seu (ex:
`app.espacoligiaramos.com.br`) via um registro CNAME no seu provedor de DNS.
O Railway cuida do certificado HTTPS automaticamente.

## Backups

Como tudo vive num único disco (`/data`), vale configurar um backup
periódico desse volume (Railway tem snapshots de volume nos planos pagos) —
sem isso, perder o volume por qualquer motivo apaga banco e arquivos juntos.
Isso é uma limitação do caminho "simples"; o caminho com Postgres gerenciado
(ver `SECURITY.md`) já vem com backup automático por padrão.

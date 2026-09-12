# Segurança — Espaço Lígia Ramos

Este documento registra as decisões de segurança do projeto seguindo **security by design**:
segurança tratada como requisito desde a concepção da arquitetura, não como camada
adicionada depois. Cada seção explica a regra, por que ela existe e onde está implementada.

## 1. Autenticação

- **NextAuth (Credentials Provider) + JWT de sessão** — `src/auth.ts`.
- Senhas nunca são armazenadas em texto puro: hash com `bcryptjs` (custo 10) antes de
  qualquer gravação (`src/app/api/usuarios/route.ts`).
- Toda tentativa de login é registrada em `AuditLog` (`src/lib/audit.ts`), com sucesso
  atualizando `lastLoginAt` — permite detectar contas nunca acessadas ou paradas de acesso.
- A sessão usa estratégia JWT (sem estado no servidor), reduzindo a superfície de ataque de
  sequestro de sessão via banco de dados comprometido.

## 2. Autorização (RBAC)

Quatro papéis: `ADMIN`, `PROFISSIONAL`, `RECEPCAO`, `FINANCEIRO` (`prisma/schema.prisma`).

A matriz de permissões vive em um único lugar — `src/lib/permissions.ts` — e é aplicada em
duas camadas independentes (defesa em profundidade):

1. **Borda (proxy/middleware)** — `src/proxy.ts` intercepta toda rota (inclusive `/api/*`) e
   redireciona para `/acesso-negado` qualquer usuário sem permissão para o caminho, antes de
   qualquer código de página rodar.
2. **API** — cada rota de API (`src/app/api/**/route.ts`) revalida a sessão e o papel do
   usuário no servidor. Isso é obrigatório porque o proxy pode ser contornado em teoria por
   chamadas diretas à API; nunca confie apenas no front-end ou apenas no middleware.

Regra de negócio: só `ADMIN` acessa Pacientes, Prontuários, Equipe, Estoque, Configurações,
Comunicação, Relatórios e Pagamentos (dados sensíveis — clínicos, financeiros e de gestão de
acesso). Os demais papéis têm acesso **somente leitura** a Agenda, Tratamentos, Financeiro
(dívidas) e Eventos — o suficiente para o dia a dia sem exposição de dados sensíveis.

## 3. Validação de entrada

Toda validação vive em `src/lib/validation.ts` e é reaplicada tanto no cliente (React Hook
Form + Zod) quanto no servidor (rota de API) — **nunca confie em validação só no cliente**,
pois ela pode ser contornada por uma chamada HTTP direta.

- **E-mail**: só domínios `@gmail.com` e `@hotmail.com` são aceitos, em qualquer cadastro
  (pacientes, profissionais, usuários). Reduz e-mails descartáveis/falsos e phishing com
  domínios forjados.
- **Telefone**: formato obrigatório `(DD) 9.XXXX-XXXX`, com máscara aplicada durante a
  digitação (`formatPhoneMask`). Padroniza o dado para uso futuro em envio de WhatsApp/SMS.
- **Senha**: mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo; proíbe
  sequências numéricas (`123`, `987`) e caracteres repetidos (`111`, `aaa`). Reduz senhas
  triviais que resistem mal a ataques de força bruta e dicionário.
- **CPF**: formato `000.000.000-00` e unicidade garantida no banco (`@unique` no schema).

## 4. Dados sensíveis e LGPD

- Dados clínicos (prontuário, evolução, tratamento) e financeiros ficam atrás do RBAC
  descrito acima — nenhum papel além de ADMIN os vê "de graça".
- `AuditLog` registra criação/edição de pacientes, profissionais, tratamentos, pagamentos,
  eventos, itens de estoque e usuários — quem fez o quê e quando, essencial para
  responder a uma auditoria de LGPD ou investigar um incidente.
- Nenhuma rota de API expõe `passwordHash` — o `select` explícito em `/api/usuarios`
  restringe os campos retornados.
- O sistema começa **zerado**: nenhum paciente ou dado de negócio de exemplo é semeado
  (`prisma/seed.ts` cria só a conta ADMIN inicial). Isso evita que dados fictícios sejam
  confundidos com dados reais de pacientes em produção.

## 5. O que falta para produção (próximos passos recomendados)

- Trocar `NEXTAUTH_SECRET` do `.env` por um segredo gerado (`openssl rand -base64 32`) e
  nunca commitá-lo — hoje ele é só um placeholder de desenvolvimento.
- Habilitar autenticação de dois fatores (2FA) para contas `ADMIN`.
- Expirar sessões por inatividade (hoje o JWT tem a validade padrão do NextAuth).
- Rate limiting no endpoint de login (`/api/auth/callback/credentials`) para mitigar força
  bruta — hoje não há limite de tentativas.
- Criptografia em repouso de campos especialmente sensíveis (ex: CPF) se o banco de produção
  não oferecer criptografia de disco nativa.
- Trocar SQLite por Postgres gerenciado antes de ir a produção (ver seção de infraestrutura).

---

# Infraestrutura e alta disponibilidade (recomendações)

O ambiente atual (SQLite local + `next dev`) é adequado para desenvolvimento, não para
produção. Para produção, recomenda-se:

## Banco de dados

- **Postgres gerenciado** (Neon, Supabase, RDS ou Cloud SQL) no lugar do SQLite —
  `prisma/schema.prisma` já isola o provider em `datasource db`, então a troca é apenas de
  `provider` e `DATABASE_URL`.
- **Réplica de leitura** para separar tráfego de relatórios/dashboard do tráfego
  transacional (agenda, pagamentos), evitando que um relatório pesado derrube o
  atendimento.
- **Backups automáticos diários com retenção** (mínimo 7–30 dias) e teste periódico de
  restauração — um backup nunca testado não é um backup confiável.

## Aplicação

- **Múltiplas instâncias atrás de um load balancer** (ex: 2+ regiões ou zonas de
  disponibilidade) — a sessão é JWT (stateless), então qualquer instância pode atender
  qualquer requisição sem *sticky sessions*.
- **Health checks** (`/api/health`, a implementar) para o load balancer remover
  automaticamente instâncias degradadas.
- **Autoscaling horizontal** baseado em CPU/latência para picos previsíveis (ex: horário de
  abertura da agenda) e imprevisíveis.
- **CDN** para assets estáticos (`_next/static`), reduzindo carga na origem.

## Observabilidade

- Logs estruturados centralizados (ex: CloudWatch, Grafana Loki) — hoje só existe
  `AuditLog` de negócio; falta log técnico de erros/latência.
- Alertas de erro 5xx, latência acima do esperado e filas de banco de dados.
- Rastreamento de uptime sintético (ping externo a cada minuto) para detectar quedas antes
  do usuário reportar.

## Segredos e configuração

- Gerenciador de segredos (Vault, AWS Secrets Manager, Doppler) no lugar de `.env` em
  produção — `NEXTAUTH_SECRET` e `DATABASE_URL` nunca devem viver em texto plano no
  servidor de produção.
- Rotação periódica de segredos, especialmente após qualquer suspeita de vazamento.

## Continuidade

- **RTO/RPO definidos** (ex: RTO 1h, RPO 15min) e testados — hoje não há plano formal de
  disaster recovery.
- Ambiente de staging idêntico à produção para validar migrações de banco antes do deploy
  real (`prisma migrate deploy` nunca deve rodar direto em produção sem passar por staging).

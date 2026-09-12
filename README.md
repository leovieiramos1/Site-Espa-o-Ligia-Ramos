# Espaço Lígia Ramos — Plataforma de Gestão Clínica

Plataforma de gestão para clínica de fisioterapia e Medicina Integrativa: agenda,
pacientes, prontuário eletrônico, equipe multidisciplinar, tratamentos, financeiro,
pagamentos, eventos e estoque.

Stack: Next.js (App Router) + TypeScript + Tailwind v4 + Prisma/SQLite + NextAuth.

## Como rodar localmente

Pré-requisitos: Node.js 20+.

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Acesse [http://localhost:3010](http://localhost:3010) (a porta 3010 é usada pelo
`dev.bat`/`launch.json` deste projeto para não colidir com outros projetos locais; para
rodar na porta padrão 3000, use `npm run dev` diretamente).

### Usuário administrador (criado pelo seed)

- E-mail: `admin@gmail.com`
- Senha: `Ligia@2026`

Troque essa senha após o primeiro acesso e crie os demais usuários da equipe em
**Configurações → Usuários** (requer papel Administrador).

O sistema começa **zerado**: nenhum paciente, agendamento ou dado de negócio de exemplo é
criado — apenas a conta administradora, para permitir o início do cadastro real.

## Perfis de acesso

- **Administrador**: acesso total.
- **Profissional / Recepção / Financeiro**: acesso restrito e somente leitura a Agenda,
  Tratamentos, Financeiro (dívidas) e Eventos. Pacientes, Prontuários, Equipe, Estoque,
  Pagamentos, Comunicação, Relatórios e Configurações são exclusivos do Administrador.

Veja [`SECURITY.md`](./SECURITY.md) para o racional completo das regras de segurança
(validação de e-mail/telefone/senha, RBAC, auditoria) e as recomendações de infraestrutura
para alta disponibilidade em produção.

## Estrutura

- `prisma/schema.prisma` — modelo de dados (usuários, profissionais, pacientes, agenda,
  tratamentos, evoluções, pagamentos, eventos, estoque, log de auditoria).
- `src/app/(app)` — páginas autenticadas (dashboard, agenda, pacientes, prontuários,
  equipe, tratamentos, financeiro, pagamentos, eventos, comunicação, estoque, relatórios,
  configurações).
- `src/app/login` — autenticação.
- `src/app/api` — rotas de API (CRUD de pacientes, profissionais, tratamentos, pagamentos,
  eventos, estoque, usuários).
- `src/lib` — Prisma client, validação (Zod), permissões (RBAC), auditoria, rótulos.
- `src/proxy.ts` — gate de autenticação e autorização por papel (substitui o antigo
  `middleware.ts` no Next.js 16).

## Observações

- Banco de dados: SQLite (`prisma/dev.db`), adequado para desenvolvimento/demonstração
  local. Para produção, troque o `provider` do datasource em `prisma/schema.prisma` para
  `postgresql` e ajuste `DATABASE_URL` no `.env` — ver `SECURITY.md`.
- MVP funcional: cobre o fluxo essencial ponta a ponta descrito no escopo, mas alguns
  módulos (Comunicação, Relatórios com exportação) ainda são simplificados — ver os avisos
  dentro de cada tela.

# 🙏 Contributing — Cabala dos Caminhos

Obrigado por querer contribuir para a Cabala dos Caminhos! Este é um projeto de **tecnologia sagrada** que visa conectar seres humanos à sua essência espiritual através de sistemas místicos ancestrais.

## 💫 O que você pode fazer

### 🐛 Reportar Bugs
Encontrou um bug? Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Screenshots se aplicável
- Ambiente (SO, browser, versão)

### 💡 Sugerir Funcionalidades
Tem uma ideia para melhorar o projeto? Abra uma issue com:
- Descrição da funcionalidade
- Caso de uso
- Como ela beneficializa os praticantes

### 🧘 Contribuir Código
Quer meter a mão na massa? Veja as secções abaixo!

---

## 🚀 Setup Rápido

```bash
# 1. Clone o repo
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos

# 2. Instale dependências
npm install

# 3. Copie e configure variáveis
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Inicie o banco
npm run db:generate
npm run db:push

# 5. Rode!
npm run dev
```

---

## 🏗️ Arquitetura

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # 400+ API routes
│   ├── dashboard/         # Dashboard pages
│   ├── mapa/              # Mapa da Alma
│   └── calendario/        # Calendário espiritual
├── components/
│   ├── ui/                # Design system (shadcn)
│   ├── auth/              # Autenticação
│   ├── mapa/              # Mapa components
│   └── astrologia/        # Astrologia
├── lib/
│   ├── engines/           # Spiritual engines
│   ├── ai/                # AI generators
│   └── prisma/            # Database client
└── hooks/                 # React hooks
```

---

## 📝 Convenções

### Commits
Seguimos **Conventional Commits**:

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação (CSS, etc.)
refactor: refatoração
test: testes
chore: manutenção
```

Exemplos:
```bash
git commit -m "feat(mapa): adicionar visualização da árvore da vida"
git commit -m "fix(api): corrigir validação de data de nascimento"
git commit -m "docs: atualizar README com screenshots"
```

### Branches
```
feat/nome-da-funcionalidade
fix/correcao-de-bug
docs/atualizar-documentacao
refactor/nome-do-modulo
```

### TypeScript
```typescript
// Interface para objetos públicos
interface MapaAlma {
  nome: string;
  dataNascimento: Date;
  numerologia: NumerologiaResults;
}

// Type para unions
type TipoOdú = 'ogbe' | 'oyeku' | 'iwori' | 'o.bará';
```

### Componentes
```tsx
'use client';

interface CardProps {
  titulo: string;
  descricao?: string;
  children?: React.ReactNode;
}

/** Card espiritual para dashboard */
export function CartaoEspiritual({ titulo, descricao, children }: CardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold">{titulo}</h3>
      {descricao && <p className="text-muted-foreground">{descricao}</p>}
      {children}
    </div>
  );
}
```

### API Routes
```typescript
export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get('data');
  
  if (!data) {
    return NextResponse.json(
      { error: 'Parâmetro "data" é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const resultado = await calcular(data);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Testing

```bash
# Todos os testes
npm run test

# Uma vez (CI mode)
npm run test:run

# Com UI
npx vitest ui
```

**1728 testes** cobrem:
- Engines espirituais
- Componentes React
- API routes
- Hooks personalizados

---

## ✅ Checklist Antes do PR

- [ ] Código compila (`npm run build`)
- [ ] Testes passam (`npm run test:run`)
- [ ] Lint passa (`npm run lint`)
- [ ] Commits seguem conventional commits
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem `console.log` de debug
- [ ] Variáveis sensíveis não commitadas

---

## 📜 Scripts Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint check |
| `npm run test` | Run tests (watch) |
| `npm run test:run` | Run tests (once) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Prisma Studio |
| `npm run quality` | Run quality eval |

---

## 🤝 Code of Conduct

### Nossos Padrões
- Respeito mútuo
- Linguagem inclusiva
- Construtividade nas críticas
- Foco na missão espiritual do projeto

### Não Toleramos
- Comentários ofensivos
- Ataques pessoais
- Spam ou promotional content
- Desrespeito às tradições representadas

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest](https://vitest.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://prisma.io/docs)

---

## 🙏 Lembretes Espirituais

> *"Assim como é em cima, também é embaixo."*

- Cada commit é um ato de serviço
- Cada bug corrigido é uma transmutação
- Cada feature adicionada é uma expansão da consciência

Obrigado por fazer parte desta jornada! 🌟

---

**Dúvidas?** Abra uma issue com a tag `question`.
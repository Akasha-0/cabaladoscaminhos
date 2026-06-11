# Lessons — Loop sudo policy

**Date:** 2026-06-11
**Policy:** sudo é HARD BLOCKED em todos os hooks do loop.

## Por que bloqueado

1. **Defense-in-depth**: pre-bash-allowlist.sh tem `sudo ` em FORBIDDEN_PATTERNS
2. **Risk:** qualquer `sudo` wrapper pode escalar privilégio (rm -rf, dd, chmod 777)
3. **User override:** mesmo com senha fornecida, hook bloqueia — policy hard-coded

## Quando loop precisa de sudo

- DB setup inicial (peer auth → password)
- Restart de serviços (systemctl)
- Install de pacotes globais

## Solução

Usuário roda 1x manualmente quando precisa:

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

Loop detecta falha (preflight DB check) e loga instrução clara.
Launch.sh tem FIX #2 que detecta DB inacessível e aborta com mensagem.

## Workarounds que loop PODE fazer sozinho

- Editar arquivos em `apps/`, `packages/`, `src/`, `tests/`
- Rodar testes, typecheck, build
- Aplicar migrations Prisma (sem sudo)
- Criar arquivos em `.autonomous/` (gitignored ou tracked)
- Commitar e dar push (mas push é separado)

## O que loop NÃO pode fazer sozinho

- Mudar permissões de arquivo (chmod root)
- Reiniciar serviços do sistema
- Editar `/etc/`, `/var/`, `/usr/`
- Instalar pacotes globais

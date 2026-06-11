# Deploy DOX

## Purpose
Configurações de deployment e infraestrutura.

## Ownership
- `systemd/`: Unit files para serviços systemd

## Local Contracts
- Scripts de deployment devem ser idempotentes
- Configurações de produção separadas de dev

## Work Guidance
- Backups automáticos configurados via systemd timers
- Verificar em staging antes de produção

## Verification
- `systemctl status` para verificar serviços
- Logs em `journalctl`

## Child DOX Index
(Nenhum subdiretório com AGENTS.md)

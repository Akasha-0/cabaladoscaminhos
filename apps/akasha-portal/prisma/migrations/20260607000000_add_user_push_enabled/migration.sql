-- Akasha v0.0.4 — T7: opt-in flag for Web Push (VAPID)
-- Adiciona `pushEnabled` ao User. Subscriptions Web Push continuam na tabela
-- `push_subscriptions` (relação 1-N já existente). O flag é a chave de "quer receber
-- notificação do ritual diário" — sem flag = opt-out (LGPD).

ALTER TABLE "users" ADD COLUMN "pushEnabled" BOOLEAN NOT NULL DEFAULT false;

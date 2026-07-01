# Pendientes — features newsletter

Orden decidido con el usuario: editor de posts → contador de visitas → **suscripción newsletter** → **comentarios**.

## Completado

1. **Editor de posts (CLI)** — `npm run new-post`. Spec: `docs/superpowers/specs/2026-07-01-editor-de-posts-cli-design.md`. Plan: `docs/superpowers/plans/2026-07-01-editor-de-posts-cli.md`. Doc uso: `docs/CONTENT.md`.
2. **Contador de visitas** — Upstash Redis + `/api/views/[slug]` + `ViewCounter`. Spec: `docs/superpowers/specs/2026-07-01-contador-de-visitas-design.md`. Plan: `docs/superpowers/plans/2026-07-01-contador-de-visitas.md`. Setup: `docs/VIEW_COUNTER_SETUP.md`. **Falta**: usuario debe crear integración Upstash Redis en Vercel dashboard (Storage → Marketplace) para que funcione en producción.
3. **Comentarios (Giscus)** — GitHub Discussions embed, sin backend propio. Spec: `docs/superpowers/specs/2026-07-01-comentarios-giscus-design.md`. Plan: `docs/superpowers/plans/2026-07-01-comentarios-giscus.md`. Setup: `docs/GISCUS_SETUP.md`. **Falta**: usuario debe completar setup manual en giscus.app (instalar app, crear categoría `Comments`, obtener IDs) y configurar env vars en Vercel para que se muestre en producción.

## Pendiente 3: Suscripción newsletter

**No iniciado — falta brainstorming completo.** Al retomar, invocar `superpowers:brainstorming` y cubrir:

- ¿Cómo se registra la gente? (form en el sitio → guarda email dónde: Resend/Buttondown/ConvertKit/Mailchimp/base propia?)
- ¿Cómo "llega" el newsletter? (¿envío manual del usuario copiando posts, o automatizado en cada post nuevo?)
- Servicio de email transaccional/marketing a usar — requiere decisión del usuario (cuenta externa, como con Upstash) o proveerle opciones y que elija.
- Doble opt-in / GDPR-ish considerations (mínimo, para un blog personal en español probablemente no crítico, pero preguntar).
- Dónde vive el formulario: ya existe `src/components/editorial/SubscribeBox.tsx` (revisar si es solo UI placeholder o tiene lógica).

Empezar por: `Read src/components/editorial/SubscribeBox.tsx` para ver qué ya existe, luego brainstorming.

## Contexto técnico relevante para ambos

- Stack: Next.js 16 (App Router), TypeScript, Tailwind, sin backend propio salvo route handlers (`src/app/api/`).
- Deploy: Vercel (confirmado por el usuario, serverless — sin fs persistente en runtime).
- Patrón ya establecido para features con storage externo: route handler en `src/app/api/<feature>/`, módulo lib en `src/lib/<feature>.ts` con fail-silent si faltan env vars, componente client con `'use client'`.
- Ejecución: brainstorming → spec en `docs/superpowers/specs/` → writing-plans → plan en `docs/superpowers/plans/` → subagent-driven-development (1 agente por task, con verificación inline del controller antes de avanzar — no confiar ciegamente en el reporte del subagente, revisar diffs).
- Cuidado: si un subagente commitea un archivo con cambios previos sin commitear de otra sesión (pasó con `page.tsx` en el contador de visitas), el commit arrastra ese contenido — no hay forma limpia de separarlo a nivel de línea. Verificar `git status` antes de dispatch para saber si el archivo objetivo ya tenía diffs pendientes.

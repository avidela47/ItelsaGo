# ITELSA Go · Plataforma inmobiliaria B2B2C

ITELSA Go es una plataforma fullstack pensada para digitalizar la publicación y administración de propiedades en Argentina. Conecta inmobiliarias (agencies), administradores y usuarios finales en un único flujo que cubre todo el ciclo de vida: registro, carga de propiedades, revisión, publicación y seguimiento de performance.

---

## 🚀 Resumen ejecutivo

- **Estado actual:** ~85 % de funcionalidades core completadas (auth, CRUD de propiedades, gestión de agencias, panel admin, emails, SEO avanzado, filtros y UX). Falta cerrar performance avanzada, favoritos, mapas y uploads definitivos.
- **Modelo de negocio:** Planes FREE / PRO / PREMIUM con límites automáticos y upgrade instantáneo (1 click).
- **Stack:** Next.js 14 (App Router + Server Components) · React 18 · Material UI 6 · MongoDB · Resend · Vercel Edge · Storage S3/Local abstraído.
- **Diferencial:** Panel administrativo integral, experiencia mobile-first, SEO/OG automatizado y time-to-market veloz gracias a SSR/ISR.

---

## 🔄 Cómo funciona la plataforma

1. **Registro y autenticación**: Usuarios se registran, el middleware asigna rol (admin/agency/user) y crea vínculos agency↔usuario automáticamente.
2. **Carga de propiedades**: Formularios Material UI permiten subir todos los datos claves, imágenes y vista previa antes de publicar.
3. **Control por plan**: El límite de publicaciones depende del plan vigente; el panel admin puede cambiarlo instantáneamente.
4. **Publicación y SEO**: Cada propiedad genera metadata dinámica (OpenGraph + JSON-LD) y se incluye en el sitemap para indexación inmediata.
5. **Monitoreo**: El dashboard admin muestra métricas financieras, actividad reciente y alertas para reaccionar rápido.
6. **Notificaciones**: Resend envía emails de bienvenida, avisos al admin y contactos de usuarios interesados.

---

## 🏗️ Arquitectura técnica

| Capa | Implementación |
|------|----------------|
| UI / UX | React 18 + Material UI 6 + componentes client-side y server components bien separados |
| Routing | Next.js 14 App Router con layouts anidados, metadata API y rutas protegidas vía middleware |
| Backend | API Routes en `src/app/api/*` (REST), conexión a MongoDB mediante capa `lib/mongo.ts` |
| Auth | JWT + cookies httpOnly + helpers en `lib/auth.ts` y middleware global para redirecciones |
| Datos | Modelos Mongoose (`src/models/*.ts`) para Users, Agencies, Listings, Alerts, Contacts y Visits |
| Storage | Abstracción en `src/lib/storage` (local o S3) para manejo de assets |
| Emails | Resend + plantillas personalizadas desde `lib/emailConfig.ts` y `lib/sendAlertEmails.ts` |
| Observabilidad | Endpoints `/api/health`, seeds, stats y metrics para alimentar el panel |

Estructura destacada:

```
src/
 ├─ app/                # Rutas App Router (public, panel, auth, publicar, favoritos…)
 ├─ components/         # UI reutilizable (cards, dashboard, maps, upload…)
 ├─ lib/                # Autenticación, almacenamiento, helpers, planes, emails
 ├─ models/             # Esquemas Mongoose (Agency, Listing, User, etc.)
 └─ public/uploads      # Assets de desarrollo (logos, listings)
```

---

## 🧩 Módulos principales

### Autenticación y control de acceso
- Registro/login con email y password.
- Roles jerárquicos: `admin`, `agency`, `user`.
- Middleware protege rutas sensibles y enruta según rol.

### Gestión de propiedades
- CRUD completo con campos avanzados (operación, tipo, metros, amenities, media gallery).
- Vista previa interactiva antes de publicar.
- Integración con botones de contacto (WhatsApp, llamada, email) y compartir en redes.

### Gestión de inmobiliarias (Agencies)
- CRUD con campos comerciales + logo.
- Límites automáticos por plan (FREE/PRO/PREMIUM) y cambio en un clic.
- Validaciones para que cada agency modifique solo sus propiedades.

### Panel de administración
- Dashboard con métricas financieras (MRR, ARR, proyección anual), planes y últimas publicaciones.
- Tablas con filtros avanzados, acciones masivas, suspensión/activación instantánea.
- Vistas específicas para agencias, propiedades y alertas.

### Sistema de emails y notificaciones
- Resend para onboarding, avisos al staff y contacto por propiedad.
- Templates HTML profesionales + rate limiting para evitar spam.

### SEO, performance y accesibilidad
- Metadata dinámica, OpenGraph, Twitter Cards, JSON-LD `RealEstateListing`.
- Sitemap, robots, SSR e ISR para indexación y velocidad.
- Uso de `next/image`, lazy loading y dynamic imports en componentes pesados.

### Experiencia de usuario
- Material UI con tema dark custom, microinteracciones, loaders y snackbars consistentes.
- Panel responsive/mobile-first.
- Indicadores visuales de límites, chips de plan y barras de progreso.

---

## 🥇 Ventaja competitiva

| Aspecto | ITELSA Go | Competidores tradicionales |
|---------|-----------|----------------------------|
| Modelo comercial | Plan FREE real + upgrades instantáneos | Solo planes pagos, upgrades vía soporte |
| Panel administrativo | Control total en tiempo real, stats financieras, cambios en 1 clic | Paneles lentos, cambios manuales |
| Tecnología | Next.js 14, SSR/ISR, Edge, Material UI 6 | PHP/Java legacy, CSR parcial |
| UX | Vista previa antes de publicar, validaciones live, móvil 100 % | Formularios largos, sin preview, responsive limitado |
| SEO | Meta tags + JSON-LD automáticos | Configuraciones manuales o básicas |
| Emails | Onboarding, avisos y contactos automatizados | Formularios básicos sin branding |

Resultado: time-to-market más rápido, costos de operación bajos y experiencia superior para agencias y usuarios finales.

---

## 💰 Valor económico del proyecto

Estimación basada en horas senior requeridas hasta el estado actual (85 %) y tarifas promedio para LATAM 2025:

| Rol | Horas estimadas | Tarifa USD/h | Subtotal |
|-----|-----------------|-------------|----------|
| Tech Lead / Arq. Next.js | 180 h | 65 USD | 11 700 USD |
| Fullstack Engineer | 320 h | 55 USD | 17 600 USD |
| UI/UX Designer | 90 h | 45 USD | 4 050 USD |
| QA / Automation | 60 h | 35 USD | 2 100 USD |
| **Total invertido (85 %)** | **650 h** | — | **35 450 USD** |

Completar el 15 % restante (favoritos, mapas, upload cloud, panel agency, performance extra) demandará ~120 h adicionales (~6 600 USD). En un escenario de precio de transferencia a cliente final, el valor de mercado de la plataforma (IP + time-to-market + ventaja competitiva) puede ubicarse entre **50 000 y 60 000 USD** considerando licenciamiento inicial + soporte.

---

## 💪 Fortalezas clave

1. **Tecnología de vanguardia:** App Router, Server Components, SSR/ISR y despliegue edge aseguran performance y SEO.
2. **Modelo freemium escalable:** Captura leads sin fricción y monetiza upgrades.
3. **Panel administrativo superior:** Visibilidad financiera y control granular inexistentes en la competencia local.
4. **UX profesional y consistente:** Material UI + validaciones en vivo que elevan la percepción de marca.
5. **Base de código modular:** Librerías (`lib/*`), modelos y componentes desacoplados facilitan nuevas features y automatización.

---

## 🧭 Roadmap recomendado (próximas 2–4 semanas)

1. **Favoritos persistentes y página `/favoritos`** (retención y personalización).
2. **Mapas interactivos (selector + vista de detalle)** para reforzar confianza.
3. **Upload productivo (S3/Cloudinary)** con drag & drop y compresión automática.
4. **Panel específico para agencies** con métricas e insights propios.
5. **Optimización performance extra:** bundle analyzer, carga diferida de fuentes y ajustes Lighthouse.

Extras de mediano plazo: búsqueda geográfica avanzada, notificaciones push, comparador de propiedades, reviews verificados y analytics para agencies.

---

## 🧪 Setup y ejecución local

```bash
npm install
npm run dev
```

Variables de entorno clave:

- `MONGODB_URI`
- `RESEND_API_KEY`
- `NEXTAUTH_SECRET` (u otro secreto de firma)
- Configuración de storage (`LOCAL_STORAGE_PATH` o credenciales S3)

Endpoints útiles:

- `/api/health` – ping básico
- `/api/admin/stats` – insumos del dashboard
- `/api/admin/financial-stats`

Seeds disponibles en `/api/seed` y `/api/seed-listings` para poblar datos de prueba.

---

## 📬 Contacto y siguientes pasos

- **Equipo recomendado:** 1 tech lead, 1 fullstack, 1 UX, 1 QA part-time.
- **Tiempo para release 1.0:** 3–4 semanas con el equipo arriba.
- **Métricas a monitorear:** crecimiento de agencias FREE→PRO/PREMIUM, tiempo de publicación, respuesta a alertas, resultados de Lighthouse.

Este README resume el estado, valor y potencial de ITELSA Go. Sirve como handoff ejecutivo/técnico para inversores, nuevos desarrolladores o stakeholders comerciales.

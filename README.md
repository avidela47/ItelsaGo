# ITELSA Go (local dev)

Repositorio base para ITELSA Go.

Requisitos:
- Node >= 18
- MongoDB (local o Atlas)

Variables de entorno: copia `.env.example` a `.env` y ajusta valores.

Instalación:

```bash
npm ci
npm run dev
```

Endpoints de autenticación (MVP):
- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password }
- `POST /api/auth/logout`

Notas:
- Storage local por defecto (`public/uploads`).
- Para producción, configurar `STORAGE_DRIVER=s3` y variables S3.

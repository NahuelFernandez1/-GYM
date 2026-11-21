# +GYM

Mono repo con el backend (Spring Boot) y el frontend (React) de +GYM.
Produccion: https://masgym.tech

- `backend/` — API REST (Spring Boot, Java 21, PostgreSQL)
- `frontend/` — Panel de gestion (React, MUI). En produccion lo sirve Caddy.
- `deploy/` — scripts del servidor (backup diario de la base).
- `docker-compose.yml` — stack de produccion: `db` (Postgres 18), `backend` y `web` (Caddy + build de React, HTTPS automatico).

## Desarrollo local

Requiere Java 21, Node 22 y un PostgreSQL local con una base `masgym`.

```bash
# backend (puerto 8080)
cd backend
DB_PASSWORD=<tu clave> JWT_SECRET=<minimo 32 caracteres> ./mvnw spring-boot:run

# frontend (puerto 3000)
cd frontend
npm install
npm start
```

## Produccion (VPS Hostinger)

El proyecto vive en `/opt/masgym` y la configuracion en `/opt/masgym/.env`
(ver `.env.example`, nunca se commitea).

Deploy de una nueva version, desde la PC (el VPS no tiene un clon de git;
se le copia el codigo commiteado):

```bash
git -c core.autocrlf=false archive --format=tar HEAD | ssh -i ~/.ssh/masgym_vps root@189.24.5.100 "tar -x -C /opt/masgym"
ssh -i ~/.ssh/masgym_vps root@189.24.5.100 "cd /opt/masgym && docker compose up -d --build"
```

Caddy saca y renueva el certificado HTTPS solo. Solo los puertos 80 y 443
quedan expuestos; la base y el backend no son accesibles desde afuera.

### Backups

`deploy/backup.sh` corre todos los dias a las 04:00 por cron, hace un
`pg_dump` en `/opt/masgym/backups/` y conserva los ultimos 14.

Restaurar un backup:

```bash
docker compose exec -T db pg_restore -U "$DB_USERNAME" -d masgym --clean --if-exists < backups/<archivo>.dump
```

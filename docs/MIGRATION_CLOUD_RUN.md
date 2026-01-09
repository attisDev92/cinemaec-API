# Ejecutar Migraciones en Cloud Run

## Problema

Las migraciones en TypeORM deben ejecutarse antes de que la aplicación inicie. En Cloud Run, necesitamos una estrategia para ejecutar migraciones sin bloquear el inicio del servicio.

## Solución: Cloud Run Job

### Opción 1: Ejecutar Job manualmente desde Cloud Console

1. Ve a **Cloud Run** → **Jobs** → **Crear Job**.
2. Configura:
   - **Nombre:** `cinemaec-migrate`
   - **Imagen de contenedor:** `us-central1-docker.pkg.dev/cinema-ec/cinema-ec/cinemaec-backend:latest` (o el hash actual)
   - **Región:** `us-central1`
   - **CPU/Memory:** `2 vCPU / 2 GB` (para migraciones)
3. En **Configuración del contenedor** → **Variables de entorno**, añade todas las de `.env.production`:
   - `NODE_ENV=production`
   - `PORT=8080`
   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_NAME`, etc.
4. En **Secretos**, mapea:
   - `DB_PASSWORD` ← secret `DB_PASSWORD:latest`
   - `MAIL_PASSWORD` ← secret `MAIL_PASSWORD:latest`
   - etc.
5. **Comando anulador:**
   ```bash
   npm run migration:run
   ```
6. **Crear** el job.

### Ejecutar el Job

Opción A: Cloud Console

- Ve a **Cloud Run** → **Jobs** → `cinemaec-migrate` → **Ejecutar**

Opción B: gcloud CLI

```bash
gcloud run jobs execute cinemaec-migrate --region us-central1
```

### Verificar ejecución

```bash
gcloud run jobs logs read cinemaec-migrate --region us-central1 --limit 100
```

Busca líneas como:

```
query: ALTER TYPE "asset_owner_enum" ADD VALUE IF NOT EXISTS 'space_document'
query: ALTER TYPE "asset_owner_enum" ADD VALUE IF NOT EXISTS 'user_agreement'
```

---

## Opción 2: Ejecutar migración dentro de main.ts (no recomendado)

Si quieres que las migraciones se ejecuten automáticamente al iniciar el servicio, modifica `src/main.ts`:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Ejecutar migraciones antes de iniciar el servidor
  const dataSource = app.get(DataSource)
  if (!dataSource.isInitialized) {
    await dataSource.initialize()
  }
  await dataSource.runMigrations()

  // ... resto del código
  await app.listen(port, '0.0.0.0')
}
```

**⚠️ Ventajas:** Las migraciones se ejecutan siempre.
**⚠️ Desventajas:** Si hay error en migración, la app no inicia; aumenta tiempo de startup.

---

## Próximas migraciones

Siempre que hagas cambios en la BD:

1. Crea la migración:

   ```bash
   npm run migration:generate -- src/migrations/[nombre]
   ```

2. Commit y push a `main`.

3. Deploy a Cloud Run (automático o manual).

4. **IMPORTANTE:** Ejecuta el Cloud Run Job `cinemaec-migrate` después del deploy para aplicar cambios.

5. Verifica en logs.

---

## Estado actual

**Migración pendiente:** `AddMissingAssetOwnerEnumValues1736100000000`

- Agrega valores `space_document` y `user_agreement` al enum `asset_owner_enum`.
- **Acción necesaria:** Ejecutar job de migración para aplicar en BD de producción.

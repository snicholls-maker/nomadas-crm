# Setup — Nómadas CRM

## Paso 1: Crear base en Airtable

1. Ve a https://airtable.com y crea una cuenta (es gratis)
2. Clic en **"+ Add a base"** → **"Start from scratch"**
3. Nómbrala: `Nomadas CRM`
4. Cambia el nombre de la tabla de `Table 1` a `Leads`
5. Configura los campos con estos nombres exactos:

| Campo | Tipo |
|-------|------|
| Timestamp | Single line text |
| Nombre | Single line text |
| Telefono | Single line text |
| Mensaje | Long text |
| Estado | Single line text |
| Notas | Long text |
| Actualizado | Single line text |
| Campana | Single line text |
| Origen | Single line text |

> **Tip**: Puedes ingresar los leads de WhatsApp directamente aquí en Airtable.

## Paso 2: Obtener el AIRTABLE_BASE_ID

Abre tu base en Airtable. La URL tiene este formato:
```
https://airtable.com/appXXXXXXXXXXXXXX/tblXXXXXX/...
```
El `appXXXXXXXXXXXXXX` es tu `AIRTABLE_BASE_ID`.

## Paso 3: Crear el Personal Access Token

1. Ve a https://airtable.com/create/tokens
2. Clic en **"+ Create new token"**
3. Nombre: `nomadas-crm`
4. Scopes: marca `data.records:read` y `data.records:write`
5. Access: `All current and future bases`
6. Clic en **"Create token"**
7. Copia el token (empieza con `pat...`) — solo se muestra una vez

## Paso 4: Deploy en Vercel

1. Ve a https://vercel.com → Sign up con Google
2. Sube este proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Nomadas CRM inicial"
   git remote add origin https://github.com/TU_USUARIO/nomadas-crm.git
   git push -u origin main
   ```
3. En Vercel → **New Project** → importa tu repo
4. Agrega estas 3 variables de entorno:
   - `AIRTABLE_TOKEN` → el token `pat...` que copiaste
   - `AIRTABLE_BASE_ID` → el ID `app...` de tu base
   - `AIRTABLE_TABLE` → `Leads`
5. Deploy → en 2 minutos tienes la URL de tu CRM

## Paso 5: Instalar como PWA en el teléfono

### iPhone:
1. Abre la URL de Vercel en Safari
2. Toca el ícono de compartir (cuadrado con flecha hacia arriba)
3. "Añadir a pantalla de inicio"

### Android:
1. Abre la URL en Chrome
2. Menú → "Instalar app" o "Añadir a pantalla de inicio"

## Estructura del proyecto

```
nomadas-crm/
├── app/
│   ├── api/
│   │   └── leads/
│   │       ├── route.js          # GET (listar) / POST (agregar)
│   │       └── [id]/route.js     # PATCH (actualizar estado/notas)
│   ├── lib/
│   │   └── airtable.js           # Conexión Airtable
│   ├── layout.js
│   ├── page.js                   # Dashboard principal
│   └── globals.css
├── public/
│   └── manifest.json             # PWA config
├── .env.example                  # Variables de entorno
├── next.config.js
├── tailwind.config.js
└── package.json
```

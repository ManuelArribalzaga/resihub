# ResiHub V3 — Portal de Gestión de Trámites de Residencia Profesional
**TecNM Campus Minatitlán · Versión Funcional con Backend**

---

## 📁 Estructura del Proyecto

```
resihub/
├── server.js              ← Punto de entrada (Express)
├── setup.js               ← Crea el usuario admin inicial
├── package.json
├── .env.example           ← Copia esto a .env
│
├── config/
│   └── db.js              ← Conexión a MySQL (pool)
│
├── middleware/
│   └── auth.js            ← JWT: verificarToken, soloAdmin
│
├── routes/
│   ├── auth.js            ← POST /api/auth/login, GET /api/auth/me
│   ├── documentos.js      ← GET /api/documentos, /etapa/:id, /descargar/:id
│   └── admin.js           ← CRUD documentos, etapas, usuarios, estadísticas
│
├── controllers/
│   ├── authController.js
│   ├── documentosController.js
│   └── adminController.js
│
├── database/
│   ├── schema.sql         ← Crear tablas
│   └── seeds.sql          ← Datos iniciales
│
├── uploads/               ← Archivos PDF/DOCX subidos (creado automáticamente)
│
└── public/                ← Frontend estático servido por Express
    ├── index.html
    ├── solicitud.html
    ├── seguimiento.html
    ├── liberacion.html
    ├── admin/
    │   └── index.html     ← Panel de administración
    ├── css/
    │   └── estilos.css
    ├── img/               ← Coloca aquí: ITMina.png, TecNM_logo.png, ImgenPrevisualizada.jpg
    └── js/
        └── api.js         ← Funciones fetch compartidas
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/resihub.git
cd resihub
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus datos de MySQL
```

### 4. Crear la base de datos
```sql
-- En tu cliente MySQL:
SOURCE database/schema.sql;
SOURCE database/seeds.sql;
```

### 5. Crear usuario administrador
```bash
node setup.js
# Credenciales por defecto: admin@itmina.edu.mx / Admin2026!
```

### 6. Agregar imágenes
Copia tus imágenes a `public/img/`:
- `ITMina.png`
- `TecNM_logo.png`
- `ImgenPrevisualizada.jpg`

### 7. Iniciar el servidor
```bash
# Desarrollo (con recarga automática):
npm run dev

# Producción:
npm start
```

### 8. Abrir en el navegador
- **Portal público:** http://localhost:3000
- **Panel admin:**   http://localhost:3000/admin/

---

## 🔌 API REST — Endpoints

### Públicos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/documentos` | Todos los docs agrupados por etapa |
| GET | `/api/documentos/etapa/:id` | Docs de una etapa (1, 2 o 3) |
| GET | `/api/documentos/descargar/:id` | Descargar archivo |

### Admin (requieren JWT Bearer token)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/documentos` | Listar todos (incluso inactivos) |
| POST | `/api/admin/documentos` | Crear documento + subir archivo |
| PUT | `/api/admin/documentos/:id` | Actualizar documento |
| DELETE | `/api/admin/documentos/:id` | Eliminar documento |
| GET | `/api/admin/etapas` | Listar etapas |
| GET | `/api/admin/estadisticas` | Stats: descargas, top docs |
| GET | `/api/admin/usuarios` | Listar usuarios |
| POST | `/api/admin/usuarios` | Crear admin |

---

## 🗄️ Base de Datos

### Tablas
- `usuarios` — Admins y estudiantes
- `etapas` — Las 3 etapas del proceso
- `documentos` — Formatos y guías (con ruta al archivo)
- `descargas` — Bitácora de descargas para estadísticas

---

## 👤 Credenciales por Defecto
| Campo | Valor |
|-------|-------|
| Email | admin@itmina.edu.mx |
| Password | Admin2026! |

⚠️ **Cambia la contraseña después del primer inicio de sesión.**

---

© 2026 ResiHub - TecNM / ITMina

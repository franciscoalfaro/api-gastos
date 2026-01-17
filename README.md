# 📊 API Gastos

**API Gastos** es un backend REST desarrollado con **Node.js**, **Express** y **MongoDB** para la gestión de gastos, categorías, usuarios y saldos.  
Incluye autenticación JWT, recuperación de contraseña y cálculo de indicadores financieros.

---

## 🚀 Tecnologías principales

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** para autenticación
- **Multer** para subida de archivos
- **CORS** y middlewares de seguridad
- **dotenv** para manejo de variables de entorno

---

## ⚙️ Instalación y configuración

Clona el proyecto:

```bash
git clone https://github.com/franciscoalfaro/api-gastos.git
cd api-gastos
```

Instala dependencias:

```bash
npm install
```

Crea un archivo `.env` en la raíz basado en `.env.example` con tus credenciales, por ejemplo:

```env
MONGODB_URI=mongodb://localhost:27017/api-gastos
JWT_SECRET=tu_clave_secreta
PORT=3001
EMAIL_USER=tu_email@example.com
EMAIL_PASSWORD=tu_password
```

Inicia el servidor:

```bash
npm run dev   # desarrollo
npm start     # producción
```

---

## 📂 Rutas disponibles

### 🔑 Usuario (`/api/user`)
- `POST /register` → Registrar usuario
- `POST /login` → Iniciar sesión
- `GET /profile/:id` → Ver perfil (requiere token)
- `GET /list/:page?` → Listar usuarios (paginado)
- `PUT /update` → Actualizar usuario (requiere token)
- `POST /upload` → Subir avatar (requiere token, campo `file0`)
- `GET /avatar/:file` → Obtener avatar
- `DELETE /delete/:id` → Eliminar usuario

---

### 💰 Gastos (`/api/bills`)
- `POST /creargasto` → Crear gasto
- `PUT /update/:id` → Actualizar gasto
- `DELETE /delete/:id` → Eliminar gasto
- `GET /ultimosgastos/:page?` → Listar últimos gastos (paginado)
- `GET /ultimos10` → Últimos 10 gastos
- `GET /ultimos5` → Últimos 5 gastos
- `GET /detalle` → Detalle de gastos

---

### 🏷️ Categorías (`/api/category`)
- `POST /crearcategoria` → Crear categoría
- `PUT /update/:id` → Actualizar categoría
- `DELETE /delete/:id` → Eliminar categoría
- `GET /list/:page?` → Listar categorías (paginado)
- `GET /listcategoria` → Listar categorías para dropdown

---

### 💵 Saldos (`/api/saldo`)
- `POST /register` → Registrar saldo
- `PUT /update` → Actualizar saldo
- `DELETE /delete/:id` → Eliminar saldo
- `GET /montoactual` → Consultar saldo actual
- `GET /list/:page?` → Listar historial de saldos

---

### 📈 Totales y consumos (`/api/total`)
- `GET /consumo` → Total por mes y año
- `POST /generartotal` → Generar total de gastos
- `GET /ultimosmeses` → Consumos últimos 12 meses
- `POST /fechas` → Gastos entre fechas

---

### 🌍 Indicadores (`/api/indicador`)
- `GET /economico` → Obtener dólar observado

---

### 🔐 Recuperación de contraseña (`/api/recovery`)
- `POST /newpass` → Recuperar contraseña (envío por email)

---

## 🔒 Seguridad

- Todas las rutas (excepto login, registro y recuperación de contraseña) requieren **JWT válido** en el header `Authorization: Bearer <token>`.
- Las contraseñas se almacenan cifradas.

---

## 📌 Roadmap futuro

- Reportes en PDF/Excel  
- Gráficos estadísticos integrados  
- Roles de usuario (admin / user)  
- Pruebas unitarias e integración  
- Documentación con Swagger  

---

## 👨‍💻 Autor

Francisco Alfaro  
GitHub: [franciscoalfaro](https://github.com/franciscoalfaro)  

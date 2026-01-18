# 📊 API Gastos

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)
![AWS](https://img.shields.io/badge/Deployed-AWS-orange?logo=amazon-aws)
![License](https://img.shields.io/badge/License-MIT-blue)

**API Gastos** es un backend REST desarrollado con **Node.js**, **Express** y **MongoDB** para la gestión de gastos personales.
Permite administrar usuarios, gastos, categorías, saldos y obtener indicadores financieros, incorporando autenticación segura con JWT y recuperación de contraseña vía email.
Está desplegada en **AWS** y soporta autenticación, operaciones CRUD de usuarios y agendas, y subida de archivos de avatar.

---

## 🚀 Tecnologías principales

- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JSON Web Tokens (JWT)**
- **Multer (subida de archivos)**
- **Nodemailer** para envio de correos
- **dotenv** para variables de entorno
- **AWS** (EC2 / Elastic Beanstalk / otro)
- CORS y middlewares de seguridad

---

## ⚙️ Instalación y configuración

Clonar repositorio:

1. Clona el repositorio:
```bash
git clone https://github.com/franciscoalfaro/api-gastos.git
cd api-gastos
```

2. Instala dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto usando como base el archivo `.env.example`.

4. Inicia el servidor en modo desarrollo:
```bash
npm run dev
```
Producción:
```bash
npm start
```

---

## 🔑 Usuarios /api/user

| Método | Ruta | Descripción | Body / Parámetros |
|--------|------|-------------|------------------|
| POST | /register | Registro de usuario | name, email, password |
| POST | /login | Inicio de sesión | email, password |
| GET | /profile/:id | Obtener perfil de usuario | token JWT |
| GET | /list/:page? | Listado paginado de usuarios | page (opcional) |
| PUT | /update | Actualizar datos de usuario | token JWT |
| POST | /upload | Subir avatar | token JWT, file0 |
| GET | /avatar/:file | Obtener avatar | nombre archivo |
| DELETE | /delete/:id | Eliminar usuario | token JWT |

---

## 💰 Gastos /api/bills

| Método | Ruta | Descripción | Body / Parámetros |
|--------|------|-------------|------------------|
| POST | /creargasto | Crear nuevo gasto | monto, categoría, fecha |
| PUT | /update/:id | Actualizar gasto | id gasto |
| DELETE | /delete/:id | Eliminar gasto | id gasto |
| GET | /ultimosgastos/:page? | Últimos gastos paginados | page (opcional) |
| GET | /ultimos10 | Últimos 10 gastos | — |
| GET | /ultimos5 | Últimos 5 gastos | — |
| GET | /detalle | Detalle completo de gastos | — |

---

## 🏷️ Categorías /api/category

| Método | Ruta | Descripción | Body / Parámetros |
|--------|------|-------------|------------------|
| POST | /crearcategoria | Crear categoría | nombre |
| PUT | /update/:id | Actualizar categoría | id |
| DELETE | /delete/:id | Eliminar categoría | id |
| GET | /list/:page? | Listado paginado | page (opcional) |
| GET | /listcategoria | Categorías para dropdown | — |

---

## 💵 Saldos /api/saldo

| Método | Ruta | Descripción | Body / Parámetros |
|--------|------|-------------|------------------|
| POST | /register | Registrar saldo inicial | monto |
| PUT | /update | Actualizar saldo | monto |
| DELETE | /delete/:id | Eliminar registro de saldo | id |
| GET | /montoactual | Consultar saldo actual | — |
| GET | /list/:page? | Historial de saldos | page (opcional) |

---

## 📈 Totales y consumos /api/total

| Método | Ruta | Descripción | Body / Parámetros |
|--------|------|-------------|------------------|
| GET | /consumo | Total por mes y año | — |
| POST | /generartotal | Generar total de gastos | — |
| GET | /ultimosmeses | Consumo últimos 12 meses | — |
| POST | /fechas | Gastos entre fechas | fecha_inicio, fecha_fin |

---

## 🌍 Indicadores económicos /api/indicador

| Método | Ruta | Descripción | Body / Parámetros |
|--------|------|-------------|------------------|
| GET | /economico | Obtener dólar observado | — |

---

## 🔐 Recuperación de contraseña /api/recovery

| Método | Ruta | Descripción | Body / Parámetros |
|--------|------|-------------|------------------|
| POST | /newpass | Recuperación de contraseña vía email | email |

---

## 🔒 Seguridad

- Autenticación mediante JWT
- Rutas protegidas con middleware
- Contraseñas cifradas antes de persistir
- Manejo seguro de variables de entorno

---

## 📌 Roadmap

- Roles de usuario (admin / user)
- Reportes PDF / Excel
- Gráficos estadísticos
- Tests unitarios e integración
- Documentación Swagger / OpenAPI

---

## 👨‍💻 Autor

Francisco Alfaro  
GitHub: https://github.com/franciscoalfaro

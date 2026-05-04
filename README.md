# App Attendance

Sistema académico para registrar asistencia mediante **QR temporal** y **código de sala**.

La aplicación permite que un docente o instructor cree una sesión de asistencia, active un QR, permita el registro público de estudiantes y consulte resultados como presentes, ausentes y rechazos.

---

## Tecnologías utilizadas

### Frontend

- Ionic React
- React
- Vite
- TypeScript

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- Zod

### Contenedores

- Docker
- Docker Compose

---

## Estructura del proyecto

```txt
app-attendance/
├── app/                 # Frontend Ionic React
├── back/                # Backend Express + TypeScript
├── docker-compose.yml   # Servicios Docker
├── .env.example         # Variables de entorno de ejemplo
├── .gitignore
├── package.json
└── README.md

# App Attendance

Sistema académico para registrar asistencia mediante QR temporal y código de sala.

El proyecto permite que un docente cree una sesión de asistencia, active un QR, los estudiantes registren su asistencia y luego se puedan consultar presentes, ausentes y rechazos.

---

## Tecnologías

### Frontend
- Ionic React
- Vite
- TypeScript

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- JWT

### Contenedores
- Docker
- Docker Compose

---

## Estructura del proyecto

```txt
app-attendance/
├── app/                 # Frontend Ionic React
├── back/                # Backend Express + TypeScript
├── db/                  # Base de datos / recursos
├── docs/                # Documentación
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
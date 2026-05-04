import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import { Institution } from "./models/Institution";
import { AcademicUnit } from "./models/AcademicUnit";
import { Person } from "./models/Person";
import { Enrollment } from "./models/Enrollment";
import { Permission } from "./models/Permission";

dotenv.config({ path: "../.env" });

async function seed(): Promise<void> {
  await connectDB();

  console.log("Limpiando datos demo...");

  await Enrollment.deleteMany({});
  await Permission.deleteMany({});
  await AcademicUnit.deleteMany({});
  await Person.deleteMany({});
  await Institution.deleteMany({});

  console.log("Creando institución demo...");

  const institution = await Institution.create({
    code: "SENA-DEMO",
    name: "Institución Demo",
    context: "SENA",
    labels: {
      unit: "Ficha",
      student: "Aprendiz",
      teacher: "Instructor"
    },
    theme: {
      primaryColor: "#2563eb"
    },
    active: true
  });

  console.log("Creando unidad académica demo...");

  const unit = await AcademicUnit.create({
    institutionId: institution._id,
    code: "BD-II-DEMO",
    name: "Base de Datos II Demo",
    type: "FICHA",
    active: true
  });

  console.log("Creando usuario docente demo...");

  const passwordHash = await bcrypt.hash("Demo12345*", 10);

  const teacher = await Person.create({
    institutionId: institution._id,
    documento: "DOC-DEMO-001",
    nombre: "Docente Demo",
    passwordHash,
    roles: ["DOCENTE"],
    active: true
  });

  console.log("Creando estudiantes demo...");

  const students = await Person.insertMany([
    {
      institutionId: institution._id,
      documento: "EST-DEMO-001",
      nombre: "Estudiante Demo Uno",
      matricula: "MAT-DEMO-001",
      roles: ["ESTUDIANTE"],
      active: true
    },
    {
      institutionId: institution._id,
      documento: "EST-DEMO-002",
      nombre: "Estudiante Demo Dos",
      matricula: "MAT-DEMO-002",
      roles: ["ESTUDIANTE"],
      active: true
    },
    {
      institutionId: institution._id,
      documento: "EST-DEMO-003",
      nombre: "Estudiante Demo Tres",
      matricula: "MAT-DEMO-003",
      roles: ["ESTUDIANTE"],
      active: true
    }
  ]);

  console.log("Creando inscripciones demo...");

  await Enrollment.insertMany(
    students.map((student) => ({
      institutionId: institution._id,
      unitId: unit._id,
      personId: student._id,
      active: true
    }))
  );

  console.log("Creando permisos demo...");

  await Permission.insertMany([
    {
      role: "DOCENTE",
      resource: "sessions",
      action: "create"
    },
    {
      role: "DOCENTE",
      resource: "sessions",
      action: "activate"
    },
    {
      role: "DOCENTE",
      resource: "sessions",
      action: "close"
    },
    {
      role: "DOCENTE",
      resource: "attendance",
      action: "read"
    }
  ]);

  console.log("Seed ejecutado correctamente");
  console.log("--------------------------------");
  console.log("Usuario demo:");
  console.log("Documento: DOC-DEMO-001");
  console.log("Password: Demo12345*");
  console.log("--------------------------------");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Error ejecutando seed:", error);
  process.exit(1);
});
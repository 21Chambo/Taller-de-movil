import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Person } from "../models/Person";

const router = Router();

const loginSchema = z.object({
  documento: z.string().min(1),
  password: z.string().min(1)
});

router.post("/login", async (req: Request, res: Response) => {
  const traceId = uuidv4();

  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "La solicitud no cumple el contrato esperado.",
          details: parsed.error.issues,
          trace_id: traceId
        }
      });
    }

    const { documento, password } = parsed.data;

    const person = await Person.findOne({
      documento,
      active: true,
      roles: { $in: ["DOCENTE", "INSTRUCTOR", "ADMIN"] }
    });

    if (!person || !person.passwordHash) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Credenciales inválidas.",
          details: [],
          trace_id: traceId
        }
      });
    }

    const validPassword = await bcrypt.compare(password, person.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Credenciales inválidas.",
          details: [],
          trace_id: traceId
        }
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        error: {
          code: "SERVER_CONFIG_ERROR",
          message: "JWT_SECRET no está configurado.",
          details: [],
          trace_id: traceId
        }
      });
    }

    const token = jwt.sign(
      {
        sub: person._id.toString(),
        institutionId: person.institutionId.toString(),
        documento: person.documento,
        roles: person.roles
      },
      jwtSecret,
      {
        expiresIn: "2h"
      }
    );

    return res.status(200).json({
      data: {
        token,
        person: {
          id: person._id,
          institutionId: person.institutionId,
          nombre: person.nombre,
          documento: person.documento,
          roles: person.roles
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error interno en autenticación.",
        details: [],
        trace_id: traceId
      }
    });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { AttendanceSession } from "../models/AttendanceSession";
import { AttendanceRecord } from "../models/AttendanceRecord";
import { Person } from "../models/Person";
import { Enrollment } from "../models/Enrollment";

const router = Router();

const registerSchema = z.object({
  documento: z.string().min(1)
});

router.get("/attendance/:token", async (req: Request, res: Response) => {
  const traceId = uuidv4();

  try {
    const { token } = req.params;

    const session = await AttendanceSession.findOne({
      qrToken: token
    });

    if (!session) {
      return res.status(404).json({
        error: {
          code: "SESSION_NOT_FOUND",
          message: "La sesión no existe.",
          details: [],
          trace_id: traceId
        }
      });
    }

    return res.status(200).json({
      data: {
        sessionId: session._id,
        status: session.status,
        qrExpiresAt: session.qrExpiresAt,
        roomCode: session.roomCode
      }
    });
  } catch {
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error interno consultando sesión pública.",
        details: [],
        trace_id: traceId
      }
    });
  }
});

router.post("/public/attendance/:token/register", async (req: Request, res: Response) => {
  const traceId = uuidv4();

  try {
    const { token } = req.params;

    const parsed = registerSchema.safeParse(req.body);

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

    const { documento } = parsed.data;

    const session = await AttendanceSession.findOne({
      qrToken: token
    });

    if (!session) {
      await AttendanceRecord.create({
        sessionId: undefined,
        documento,
        status: "rejected",
        rejectReason: "VALIDATION_ERROR"
      }).catch(() => null);

      return res.status(404).json({
        error: {
          code: "SESSION_NOT_FOUND",
          message: "La sesión no existe.",
          details: [],
          trace_id: traceId
        }
      });
    }

    if (session.status !== "active") {
      await AttendanceRecord.create({
        sessionId: session._id,
        documento,
        status: "rejected",
        rejectReason: "SESSION_NOT_ACTIVE"
      });

      return res.status(400).json({
        error: {
          code: "SESSION_NOT_ACTIVE",
          message: "La sesión no está activa.",
          details: [],
          trace_id: traceId
        }
      });
    }

    if (!session.qrExpiresAt || session.qrExpiresAt.getTime() < Date.now()) {
      await AttendanceRecord.create({
        sessionId: session._id,
        documento,
        status: "rejected",
        rejectReason: "QR_EXPIRED"
      });

      return res.status(400).json({
        error: {
          code: "QR_EXPIRED",
          message: "El QR está expirado.",
          details: [],
          trace_id: traceId
        }
      });
    }

    const person = await Person.findOne({
      institutionId: session.institutionId,
      documento,
      active: true
    });

    if (!person) {
      await AttendanceRecord.create({
        sessionId: session._id,
        documento,
        status: "rejected",
        rejectReason: "DOCUMENT_NOT_FOUND"
      });

      return res.status(404).json({
        error: {
          code: "DOCUMENT_NOT_FOUND",
          message: "El documento no existe.",
          details: [],
          trace_id: traceId
        }
      });
    }

    const enrollment = await Enrollment.findOne({
      institutionId: session.institutionId,
      unitId: session.unitId,
      personId: person._id,
      active: true
    });

    if (!enrollment) {
      await AttendanceRecord.create({
        sessionId: session._id,
        personId: person._id,
        documento,
        status: "rejected",
        rejectReason: "NOT_ENROLLED"
      });

      return res.status(400).json({
        error: {
          code: "NOT_ENROLLED",
          message: "La persona no está inscrita en esta unidad académica.",
          details: [],
          trace_id: traceId
        }
      });
    }

    const duplicate = await AttendanceRecord.findOne({
      sessionId: session._id,
      personId: person._id,
      status: "accepted"
    });

    if (duplicate) {
      await AttendanceRecord.create({
        sessionId: session._id,
        personId: person._id,
        documento,
        status: "rejected",
        rejectReason: "DUPLICATE"
      });

      return res.status(409).json({
        error: {
          code: "DUPLICATE",
          message: "La asistencia ya fue registrada.",
          details: [],
          trace_id: traceId
        }
      });
    }

    const record = await AttendanceRecord.create({
      sessionId: session._id,
      personId: person._id,
      documento,
      status: "accepted"
    });

    return res.status(201).json({
      data: {
        id: record._id,
        sessionId: record.sessionId,
        personId: record.personId,
        documento: record.documento,
        status: record.status,
        registeredAt: record.registeredAt
      }
    });
  } catch {
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error interno registrando asistencia.",
        details: [],
        trace_id: traceId
      }
    });
  }
});

export default router;
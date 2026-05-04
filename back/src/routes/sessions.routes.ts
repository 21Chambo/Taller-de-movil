import { Router, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";

import { requireAuth, AuthRequest } from "../middlewares/auth.middleware";
import { AttendanceSession } from "../models/AttendanceSession";
import { AttendanceRecord } from "../models/AttendanceRecord";
import { Institution } from "../models/Institution";
import { AcademicUnit } from "../models/AcademicUnit";
import { Enrollment } from "../models/Enrollment";

const router = Router();

const createSessionSchema = z.object({
  institutionId: z.string().min(1),
  unitId: z.string().min(1),
  qrTtlMinutes: z.number().int().positive().default(10)
});

function buildError(
  code: string,
  message: string,
  traceId: string,
  details: unknown[] = []
) {
  return {
    error: {
      code,
      message,
      details,
      trace_id: traceId
    }
  };
}

/**
 * POST /api/sessions
 * Crea una sesión de asistencia.
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const traceId = uuidv4();

  try {
    const parsed = createSessionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json(
          buildError(
            "VALIDATION_ERROR",
            "La solicitud no cumple el contrato esperado.",
            traceId,
            parsed.error.issues
          )
        );
    }

    const { institutionId, unitId, qrTtlMinutes } = parsed.data;

    const institution = await Institution.findById(institutionId);

    if (!institution || !institution.active) {
      return res
        .status(404)
        .json(
          buildError(
            "INSTITUTION_NOT_FOUND",
            "La institución no existe o no está activa.",
            traceId
          )
        );
    }

    const unit = await AcademicUnit.findOne({
      _id: unitId,
      institutionId,
      active: true
    });

    if (!unit) {
      return res
        .status(404)
        .json(
          buildError(
            "UNIT_NOT_FOUND",
            "La unidad académica no existe o no está activa.",
            traceId
          )
        );
    }

    const session = await AttendanceSession.create({
      institutionId,
      unitId,
      status: "created",
      qrExpiresAt: new Date(Date.now() + qrTtlMinutes * 60 * 1000)
    });

    return res.status(201).json({
      data: {
        id: session._id,
        institutionId: session.institutionId,
        unitId: session.unitId,
        status: session.status,
        qrExpiresAt: session.qrExpiresAt
      }
    });
  } catch {
    return res
      .status(500)
      .json(
        buildError(
          "INTERNAL_SERVER_ERROR",
          "Error interno creando sesión.",
          traceId
        )
      );
  }
});

/**
 * POST /api/sessions/:sessionId/activate
 * Activa la sesión, genera QR temporal y código de sala.
 */
router.post(
  "/:sessionId/activate",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const traceId = uuidv4();

    try {
      const { sessionId } = req.params;

      const session = await AttendanceSession.findById(sessionId);

      if (!session) {
        return res
          .status(404)
          .json(
            buildError(
              "SESSION_NOT_FOUND",
              "La sesión no existe.",
              traceId
            )
          );
      }

      if (session.status === "closed") {
        return res
          .status(400)
          .json(
            buildError(
              "SESSION_CLOSED",
              "La sesión ya está cerrada.",
              traceId
            )
          );
      }

      const ttlMinutes =
        Number(req.body.qrTtlMinutes) ||
        Number(process.env.QR_DEFAULT_TTL_MINUTES) ||
        10;

      const roomCodeTtlSeconds =
        Number(process.env.ROOM_CODE_TTL_SECONDS) || 90;

      const qrToken = uuidv4();
      const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

      session.status = "active";
      session.qrToken = qrToken;
      session.qrExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
      session.roomCode = roomCode;
      session.roomCodeExpiresAt = new Date(
        Date.now() + roomCodeTtlSeconds * 1000
      );
      session.openedAt = new Date();

      await session.save();

      return res.status(200).json({
        data: {
          id: session._id,
          status: session.status,
          qrToken: session.qrToken,
          qrExpiresAt: session.qrExpiresAt,
          roomCode: session.roomCode,
          roomCodeExpiresAt: session.roomCodeExpiresAt,
          publicUrl: `/attendance/${session.qrToken}`
        }
      });
    } catch {
      return res
        .status(500)
        .json(
          buildError(
            "INTERNAL_SERVER_ERROR",
            "Error interno activando sesión.",
            traceId
          )
        );
    }
  }
);

/**
 * GET /api/sessions/:sessionId/present
 * Consulta estudiantes presentes.
 */
router.get(
  "/:sessionId/present",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const traceId = uuidv4();

    try {
      const { sessionId } = req.params;

      const records = await AttendanceRecord.find({
        sessionId,
        status: "accepted"
      }).populate("personId", "documento nombre matricula roles");

      return res.status(200).json({
        data: records.map((record) => ({
          id: record._id,
          sessionId: record.sessionId,
          person: record.personId,
          documento: record.documento,
          status: record.status,
          registeredAt: record.registeredAt
        }))
      });
    } catch {
      return res
        .status(500)
        .json(
          buildError(
            "INTERNAL_SERVER_ERROR",
            "Error interno consultando presentes.",
            traceId
          )
        );
    }
  }
);

/**
 * GET /api/sessions/:sessionId/absent
 * Consulta estudiantes ausentes.
 */
router.get(
  "/:sessionId/absent",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const traceId = uuidv4();

    try {
      const { sessionId } = req.params;

      const session = await AttendanceSession.findById(sessionId);

      if (!session) {
        return res
          .status(404)
          .json(
            buildError(
              "SESSION_NOT_FOUND",
              "La sesión no existe.",
              traceId
            )
          );
      }

      const acceptedRecords = await AttendanceRecord.find({
        sessionId,
        status: "accepted"
      });

      const presentPersonIds: Types.ObjectId[] = acceptedRecords
        .filter((record) => Boolean(record.personId))
        .map((record) => record.personId as Types.ObjectId);

      const enrollments = await Enrollment.find({
        institutionId: session.institutionId,
        unitId: session.unitId,
        active: true,
        personId: { $nin: presentPersonIds }
      }).populate("personId", "documento nombre matricula roles");

      return res.status(200).json({
        data: enrollments.map((enrollment) => ({
          enrollmentId: enrollment._id,
          person: enrollment.personId
        }))
      });
    } catch {
      return res
        .status(500)
        .json(
          buildError(
            "INTERNAL_SERVER_ERROR",
            "Error interno consultando ausentes.",
            traceId
          )
        );
    }
  }
);

/**
 * GET /api/sessions/:sessionId/rejections
 * Consulta intentos rechazados.
 */
router.get(
  "/:sessionId/rejections",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const traceId = uuidv4();

    try {
      const { sessionId } = req.params;

      const records = await AttendanceRecord.find({
        sessionId,
        status: "rejected"
      }).populate("personId", "documento nombre matricula roles");

      return res.status(200).json({
        data: records.map((record) => ({
          id: record._id,
          sessionId: record.sessionId,
          person: record.personId,
          documento: record.documento,
          status: record.status,
          rejectReason: record.rejectReason,
          registeredAt: record.registeredAt
        }))
      });
    } catch {
      return res
        .status(500)
        .json(
          buildError(
            "INTERNAL_SERVER_ERROR",
            "Error interno consultando rechazos.",
            traceId
          )
        );
    }
  }
);

/**
 * POST /api/sessions/:sessionId/close
 * Cierra la sesión de asistencia.
 */
router.post(
  "/:sessionId/close",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const traceId = uuidv4();

    try {
      const { sessionId } = req.params;

      const session = await AttendanceSession.findById(sessionId);

      if (!session) {
        return res
          .status(404)
          .json(
            buildError(
              "SESSION_NOT_FOUND",
              "La sesión no existe.",
              traceId
            )
          );
      }

      session.status = "closed";
      session.closedAt = new Date();

      await session.save();

      return res.status(200).json({
        data: {
          id: session._id,
          status: session.status,
          closedAt: session.closedAt
        }
      });
    } catch {
      return res
        .status(500)
        .json(
          buildError(
            "INTERNAL_SERVER_ERROR",
            "Error interno cerrando sesión.",
            traceId
          )
        );
    }
  }
);

export default router;
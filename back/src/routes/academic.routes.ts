import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { requireAuth, AuthRequest } from "../middlewares/auth.middleware";
import { Institution } from "../models/Institution";
import { AcademicUnit } from "../models/AcademicUnit";
import { Enrollment } from "../models/Enrollment";

const router = Router();

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

router.get("/institutions", requireAuth, async (_req: AuthRequest, res: Response) => {
  const traceId = uuidv4();

  try {
    const institutions = await Institution.find({ active: true }).sort({ name: 1 });

    return res.status(200).json({
      data: institutions
    });
  } catch {
    return res
      .status(500)
      .json(buildError("INTERNAL_SERVER_ERROR", "Error consultando instituciones.", traceId));
  }
});

router.get(
  "/institutions/:institutionId/units",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const traceId = uuidv4();

    try {
      const { institutionId } = req.params;

      const units = await AcademicUnit.find({
        institutionId,
        active: true
      }).sort({ name: 1 });

      return res.status(200).json({
        data: units
      });
    } catch {
      return res
        .status(500)
        .json(buildError("INTERNAL_SERVER_ERROR", "Error consultando unidades académicas.", traceId));
    }
  }
);

router.get(
  "/units/:unitId/enrollments",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const traceId = uuidv4();

    try {
      const { unitId } = req.params;

      const enrollments = await Enrollment.find({
        unitId,
        active: true
      }).populate("personId", "documento nombre matricula roles");

      return res.status(200).json({
        data: enrollments.map((enrollment) => ({
          id: enrollment._id,
          institutionId: enrollment.institutionId,
          unitId: enrollment.unitId,
          person: enrollment.personId,
          active: enrollment.active
        }))
      });
    } catch {
      return res
        .status(500)
        .json(buildError("INTERNAL_SERVER_ERROR", "Error consultando inscritos.", traceId));
    }
  }
);

export default router;
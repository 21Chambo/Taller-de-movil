import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export interface AuthUser {
  sub: string;
  institutionId: string;
  documento: string;
  roles: string[];
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const traceId = uuidv4();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Token Bearer requerido.",
        details: [],
        trace_id: traceId
      }
    });
  }

  const token = authHeader.replace("Bearer ", "");

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

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Token inválido o expirado.",
        details: [],
        trace_id: traceId
      }
    });
  }
}
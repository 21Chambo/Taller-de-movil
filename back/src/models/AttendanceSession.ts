import { Schema, model, Types } from "mongoose";

export type AttendanceSessionStatus = "created" | "active" | "closed" | "expired";

export interface AttendanceSessionDocument {
  _id: Types.ObjectId;
  institutionId: Types.ObjectId;
  unitId: Types.ObjectId;
  status: AttendanceSessionStatus;
  qrToken?: string;
  qrExpiresAt?: Date;
  roomCode?: string;
  roomCodeExpiresAt?: Date;
  openedAt?: Date;
  closedAt?: Date;
}

const attendanceSessionSchema = new Schema<AttendanceSessionDocument>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: true
    },
    status: {
      type: String,
      enum: ["created", "active", "closed", "expired"],
      default: "created"
    },
    qrToken: {
      type: String,
      unique: true,
      sparse: true
    },
    qrExpiresAt: {
      type: Date
    },
    roomCode: {
      type: String
    },
    roomCodeExpiresAt: {
      type: Date
    },
    openedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const AttendanceSession = model<AttendanceSessionDocument>(
  "AttendanceSession",
  attendanceSessionSchema,
  "attendance_sessions"
);
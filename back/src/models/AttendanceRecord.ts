import { Schema, model, Types } from "mongoose";

export type AttendanceRecordStatus = "accepted" | "rejected";

export type AttendanceRejectReason =
  | "DOCUMENT_NOT_FOUND"
  | "NOT_ENROLLED"
  | "SESSION_NOT_ACTIVE"
  | "QR_EXPIRED"
  | "DUPLICATE"
  | "VALIDATION_ERROR";

export interface AttendanceRecordDocument {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  personId?: Types.ObjectId;
  documento: string;
  status: AttendanceRecordStatus;
  rejectReason?: AttendanceRejectReason;
  registeredAt: Date;
}

const attendanceRecordSchema = new Schema<AttendanceRecordDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true
    },
    personId: {
      type: Schema.Types.ObjectId,
      ref: "Person"
    },
    documento: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["accepted", "rejected"],
      required: true
    },
    rejectReason: {
      type: String,
      enum: [
        "DOCUMENT_NOT_FOUND",
        "NOT_ENROLLED",
        "SESSION_NOT_ACTIVE",
        "QR_EXPIRED",
        "DUPLICATE",
        "VALIDATION_ERROR"
      ]
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

attendanceRecordSchema.index(
  {
    sessionId: 1,
    personId: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "accepted",
      personId: {
        $exists: true
      }
    }
  }
);

export const AttendanceRecord = model<AttendanceRecordDocument>(
  "AttendanceRecord",
  attendanceRecordSchema,
  "attendance_records"
);
import { Schema, model, Types } from "mongoose";

export interface AcademicUnitDocument {
  _id: Types.ObjectId;
  institutionId: Types.ObjectId;
  code: string;
  name: string;
  type: "FICHA" | "MATERIA" | "CURSO";
  active: boolean;
}

const academicUnitSchema = new Schema<AcademicUnitDocument>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["FICHA", "MATERIA", "CURSO"],
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

academicUnitSchema.index(
  {
    institutionId: 1,
    code: 1
  },
  {
    unique: true
  }
);

export const AcademicUnit = model<AcademicUnitDocument>(
  "AcademicUnit",
  academicUnitSchema,
  "academic_units"
);
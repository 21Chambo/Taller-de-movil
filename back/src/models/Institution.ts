import { Schema, model, Types } from "mongoose";

export interface InstitutionDocument {
  _id: Types.ObjectId;
  code: string;
  name: string;
  context: "SENA" | "UNIVERSIDAD" | "OTRO";
  labels: {
    unit: string;
    student: string;
    teacher: string;
  };
  theme?: {
    primaryColor?: string;
  };
  active: boolean;
}

const institutionSchema = new Schema<InstitutionDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    context: {
      type: String,
      enum: ["SENA", "UNIVERSIDAD", "OTRO"],
      required: true
    },
    labels: {
      unit: {
        type: String,
        required: true
      },
      student: {
        type: String,
        required: true
      },
      teacher: {
        type: String,
        required: true
      }
    },
    theme: {
      primaryColor: {
        type: String
      }
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

export const Institution = model<InstitutionDocument>(
  "Institution",
  institutionSchema,
  "institutions"
);
import { Schema, model, Types } from "mongoose";

export type PersonRole = "ADMIN" | "DOCENTE" | "INSTRUCTOR" | "ESTUDIANTE" | "APRENDIZ";

export interface PersonDocument {
  _id: Types.ObjectId;
  institutionId: Types.ObjectId;
  documento: string;
  nombre: string;
  matricula?: string;
  passwordHash?: string;
  roles: PersonRole[];
  active: boolean;
}

const personSchema = new Schema<PersonDocument>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    documento: {
      type: String,
      required: true,
      trim: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    matricula: {
      type: String,
      trim: true
    },
    passwordHash: {
      type: String
    },
    roles: {
      type: [String],
      enum: ["ADMIN", "DOCENTE", "INSTRUCTOR", "ESTUDIANTE", "APRENDIZ"],
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

personSchema.index(
  {
    institutionId: 1,
    documento: 1
  },
  {
    unique: true
  }
);

export const Person = model<PersonDocument>(
  "Person",
  personSchema,
  "people"
);
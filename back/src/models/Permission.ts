import { Schema, model } from "mongoose";
import { PersonRole } from "./Person";

export interface PermissionDocument {
  role: PersonRole;
  resource: string;
  action: string;
}

const permissionSchema = new Schema<PermissionDocument>(
  {
    role: {
      type: String,
      enum: ["ADMIN", "DOCENTE", "INSTRUCTOR", "ESTUDIANTE", "APRENDIZ"],
      required: true
    },
    resource: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

permissionSchema.index(
  {
    role: 1,
    resource: 1,
    action: 1
  },
  {
    unique: true
  }
);

export const Permission = model<PermissionDocument>(
  "Permission",
  permissionSchema,
  "permissions"
);
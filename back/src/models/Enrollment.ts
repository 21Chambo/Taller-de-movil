import { Schema, model, Types } from "mongoose";

export interface EnrollmentDocument {
  _id: Types.ObjectId;
  institutionId: Types.ObjectId;
  unitId: Types.ObjectId;
  personId: Types.ObjectId;
  active: boolean;
}

const enrollmentSchema = new Schema<EnrollmentDocument>(
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
    personId: {
      type: Schema.Types.ObjectId,
      ref: "Person",
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

enrollmentSchema.index(
  {
    unitId: 1,
    personId: 1
  },
  {
    unique: true
  }
);

export const Enrollment = model<EnrollmentDocument>(
  "Enrollment",
  enrollmentSchema,
  "enrollments"
);
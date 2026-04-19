import { Schema, model, models, type InferSchemaType } from "mongoose";

export const meetingStatusValues = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

export type MeetingStatus = (typeof meetingStatusValues)[number];

const meetingSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: meetingStatusValues,
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export type Meeting = InferSchemaType<typeof meetingSchema>;

const MeetingModel =
  models.Meeting || model<Meeting>("Meeting", meetingSchema, "meetings");

export default MeetingModel;

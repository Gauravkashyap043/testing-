import { Schema, models, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: { toString(): string };
};

export const User = models.User || model("User", userSchema);

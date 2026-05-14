import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IClickEvent {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export interface IShortUrl extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  shortCode: string;
  title?: string;
  password?: string;
  expiresAt?: Date;
  clicks: number;
  clickEvents: IClickEvent[];
  createdAt: Date;
  updatedAt: Date;
  isPasswordProtected: boolean;
  isExpired: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const ClickEventSchema = new Schema<IClickEvent>(
  {
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String },
  },
  { _id: false }
);

const ShortUrlSchema = new Schema<IShortUrl>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    title: { type: String },
    password: { type: String },
    expiresAt: { type: Date },
    clicks: { type: Number, default: 0 },
    clickEvents: { type: [ClickEventSchema], default: [] },
  },
  { timestamps: true }
);

ShortUrlSchema.virtual("isPasswordProtected").get(function () {
  return !!this.password;
});

ShortUrlSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

ShortUrlSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

ShortUrlSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

ShortUrlSchema.set("toJSON", { virtuals: true });
ShortUrlSchema.set("toObject", { virtuals: true });

export const ShortUrl = mongoose.model<IShortUrl>("ShortUrl", ShortUrlSchema);

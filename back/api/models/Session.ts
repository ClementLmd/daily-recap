import mongoose, { Document, Schema, Model } from "mongoose";
import crypto from "crypto";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    deviceId: string;
  };
  expiresAt: Date;
  lastActivityAt: Date;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  extendExpiration(days?: number): void;
}

interface ISessionModel extends Model<ISession> {
  generateToken(): string;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      userAgent: {
        type: String,
        required: false,
      },
      ipAddress: {
        type: String,
        required: false,
      },
      deviceId: {
        type: String,
        required: false,
      },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for better query performance
// sessionSchema.index({ userId: 1, isValid: 1 });
// sessionSchema.index({ token: 1 });
// sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate a secure session token
sessionSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(32).toString("hex");
};

// Check if session is expired
sessionSchema.methods.isExpired = function (): boolean {
  return Date.now() >= this.expiresAt.getTime();
};

// Extend session expiration
sessionSchema.methods.extendExpiration = function (days: number = 30): void {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

export const Session = mongoose.model<ISession, ISessionModel>("Session", sessionSchema);

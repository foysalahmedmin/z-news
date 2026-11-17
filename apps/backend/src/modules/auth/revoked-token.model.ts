import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRevokedToken extends Document {
  token: string;
  expires_at: Date;
  created_at: Date;
}

const revokedTokenSchema = new Schema<IRevokedToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  },
);

export const RevokedToken: Model<IRevokedToken> =
  mongoose.models.RevokedToken ||
  mongoose.model<IRevokedToken>(
    'RevokedToken',
    revokedTokenSchema,
    'revoked_tokens',
  );

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash: string
  username: string
  subscription: {
    status: 'none' | 'active' | 'past_due' | 'canceled'
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    currentPeriodEnd?: Date
  }
  profileComplete: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subscription: {
      status: {
        type: String,
        enum: ['none', 'active', 'past_due', 'canceled'],
        default: 'none',
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      currentPeriodEnd: Date,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

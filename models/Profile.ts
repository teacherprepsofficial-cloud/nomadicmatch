import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IPhoto {
  url: string
  order: number
  uploadedAt: Date
}

export interface ITravelPlan {
  destination: string
  city?: string
  country?: string
  countryCode?: string
  startDate?: Date
  endDate?: Date
  notes?: string
}

export interface IProfile extends Document {
  userId: Types.ObjectId
  firstName: string
  age: number
  bio?: string
  pronouns?: string
  genderIdentity?: 'man' | 'woman' | 'nonbinary' | 'trans man' | 'trans woman' | 'genderqueer' | 'other'
  seeking: string[]
  photos: IPhoto[]
  currentLocation?: {
    city: string
    country: string
    countryCode: string
    updatedAt: Date
  }
  travelPlans: ITravelPlan[]
  workStyle?: 'fully-remote' | 'freelance' | 'entrepreneur' | 'content-creator' | 'other'
  workDescription?: string
  lifestyle: string[]
  languages: string[]
  socials?: {
    instagram?: string
    twitter?: string
    linkedin?: string
    tiktok?: string
    email?: string
    website?: string
  }
  compatibilityTestId?: Types.ObjectId
  isVisible: boolean
  lastActive?: Date
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18 },
    bio: { type: String, maxlength: 500 },
    pronouns: String,
    genderIdentity: {
      type: String,
      enum: ['man', 'woman', 'nonbinary', 'trans man', 'trans woman', 'genderqueer', 'other'],
    },
    seeking: [{ type: String }],
    photos: [
      {
        url: String,
        order: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    currentLocation: {
      city: String,
      country: String,
      countryCode: String,
      updatedAt: Date,
    },
    travelPlans: [
      {
        destination: String,
        city: String,
        country: String,
        countryCode: String,
        startDate: Date,
        endDate: Date,
        notes: String,
      },
    ],
    workStyle: {
      type: String,
      enum: ['fully-remote', 'freelance', 'entrepreneur', 'content-creator', 'other'],
    },
    workDescription: String,
    lifestyle: [{ type: String }],
    languages: [{ type: String }],
    socials: {
      instagram: String,
      twitter: String,
      linkedin: String,
      tiktok: String,
      email: String,
      website: String,
    },
    compatibilityTestId: { type: Schema.Types.ObjectId, ref: 'CompatibilityTest' },
    isVisible: { type: Boolean, default: true },
    lastActive: Date,
  },
  { timestamps: true }
)

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile

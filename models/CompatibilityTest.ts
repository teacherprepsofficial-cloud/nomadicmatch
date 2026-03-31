import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ICompatibilityTest extends Document {
  userId: Types.ObjectId
  answers: {
    questionId: string
    category: string
    value: number
  }[]
  categoryScores: {
    travel_pace: number
    lifestyle_stability: number
    social_energy: number
    relationship_goals: number
    values_alignment: number
    communication_style: number
  }
  completedAt: Date
  version: number
}

const CompatibilityTestSchema = new Schema<ICompatibilityTest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  answers: [
    {
      questionId: String,
      category: String,
      value: Number,
    },
  ],
  categoryScores: {
    travel_pace: Number,
    lifestyle_stability: Number,
    social_energy: Number,
    relationship_goals: Number,
    values_alignment: Number,
    communication_style: Number,
  },
  completedAt: Date,
  version: { type: Number, default: 1 },
})

const CompatibilityTest: Model<ICompatibilityTest> =
  mongoose.models.CompatibilityTest ||
  mongoose.model<ICompatibilityTest>('CompatibilityTest', CompatibilityTestSchema)

export default CompatibilityTest

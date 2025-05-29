import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  practitioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: true
  },
  matchType: {
    type: String,
    enum: ['liked', 'shortlisted', 'passed'],
    required: true
  },
  onboardingScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  compatibility: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  messageStatus: {
    hasMessaged: {
      type: Boolean,
      default: false
    },
    messageDate: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Ensure unique user-practitioner combinations
MatchSchema.index({ user: 1, practitioner: 1 }, { unique: true });
MatchSchema.index({ user: 1, matchType: 1 });

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);

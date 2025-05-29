import mongoose from 'mongoose';

const PractitionerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  specializations: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  experience: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  education: {
    type: [String],
    default: []
  },
  languages: {
    type: [String],
    default: ['English']
  },
  sessionTypes: {
    type: [String],
    enum: ['video', 'audio', 'text'],
    default: ['video']
  },
  price: {
    type: String,
    required: true
  },
  availability: {
    type: [String],
    default: []
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: true
  },
  psychoshalaVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search and filtering
PractitionerSchema.index({ specializations: 1 });
PractitionerSchema.index({ location: 1 });
PractitionerSchema.index({ rating: -1 });

export default mongoose.models.Practitioner || mongoose.model('Practitioner', PractitionerSchema);

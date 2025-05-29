import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },  
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  image: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  preferences: {
    language: {
      type: String,
      default: 'English'
    },
    sessionType: {
      type: String,
      enum: ['Video', 'Audio', 'Text'],
      default: 'Video'
    },
    practitionerGender: {
      type: String,
      enum: ['No preference', 'Male', 'Female'],
      default: 'No preference'
    },
    concerns: {
      type: [String],
      default: []
    },
    ageGroup: {
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55+'],
      default: '25-34'
    },
    experience: {
      type: String,
      default: 'First time'
    }
  },
  upcomingSessions: {
    type: Number,
    default: 0
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  notifications: [{
    message: String,
    date: String,
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // OAuth specific fields
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials'
  },
  providerId: {
    type: String,
    default: null
  },
  hashedPassword: {
    type: String,
    default: null
  },  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  shownPractitioners: {
    type: [String],
    default: []
  },
  midScreenPromptShown: {
    type: Boolean,
    default: false
  },
  onboardingParameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ provider: 1, providerId: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);

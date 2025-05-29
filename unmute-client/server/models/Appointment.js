import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
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
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['video', 'audio', 'text'],
    required: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'confirmed'
  },
  duration: {
    type: String,
    default: '50 minutes'
  },
  notes: {
    type: String,
    default: null
  },
  quizParameters: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // Session details
  sessionLink: {
    type: String,
    default: null
  },
  sessionStarted: {
    type: Date,
    default: null
  },
  sessionEnded: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
AppointmentSchema.index({ user: 1, createdAt: -1 });
AppointmentSchema.index({ practitioner: 1, createdAt: -1 });
AppointmentSchema.index({ bookingId: 1 });
AppointmentSchema.index({ status: 1 });

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

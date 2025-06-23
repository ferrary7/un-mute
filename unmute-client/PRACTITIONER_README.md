# Un-Mute Practitioner Portal

This is the practitioner portal for the Un-Mute mental health platform. It provides a comprehensive dashboard for mental health practitioners to manage their practice, appointments, and client relationships.

## Features

### 🏠 Dashboard
- Overview of daily appointments and statistics
- Quick access to pending handshakes
- Monthly earnings and session completion tracking
- Real-time notifications

### 📅 Appointment Management
- View today's, upcoming, completed, and cancelled appointments
- Detailed appointment information with client context
- Easy appointment navigation and management
- Search and filter functionality

### 🤝 Handshake Management
- Review completed sessions requiring practitioner response
- Accept or decline handshake requests
- Schedule follow-up sessions directly from handshake interface
- Comprehensive session notes and client information

### 👥 Client Management
- Complete client database with relationship tracking
- Client status monitoring (active, inactive, new)
- Session history and progress tracking
- Search and filter clients by various criteria

### 🔐 Authentication
- Secure practitioner login system
- Session management and protection
- Role-based access control

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Environment variables configured

### Installation
1. Navigate to the project directory
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

### Practitioner Access
- Navigate to `/practitioner/login`
- Use practitioner credentials to access the portal
- Complete profile setup if required

## Project Structure

```
src/app/practitioner/
├── page.js                 # Main dashboard
├── login/
│   └── page.js            # Login page
├── appointments/
│   └── page.js            # Appointment management
├── handshakes/
│   └── page.js            # Handshake management
└── clients/
    └── page.js            # Client management

src/components/practitioner/
├── PractitionerNavbar.jsx  # Navigation component
└── PractitionerFooter.jsx  # Footer component

src/app/api/practitioner/
├── profile/               # Profile management API
├── dashboard/             # Dashboard stats API
├── appointments/          # Appointments API
├── handshakes/           # Handshakes API
├── clients/              # Clients API
└── schedule-session/     # Session scheduling API
```

## Database Models

### Practitioner Schema
- Personal information and credentials
- Specializations and qualifications
- Session types and pricing
- Availability and verification status

### Appointment Schema
- User and practitioner relationships
- Session details and scheduling
- Status tracking and handshake management
- Session notes and pricing

## Workflow

1. **Initial Session**: Client books first consultation
2. **Session Completion**: Session marked as completed
3. **Handshake**: Client initiates handshake for follow-up
4. **Practitioner Review**: Practitioner accepts/declines handshake
5. **Session Scheduling**: Follow-up sessions scheduled
6. **Ongoing Care**: Continued therapeutic relationship

## Security Features

- JWT-based authentication
- Role-based access control
- Secure API endpoints
- HIPAA-compliant data handling
- Session encryption

## Technologies Used

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MongoDB with Mongoose
- **UI Components**: Radix UI, Lucide React
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS, Framer Motion

## Contributing

1. Follow existing code patterns and conventions
2. Ensure proper error handling and loading states
3. Maintain responsive design principles
4. Test across different screen sizes
5. Follow HIPAA compliance guidelines

## Support

For technical support or practitioner onboarding, contact the development team.

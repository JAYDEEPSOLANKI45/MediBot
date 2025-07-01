# MediBot

## Overview

MediBot is an innovative healthcare appointment management system that bridges the gap between clinics and patients through an intelligent chatbot interface. The platform streamlines the process of scheduling and managing medical appointments while providing a seamless experience for both healthcare providers and patients.

## Key Features

### For Clinics
- Secure clinic registration and authentication system
- Comprehensive appointment management dashboard
- Real-time appointment status tracking
- Customizable clinic hours and availability settings
- Automated appointment reminders and notifications

### For Patients
- Natural language chat interface for booking appointments
- Intelligent clinic discovery and recommendations
- Automated appointment scheduling and confirmation
- Real-time appointment status updates
- Location-based clinic search

## Technical Features

- Secure authentication system using Passport.js
- MongoDB database for reliable data storage
- Real-time messaging capabilities
- Geolocation services for clinic discovery
- Natural language processing for chat interactions
- Automated scheduling system
- Session management and user tracking

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- NPM or Yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the server: `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new clinic
- `POST /api/auth/login` - Login to clinic dashboard
- `POST /api/auth/logout` - Logout from the system
- `GET /api/auth/status` - Check authentication status

### Appointments
- `GET /api/appointments` - Get all appointments for a clinic
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel an appointment

## Security

- Secure password hashing using bcrypt
- Session-based authentication
- Protected API endpoints
- MongoDB session storage
- Input validation and sanitization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

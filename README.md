# MediBot Authentication System

## Overview

MediBot now uses Passport.js for authentication. This provides a more robust and flexible authentication system with the following benefits:

- Standardized authentication flow
- Support for multiple authentication strategies
- Session management
- Easy to extend with additional authentication methods in the future

## Authentication Routes

### Register a New Clinic

```
POST /api/auth/register
```

Request body:
```json
{
  "name": "Clinic Name",
  "address": {
    "lat": "12.345",
    "long": "67.890",
    "pincode": 123456
  },
  "phone": "1234567890",
  "email": "clinic@example.com",
  "password": "securepassword"
}
```

### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "clinic@example.com",
  "password": "securepassword"
}
```

### Logout

```
POST /api/auth/logout
```

Requires authentication.

### Check Authentication Status

```
GET /api/auth/status
```

Returns the current authentication status and user information if authenticated.

## Protected Routes

All routes that require authentication use the `isAuthenticated` middleware. This middleware checks if the user is authenticated using Passport.js and falls back to the session-based authentication for backward compatibility.

## How to Use

1. Register a new clinic using the registration endpoint
2. Login using the login endpoint
3. Access protected routes with the authentication session
4. Logout when finished

## Implementation Details

- Passport Local Strategy is used for username/password authentication
- Sessions are stored in MongoDB using connect-mongo
- Passwords are hashed using bcrypt
- Authentication state is maintained across requests using sessions